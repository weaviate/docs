---
title: プロパティ データ型
sidebar_label: Data types
description: オブジェクト プロパティとフィールド仕様を定義するための Weaviate スキーマ データ型リファレンスです。
image: og/docs/configuration.jpg
# tags: ['Data types']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import SkipLink from '/src/components/SkipValidationLink'

[プロパティを作成する](../manage-collections/collection-operations.mdx#add-a-property) ときには、データ型を指定する必要があります。Weaviate では次の型を利用できます。

## 利用可能なデータ型

:::note 配列型
あるデータ型の配列を指定する場合は、その型に `[]` を付けます（例: `text` ➡ `text[]`）。すべてのデータ型が配列をサポートしているわけではありませんのでご注意ください。
:::

import DataTypes from '/\_includes/datatypes.mdx';

<DataTypes />

各データ型の詳細は以下をご覧ください。

## `text`

あらゆるテキスト データに使用します。

- `text` 型のプロパティは、別途 [プロパティ設定](../manage-collections/vector-config.mdx#property-level-settings) で指定しない限り、ベクトル化およびキーワード検索に利用されます。
- [名前付きベクトル](../concepts/data.md#multiple-vector-embeddings-named-vectors) を使用する場合、プロパティのベクトル化は [名前付きベクトル定義](../manage-collections/vector-config.mdx#define-named-vectors) で設定します。
- テキスト プロパティは、キーワード/BM25 検索用にインデックス化される前にトークン化されます。詳細は [コレクション定義: tokenization](../config-refs/collections.mdx#tokenization) を参照してください。

<details>
  <summary><code>string</code> は非推奨です</summary>

`v1.19` より前の Weaviate では、トークン化の挙動が `text` と異なる `string` という追加データ型をサポートしていました。`v1.19` 以降、この型は非推奨となり、今後のリリースで削除される予定です。

`string` の代わりに `text` をお使いください。`text` は `string` で利用可能だったトークン化オプションをサポートしています。

</details>

### 例

import TextTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.text.py';
import TextTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.text.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={TextTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TextTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクト挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={TextTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TextTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

## `boolean` / `int` / `number`

`boolean`、`int`、`number` の各型は、それぞれブール値、整数、浮動小数点数を格納するために使用します。

### 例

import NumericalTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.numerical.py';
import NumericalTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.numerical.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={NumericalTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={NumericalTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>



#### オブジェクト挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={NumericalTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={NumericalTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

### 注意: GraphQL と `int64`

Weaviate は `int64` をサポートしていますが、GraphQL は現在 `int32` のみをサポートしており、`int64` には対応していません。つまり、Weaviate の _integer_ データフィールドに `int32` を超える値が格納されている場合、GraphQL クエリで返されません。この [issue](https://github.com/weaviate/weaviate/issues/1563) の解決に取り組んでいます。現時点での回避策としては、代わりに `string` を使用してください。

## `date`

Weaviate における `date` は、[RFC 3339](https://datatracker.ietf.org/doc/rfc3339/) の `date-time` 形式タイムスタンプで表されます。このタイムスタンプには時刻とオフセットが含まれます。

例:

- `"1985-04-12T23:20:50.52Z"`
- `"1996-12-19T16:39:57-08:00"`
- `"1937-01-01T12:00:27.87+00:20"`

複数の日付を 1 つのエンティティとして追加する場合は、`date-time` 形式の文字列配列を使用します。例: `["1985-04-12T23:20:50.52Z", "1937-01-01T12:00:27.87+00:20"]`

特定のクライアントライブラリでは、以下の例のようにネイティブ日付オブジェクトを使用できる場合があります。

### 例

import DateTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.date.py';
import DateTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.date.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={DateTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={DateTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクト挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={DateTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={DateTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

## `uuid`

専用の `uuid` および `uuid[]` データタイプは、[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) を効率的に保存します。

- 各 `uuid` は 128-bit (16-byte) の数値です。  
- フィルタリング用インデックスには Roaring Bitmap が使用されます。

:::note 集計/ソートは現在利用できません
現在、`uuid` および `uuid[]` 型で集計やソートを行うことはできません。
:::

### 例

import UUIDTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.uuid.py';
import UUIDTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.uuid.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={UUIDTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={UUIDTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクト挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={UUIDTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={UUIDTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

## `geoCoordinates`

`geoCoordinates` は、クエリ地点から半径内にあるオブジェクトを検索するために使用できます。geo 座標の値は  float として保存され、[ISO 規格](https://www.iso.org/standard/39242.html#:~:text=For%20computer%20data%20interchange%20of,minutes%2C%20seconds%20and%20decimal%20seconds) に従い [10 進度](https://en.wikipedia.org/wiki/Decimal_degrees) として処理されます。

`geoCoordinates` プロパティを指定するには、`latitude` と `longitude` を浮動小数点形式の 10 進度で入力してください。

<!-- An example of how geo coordinates are used in a data object:

```json
{
  "City": {
    "location": {
      "latitude": 52.366667,
      "longitude": 4.9
    }
  }
}
``` -->

### 例

import GeoTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.geocoordinates.py';
import GeoTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.geocoordinates.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={GeoTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={GeoTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクト挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={GeoTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={GeoTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

import GeoLimitations from '/\_includes/geo-limitations.mdx';

<GeoLimitations/>

## `phoneNumber`

`phoneNumber` 入力は、`number` や `string` のような単一フィールドとは異なり、正規化およびバリデーションが行われます。このデータフィールドは複数のフィールドを持つオブジェクトです。

```yaml
{
  "phoneNumber": {
    "input": "020 1234567",                       // Required. Raw input in string format
    "defaultCountry": "nl",                       // Required if only a national number is provided, ISO 3166-1 alpha-2 country code. Only set if explicitly set by the user.
    "internationalFormatted": "+31 20 1234567",   // Read-only string
    "countryCode": 31,                            // Read-only unsigned integer, numerical country code
    "national": 201234567,                        // Read-only unsigned integer, numerical representation of the national number
    "nationalFormatted": "020 1234567",           // Read-only string
    "valid": true                                 // Read-only boolean. Whether the parser recognized the phone number as valid
  }
}
```

入力を受け取るフィールドは 2 つあります。`input` は常に設定する必要がありますが、`defaultCountry` は特定の状況でのみ設定します。考えられるシナリオは次の 2 つです。

- `input` フィールドに国際電話番号（例: `"+31 20 1234567"`）を入力する場合、`defaultCountry` を設定する必要はありません。基盤となるパーサーが番号の国を自動で判別します。
- 国番号を含まない国内電話番号（例: `"020 1234567"`）を入力する場合は、`defaultCountry` に国を指定する必要があります（この例では `"nl"`）。これにより、パーサーが番号を正しく各形式に変換できます。`defaultCountry` には [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) 形式の国コードを入力してください。

Weaviate で `phoneNumber` 型のフィールドを読み取る際には、`internationalFormatted`、`countryCode`、`national`、`nationalFormatted`、`valid` といった読み取り専用フィールドが追加されます。

### 例

import PhoneTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.phonenumber.py';
import PhoneTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.phonenumber.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PhoneTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={PhoneTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクトの挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PhoneTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={PhoneTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

## `blob`

データタイプ `blob` は、任意のバイナリデータを受け付けます。データは `base64` でエンコードされ、 `string` として渡す必要があります。特徴は次のとおりです。  

- Weaviate は、エンコードされたデータの種類について一切の前提を置きません。モジュール（例: `img2vec`）は必要に応じてファイルヘッダーを調査できますが、Weaviate 自体は行いません。  
- 保存時には、データが `base64` デコードされるため、より効率的に保存されます。  
- 配信時には、データが `base64` エンコードされるため、 `json` として安全に提供できます。  
- ファイルサイズの上限はありません。  
- この `blob` フィールドは、設定に関わらず常に 転置インデックス からスキップされます。そのため、Weaviate GraphQL `where` フィルターでこの `blob` フィールドによる検索はできず、対応する `valueBlob` フィールドも存在しません。モジュールによっては、このフィールドをモジュール固有のフィルター（例: `img2vec-neural` フィルターの `nearImage`{}）で使用できます。  

<!-- Example:

The dataType `blob` can be used as property dataType in the data schema as follows:

```json
{
  "properties": [
    {
      "name": "image",
      "dataType": ["blob"]
    }
  ]
}
``` -->

To obtain the base64-encoded value of an image, you can run the following command - or use the helper methods in the Weaviate clients - to do so:

```bash
cat my_image.png | base64
```

<!-- You can then import data with `blob` dataType to Weaviate as follows:

```bash
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "class": "FashionPicture",
      "id": "36ddd591-2dee-4e7e-a3cc-eb86d30a4302",
      "properties": {
          "image": "iVBORw0KGgoAAAANS..."
      }
  }' \
    http://localhost:8080/v1/objects
``` -->

### Examples

import BlobTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.blob.py';
import BlobTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.blob.ts';

#### Property definition

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={BlobTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={BlobTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクトの挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={BlobTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={BlobTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

## `object`

:::info `v1.22` で追加
:::

`object` タイプを使用すると、任意の深さでネストできる JSON オブジェクトとしてデータを保存できます。

たとえば、 `Person` コレクションに `address` プロパティを `object` として定義し、その中に `street` や `city` などのネストしたプロパティを含めることができます。

:::note 制限事項
現在、 `object` および `object[]` データタイプのプロパティは インデックス化 も ベクトル化 もされません。

将来的には、ネストしたプロパティをインデックス化してフィルタリングやベクトル化を可能にする予定です。
:::

### Examples

import ObjectTypePy from '!!raw-loader!/\_includes/code/python/config-refs.datatypes.object.py';
import ObjectTypeTs from '!!raw-loader!/\_includes/code/typescript/config-refs.datatypes.object.ts';

#### プロパティ定義

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={ObjectTypePy}
      startMarker="# START ConfigureDataType"
      endMarker="# END ConfigureDataType"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={ObjectTypeTs}
      startMarker="// START ConfigureDataType"
      endMarker="// END ConfigureDataType"
      language="ts"
    />
  </TabItem>
</Tabs>

#### オブジェクトの挿入

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={ObjectTypePy}
      startMarker="# START AddObject"
      endMarker="# END AddObject"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={ObjectTypeTs}
      startMarker="// START AddObject"
      endMarker="// END AddObject"
      language="ts"
    />
  </TabItem>
</Tabs>

<!-- Old example - could re-use for other language examples -->
<!--
```json
{
    "class": "Person",
    "properties": [
        {
            "dataType": ["text"],
            "name": "last_name",
        },
        {
            "dataType": ["object"],
            "name": "address",
            "nestedProperties": [
                {"dataType": ["text"], "name": "street"},
                {"dataType": ["text"], "name": "city"}
            ],
        }
    ],
}
```

An object for this class may have a structure such as follows:

```json
{
    "last_name": "Franklin",
    "address": {
        "city": "London",
        "street": "King Street"
    }
}
``` -->

## `cross-reference`

import CrossReferencePerformanceNote from '/\_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

The `cross-reference` type allows a link to be created from one object to another. This is useful for creating relationships between collections, such as linking a `Person` collection to a `Company` collection.

The `cross-reference` type objects are `arrays` by default. This allows you to link to any number of instances of a given collection (including zero).

For more information on cross-references, see the [cross-references](../concepts/data.md#cross-references). To see how to work with cross-references, see [how to manage data: cross-references](../manage-collections/cross-references.mdx).

## Notes

#### Formatting in payloads

In raw payloads (e.g. JSON payloads for REST), data types are specified as an array (e.g. `["text"]`, or `["text[]"]`), as it is required for some cross-reference specifications.

## Further resources

- [How-to: Manage collections](../manage-collections/index.mdx)
- [Concepts: Data structure](../concepts/data.md)
- <SkipLink href="/weaviate/api/rest#tag/schema">References: REST API: Schema</SkipLink>

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

