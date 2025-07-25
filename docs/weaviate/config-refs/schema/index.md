---
title: Collection definition
description: Schema Configuration in Weaviate
sidebar_position: 10
image: og/docs/configuration.jpg
# tags: ['Data types']
---
import SkipLink from '/src/components/SkipValidationLink'

## Introduction

A collection definition describes how to store and index a set of data objects in Weaviate. This page discuses the collection definition, collection parameters and collection configuration.

import Terminology from '/_includes/collection-class-terminology.md';

<Terminology />

## Collection object

An example of a complete collection object including properties:

```json
{
  "class": "Article",                       // The name of the collection in string format
  "description": "An article",              // A description for your reference
  "vectorIndexType": "hnsw",                // Defaults to hnsw
  "vectorIndexConfig": {
    ...                                     // Vector index type specific settings, including distance metric
  },
  "vectorizer": "text2vec-contextionary",   // Vectorizer to use for data objects added to this collection
  "moduleConfig": {
    "text2vec-contextionary": {
      "vectorizeClassName": true            // Include the collection name in vector calculation (default true)
    }
  },
  "properties": [                           // An array of the properties you are adding, same as a Property Object
    {
      "name": "title",                     // The name of the property
      "description": "title of the article",              // A description for your reference
      "dataType": [                         // The data type of the object as described above. When
                                            //    creating cross-references, a property can have
                                            //    multiple data types, hence the array syntax.
        "text"
      ],
      "moduleConfig": {                     // Module-specific settings
        "text2vec-contextionary": {
          "skip": true,                     // If true, the whole property will NOT be included in
                                            //    vectorization. Default is false, meaning that the
                                            //    object will be NOT be skipped.
          "vectorizePropertyName": true,    // Whether the name of the property is used in the
                                            //    calculation for the vector position of data
                                            //    objects. Default false.
        }
      },
      "indexFilterable": true,              // Optional, default is true. By default each property
                                            //    is indexed with a roaring bitmap index where
                                            //     available for efficient filtering.
      "indexSearchable": true               // Optional, default is true. By default each property
                                            //    is indexed with a searchable index for
                                            //    BM25-suitable Map index for BM25 or hybrid
                                            //    searching.
    }
  ],
  "invertedIndexConfig": {                  // Optional, index configuration
    "stopwords": {
      ...                                   // Optional, controls which words should be ignored in the inverted index, see section below
    },
    "indexTimestamps": false,               // Optional, maintains inverted indexes for each object by its internal timestamps
    "indexNullState": false,                // Optional, maintains inverted indexes for each property regarding its null state
    "indexPropertyLength": false            // Optional, maintains inverted indexes for each property by its length
  },
  "shardingConfig": {
    ...                                     // Optional, controls behavior of the collection in a
                                            //    multi-node setting, see section below
  },
  "multiTenancyConfig": {"enabled": true}   // Optional, for enabling multi-tenancy for this
                                            //    collection (default: false)
}
```

## Create a collection

### Mutability

Some, but not all, parameters are mutable after you create your collection. To modify immutable parameters, export your data, create a new collection, and import your data into it.

<details>
  <summary>Mutable parameters</summary>

import RaftRFChangeWarning from '/_includes/1-25-replication-factor.mdx';

<!-- Note: remove below "(not mutable in `v1.25`)" note when the feature is released. -->

<RaftRFChangeWarning/>

import CollectionMutableParameters from '/_includes/collection-mutable-parameters.mdx';

<CollectionMutableParameters/>

</details>

