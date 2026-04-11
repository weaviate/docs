---
title: Configure tokenization for keyword search
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCreateCollection from '!!raw-loader!/_includes/code/tutorials/tokenization/create_collection.py';
import PyAddObjects from '!!raw-loader!/_includes/code/tutorials/tokenization/add_objects.py';
import PyFilters from '!!raw-loader!/_includes/code/tutorials/tokenization/filters.py';
import PySearches from '!!raw-loader!/_includes/code/tutorials/tokenization/searches.py';
import PyAccentFolding from '!!raw-loader!/_includes/code/tutorials/tokenization/accent_folding.py';
import PyCustomStopwords from '!!raw-loader!/_includes/code/tutorials/tokenization/custom_stopwords.py';
import PyTokenizeEndpoint from '!!raw-loader!/_includes/code/tutorials/tokenization/tokenize_endpoint.py';
import TokenizerPreview from '/_includes/feature-notes/tokenizer-v137-preview.mdx';

## What you'll learn

In this tutorial, you'll learn how to configure tokenization in Weaviate and see how different tokenization methods impact keyword search and filtering results.

By the end of this tutorial, you'll understand:
- How to configure tokenization for a collection property
- How tokenization affects filter matching
- How tokenization impacts keyword search ranking
- How to choose the right tokenization method for your use case
- How accent folding normalizes accented characters for matching
- How to define and use custom stopword presets per property
- How to use the tokenize endpoint to test configurations

## Prerequisites

- A running Weaviate instance
- Python Weaviate client installed
- Basic familiarity with Weaviate collections

## Create a demo collection

We'll create a collection with multiple properties, each using a different tokenization method. This allows us to compare how the same text behaves under different tokenization strategies.

<FilteredTextBlock
  text={PyCreateCollection}
  startMarker="# CreateDemoCollection"
  endMarker="# END CreateDemoCollection"
  language="py"
/>

Note that we do not add object vectors in this case, as we are only interested in the impact of tokenization on filters and keyword searches.

## Add test data

We'll use a small, custom dataset for demonstration purposes.

<FilteredTextBlock
  text={PyAddObjects}
  startMarker="# StringsToAdd"
  endMarker="# END StringsToAdd"
  language="py"
/>

Now, add objects to the collection, repeating text objects across properties with different tokenization methods.

<FilteredTextBlock
  text={PyAddObjects}
  startMarker="# AddObjects"
  endMarker="# END AddObjects"
  language="py"
/>

## Example 1: Punctuation and case sensitivity

Let's see how tokenization handles messy text with punctuation and mixed cases. We'll filter for various combinations of substrings from the TV show title `"Lois & Clark: The New Adventures of Superman"`.

### Setup the filter function

We'll create a reusable function to filter objects based on query strings. Remember that a filter is binary: it either matches or it doesn't.

<FilteredTextBlock
  text={PyFilters}
  startMarker="# FilterExampleBasic"
  endMarker="# END FilterExampleBasic"
  language="py"
/>

### Test "Clark:" vs "clark"

<FilteredTextBlock
  text={PyFilters}
  startMarker="# ClarkExample"
  endMarker="# END ClarkExample"
  language="py"
/>

The results show whether the query matched the title:

|               | `word` | `lowercase` | `whitespace` | `field` |
|---------------|--------|-------------|--------------|---------|
| `"clark"`       | ✅     | ❌         | ❌          | ❌     |
| `"Clark"`       | ✅     | ❌         | ❌          | ❌     |
| `"clark:" `     | ✅     | ✅         | ❌          | ❌     |
| `"Clark:" `     | ✅     | ✅         | ✅          | ❌     |
| `"lois clark"`  | ✅     | ❌         | ❌          | ❌     |
| `"clark lois"`  | ✅     | ❌         | ❌          | ❌     |

<details>
  <summary>Example output</summary>

<FilteredTextBlock
  text={PyFilters}
  startMarker="# ClarkResults"
  endMarker="# END ClarkResults"
  language="text"
/>

</details>

**Key observations:**
- `word` tokenization consistently matches regardless of case or punctuation
- `lowercase` and `whitespace` require more exact matches
- Users typically don't include punctuation in queries, making `word` a good default

## Example 2: Stop words

Here, we filter for variants of the phrase "computer mouse", where some queries include additional words like "a" or "the".

<FilteredTextBlock
  text={PyFilters}
  startMarker="# MouseExample"
  endMarker="# END MouseExample"
  language="py"
