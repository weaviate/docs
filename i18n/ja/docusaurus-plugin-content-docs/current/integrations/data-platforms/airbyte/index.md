---
title: Airbyte
sidebar_position: 1
---
[Airbyte](https://airbyte.com/) は、データウェアハウスやデータレイク、データベースへデータを統合するためのオープンソースのデータ統合エンジンです。Airbyte を使って Weaviate にデータを取り込むことができます。

## Airbyte と Weaviate

::::caution
Airbyte 上の Weaviate 連携は `v3` Python クライアントを使用しており、Weaviate Database バージョン `<1.24` としか互換性がありません。連携のアップデート要望を追跡するため、[Airbyte のリポジトリで GitHub issue を作成](https://github.com/airbytehq/airbyte/issues?q=is%3Aissue%20state%3Aopen) してください。
::::

Weaviate は Airbyte でサポートされている[デスティネーションコネクター](https://airbyte.com/connectors/weaviate)です。Airbyte でソースコネクターを設定し、データを抽出して Weaviate にインポートできます。 

## リソース
リソースは 2 つのカテゴリに分かれています：  
[**Hands on Learning**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めましょう。

### Hands on Learning

| トピック | 説明 | リソース | 
| --- | --- | --- |
| Unleash から Weaviate へ | Unleash から Weaviate へデータをロード | [チュートリアル](https://airbyte.com/how-to-sync/unleash-to-weaviate) |
| Airtable から Weaviate へ | Airtable から Weaviate にデータを同期 | [チュートリアル](https://airbyte.com/how-to-sync/airtable-to-weaviate) |
| Monday から Weaviate へ | Monday のデータを数分で Weaviate にロード | [チュートリアル](https://airbyte.com/how-to-sync/monday-to-weaviate) |