After you create a collection, you can add new properties. You cannot modify existing properties after you create the collection. You can also [add new named vectors](#adding-a-named-vector-after-collection-creation).

### Auto-schema

:::info Added in `v1.5`
:::

The "Auto-schema" feature generates a collection definition automatically by inferring parameters from data being added. It is enabled by default, and can be disabled (e.g. in `docker-compose.yml`) by setting `AUTOSCHEMA_ENABLED: 'false'`.

It will:

* Create a collection if an object is added to a non-existent collection.
* Add any missing property from an object being added.
* Infer array data types, such as `int[]`, `text[]`, `number[]`, `boolean[]`, `date[]` and `object[]`.
* Infer nested properties for `object` and `object[]` data types (introduced in `v1.22.0`).
* Throw an error if an object being added contains a property that conflicts with an existing schema type. (e.g. trying to import text into a field that exists in the schema as `int`).

:::tip Define the collection manually for production use
Generally speaking, we recommend that you disable auto-schema for production use.
- A manual collection definition will provide more precise control.
- There is a performance penalty associated with inferring the data structure at import time. This may be a costly operation in some cases, such as complex nested properties.
:::

#### Auto-schema data types

Additional configurations are available to help the auto-schema infer properties to suit your needs.

* `AUTOSCHEMA_DEFAULT_NUMBER=number` - create `number` columns for any numerical values (as opposed to `int`, etc).
* `AUTOSCHEMA_DEFAULT_DATE=date` - create `date` columns for any date-like values.

The following are not allowed:
* Any map type is forbidden, unless it clearly matches one of the two supported types `phoneNumber` or `geoCoordinates`.
* Any array type is forbidden, unless it is clearly a reference-type. In this case, Weaviate needs to resolve the beacon and see what collection the resolved beacon is from, since it needs the collection name to be able to alter the schema.

### Single vector collections

If you don't explicitly define a [named vector](#named-vectors) in your collection definition, Weaviate automatically creates what's known as a *single vector* collection. These vectors are stored internally under the named vector `default` (which is a reserved vector name).

To learn which properties of your data are vectorized, refer to the [Configure semantic indexing](#configure-semantic-indexing) section.

### Multiple vector embeddings (named vectors) {#named-vectors}

import MultiVectorSupport from '/_includes/multi-vector-support.mdx';

<MultiVectorSupport />

### Adding a property after collection creation

Adding a property after importing objects can lead to limitations in inverted-index related behavior, such as filtering by the new property's length or null status.

This is caused by the inverted index being built at import time. If you add a property after importing objects, the inverted index for metadata such as the length or the null status will not be updated to include the new properties. This means that the new property will not be indexed for existing objects. This can lead to unexpected behavior when querying.

To avoid this, you can either:
- Add the property before importing objects.
- Delete the collection, re-create it with the new property and then re-import the data.

We are working on a re-indexing API to allow you to re-index the data after adding a property. This will be available in a future release.

### Adding a named vector after collection creation

:::info Added in `v1.31`
:::

A named vector can be added to an existing collection definition after collection creation. This allows you to add new vector representations for objects without having to delete and recreate the collection.

When you add a new named vector to an existing collection definition, it's important to understand that **existing objects' new named vector will remain unpopulated**. Only objects created or updated after the named vector addition will receive these new vector embeddings.

This prevents any unintended side effects, such as incurring large vectorization time or costs for all existing objects in a collection.

If you want to populate the new named vector for existing objects, update the object with the existing object UUID and vectors. This will trigger the vectorization process for the new named vector.

<!-- TODO: I wonder we should show an example - maybe once the vectorizer syntax is updated with 1.32 -->

:::caution Not available for legacy (unnamed) vectorizers
The ability to add a named vector after collection creation is only available for collections configured with named vectors.
:::

### Collections count limit {#collections-count-limit}

:::info Added in `v1.30`
:::

To ensure optimal performance, Weaviate **limits the number of collections per node**. Each collection adds overhead in terms of indexing, definition management, and storage. This limit aims to ensure Weaviate remains performant.

- **Default limit**: `1000` collections.
- **Modify the limit**: Use the [`MAXIMUM_ALLOWED_COLLECTIONS_COUNT`](/deploy/configuration/env-vars/index.md) environment variable to adjust the collection count limit.

:::note
If your instance already exceeds the limit, Weaviate will not allow the creation of any new collections. Existing collections will not be deleted.
:::

:::tip
**Instead of raising the collections count limit, consider rethinking your architecture**.
For more details, see [Starter Guides: Scaling limits with collections](../../starter-guides/managing-collections/collections-scaling-limits.mdx).
:::

## Available parameters

### `class`

The `class` is the name of the collection.

The collection name starts with an upper case letter. The upper case letter distinguishes collection names from primitive data types when the name is used as a property value.

Consider these examples that use the `dataType` property:

- `dataType: ["text"]` is a `text` data type.
- `dataType: ["Text"]` is a cross-reference type to a collection named `Text`.

After the first letter, collection names may use any GraphQL-compatible characters.

The collection name validation regex is `/^[A-Z][_0-9A-Za-z]*$/`.

import InitialCaps from '/_includes/schemas/initial-capitalization.md'

<InitialCaps />

### `description`

A description of the collection. This is for your reference only.

### `invertedIndexConfig`

This configures the inverted index for the collection.

### `bm25`

Part of `invertedIndexConfig`. The settings for BM25 are the [free parameters `k1` and `b`](https://en.wikipedia.org/wiki/Okapi_BM25#The_ranking_function), and they are optional. The defaults (`k1` = 1.2 and `b` = 0.75) work well for most cases.

They can be configured per collection, and can optionally be overridden per property:

```js
{
  "class": "Article",
  // Configuration of the sparse index
  "invertedIndexConfig": {
    "bm25": {
      "b": 0.75,
      "k1": 1.2
    }
  },
  "properties": [
    {
      "name": "title",
      "description": "title of the article",
      "dataType": [
        "text"
      ],
      // Property-level settings override the collection-level settings
      "invertedIndexConfig": {
        "bm25": {
          "b": 0.75,
          "k1": 1.2
        }
      },
      "indexFilterable": true,
      "indexSearchable": true,
    }
  ]
}
```

### `stopwords` (stopword lists)

Part of `invertedIndexConfig`. `text` properties may contain words that are very common and don't contribute to search results. Ignoring them speeds up queries that contain stopwords, as they can be automatically removed from queries as well. This speed up is very notable on scored searches, such as `BM25`.

The stopword configuration uses a preset system. You can select a preset to use the most common stopwords for a particular language (e.g. [`"en"` preset](https://github.com/weaviate/weaviate/blob/main/adapters/repos/db/inverted/stopwords/presets.go)). If you need more fine-grained control, you can add additional stopwords or remove stopwords that you believe should not be part of the list. Alternatively, you can create your custom stopword list by starting with an empty (`"none"`) preset and adding all your desired stopwords as additions.

```json
  "invertedIndexConfig": {
    "stopwords": {
      "preset": "en",
      "additions": ["star", "nebula"],
      "removals": ["a", "the"]
    }
  }
```

This configuration allows stopwords to be configured by collection. If not set, these values are set to the following defaults:

| Parameter | Default value | Acceptable values |
| --- | --- | --- |
| `"preset"` | `"en"` | `"en"`, `"none"` |
| `"additions"` | `[]` | *any list of custom words* |
| `"removals"` | `[]` | *any list of custom words* |

:::note
- If `preset` is `none`, then the collection only uses stopwords from the `additions` list.
- If the same item is included in both `additions` and `removals`, Weaviate returns an error.
:::

As of `v1.18`, stopwords are indexed. Thus stopwords are included in the inverted index, but not in the tokenized query. As a result, when the BM25 algorithm is applied, stopwords are ignored in the input for relevance ranking but will affect the score.

Stopwords can now be configured at runtime. You can use the RESTful API to <SkipLink href="/weaviate/api/rest#tag/schema/put/schema/%7BclassName%7D">update</SkipLink> the list of stopwords after your data has been indexed.

Note that stopwords are only removed when [tokenization](#tokenization) is set to `word`.

Below is an example request on how to update the list of stopwords:

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

collection_obj = {
    "invertedIndexConfig": {
        "stopwords": {
            "preset": "en",
            "additions": ["where", "is", "the"]
        }
    }
}

client.schema.update_config("Article", collection_obj)
```

### `indexTimestamps`

Part of `invertedIndexConfig`. To perform queries that are filtered by timestamps, configure the target collection to maintain an inverted index based on the objects' internal timestamps. Currently the timestamps include `creationTimeUnix` and `lastUpdateTimeUnix`.

To configure timestamp based indexing, set `indexTimestamps` to `true` in the `invertedIndexConfig` object.

```json
  "invertedIndexConfig": {
    "indexTimestamps": true
  }
```

### `indexNullState`

Part of `invertedIndexConfig`. To perform queries that filter on `null`, configure the target collection to maintain an inverted index that tracks `null` values for each property in a collection .

To configure `null` based indexing, setting `indexNullState` to `true` in the `invertedIndexConfig` object.

```json
  "invertedIndexConfig": {
    "indexNullState": true
  }
```

### `indexPropertyLength`

Part of `invertedIndexConfig`. To perform queries that filter by the length of a property, configure the target collection to maintain an inverted index based on the length of the properties.

To configure indexing based on property length, set `indexPropertyLength` to `true` in the `invertedIndexConfig` object.

```json
  "invertedIndexConfig": {
    "indexPropertyLength": true
  }
```

:::note
Using these features requires more resources. The additional inverted indexes must be created and maintained for the lifetime of the collection.
:::

### `vectorizer`

The vectorizer (`"vectorizer": "..."`) can be specified per collection in the definition. Check the [modules page](../../modules/index.md) for available vectorizer modules.

You can use Weaviate without a vectorizer by setting `"vectorizer": "none"`. This is useful if you want to upload your own vectors from a custom model ([see how here](../../manage-objects/import.mdx#specify-a-vector)), or if you want to create a collection without any vectors.

### `vectorIndexType`

The `vectorIndexType` parameter controls the type of vector index that is used for this collection. The options are `hnsw` (default) and `flat`.

### `vectorIndexConfig`

The `vectorIndexConfig` parameter controls the configuration of the vector index. The available parameters depend on the `vectorIndexType` that is used.

See the [vector index configuration](./vector-index.md) page for more details.

### `shardingConfig`

The `"shardingConfig"` controls how a collection is [sharded and distributed across multiple nodes](../../concepts/cluster.md). All values are optional and default to the following settings:

```json
  "shardingConfig": {
    "virtualPerPhysical": 128,
    "desiredCount": 1,           // defaults to the amount of Weaviate nodes in the cluster
    "actualCount": 1,
    "desiredVirtualCount": 128,
    "actualVirtualCount": 128,
    "key": "_id",
    "strategy": "hash",
    "function": "murmur3"
  }
```

These parameters are explained below:

* `"desiredCount"`: *integer, immutable, optional*, defaults to the number of nodes in the cluster. This value controls how many shards should be created for this collection index. The typical setting is that a collection should be distributed across all the nodes in the cluster, but you can explicitly set this value to a lower value. If the `"desiredCount"` is larger than the amount of physical nodes in the cluster, then some nodes will contain multiple shards.

* `"actualCount"`: *integer, read-only*. Typically matches desired count, unless there was a problem initiating the shards at creation time.

* `"virtualPerPhysical"`: *integer, immutable, optional*, defaults to `128`. Weaviate uses virtual shards. This helps in reducing the amount of data moved when resharding.

* `"desiredVirtualCount"`: *integer, readonly*. Matches `desiredCount * virtualPerPhysical`

* `"actualVirtualCount"`: *integer, readonly*. Like `actualCount`, but for virtual shards, instead of physical.

* `"strategy"`: *string, optional, immutable*. Only supports `"hash"`. This value controls how Weaviate should decide which (virtual - and therefore physical) shard a new object belongs to. The hash is performed on the field specified in `"key"`.

* `"key"`: *string, optional, immutable*. Only supports `"_id"`. This value controls the partitioning key that is used for the hashing function to determine the target shard. As of now, only the internal id-field (containing the object's UUID) can be used to determine the target shard. Custom keys may be supported at a later point.

* `"function"`: *string, optional, immutable*. Only `"murmur3"` is supported as a hashing function. It describes the hashing function used on the `"key"` property to determine the hash which in turn determines the target (virtual - and therefore physical) shard. `"murmur3"` creates a 64bit hash making hash collisions very unlikely.

### `replicationConfig`

<RaftRFChangeWarning/>

[Replication](/deploy/configuration/replication.md) configurations can be set using the definition, through the `replicationConfig` parameter.

The `factor` parameter sets the number of copies of to be stored for objects in this collection.

```json
{
  "class": "Article",
  "vectorizer": "text2vec-openai",
  // highlight-start
  "replicationConfig": {
    "factor": 3,
  },
  // highlight-end
}
```

### `multiTenancyConfig`

:::info Added in `v1.20`
:::

The `multiTenancyConfig` value determines if [multi-tenancy](../../concepts/data.md#multi-tenancy) is enabled for this collection. If enabled, objects of this collection will be isolated for each tenant. It is disabled by default.

To enable it, set the `enabled` key to `true`, as shown below:

```json
{
  "class": "MultiTenancyClass",
  // highlight-start
  "multiTenancyConfig": {"enabled": true}
  // highlight-end
}
```

## `properties`

Properties define the data structure of objects to be stored and indexed. For each property in the collection, you must specify at least the name and its [dataType](../../config-refs/datatypes.md).

### `name`

Property names can contain the following characters: `/[_A-Za-z][_0-9A-Za-z]*/`.

### Property object example

An example of a complete property object:

```json
{
    "name": "title",                     // The name of the property
    "description": "title of the article",              // A description for your reference
    "dataType": [                         // The data type of the object as described above. When creating cross-references, a property can have multiple dataTypes.
      "text"
    ],
    "tokenization": "word",               // Split field contents into word-tokens when indexing into the inverted index. See "Property Tokenization" below for more detail.
    "moduleConfig": {                     // Module-specific settings
      "text2vec-contextionary": {
          "skip": true,                   // If true, the whole property is NOT included in vectorization. Default is false, meaning that the object will be NOT be skipped.
          "vectorizePropertyName": true   // Whether the name of the property is used in the calculation for the vector position of data objects. Default false.
      }
    },
    "indexFilterable": true,              // Optional, default is true. By default each property is indexed with a roaring bitmap index where available for efficient filtering.
    "indexSearchable": true               // Optional, default is true. By default each property is indexed with a searchable index for BM25-suitable Map index for BM25 or hybrid searching.
}
```

### Reserved words

The following words are reserved and cannot be used as property names:

- `_additional`
- `id`
- `_id`

Additionally, we strongly recommend that you do not use the following words as property names, due to potential conflicts with future reserved words:

- `vector`
- `_vector`

### `tokenization`

:::note
This feature was introduced in `v1.12.0`.
:::

You can customize how `text` data is tokenized and indexed in the inverted index. Tokenization influences the results returned by the [`bm25`](../../api/graphql/search-operators.md#bm25) and [`hybrid`](../../api/graphql/search-operators.md#hybrid) operators, and [`where` filters](../../api/graphql/filters.md).

Tokenization is a property-level configuration for `text` properties. [See how to set the tokenization option using a client library](../../manage-collections/vector-config.mdx#property-level-settings)

<details>
  <summary>Example property configuration</summary>

```json
{
  "classes": [
    {
      "class": "Question",
      "properties": [
        {
          "dataType": ["text"],
          "name": "question",
          // highlight-start
          "tokenization": "word"
          // highlight-end
        },
      ],
      ...
      "vectorizer": "text2vec-openai"
    }
  ]
}
```

</details>

Each token will be indexed separately in the inverted index. For example, if you have a `text` property with the value `Hello, (beautiful) world`, the following table shows how the tokens would be indexed for each tokenization method:

import TokenizationDefinition from '/_includes/tokenization_definition.mdx';

<TokenizationDefinition/>

### Tokenization and search / filtering

Tokenization impacts how filters or keywords searches behave. The filter or keyword search query is also tokenized before being matched against the inverted index.

The following table shows an example scenario showing whether a filter or keyword search would identify a `text` property with value `Hello, (beautiful) world` as a hit.

- **Row**: Various tokenization methods.
- **Column**: Various search strings.

|                        | `Beautiful` | `(Beautiful)` | `(beautiful)` | `Hello, (beautiful) world` |
|------------------------|-------------|---------------|---------------|----------------------------|
| `word` (default)       | ✅          | ✅            | ✅             | ✅                         |
| `lowercase`            | ❌          | ✅            | ✅             | ✅                         |
| `whitespace`           | ❌          | ❌            | ✅             | ✅                         |
| `field`                | ❌          | ❌            | ❌             | ✅                         |

:::caution `string` is deprecated
The `string` data type has been deprecated from Weaviate `v1.19` onwards. Use `text` instead.

<details>
  <summary>
    Pre <code>v1.19</code> tokenization behavior
  </summary>

**Tokenization with `text`**

`text` properties are always tokenized, and by all non-alphanumerical characters. Tokens are then lowercased before being indexed. For example, a `text` property value `Hello, (beautiful) world`, would be indexed by tokens `hello`, `beautiful`, and `world`.

Each of these tokens will be indexed separately in the inverted index. This means that a search for any of the three tokens with the `Equal` operator under `valueText` would return this object regardless of the case.

**Tokenization with `string`**

`string` properties allow the user to set whether it should be tokenized, by setting the `tokenization` collection property.

If `tokenization` for a `string` property is set to `word`, the field will be tokenized. The tokenization behavior for `string` is different from `text`, however, as `string` values are only tokenized by white spaces, and casing is not altered.

So, a `string` property value `Hello, (beautiful) world` with `tokenization` set as `word` would be split into the tokens `Hello,`, `(beautiful)`, and `world`. In this case, the `Equal` operator would need the exact match including non-alphanumerics and case (e.g. `Hello,`, not `hello`) to retrieve this object.

`string` properties can also be indexed as the entire value, by setting `tokenization` as `field`. In such a case the `Equal` operator would require the value `Hello, (beautiful) world` before returning the object as a match.

**Default behavior**

`text` and `string` properties default to `word` level tokenization for backward-compatibility.

</details>
:::

### `gse` and `trigram` tokenization methods

:::info Added in `1.24`
:::

For Japanese and Chinese text, we recommend use of `gse` or `trigram` tokenization methods. These methods work better with these languages than the other methods as these languages are not easily able to be tokenized using whitespaces.

The `gse` tokenizer is not loaded by default to save resources. To use it, set the environment variable `ENABLE_TOKENIZER_GSE` to `true` on the Weaviate instance.

`gse` tokenization examples:

- `"素早い茶色の狐が怠けた犬を飛び越えた"`: `["素早", "素早い", "早い", "茶色", "の", "狐", "が", "怠け", "けた", "犬", "を", "飛び", "飛び越え", "越え", "た", "素早い茶色の狐が怠けた犬を飛び越えた"]`
- `"すばやいちゃいろのきつねがなまけたいぬをとびこえた"`: `["すばや", "すばやい", "やい", "いち", "ちゃ", "ちゃい", "ちゃいろ", "いろ", "のき", "きつ", "きつね", "つね", "ねが", "がな", "なま", "なまけ", "まけ", "けた", "けたい", "たい", "いぬ", "を", "とび", "とびこえ", "こえ", "た", "すばやいちゃいろのきつねがなまけたいぬをとびこえた"]`

### `kagome_ja` tokenization method

:::caution Experimental feature
Available starting in `v1.28.0`. This is an experimental feature. Use with caution.
:::

For Japanese text, `kagome_ja` tokenization method is also available. This uses the [`Kagome` tokenizer](https://github.com/ikawaha/kagome?tab=readme-ov-file) with a Japanese [MeCab IPA](https://github.com/ikawaha/kagome-dict/) dictionary to split the property text.

The `kagome_ja` tokenizer is not loaded by default to save resources. To use it, set the environment variable `ENABLE_TOKENIZER_KAGOME_JA` to `true` on the Weaviate instance.

`kagome_ja` tokenization examples:

- `"春の夜の夢はうつつよりもかなしき 夏の夜の夢はうつつに似たり 秋の夜の夢はうつつを超え 冬の夜の夢は心に響く 山のあなたに小さな村が見える 川の音が静かに耳に届く 風が木々を通り抜ける音 星空の下、すべてが平和である"`:
  - [`"春", "の", "夜", "の", "夢", "は", "うつつ", "より", "も", "かなしき", "\n\t", "夏", "の", "夜", "の", "夢", "は", "うつつ", "に", "似", "たり", "\n\t", "秋", "の", "夜", "の", "夢", "は", "うつつ", "を", "超え", "\n\t", "冬", "の", "夜", "の", "夢", "は", "心", "に", "響く", "\n\n\t", "山", "の", "あなた", "に", "小さな", "村", "が", "見える", "\n\t", "川", "の", "音", "が", "静か", "に", "耳", "に", "届く", "\n\t", "風", "が", "木々", "を", "通り抜ける", "音", "\n\t", "星空", "の", "下", "、", "すべて", "が", "平和", "で", "ある"`]
- `"素早い茶色の狐が怠けた犬を飛び越えた"`:
  - `["素早い", "茶色", "の", "狐", "が", "怠け", "た", "犬", "を", "飛び越え", "た"]`
- `"すばやいちゃいろのきつねがなまけたいぬをとびこえた"`:
  - `["すばやい", "ちゃ", "いろ", "の", "きつね", "が", "なまけ", "た", "いぬ", "を", "とびこえ", "た"]`

### `kagome_kr` tokenization method

:::caution Experimental feature
Available starting in `v1.25.7`. This is an experimental feature. Use with caution.
:::

For Korean text, we recommend use of the `kagome_kr` tokenization method. This uses the [`Kagome` tokenizer](https://github.com/ikawaha/kagome?tab=readme-ov-file) with a Korean MeCab ([mecab-ko-dic](https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/)) dictionary to split the property text.

The `kagome_kr` tokenizer is not loaded by default to save resources. To use it, set the environment variable `ENABLE_TOKENIZER_KAGOME_KR` to `true` on the Weaviate instance.

`kagome_kr` tokenization examples:

- `"아버지가방에들어가신다"`:
  - `["아버지", "가", "방", "에", "들어가", "신다"]`
- `"아버지가 방에 들어가신다"`:
  - `["아버지", "가", "방", "에", "들어가", "신다"]`
- `"결정하겠다"`:
  - `["결정", "하", "겠", "다"]`

### Limit the number of `gse` and `Kagome` tokenizers

The `gse` and `Kagome` tokenizers can be resource intensive and affect Weaviate's performance.
You can limit the combined number of `gse` and `Kagome` tokenizers running at the same time using the [`TOKENIZER_CONCURRENCY_COUNT` environment variable](/deploy/configuration/env-vars/index.md). 

### Inverted index types

:::info `indexInverted` is deprecated
The `indexInverted` parameter has been deprecated from Weaviate `v1.19` onwards.
:::

Multiple [inverted index types](../../concepts/indexing/inverted-index.md) are available in Weaviate. Not all inverted index types are available for all data types. The available inverted index types are:

import InvertedIndexTypesSummary from '/_includes/inverted-index-types-summary.mdx';

<InvertedIndexTypesSummary/>

- Enable one or both of `indexFilterable` and `indexRangeFilters` to index a property for faster filtering.
    - If only one is enabled, the respective index is used for filtering.
    - If both are enabled, `indexRangeFilters` is used for operations involving comparison operators, and `indexFilterable` is used for equality and inequality operations.

## Configure semantic indexing

Weaviate can generate vector embeddings for objects using [model provider integrations](/weaviate/model-providers/).

For instance, text embedding integrations (e.g. `text2vec-cohere` for Cohere, or `text2vec-ollama` for Ollama) can generate vectors from text objects. Weaviate follows the collection configuration and a set of predetermined rules to vectorize objects.

Unless specified otherwise in the collection definition, the default behavior is to:

- Only vectorize properties that use the `text` or `text[]` data type (unless [skipped](../../manage-collections/vector-config.mdx#property-level-settings))
- Sort properties in alphabetical (a-z) order before concatenating values
- If `vectorizePropertyName` is `true` (`false` by default) prepend the property name to each property value
- Join the (prepended) property values with spaces
- Prepend the class name (unless `vectorizeClassName` is `false`)
- Convert the produced string to lowercase

For example, this data object,

```js
Article = {
  summary: "Cows lose their jobs as milk prices drop",
  text: "As his 100 diary cows lumbered over for their Monday..."
}
```

will be vectorized as:

```md
article cows lose their jobs as milk prices drop as his 100 diary cows lumbered over for their monday...
```

By default, the calculation includes the  `collection name` and all property `values`, but the property `names` *are not* indexed.

To configure vectorization behavior on a per-collection basis, use `vectorizeClassName`.

To configure vectorization on a per-property basis, use `skip` and `vectorizePropertyName`.

### Default distance metric

Weaviate allows you to configure the `DEFAULT_VECTOR_DISTANCE_METRIC` which will be applied to every collection unless overridden individually. You can choose from: `cosine` (default), `dot`, `l2-squared`, `manhattan`, `hamming`.

```python
collection_obj = {
    "class": "Article",
    "vectorIndexConfig": {
        "distance": "dot",
    },
}

client.schema.create_class(collection_obj)
```

## Collection aliases

:::caution Technical preview

Collection aliases were added in **`v1.32`** as a **technical preview**.<br/><br/>
This means that the feature is still under development and may change in future releases, including potential breaking changes.
**We do not recommend using this feature in production environments at this time.**

:::

Collection aliases are alternative names for Weaviate collections that allow you to reference a collection by an alternative name.

Weaviate automatically routes alias requests to the target collection. This allows you to use aliases wherever collection names are required. This includes [collection management](../../manage-collections/index.mdx), [queries](../../search/index.mdx), and all other operations requiring a specific collection name with the **exception** of deleting collections. To delete a collection you need to use its name. Deleting a collection does not automatically delete aliases pointing to it.

Alias names must be unique (can't match existing collections or other aliases) and multiple aliases can point to the same collection. You can set up collection aliases [programmatically through client libraries](../../manage-collections/collection-aliases.mdx) or by using the <SkipLink href="/weaviate/api/rest#tag/aliases">REST endpoints</SkipLink>. 

In order to manage collection aliases, you need to posses the right [`Collection aliases`](../../configuration/rbac/index.mdx#available-permissions) permissions. To manage the underlying collection the alias references, you also need the [`Collections`](../../configuration/rbac/index.mdx#available-permissions) permissions for that specific collection. 

## Further resources

- [Tutorial: Schema](/weaviate/starter-guides/managing-collections)
- [How to: Configure a schema](../../manage-collections/index.mdx)
- [How to: Collection aliases](../../manage-collections/collection-aliases.mdx)
- <SkipLink href="/weaviate/api/rest#tag/schema">References: REST API: Schema</SkipLink>
- [Concepts: Data Structure](/weaviate/concepts/data)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
