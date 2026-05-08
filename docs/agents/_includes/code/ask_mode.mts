import 'dotenv/config'
const { populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));


// START BasicAskMode
import weaviate, { WeaviateClient, vectors, dataType, configure } from 'weaviate-client';
import { QueryAgent } from 'weaviate-agents';

// END BasicAskMode

// START ImportAskResponse
import { AskModeResponse } from 'weaviate-agents';
// END ImportAskResponse

// START StreamingExample
import { ProgressMessage, StreamedTokens } from 'weaviate-agents';
// END StreamingExample

// START BasicAskMode
const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL as string, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
});

const qa = new QueryAgent(client, {
    collections: ['Weather'],
    systemPrompt:
        "You are a helpful assistant. " +
        "Write your response in short, 5 word sentences. " +
        "Emphasize key insights."
});

// END BasicAskMode

await populateWeaviate(client, false);

// START BasicAskMode
const res = await qa.ask("What was the average temperature in the first week of May 2025?", {
    resultEvaluation: "none",
});

// END BasicAskMode

// START StreamingAskMode
for await (const output of qa.askStream("What was the average temperature in the first week of May 2025?")) {
    // Do something with the output
}
// END StreamingAskMode

// START StreamingExample
function printStreamOutput(output: ProgressMessage | StreamedTokens | AskModeResponse) {
    if (output.outputType === "progressMessage") {
        console.log(output.message);
    } else if (output.outputType === "streamedTokens") {
        process.stdout.write(output.delta);
    } else {
        output.display();
    }
}

for await (const output of qa.askStream("What was the average temperature in the first week of May 2025?")) {
    printStreamOutput(output);
}

// END StreamingExample

await client.close();
