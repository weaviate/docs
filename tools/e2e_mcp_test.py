import asyncio
import os
import httpx
import weaviate
from weaviate.classes.query import Filter
from mcp import ClientSession
from mcp.client.sse import sse_client
from mcp.types import CallToolResult
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool as GeminiTool

# --- Configuration ---
MCP_SERVER_URL = "http://localhost:9000/sse"
WEAVIATE_URL = "http://localhost:8080"  # Standard Weaviate port for verification
WEAVIATE_GRPC = "localhost:50051"  # Standard gRPC port
MODEL_NAME = "gemini-2.0-flash-exp"

# Global state to track UUIDs for verification across steps
STATE = {
    "movie_uuid": None,
    "movie_title": None,
    "movie_uuid_for_filter": None,
    "movie_title_for_filter": None,
}

# --- Prompts for each Phase ---
PROMPTS = {
    "schema": """
        Create two collections in Weaviate with exactly these configurations:
        1. Name="Movie"
           - Vectorizers: text2vec-transformers (fields: title, description), multi2vec-clip (fields: poster)
           - Properties: title(text), description(text), poster(blob), rating(number), year(date)
        2. Name="User"
           - Vectorizer: text2vec-transformers
           - Multi-tenancy: Enabled (true)
           - Properties: name(text), liked_movies(text[])
    """,
    "populate": """
        1. Create a tenant named 'tenant_a' in the 'User' collection.
        2. Batch insert 5 random, realistic Movie objects.
        3. Batch insert 5 random User objects into 'User' (for tenant 'tenant_a').
    """,
    "read_ops": """
        1. Fetch and return the configuration for ALL collections.
        2. Fetch the config for 'Movie' and 'User' separately.
        3. List all tenants in the 'User' collection.
        4. Fetch 3 sample objects from 'Movie'.
        5. Perform a hybrid search in 'Movie' for the query "exciting story".
    """,
    "update": lambda uuid: f"""
        Update the Movie object with UUID '{uuid}'. 
        Change its 'rating' property to exactly 1337.
    """,
    "delete_uuid": lambda uuid: f"""
        Delete the Movie object with UUID '{uuid}'.
    """,
    "delete_filter": lambda title: f"""
        Delete any Movie objects where the 'title' property equals "{title}".
    """,
}

# --- Helper Functions ---


def get_weaviate_client():
    """Connects directly to Weaviate for manual verification."""
    return weaviate.connect_to_local(port=8080, grpc_port=50051)


def mcp_tool_to_gemini(mcp_tool):
    return FunctionDeclaration(
        name=mcp_tool.name,
        description=mcp_tool.description,
        parameters=mcp_tool.inputSchema,
    )


async def execute_agent_step(session, chat, prompt_text):
    """
    Sends a prompt to Gemini and handles the MCP tool loop until Gemini is satisfied.
    """
    print(f"\n🤖 Prompting Agent: {prompt_text[:60].strip()}...")
    response = await chat.send_message_async(prompt_text)

    while True:
        part = response.parts[0]

        # If Gemini wants to call a function
        if part.function_call:
            fn_name = part.function_call.name
            fn_args = dict(part.function_call.args)
            print(f"   ➤ Agent calling MCP Tool: {fn_name}")

            try:
                result = await session.call_tool(fn_name, arguments=fn_args)
                tool_output = result.content[0].text if result.content else "Success"

                # Send result back to Gemini
                response = await chat.send_message_async(
                    content=genai.prototypes.Part(
                        function_response=genai.prototypes.FunctionResponse(
                            name=fn_name, response={"result": tool_output}
                        )
                    )
                )
            except Exception as e:
                print(f"   ❌ Tool Error: {e}")
                response = await chat.send_message_async(
                    content=genai.prototypes.Part(
                        function_response=genai.prototypes.FunctionResponse(
                            name=fn_name, response={"error": str(e)}
                        )
                    )
                )
        else:
            # No function call -> Step complete
            print("   ✅ Agent finished step.")
            break


# --- Verification Logic ---


def verify_schema():
    print("🔍 [Manual Verify] Checking Schema...")
    with get_weaviate_client() as client:
        collections = client.collections.list_all()
        names = [c for c in collections]
        if "Movie" in names and "User" in names:
            print("   ✅ Verified: Collections 'Movie' and 'User' exist.")
        else:
            raise Exception(f"❌ Verification Failed: Found {names}")