/>

**Matches for `"computer mouse"`**

|                              | `word`    | `lowercase` | `whitespace` | `field` |
|------------------------------|-----------|-------------|--------------|---------|
| `"computer mouse"`           | ✅        | ✅           | ✅           | ✅     |
| `"a computer mouse"`         | ✅        | ✅           | ✅           | ❌     |
| `"the computer mouse:" `     | ✅        | ✅           | ✅           | ❌     |
| `"blue computer mouse" `     | ❌        | ❌           | ❌           | ❌     |

**Matches for `"a computer mouse"`**

|                              | `word`    | `lowercase` | `whitespace` | `field` |
|------------------------------|-----------|-------------|--------------|---------|
| `"computer mouse"`           | ✅        | ✅           | ✅           | ❌     |
| `"a computer mouse"`         | ✅        | ✅           | ✅           | ✅     |
| `"the computer mouse:" `     | ✅        | ✅           | ✅           | ❌     |
| `"blue computer mouse" `     | ❌        | ❌           | ❌           | ❌     |

<details>
  <summary>Example output</summary>

<FilteredTextBlock
  text={PyFilters}
  startMarker="# MouseResults"
  endMarker="# END MouseResults"
  language="text"
/>

</details>

**Key observations:**
- Stop words like "a" and "the" are ignored in `word`, `lowercase`, and `whitespace` tokenization
- `field` tokenization treats the entire string as one token, so stop words matter
- Adding non-stop words like "blue" prevents matches

## Example 3: Symbols and underscores

The `word` tokenization is a good default, but may not work for data with meaningful symbols. Let's test different variants of `"variable_name"`.

<FilteredTextBlock
  text={PyFilters}
  startMarker="# UnderscoreExample"
  endMarker="# END UnderscoreExample"
  language="py"
/>

|                              | `word`    | `lowercase` | `whitespace` | `field` |
|------------------------------|-----------|-------------|--------------|---------|
| `"variable_name"`            | ✅        | ✅           | ✅           | ✅     |
| `"Variable_Name:" `          | ✅        | ✅           | ❌           | ❌     |
| `"Variable Name:" `          | ✅        | ❌           | ❌           | ❌     |
| `"a_variable_name"`          | ✅        | ❌           | ❌           | ❌     |
| `"the_variable_name"`        | ✅        | ❌           | ❌           | ❌     |
| `"variable_new_name" `       | ✅        | ❌           | ❌           | ❌     |

<details>
  <summary>Example output</summary>

<FilteredTextBlock
  text={PyFilters}
  startMarker="# UnderscoreResults"
  endMarker="# END UnderscoreResults"
  language="text"
/>

</details>

**Key observations:**
- `word` tokenization treats underscores as separators, which may be too permissive
- For code, email addresses, or data where symbols are meaningful, use `lowercase` or `whitespace`
- Consider whether `"variable_new_name"` should match `"variable_name"` in your use case

## Example 4: Accent folding

<TokenizerPreview/>

Suppose you run a multilingual product catalog with names like "Café Crème Bio", "Łódź Ceramics", and "São Paulo Sandals". Without accent folding, a user searching for "cafe creme" or "lodz" would not find these products because the accented and unaccented forms produce different tokens.

### Create a collection with accent folding

<FilteredTextBlock
  text={PyAccentFolding}
  startMarker="# AccentFoldingCreateCollection"
  endMarker="# END AccentFoldingCreateCollection"
  language="py"
/>

We create three properties: one without folding (`text_default`), one with full folding (`text_folded`), and one that preserves `é` (`text_folded_keep_e`).

### Add test data

<FilteredTextBlock
  text={PyAccentFolding}
  startMarker="# AccentFoldingAddObjects"
  endMarker="# END AccentFoldingAddObjects"
  language="py"
/>

### Filter with accent folding

<FilteredTextBlock
  text={PyAccentFolding}
  startMarker="# AccentFoldingFilter"
  endMarker="# END AccentFoldingFilter"
  language="py"
/>

| Query | `text_default` (no folding) | `text_folded` | `text_folded_keep_e` |
|-------|-----------|------------|-----------------|
| `"cafe"` | ❌ | ✅ Café Crème Bio | ❌ (`é` preserved) |
| `"Café"` | ✅ | ✅ | ✅ |
| `"lodz"` | ❌ | ✅ Łódź Ceramics | ✅ |
| `"sao paulo"` | ❌ | ✅ São Paulo Sandals | ✅ |
| `"muller"` | ❌ | ✅ Müller Bräu | ✅ |

