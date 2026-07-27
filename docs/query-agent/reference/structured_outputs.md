---
title: Structured outputs
description: "Conform the final response to a particular schema."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'configuration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/query-agent/_includes/code/structured_outputs.py';
import TSCode from '!!raw-loader!/docs/query-agent/_includes/code/structured_outputs.mts';


Structured outputs ensure that the Query Agent's final response adheres to a schema that you provide. Instead of parsing a free-text answer, you get back an object whose fields are customized to your use case.

Structured outputs are supported in **[Ask Mode](../guides/ask_mode.md) only.**

:::info Client versions
Structured outputs require `weaviate-agents` **1.7.0 or later** in Python, and **1.6.0 or later** in JavaScript/TypeScript. The JavaScript/TypeScript examples that use a Zod schema also require **Zod 4 or later**. [See the installation page](../installation.md).
:::

The example outputs on this page are illustrative. The Query Agent is non-deterministic, so the wording, the level of detail, and the specific records it selects will vary between runs, even for an identical query and schema. The *shape* of the response is what the schema guarantees.

## Basic usage

Set the schema per request, with the `output_format` argument of `.ask()` (`outputFormat` in JavaScript/TypeScript). The examples on this page use a Query Agent instantiated over a `FinancialContracts` collection ([see the class instantiation page for more detail](./instantiation.md)):

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SOInstantiate"
            endMarker="# END SOInstantiate"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SOInstantiate"
            endMarker="// END SOInstantiate"
            language="ts"
        />
    </TabItem>
</Tabs>

