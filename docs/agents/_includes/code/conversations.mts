import 'dotenv/config'
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/agents/_includes/code/util.mjs'));
import { QueryAgent } from 'weaviate-agents';

const client = await loadClientInternally();
await populateWeaviate(client, false);
const qa = new QueryAgent(client, {
    collections: ['Weather'],
});

// START BasicConversation
import { ChatMessage } from 'weaviate-agents';

const conversation: ChatMessage[] = [
    {
        role: "user",
        content: "Hi!"
    },
    {
        role: "assistant",
        content: "Hello! How can I assist you today?"
    },
    {
        role: "user",
        content: "I have some questions about the weather data. You can assume the temperature is in Fahrenheit and the wind speed is in mph.",
    },
    {
        role: "assistant",
        content: "I can help with that. What specific information are you looking for?",
    },
    {
        role: "user",
        content: "What's the average wind speed, the max wind speed, and the min wind speed",
    }
]

const response = await qa.ask(conversation)
// END BasicConversation

// START ExampleMessageHistory
const messageHistory: ChatMessage[] = []

async function useQA(query: string): Promise<string> {
    messageHistory.push({ role: "user", content: query })
    const response = await qa.ask(messageHistory)
    messageHistory.push({ role: "assistant", content: response.finalAnswer })
    return response.finalAnswer
}

await useQA(
    "I have some questions about the weather data. " +
    "You can assume the temperature is in Fahrenheit " +
    "and the wind speed is in mph."
)

await useQA(
    "What's the average wind speed, the max wind speed, " +
    "and the min wind speed?"
)
// END ExampleMessageHistory

await client.close();