def verify_population():
    print("🔍 [Manual Verify] Checking Data Population...")
    with get_weaviate_client() as client:
        # Check Movies
        movies = client.collections.get("Movie")
        response = movies.query.fetch_objects(limit=5)
        count = len(response.objects)
        if count == 0:
            raise Exception("❌ Verification Failed: Movie collection is empty.")
        print(f"   ✅ Verified: Found {count} movies.")

        # Save state for future steps
        STATE["movie_uuid"] = response.objects[0].uuid
        STATE["movie_title"] = response.objects[0].properties["title"]
        STATE["movie_uuid_for_filter"] = response.objects[1].uuid
        STATE["movie_title_for_filter"] = response.objects[1].properties["title"]

        # Check Users (Multi-tenancy)
        users = client.collections.get("User")
        # Must verify tenant exists first
        tenants = users.tenants.get()
        if "tenant_a" not in tenants:
            raise Exception("❌ Verification Failed: 'tenant_a' not found.")

        user_objs = users.with_tenant("tenant_a").query.fetch_objects(limit=1)
        if len(user_objs.objects) == 0:
            raise Exception("❌ Verification Failed: No users found in 'tenant_a'.")
        print("   ✅ Verified: Found users in tenant_a.")


def verify_update():
    target_uuid = STATE["movie_uuid"]
    print(f"🔍 [Manual Verify] Checking Update for UUID {target_uuid}...")
    with get_weaviate_client() as client:
        obj = client.collections.get("Movie").query.fetch_object_by_id(target_uuid)
        rating = obj.properties.get("rating")
        if rating == 1337:
            print("   ✅ Verified: Rating updated to 1337.")
        else:
            raise Exception(
                f"❌ Verification Failed: Rating is {rating}, expected 1337."
            )


def verify_delete_uuid():
    target_uuid = STATE["movie_uuid"]
    print(f"🔍 [Manual Verify] Checking Deletion of UUID {target_uuid}...")
    with get_weaviate_client() as client:
        obj = client.collections.get("Movie").query.fetch_object_by_id(target_uuid)
        if obj is None:
            print("   ✅ Verified: Object is gone.")
        else:
            raise Exception("❌ Verification Failed: Object still exists.")


def verify_delete_filter():
    target_title = STATE["movie_title_for_filter"]
    print(f"🔍 [Manual Verify] Checking Filter Deletion for title '{target_title}'...")
    with get_weaviate_client() as client:
        response = client.collections.get("Movie").query.fetch_objects(
            filters=Filter.by_property("title").equal(target_title)
        )
        if len(response.objects) == 0:
            print("   ✅ Verified: No objects found with that title.")
        else:
            raise Exception(
                f"❌ Verification Failed: Found {len(response.objects)} objects."
            )


# --- Main Flow ---


async def main():
    api_key = os.environ.get("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(MODEL_NAME)

    print("--- Starting Weaviate MCP Agent with Manual Verification ---")

    async with httpx.AsyncClient() as client:
        async with sse_client(MCP_SERVER_URL, client) as streams:
            async with ClientSession(streams[0], streams[1]) as session:
                await session.initialize()

                # Setup Gemini Tools
                mcp_tools = await session.list_tools()
                gemini_tools = [mcp_tool_to_gemini(t) for t in mcp_tools.tools]
                chat = model.start_chat(
                    enable_automatic_function_calling=False,
                    tools=[GeminiTool(function_declarations=gemini_tools)],
                )

                # 1. Create Schema
                await execute_agent_step(session, chat, PROMPTS["schema"])
                verify_schema()

                # 2. Populate
                await execute_agent_step(session, chat, PROMPTS["populate"])
                verify_population()

                # 3. Read Operations (Config, Tenants, Search)
                # These are read-only, so we just run them to ensure the agent can do it.
                await execute_agent_step(session, chat, PROMPTS["read_ops"])

                # 4. Update
                if not STATE["movie_uuid"]:
                    raise Exception("No UUID captured!")
                await execute_agent_step(
                    session, chat, PROMPTS["update"](STATE["movie_uuid"])
                )
                verify_update()

                # 5. Delete by UUID
                await execute_agent_step(
                    session, chat, PROMPTS["delete_uuid"](STATE["movie_uuid"])
                )
                verify_delete_uuid()

                # 6. Delete by Filter
                if not STATE["movie_title_for_filter"]:
                    raise Exception("No Title captured!")
                await execute_agent_step(
                    session,
                    chat,
                    PROMPTS["delete_filter"](STATE["movie_title_for_filter"]),
                )
                verify_delete_filter()

    print("\n🎉 All steps executed and verified successfully!")


if __name__ == "__main__":
    asyncio.run(main())