The examples below use structured outputs to generate a set of metadata associated with a single retrieved item.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        In Python, you can either provide a Pydantic `BaseModel` or a raw dictionary conforming to the [Draft 2020-12 JSON Schema](https://json-schema.org/draft/2020-12) specification.

        The structured output is available on a new field, `final_answer_parsed`, which appears when you provide `output_format`. The raw string from the model can still be accessed at `final_answer`.

        **Pydantic BaseModel**
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
            contract_id='46.0',
            contract_title='Employment Contract',
            auto_renew=False,
            parties_involved=['Weaviate (Employer)', 'Mark Robson (Employee)', 'Hans Zimmer (Chief Executive Officer/signatory)'],
            requires_action=True
        )
        ```
        </details>


        **Dictionary**
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
            'contract_id': '46.0',
            'contract_title': 'Employment Contract',
            'auto_renew': False,
            'parties_involved': ['Weaviate (Employer)', 'Mark Robson (Employee)', 'Hans Zimmer, Chief Executive Officer'],
            'requires_action': True
        }
        ```
        </details>

    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        In JavaScript/TypeScript, you can either provide a [Zod](https://zod.dev/) schema or a raw object conforming to the [Draft 2020-12 JSON Schema](https://json-schema.org/draft/2020-12) specification.

        The structured output is available on a new field, `finalAnswerParsed`, which appears when you provide `outputFormat`. The raw string from the model can still be accessed at `finalAnswer`.

        **Zod schema**
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
            contract_id: '46.0',
            contract_title: 'Employment Contract',
            auto_renew: false,
            parties_involved: [ 'Weaviate (Employer)', 'Mark Robson (Employee)' ],
            requires_action: true
        }
        ```
        </details>

        **Object**
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
            contract_id: '46',
            contract_title: 'Employment Contract',
            auto_renew: false,
            parties_involved: [
                'Weaviate (Employer)',
                'Mark Robson (Employee)',
                'Hans Zimmer (Chief Executive Officer and signatory)'
            ],
            requires_action: true
        }
        ```
        </details>

        The `additionalProperties: false` entry above is what Zod's own JSON Schema conversion emits, so the two examples describe the same schema. It is optional — the Query Agent accepts a schema with or without it.

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
            reasoning='Among the provided contracts, the latest one explicitly concerning AI is dated November 15, 2023. It is a partnership agreement between Weaviate and OpenAI for collaboration on artificial intelligence research and development. The March 15, 2024 contracts are sales and lease agreements and do not concern AI.',
            final_answer='The most recent AI-related contract is a **Partnership Agreement dated November 15, 2023**, between **Weaviate and OpenAI**. It establishes a three-year partnership to collaborate on **artificial intelligence research and development**. Weaviate is responsible for marketing and promotion, while OpenAI provides technical expertise and development support; profits are to be split equally.\n\n- **Contract type:** Partnership agreement\n- **Date:** November 15, 2023\n- **Author/signatory:** Johnathan Smith, CEO of Weaviate\n- **Document ID:** 60'
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
            reasoning: 'The latest dated contract explicitly concerning AI is dated May 15, 2023. Later contracts in the provided data are dated November 15, 2023 and March 15, 2024, but do not concern AI. There are multiple duplicate records for the May 15 contract; the matching record identifies doc_id 56.0 and author Alice Johnson.',
            final_answer: 'The most recent AI-related contract is a **Partnership Agreement** dated **May 15, 2023**.\n\n- **Author:** Alice Johnson\n- **Doc ID:** 56.0\n- **Summary:** Weaviate and OpenAI agree to collaborate on developing AI-driven solutions to improve data management and retrieval. Weaviate contributes $391.74, OpenAI contributes $302.40, profits are split 60/40, and the agreement lasts three years.\n\nNo later contract in the provided records explicitly concerns AI.'
        }
        ```
        </details>
    </TabItem>
</Tabs>

## Example: Nested schemas

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
        A `Field` can be used to provide additional metadata, such as a `description`, or even constraints on numeric objects. A `Literal` can be used to constrain a field to produce only one of a few different objects.
        <details>
        <summary>Example output</summary>
        ```python
        ContractInfoResponse(
            contract_infos=[
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Mark Robson', 'Kaladin Stormblessed'],
                    contract_type='other',
                    summary='Partnership Agreement dated March 15, 2023, establishing collaboration between Weaviate and OpenAI on artificial intelligence research and development. Weaviate contributes technology resources valued at $112.85 and staff time valued at $550.09; OpenAI contributes research expertise and project-management support valued at $98.14. Net profits are split 60% to Weaviate and 40% to OpenAI.',
                    contract_uuid=UUID('8ec8f74a-2d38-4aca-80ca-e66f12ae0cb6')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Alice Johnson', 'Mark Robson'],
                    contract_type='other',
                    summary='Partnership Agreement dated March 15, 2023, for collaboration on artificial intelligence projects. Weaviate contributes $210.97 toward initial project costs, while OpenAI contributes $194.05 toward research and development. OpenAI is responsible for technical development and AI research expertise.',
                    contract_uuid=UUID('056b6b5c-d6d3-4235-9003-4822dbbef9ef')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Arthur Penndragon', 'Mark Robson', 'Danny Williams'],
                    contract_type='other',
                    summary='Partnership Agreement dated March 15, 2023, for artificial intelligence research and development, with shared resources and expertise. Weaviate contributes technology resources and staff time; OpenAI contributes research expertise and project-management support. Profits are divided 60% to Weaviate and 40% to OpenAI.',
                    contract_uuid=UUID('c50c3b9b-339a-4830-b2f7-4b0b9b84bc56')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Edward Elric', 'Mark Robson'],
                    contract_type='other',
                    summary='Partnership Agreement dated March 15, 2023, to develop advanced data-processing technologies. Weaviate provides technological support and resources valued at $416.56; OpenAI contributes AI and machine-learning expertise valued at $567.91. Revenue is split 60% to Weaviate and 40% to OpenAI.',
                    contract_uuid=UUID('3cec1521-3d26-46b3-b63f-1af2ddaa3db4')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI'],
                    contract_type='other',
                    summary='Partnership Agreement dated March 15, 2023, focused on collaborative projects in AI technology development. Weaviate contributes $234.12 toward project funding, and OpenAI contributes $173.25 for marketing and promotion. Weaviate handles technical development, while OpenAI conducts research and data analysis.',
                    contract_uuid=UUID('3d2afbc4-24c1-4f64-b676-193e4dccb451')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Johnathan Smith', 'Mark Robson'],
                    contract_type='other',
                    summary='Partnership Agreement dated March 15, 2023, to advance artificial intelligence technologies and develop innovative AI solutions. Weaviate contributes $177.98 and OpenAI contributes $67.09; each party is responsible for roles specified in an attached exhibit.',
                    contract_uuid=UUID('8ac31eff-9936-4a1b-a5a4-8e148a4596bf')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Alice Johnson', 'Mark Robson'],
                    contract_type='other',
                    summary='Partnership Agreement dated October 15, 2023, for development of innovative AI solutions. Weaviate contributes $726.88 and project resources, while OpenAI contributes $251.09 and technical expertise. Profits are shared 60% to Weaviate and 40% to OpenAI.',
                    contract_uuid=UUID('aa3c40bc-8bea-42d3-9692-75a417a99a0d')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Johnathan Smith', 'Mark Robson'],
                    contract_type='other',
                    summary='Partnership Agreement dated November 15, 2023, covering projects including artificial intelligence research and development. Weaviate contributes $244.46 and handles marketing; OpenAI contributes $151.01 and provides technical expertise. Profits are shared equally.',
                    contract_uuid=UUID('1e85f2b6-f2f7-4e52-86ba-c4f508f6c06d')
                ),
                ContractInfo(
                    names_mentioned=['Weaviate', 'OpenAI', 'Alice Johnson', 'Danny Williams'],
                    contract_type='other',
                    summary='Service Agreement dated March 15, 2023, for AI development and consulting services. The total fee is $249.44, payable in two installments of $124.72.',
                    contract_uuid=UUID('1363c2ae-83e6-4049-8f95-cd6c873a997e')
                )
            ],
            overall_summary='Nine distinct contracts concerning AI, artificial intelligence research and development, AI technology development, AI solutions, or AI development and consulting were identified in 2023. Several duplicate records in the provided data were consolidated by document identity.'
        )
        ```
        </details>
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
                    names_mentioned: [ 'Weaviate', 'OpenAI', 'Alice Johnson', 'Mark Robson' ],
                    contract_type: 'other',
                    summary: 'Partnership agreement dated March 15, 2023, between Weaviate and OpenAI to collaborate on artificial intelligence projects. Weaviate contributes $210.97 and OpenAI contributes $194.05; OpenAI is responsible for technical development and AI research expertise.',
                    contract_uuid: '056b6b5c-d6d3-4235-9003-4822dbbef9ef'
                },
                {
                    names_mentioned: [ 'Weaviate', 'Danny Williams', 'Alice Johnson' ],
                    contract_type: 'other',
                    summary: 'Service agreement dated March 15, 2023, for AI development and consulting services. The total compensation is $249.44, payable in two installments, with a two-year term ending March 15, 2025.',
                    contract_uuid: '1363c2ae-83e6-4049-8f95-cd6c873a997e'
                },
                {
                    names_mentioned: [ 'Weaviate', 'Danny Williams', 'Kaladin Stormblessed' ],
                    contract_type: 'other',
                    summary: 'Service agreement dated March 15, 2023, for consulting on artificial intelligence and data management systems, including implementation, training, and technical support. The total fee is $428.14, with a two-year term ending March 15, 2025.',
                    contract_uuid: 'dbc30467-5f6a-4630-b7ea-7a17ade8b70a'
                },
                {
                    names_mentioned: [ 'Weaviate', 'OpenAI', 'Edward Elric', 'Mark Robson' ],
                    contract_type: 'other',
                    summary: 'Partnership agreement dated March 15, 2023, for developing advanced data processing technologies. OpenAI contributes AI and machine-learning expertise valued at $567.91, while Weaviate provides technological support and resources valued at $416.56. Revenue is split 60% to Weaviate and 40% to OpenAI.',
                    contract_uuid: '3cec1521-3d26-46b3-b63f-1af2ddaa3db4'
                },
                {
                    names_mentioned: [ 'Weaviate', 'OpenAI', 'Johnathan Smith', 'Mark Robson' ],
                    contract_type: 'other',
                    summary: 'Partnership agreement dated March 15, 2023, to collaborate on advancements in artificial intelligence technologies and develop innovative AI solutions. Weaviate contributes $177.98 and OpenAI contributes $67.09.',
                    contract_uuid: '8ac31eff-9936-4a1b-a5a4-8e148a4596bf'
                },
                {
                    names_mentioned: [ 'Weaviate', 'OpenAI', 'Alice Johnson', 'Mark Robson' ],
                    contract_type: 'other',
                    summary: 'Partnership agreement dated May 15, 2023, for developing AI-driven solutions to improve data management and retrieval. Weaviate contributes $391.74 and OpenAI contributes $302.40; profits are split 60% and 40%, respectively.',
                    contract_uuid: 'e32c13b7-b552-45f6-b58b-3f0c325715ab'
                }
            ],
            overall_summary: 'Several 2023 contracts concern AI or artificial-intelligence-related services and projects, comprising partnership agreements and AI-related service agreements. Duplicate records were consolidated by document identity.'
        }
        ```
        </details>
    </TabItem>
