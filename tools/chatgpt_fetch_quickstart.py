"""Fetch the Weaviate quickstart page via ChatGPT's web_search_preview and print everything."""

import json
import openai

client = openai.OpenAI()

response = client.responses.create(
    model="gpt-4.1-mini",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "high",
    }],
    input=(
        "Go to https://docs.weaviate.io/weaviate/quickstart and read the full page. "
        "Print EVERYTHING you can see on the page: all text, all code snippets from "
        "every language tab (Python, TypeScript, Go, Java, C#), all headings, all steps. "
        "Do not summarize — reproduce the full page content as faithfully as possible."
    ),
)

print("=" * 80)
print("OUTPUT TEXT:")
print("=" * 80)
print(response.output_text)
print()
print("=" * 80)
print("FULL RESPONSE OUTPUT (raw):")
print("=" * 80)
for item in response.output:
    print(f"\n--- {item.type} ---")
    print(json.dumps(item.to_dict(), indent=2, default=str))
