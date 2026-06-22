import 'dotenv/config'
const { loadClientInternally } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));

const client = await loadClientInternally();


// START SOInstantiate
import { QueryAgent } from 'weaviate-agents';

const qa = new QueryAgent(client, { collections: ['FinancialContracts'] });
// END SOInstantiate


// START SOBasicExampleBaseModel
import { z } from 'zod';

const ContractSummary = z.object({
    contract_id: z.string(),
    contract_title: z.string(),
    auto_renew: z.boolean(),
    parties_involved: z.array(z.string()),
    requires_action: z.boolean(),
});

const res = await qa.ask(
    "Find the oldest contract and include if it automatically renews, who is involved, and if user action is needed",
    { outputFormat: ContractSummary }
);

console.log(res.finalAnswerParsed);
// END SOBasicExampleBaseModel


// START SOBasicDictExample
const res2 = await qa.ask(
    "Find the oldest contract and include if it automatically renews, who is involved, and if user action is needed",
    {
        outputFormat: {
            type: "object",
            properties: {
                contract_id: { title: "Contract Id", type: "string" },
                contract_title: { title: "Contract Title", type: "string" },
                auto_renew: { title: "Auto Renew", type: "boolean" },
                parties_involved: { items: { type: "string" }, title: "Parties Involved", type: "array" },
                requires_action: { title: "Requires Action", type: "boolean" },
            },
            required: ["contract_id", "contract_title", "auto_renew", "parties_involved", "requires_action"],
            title: "ContractSummary",
            additionalProperties: false,
        },
    }
);

console.log(res2.finalAnswerParsed);
// END SOBasicDictExample


// START SOReasoningExample
const FinalAnswer = z.object({
    reasoning: z.string(),
    final_answer: z.string(),
});

const res3 = await qa.ask("What is the most recent contract about AI?", { outputFormat: FinalAnswer });

console.log(res3.finalAnswerParsed);
// END SOReasoningExample


// START SONestedExampleBaseModel
const ContractInfo = z.object({
    names_mentioned: z.array(z.string()).describe("All names within the contract text"),
    contract_type: z.enum(["sales", "purchase", "other"]).describe("Determine the type of contract"),
    summary: z.string().describe("Provide a brief summary of the contract."),
    contract_uuid: z.uuid(),
});

const ContractInfoResponse = z.object({
    contract_infos: z.array(ContractInfo),
    overall_summary: z.string(),
});

const res4 = await qa.ask("Find and return all contracts about AI in 2023", { outputFormat: ContractInfoResponse });

console.log(res4.finalAnswerParsed);
// END SONestedExampleBaseModel


// START SOCitationExample
const CitedText = z.object({
    sentence: z.string().describe("A single sentence from your answer, to be combined with other sentences"),
    sources: z.array(z.uuid()).describe("The UUIDs of the sources that support the sentence"),
});

const CitedAnswer = z.object({
    reasoning: z.string(),
    final_answer: z.array(CitedText).describe(
        "A list of cited sentences, that will combine together in a paragraph to be a full answer"
    ),
});

const res5 = await qa.ask("What is the most recent contract about AI?", { outputFormat: CitedAnswer });

console.log(res5.finalAnswerParsed);
// END SOCitationExample


await client.close();
