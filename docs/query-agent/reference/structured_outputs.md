---
title: Structured Outputs
description: "Conform the final response to a particular schema."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'configuration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/query-agent/_includes/code/structured_outputs.py';
import TSCode from '!!raw-loader!/docs/query-agent/_includes/code/structured_outputs.mts';


Structured outputs ensure that the model's final response will adhere to a given schema. This means you can easily access aspects of a response which is customised to your use-case.

## Basic Usage

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        In Python, you can either provide a Pydantic `BaseModel` or a raw dictionary conforming to the [Draft 2020-12 JSON Schema](https://json-schema.org/draft/2020-12) specification.

        In the below examples, we use structured outputs to generate a set of metadata associated with a single retrieved item.

        The structured output can be accessed by a new field, `final_answer_parsed`, which appears only when the `output_format` argument is not `None`. The raw string from the model can still be accessed at `final_answer`.

        ### Pydantic BaseModel
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SOBasicExampleBaseModel"
            endMarker="# END SOBasicExampleBaseModel"
            language="py"
        />

        <details>
        <summary>Example output</summary>
        ```python
        ContractSummary(
            contract_id='46',
            contract_title='Employment Contract',
            auto_renew=False,
            parties_involved=['Weaviate', 'Mark Robson'],
            requires_action=True
        )
        ```
        </details>


        ### Dictionary
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SOBasicDictExample"
            endMarker="# END SOBasicDictExample"
            language="py"
        />

        <details>
        <summary>Example output</summary>
        ```python
        {
            'contract_id': '46',
            'contract_title': 'Employment Contract',
            'auto_renew': False,
            'parties_involved': ['Weaviate', 'Mark Robson'],
            'requires_action': True
        }
        ```
        </details>

    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        In JavaScript/TypeScript, you can either provide a [Zod](https://zod.dev/) schema or a raw object conforming to the [Draft 2020-12 JSON Schema](https://json-schema.org/draft/2020-12) specification.

        In the below examples, we use structured outputs to generate a set of metadata associated with a single retrieved item.

        The structured output can be accessed by a new field, `finalAnswerParsed`, which appears only when the `outputFormat` argument is not null. The raw string from the model can still be accessed at `finalAnswer`.

        ### Zod schema
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SOBasicExampleBaseModel"
            endMarker="// END SOBasicExampleBaseModel"
            language="ts"
        />
        <details>
        <summary>Example output</summary>
        ```typescript
        {
            contract_id: '46',
            contract_title: 'Employment Contract',
            auto_renew: false,
            parties_involved: [ 'Weaviate', 'Mark Robson' ],
            requires_action: true
        }
        ```
        </details>

        ### Object
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SOBasicDictExample"
            endMarker="// END SOBasicDictExample"
            language="ts"
        />
        <details>
        <summary>Example output</summary>
        ```typescript
        {
            contract_id: '46.0',
            contract_title: 'Employment Contract',
            auto_renew: false,
            parties_involved: [ 'Weaviate', 'Mark Robson' ],
            requires_action: true
        }
        ```
        </details>

    </TabItem>
</Tabs>

## Example: Reasoning

As a basic example, consider adding an additional field `reasoning` to the response. Order is preserved in the specification, so if this is provided _before_ the answer field, the model will produce a reasoning string before writing its answer, which can provide explainability to a response.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SOReasoningExample"
            endMarker="# END SOReasoningExample"
            language="py"
        />
        <details>
        <summary>Example output</summary>
        ```python
        FinalAnswer(
            reasoning='The most recent contract mentioning AI is the sales agreement dated 2024-03-15, but it does not mention AI in the text. The most recent contract that is actually about AI is the partnership agreement dated 2023-11-15 between Weaviate and FictionalSoft, which explicitly states it is for artificial intelligence research and development. No later AI-related contract is present in the provided data.',
            final_answer='The most recent contract about AI is the partnership agreement dated 2023-11-15 between Weaviate and FictionalSoft. It is specifically for collaboration on artificial intelligence research and development. No more recent AI-related contract appears in the provided data.'
        )
        ```
        </details>
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SOReasoningExample"
            endMarker="// END SOReasoningExample"
            language="ts"
        />
        <details>
        <summary>Example output</summary>
        ```typescript
        {
            reasoning: 'The most recent contract related to AI is the partnership agreement dated 2024-03-15 at 10:30 UTC. It specifically mentions collaboration on artificial intelligence research and development.',
            final_answer: 'The most recent AI-related contract is a **Partnership Agreement** dated **2024-03-15 10:30 UTC** between **Weaviate** and **FictionalSoft**. It says the parties wish to establish a partnership to collaborate on **artificial intelligence research and development**. It has a **2-year term** and includes financial contributions of **$244.46 from Weaviate** and **$151.01 from FictionalSoft**, with profits split **50/50**.\n' +
                '\n' +
                'If you want, I can also summarize the next most recent AI-related contract.'
        }
        ```
        </details>
    </TabItem>
</Tabs>

## Example: Nested Schemas

Nested schemas are supported, for example, you can define two schemas and have one reference the other, allowing more complex structured outputs to be crafted.

In the below example, the final response will generate a list of information for each object that was retrieved, either extracted or generated from the content of the data, as well as providing an overall answer.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SONestedExampleBaseModel"
            endMarker="# END SONestedExampleBaseModel"
            language="py"
        />
        <details>
        <summary>Example output</summary>
        ```python
        ContractInfoResponse(
            contract_infos=[
                ContractInfo(
                    names_mentioned=['Hans Zimmer', 'Weaviate', 'Mark Robson'],
                    contract_type='other',
                    summary='Loan agreement between Weaviate and Mark Robson for $342.00, dated 2023-03-15.',
                    contract_uuid=UUID('b2c4ffdc-411c-423a-9040-b7cbf5439bd0')
                ),
                ContractInfo(
                    names_mentioned=['John Smith', 'Weaviate'],
                    contract_type='other',
                    summary='Non-disclosure agreement between Weaviate and John Smith, dated 2022-03-15.',
                    contract_uuid=UUID('c126e3d3-db85-4a77-b49c-2a87fe48cd52')
                ),
                ContractInfo(
                    names_mentioned=['Johnathan Smith', 'Weaviate', 'John Smith'],
                    contract_type='other',
                    summary='Lease agreement for office space between Weaviate and John Smith, dated 2024-03-15.',
                    contract_uuid=UUID('6bbca4b9-fea1-4275-889a-1f5d4591ecbb')
                ),
                ContractInfo(
                    names_mentioned=['Arthur Penndragon', 'Weaviate', 'Mark Robson'],
                    contract_type='other',
                    summary='Loan agreement between Weaviate and Mark Robson for $620.41, dated 2023-03-15.',
                    contract_uuid=UUID('93213fd4-4c55-4a7c-a190-2e4c9d808566')
                ),
                ContractInfo(
                    names_mentioned=['Alice Johnson', 'Weaviate', 'Danny Williams'],
                    contract_type='other',
                    summary='Service agreement for digital marketing services between Weaviate and Danny Williams, dated 
        2023-03-15, with total compensation of $961.89.',
                    contract_uuid=UUID('eed7d7f9-b06a-4d7b-b19a-f0f3782e49fd')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'John Smith'],
                    contract_type='other',
                    summary='Loan agreement between Weaviate and John Smith for $403.65, dated 2022-03-15.',
                    contract_uuid=UUID('5f75ec7e-ca7f-415c-9f5d-7d3a1518fad8')
                ),
                ContractInfo(
                    names_mentioned=['Hans Zimmer', 'Weaviate', 'Mark Robson'],
                    contract_type='sales',
                    summary='Sales agreement between Weaviate and Mark Robson for software licenses and support services, 
        dated 2023-04-24, with a total purchase price of $420.03.',
                    contract_uuid=UUID('174b1a9a-e9b2-4f48-960d-283a0fbbe3ab')
                ),
                ContractInfo(
                    names_mentioned=['John Williams', 'Weaviate', 'Mark Robson'],
                    contract_type='other',
                    summary='Service agreement between Weaviate and Mark Robson for consultation, software development, and
        project management services, dated 2023-04-15, with total compensation of $744.35.',
                    contract_uuid=UUID('65848d82-e38e-4bed-b0bb-0c2830af8b27')
                ),
                ContractInfo(
                    names_mentioned=['John Williams', 'Weaviate'],
                    contract_type='other',
                    summary='Invoice from Weaviate to John Williams for data analysis, API integration, system maintenance,
        technical support, and consultation services, dated 2023-10-15, totaling $873.17.',
                    contract_uuid=UUID('5b5544f9-7092-45d0-830d-dd211b0f3a70')
                ),
                ContractInfo(
                    names_mentioned=['Kaladin Stormblessed', 'Weaviate', 'John Smith'],
                    contract_type='other',
                    summary='Lease agreement between Weaviate and John Smith for office space, dated 2023-07-15.',
                    contract_uuid=UUID('f3f3730b-f3c4-4b2f-aa7a-1bc07b5814d8')
                ),
                ContractInfo(
                    names_mentioned=['Johnathan Smith', 'Weaviate', 'Mark Robson'],
                    contract_type='other',
                    summary='Non-disclosure agreement between Weaviate and Mark Robson, dated 2023-09-15.',
                    contract_uuid=UUID('3d4d802d-1820-4a5f-b8fe-6c5e189de1e6')
                ),
                ContractInfo(
                    names_mentioned=['John Williams', 'Weaviate', 'Danny Williams'],
                    contract_type='sales',
                    summary='Sales agreement between Weaviate and Danny Williams for products A, B, and C, dated 
        2023-11-15, with a total purchase price of $270.68.',
                    contract_uuid=UUID('e645324e-14a4-4ca4-aeae-da146d55a3bb')
                ),
                ContractInfo(
                    names_mentioned=['John Williams', 'Weaviate', 'Mark Robson'],
                    contract_type='other',
                    summary='Invoice from Weaviate to Mark Robson dated 2023-04-15 for consultation, software development, 
        and project management services, totaling $744.35.',
                    contract_uuid=UUID('48a58d82-e38e-4bed-b0bb-0c2830af8b27')
                ),
                ContractInfo(
                    names_mentioned=['John Williams', 'Weaviate', 'John Smith'],
                    contract_type='other',
                    summary='Invoice from Weaviate to John Smith dated 2023-10-15 for consultation, development, and 
        additional charges, totaling $296.36.',
                    contract_uuid=UUID('03c0f5bb-f999-4b8b-86f3-271405de0037')
                ),
                ContractInfo(
                    names_mentioned=['Johnathan Smith', 'Weaviate', 'Danny Williams'],
                    contract_type='other',
                    summary='Service agreement between Weaviate and Danny Williams for software development, technical 
        support, and consultation services, dated 2023-03-15, with compensation of $273.86.',
                    contract_uuid=UUID('d68e20a9-4bd4-42d0-8986-d16425c3444a')
                )
            ],
            overall_summary='There are multiple 2023 contracts related to AI, including two partnership agreements about artificial intelligence research and development, plus other 2023 contracts mentioning AI-adjacent services. Some listed contracts are not directly about AI but were returned from the available matching set.'
        )
        ```
        </details>
        A `Field` can be used to provide additional metadata, such as a `description`, or even constraints on numeric objects. A `Literal` can be used to constrain a field to produce only one of a few different objects.
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SONestedExampleBaseModel"
            endMarker="// END SONestedExampleBaseModel"
            language="ts"
        />
        A `.describe()` call can be used to provide additional metadata, such as a description, or even constraints on numeric objects. A `z.enum()` can be used to constrain a field to produce only one of a few different objects.
        <details>
        <summary>Example output</summary>
        ```typescript
        {
            contract_infos: [
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Partnership agreement to collaborate on artificial intelligence research and development, including shared contributions, responsibilities, and profit or revenue sharing. Date: 2023-03-15.',
                    contract_uuid: '583a63f9-f71b-4926-8075-2ade04a689c3'
                },
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Partnership agreement to collaborate on artificial intelligence projects and develop innovative AI solutions, with financial contributions, roles, and termination terms. Date: 2022-03-15.',
                    contract_uuid: '301d007b-53b4-4ce5-9913-a4b3f28fae2f'
                },
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Partnership agreement focused on artificial intelligence and machine learning collaboration, including resource contributions, revenue sharing, confidentiality, and termination terms. Date: 2023-03-15.',
                    contract_uuid: 'c2d4620b-db64-4b20-ac10-dd805d9b135d'
                },
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Partnership agreement to advance artificial intelligence technologies through combined resources and expertise, with defined contributions, responsibilities, and termination provisions. Date: 2023-03-15.',
                    contract_uuid: 'bbfd975d-85e8-47f1-acae-8d46ff028272'
                },
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Partnership agreement to collaborate on artificial intelligence projects, with project management, technical development, funding contributions, and termination terms. Date: 2023-03-15.',
                    contract_uuid: '6e2f283c-0e29-4daa-979f-800dffe476fb'
                },
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Service agreement for data analysis, cloud computing, software development, technical support, and consultation services. It includes compensation, confidentiality, and termination terms. Date: 2023-03-15 to 2023-09-15 depending on the agreement.',
                    contract_uuid: '8cab56ce-512e-47ef-9a38-5d5fa829444e'
                },
                {
                    names_mentioned: [Array],
                    contract_type: 'other',
                    summary: 'Service agreement providing consulting on artificial intelligence and data management systems, including implementation, training, and technical support. Date: 2023-03-15.',
                    contract_uuid: '24541d4f-d84c-4cbe-b935-60cbc64c170e'
                }
            ],
            overall_summary: 'The AI-related contracts available are partnership and service agreements from 2022–2023, with one purchase order and several invoices that mention AI or related services.'
        }
        ```
        </details>
    </TabItem>
</Tabs>

## Example: Citations

For a custom implementation of citing text (for example, if you want citations in-line), you could create a schema that iteratively builds a response from objects consisting of pairs of text and source IDs.

:::note Supported Citations
The Query Agent natively supports subsetting and evaluating the quality of the response via the `result_evaluation` parameter in ask mode. [See here for more details](../guides/ask_mode.md#parameters)
:::

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SOCitationExample"
            endMarker="# END SOCitationExample"
            language="py"
        />
        <details>
        <summary>Example output</summary>
        ```python
        CitedAnswer(
            reasoning='The most recent contract mentioning AI is the partnership agreement dated 2024-03-15, which explicitly refers to AI-related work only in the contract text by implication? However, among the provided contracts, the latest one that clearly concerns AI is the partnership agreement from 2023-11-15, and another earlier partnership agreement from 2023-10-15 also mentions AI solutions. The 2024-03-15 sales agreement does not mention AI, so it is not relevant. The latest clearly AI-related contract in the data is the 2023-11-15 partnership agreement between Weaviate and FictionalSoft.',
            final_answer=[
                CitedText(
                    sentence='The most recent contract about AI is the partnership agreement dated 2023-11-15 between Weaviate and FictionalSoft.',
                    sources=[UUID('4601c407-7905-4bd5-a1b9-4234bf18e9b6')]
                ),
                CitedText(
                    sentence='It says the parties will collaborate on projects including artificial intelligence research and development, with a three-year term and 50/50 profit sharing.',
                    sources=[UUID('4601c407-7905-4bd5-a1b9-4234bf18e9b6')]
                )
            ]
        )
        ```
        </details>
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SOCitationExample"
            endMarker="// END SOCitationExample"
            language="ts"
        />
        <details>
        <summary>Example output</summary>
        ```typescript
        {
            reasoning: 'The most recent contract that explicitly concerns AI is the partnership agreement dated 2023-11-15 between Weaviate and FictionalSoft, which states that the parties wish to collaborate on artificial intelligence research and development. Among the provided contracts, no later agreement mentions AI, and later-dated documents are sales or lease agreements without AI-related terms.',
            final_answer: [
                {
                    sentence: 'The most recent AI-related contract is the partnership agreement dated November 15, 2023, between Weaviate and FictionalSoft, which is for collaboration on artificial intelligence research and development.',
                    sources: [Array]
                },
                {
                    sentence: 'No later contract in the provided set mentions AI; the newer 2024 documents are a sales agreement and lease agreements that do not reference artificial intelligence.',
                    sources: [Array]
                }
            ]
        }
        ```
        </details>
    </TabItem>
</Tabs>

## What is supported?


| Feature | Supported? | Notes |
|---------|:----------:|-------|
| Min / max number of items in an array | ✅ | |
| Min / max value of a number property | ✅ | E.g. constrain a value to be within a certain range. |
| String formats: `uuid`, `date-time`, `time`, `date`, `duration`, `email`, `hostname`, `ipv4`, `ipv6` | ✅ | Validated as a string with the given format. |
| Regular expression (pattern) on a string | ✅ | |
| Recursive schemas (a schema referencing itself) | ✅ | |
| Default values (e.g. `x: int = 1`) | ❌ | The field is always populated by the model, so the default is never used. Consider using nullable entries and transforming them afterwards. |
| Schemas with 5000+ properties | ❌ |  |
| 1000 or more enum values across all properties | ❌ |  |
| More than 10 levels of nesting in a single property | ❌ |  |


## Streaming

Structured outputs are supported with [streaming ask mode](../guides/ask_mode.md#streaming).

When streaming, the structured output is delivered incrementally as raw string fragments through `StreamedTokens` instances. No special parsing is applied during the stream — each token is simply a piece of the final output. To use the result, accumulate the streamed tokens into a single string, then validate the completed string against your schema. You can also attempt partial validation as the string grows if you want to react to the output before the stream finishes.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
