import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import load_client_internally

client = load_client_internally()


# START SOInstantiate
from weaviate.agents.query import QueryAgent

qa = QueryAgent(client=client, collections=["FinancialContracts"])
# END SOInstantiate


# START SOBasicExampleBaseModel
from pydantic import BaseModel

class ContractSummary(BaseModel):
    contract_id: str
    contract_title: str
    auto_renew: bool
    parties_involved: list[str]
    requires_action: bool

res = qa.ask(
    "Find the oldest contract and include if it automatically renews, who is involved, and if user action is needed",
    output_format=ContractSummary,
)

print(res.final_answer_parsed)
# END SOBasicExampleBaseModel

# START SOBasicDictExample
res = qa.ask(
    "Find the oldest contract and include if it automatically renews, who is involved, and if user action is needed", 
    output_format={
        'properties': {
            'contract_id': {'title': 'Contract Id', 'type': 'string'},
            'contract_title': {'title': 'Contract Title', 'type': 'string'},
            'auto_renew': {'title': 'Auto Renew', 'type': 'boolean'},
            'parties_involved': {'items': {'type': 'string'}, 'title': 'Parties Involved', 'type': 'array'},
            'requires_action': {'title': 'Requires Action', 'type': 'boolean'}
        },
        'required': ['contract_id', 'contract_title', 'auto_renew', 'parties_involved', 'requires_action'],
        'title': 'ContractSummary',
        'type': 'object'
    }
)

print(res.final_answer_parsed)
# END SOBasicDictExample

# START SOReasoningExample
from pydantic import BaseModel

class FinalAnswer(BaseModel):
    reasoning: str
    final_answer: str

res = qa.ask("What is the most recent contract about AI?", output_format=FinalAnswer)

print(res.final_answer_parsed)
# END SOReasoningExample

# START SONestedExampleBaseModel
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Literal

class ContractInfo(BaseModel):
    names_mentioned: list[str] = Field(description="All names within the contract text")
    contract_type: Literal["sales", "purchase", "other"] = Field(description="Determine the type of contract")
    summary: str = Field(description="Provide a brief summary of the contract.")
    contract_uuid: UUID

class ContractInfoResponse(BaseModel):
    contract_infos: list[ContractInfo]
    overall_summary: str

res = qa.ask("Find and return all contracts about AI in 2023", output_format=ContractInfoResponse)

print(res.final_answer_parsed)
# END SONestedExampleBaseModel

# START SOCitationExample
from pydantic import BaseModel
from uuid import UUID

class CitedText(BaseModel):
    sentence: str = Field(description="A single sentence from your answer, to be combined with other sentences")
    sources: list[UUID] = Field(description="The UUIDs of the sources that support the sentence")

class CitedAnswer(BaseModel):
    reasoning: str
    final_answer: list[CitedText] = Field(
        description="A list of cited sentences, that will combine together in a paragraph to be a full answer"
    )

res = qa.ask("What is the most recent contract about AI?", output_format=CitedAnswer)

print(res.final_answer_parsed)
# END SOCitationExample