</Tabs>

## Example: Citations

For a custom implementation of citing text (for example, if you want citations in-line), you could create a schema that iteratively builds a response from objects consisting of pairs of text and source IDs.

:::note Supported Citations
The Query Agent natively supports subsetting and evaluating the quality of the response via the `result_evaluation` parameter in Ask Mode. [See the Ask Mode parameters for more details](../guides/ask_mode.md#parameters).
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
            reasoning='The latest dated contract in the provided records that explicitly concerns AI is the partnership agreement dated November 15, 2023 (doc_id 60.0), which covers collaboration on AI research and development. The March 15, 2024 contract is a sales agreement for unspecified products and does not mention AI.',
            final_answer=[
                CitedText(
                    sentence='The most recent contract explicitly about AI is a Partnership Agreement dated November 15, 2023, between Weaviate and OpenAI (doc_id 60.0), authored by Johnathan Smith.',
                    sources=[UUID('a06ab40a-bcc3-4fc2-bb8a-b2b2598f706c')]
                ),
                CitedText(
                    sentence='It establishes a three-year collaboration on projects including artificial-intelligence research and development, with Weaviate contributing $244.46, OpenAI contributing $151.01, shared marketing and technical responsibilities, and profits split equally.',
                    sources=[UUID('a06ab40a-bcc3-4fc2-bb8a-b2b2598f706c')]
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
            reasoning: 'The latest dated contract in the provided records that explicitly concerns AI is dated May 15, 2023. It is a partnership agreement for developing AI-driven solutions; the later March 15, 2024 contracts do not mention AI.',
            final_answer: [
                {
                    sentence: 'The most recent AI-related contract is a Partnership Agreement dated May 15, 2023, authored by Alice Johnson, with document ID 56.0.',
                    sources: [ 'e32c13b7-b552-45f6-b58b-3f0c325715ab' ]
                },
                {
                    sentence: 'It establishes a partnership between Weaviate and OpenAI to develop AI-driven solutions for improving data management and retrieval, with Weaviate contributing $391.74, OpenAI contributing $302.40, and profits split 60% to Weaviate and 40% to OpenAI over a three-year term.',
                    sources: [ 'e32c13b7-b552-45f6-b58b-3f0c325715ab' ]
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
| String formats: `uuid`, `date-time`, `time`, `date`, `duration`, `email`, `hostname`, `ipv4`, `ipv6` | ✅ | Constrains the model to generate a string in the shape of the given format. The value is not validated against the full specification for that format after generation, so ask for a field the retrieved data can actually populate. |
| Regular expression (pattern) on a string | ✅ | |
| Recursive schemas (a schema referencing itself) | ✅ | |
| Default values (e.g. `x: int = 1`) | ❌ | The schema is accepted, but the field is always populated by the model, so the default is never used. Consider using nullable entries and transforming them afterwards. |
| Schemas with 5000+ properties | ❌ | Rejected with a `SCHEMA_VALIDATION_ERROR` before the agent runs. |
| 1000 or more enum values across all properties | ❌ | Rejected with a `SCHEMA_VALIDATION_ERROR` before the agent runs. |
| More than 10 levels of nesting in a single property | ❌ | Rejected with a `SCHEMA_VALIDATION_ERROR` before the agent runs. The error names the offending field path and its depth. |


## Streaming

Structured outputs are supported with [streaming in Ask Mode](../guides/ask_mode.md#streaming).

When streaming, the structured output is delivered incrementally as raw string fragments through `StreamedTokens` instances. No special parsing is applied during the stream — each token is a fragment of the final output. To use the partial result, accumulate the streamed tokens into a single string, then partially validate the string against your schema.

To use the final result after completion, you do not need to use the streamed tokens. Read the `final_answer_parsed` attribute (`finalAnswerParsed` in TypeScript) of the [final state output](../guides/ask_mode.md#responses).

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