<details>
  <summary>Example output</summary>

<FilteredTextBlock
  text={PyAccentFolding}
  startMarker="# AccentFoldingResults"
  endMarker="# END AccentFoldingResults"
  language="text"
/>

</details>

**Key observations:**
- Without folding, only exact accented forms match
- With `asciiFold: true`, both accented and unaccented queries match
- `asciiFoldIgnore` lets you preserve specific characters — `"cafe"` no longer matches `"Café"` when `é` is ignored
- `asciiFoldIgnore` is immutable after property creation

## Example 5: Custom and per-property stopword presets

<TokenizerPreview/>

The default stopword presets are `en` and `none`. For a French property, neither is appropriate — `la`, `le`, and `et` should be filtered, but they are not in the English list. Define a custom preset on the collection and assign it to specific properties.

### Create a collection with custom stopwords

<FilteredTextBlock
  text={PyCustomStopwords}
  startMarker="# CustomStopwordsCreate"
  endMarker="# END CustomStopwordsCreate"
  language="py"
/>

### Add test data

<FilteredTextBlock
  text={PyCustomStopwords}
  startMarker="# CustomStopwordsAddObjects"
  endMarker="# END CustomStopwordsAddObjects"
  language="py"
/>

### Search with per-property stopwords

<FilteredTextBlock
  text={PyCustomStopwords}
  startMarker="# CustomStopwordsSearch"
  endMarker="# END CustomStopwordsSearch"
  language="py"
/>

<details>
  <summary>Example output</summary>

<FilteredTextBlock
  text={PyCustomStopwords}
  startMarker="# CustomStopwordsResults"
  endMarker="# END CustomStopwordsResults"
  language="text"
/>

</details>

**Key observations:**
- The `fr` preset filters out `la`, `le`, and `et` from BM25 scoring on the French property
- The same words are not filtered on the English property (they are not English stopwords)
- Stopwords are still indexed — only filtered at query time — so changing presets does not require reindexing
- Custom presets can also extend a built-in preset with `additions` and `removals`

## Example 6: Inspecting tokenization with the tokenize endpoint

<TokenizerPreview/>

Tuning an analyzer is much easier when you can see what it does. Two REST endpoints make the tokenization process visible.

### Ad-hoc tokenization

`POST /v1/tokenize` tokenizes arbitrary text with an explicit tokenizer and analyzer config. Use this to test configurations before committing them to a schema.

<FilteredTextBlock
  text={PyTokenizeEndpoint}
  startMarker="# TokenizeEndpointFreeform"
  endMarker="# END TokenizeEndpointFreeform"
  language="py"
/>

```json
{
  "tokenization": "word",
  "indexed": ["the", "organic", "cafe", "creme", "blend"],
  "query":   ["organic", "cafe", "creme", "blend"]
}
```

The response distinguishes **`indexed`** tokens (what is stored in the inverted index) from **`query`** tokens (what BM25 actually scores after stopword filtering).

### Property-specific tokenization

`POST /v1/schema/{className}/properties/{propertyName}/tokenize` resolves the analyzer config from an existing property, so you can see what a specific property would do with a given input:

<FilteredTextBlock
  text={PyTokenizeEndpoint}
  startMarker="# TokenizeEndpointProperty"
  endMarker="# END TokenizeEndpointProperty"
  language="py"
/>

```json
{
  "tokenization": "word",
  "indexed": ["la", "tasse", "bleue", "et", "le", "bol"],
  "query":   ["tasse", "bleue", "bol"]
}
```

**Notes:**
- The endpoint resolves collection aliases to the underlying class
- Class and property names are case-insensitive
- All tokenizers are supported, including the optional APAC tokenizers (`gse`, `kagome_ja`, `kagome_kr`) when enabled

## Keyword searches vs filters

Tokenization impacts keyword searches similarly to filters, but with important differences.

### Setup the search function

<FilteredTextBlock
  text={PySearches}
  startMarker="# FilterExampleBasic"
  endMarker="# END FilterExampleBasic"
  language="py"
/>

### Keyword search differences

Keyword searches use the BM25f algorithm to rank results. Tokenization has two effects:

1. **Inclusion**: Determines whether a result appears at all
2. **Ranking**: Affects the score based on matching tokens

Let's revisit the "Clark" example with keyword search:

<FilteredTextBlock
  text={PySearches}
  startMarker="# ClarkExample"
  endMarker="# END ClarkExample"
  language="py"
/>

|               | `word` | `lowercase` | `whitespace` | `field` |
|---------------|--------|-------------|--------------|---------|
| `"clark"`       | 0.613     | ❌           | ❌          | ❌     |
| `"Clark"`       | 0.613     | ❌           | ❌          | ❌     |
| `"clark:" `     | 0.613     | 0.48         | ❌          | ❌     |
| `"Clark:" `     | 0.613     | 0.48         | 0.48        | ❌     |
| `"lois clark"`  | 1.226     | 0.48         | ❌          | ❌     |
| `"clark lois"`  | 1.226     | 0.48         | ❌          | ❌     |

**Key observations:**
- More matching tokens = higher scores (e.g., "lois clark" scores higher than "clark")
- Keyword search returns objects matching ANY token (not just ALL tokens)
- Scores vary based on token matching frequency

### Stop words in keyword search

<FilteredTextBlock
  text={PySearches}
  startMarker="# MouseExample"
  endMarker="# END MouseExample"
  language="py"
/>

**Matches for `"computer mouse"`**

|                              | `word`    | `lowercase` | `whitespace` | `field` |
|------------------------------|-----------|-------------|--------------|---------|
| `"computer mouse"`           | 0.889     | 0.819       | 1.01         | 0.982   |
| `"Computer Mouse"`           | 0.889     | 0.819       | ❌            | ❌      |
| `"a computer mouse"`         | 0.764     | 0.764       | 0.849        | ❌      |
| `"computer mouse pad" `      | 0.764     | 0.764       | 0.849        | ❌      |

**Matches for `"a computer mouse"`**

|                              | `word`    | `lowercase` | `whitespace` | `field` |
|------------------------------|-----------|-------------|--------------|---------|
| `"computer mouse"`           | 0.889     | 0.819       | 1.01         | ❌      |
| `"Computer Mouse"`           | 0.889     | 0.819       | ❌           | ❌      |
| `"a computer mouse"`         | 0.764     | 1.552       | 1.712        | 0.982   |
| `"computer mouse pad" `      | 0.764     | 0.688       | 0.849        | ❌      |

**Key observations:**
- Stop words don't prevent matches, but affect ranking
- Scores differ for objects with/without stop words
- `lowercase` and `whitespace` don't remove stop words from queries, giving users more control

## Choosing your tokenization method

Based on what we've learned, here's guidance for choosing a tokenization method:

### Use `word` (default) when:
- Working with typical text data (articles, descriptions, names)
- Users won't include exact punctuation in queries
- Case-insensitivity is desired
- You want forgiving search behavior

### Use `lowercase` when:
- Symbols like `&`, `@`, `_`, `-` are meaningful
- Working with code snippets, email addresses, or technical notation
- You want case-insensitivity but need to preserve symbols

### Use `whitespace` when:
- Case sensitivity is important (entity names, acronyms)
- Symbols are meaningful
- You can handle case-sensitivity in your query construction

### Use `field` when:
- Exact matches are required
- Working with unique identifiers (URLs, IDs, exact email addresses)
- You'll use wildcard filters for partial matches
- Note: Can be slow with wildcards; use judiciously

### Hybrid searches

A hybrid search combines keyword search and vector search results. Tokenization only impacts the keyword search portion; the vector search part uses the model's built-in tokenization.

## Summary

You've learned how to:
- Configure different tokenization methods for collection properties
- Test and compare tokenization behavior with filters and searches
- Understand the trade-offs between different tokenization methods
- Choose the appropriate tokenization method for your use case
- Configure accent folding for multilingual text matching
- Define custom stopword presets and assign them per property
- Use the tokenize endpoint to preview tokenization behavior

The key takeaway: **tokenization is a core part of your search strategy**. Start with `word` as a sensible default, but adjust based on your data characteristics and user expectations.

## Next steps

- Read more about tokenization in the [Concepts page](/weaviate/concepts/indexing/inverted-index.md#tokenization)
- Configure tokenization in your schema: [Configuration reference](/weaviate/config-refs/collections.mdx#tokenization)
- Learn about stop words: [Stopwords configuration](/weaviate/config-refs/indexing/inverted-index.mdx#stopwords)
- Understand the inverted index: [Inverted index concepts](/weaviate/concepts/indexing/inverted-index.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

