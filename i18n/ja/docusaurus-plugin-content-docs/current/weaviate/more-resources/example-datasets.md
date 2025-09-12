---
title: データセット例
sidebar_position: 5
image: og/docs/more-resources.jpg
# tags: ['example datasets']
---

## CLIP を使用したマルチモーダル テキスト/画像検索

このサンプルアプリケーションでは、[multi2vec-clip](/weaviate/model-providers/transformers/embeddings-multimodal.md) 連携を利用して Weaviate インスタンスを起動し、いくつかのサンプル画像をインポートします（ご自身の画像を追加することも可能です）。さらに、[React](https://reactjs.org/) と [TypeScript/JavaScript](../client-libraries/typescript/index.mdx) クライアントを使った非常にシンプルな検索フロントエンドを提供します。

[ここから始める](https://github.com/weaviate/weaviate-examples/blob/main/clip-multi-modal-text-image-search/README.md)

## Wikipedia を用いたセマンティック検索

英語版 Wikipedia の記事全体を単一の Weaviate インスタンスにインポートし、記事間のすべてのグラフ関係も作成したうえで、Wikipedia 記事に対するセマンティック検索クエリを実行できるようにしました。インポートスクリプト、前処理済みの記事、バックアップを公開しているため、完全なセットアップをご自身で実行できます。

[ここから始める](https://github.com/weaviate/semantic-search-through-Wikipedia-with-Weaviate)

## Meta AI Research - Wikidata 上の Biggraph

Wikidata の PBG モデル全体を Weaviate にインポートし、インターネット遅延を除いて 50 ミリ秒未満でデータセット全体を検索できるようにしました。デモの GraphQL クエリには、純粋な ベクトル 検索とスカラー検索を組み合わせたクエリの両方が含まれています。

[ここから始める](https://github.com/weaviate/biggraph-wikidata-search-with-weaviate)

## ニュース記事

このデータセットには、Financial Times、New York Times、Guardian、Wallstreet Journal、CNN、Fox News、The Economist、New Yorker、Wired、Vogue、Game Informer からランダムに抽出した約 1,000 件のニュース記事が含まれています。

`Article`、`Publication`、`Category`、`Author` クラスを含む [スキーマ](../starter-guides/managing-collections/index.mdx) が同梱されています。

### Docker Compose で実行

このデータセットをローカルで実行したい場合は、Docker Compose で一括実行できます。

このデモデータセットは、任意の `text2vec` モジュールで実行できます。例を以下に示します。

#### Text2vec-contextionary

Docker Compose ファイルには、`text2vec-contextionary` モジュールを組み込んだ Weaviate とデータセットの両方が含まれています。

Docker Compose ファイルをダウンロード

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-contextionary-newspublications/docker-compose.yaml
```

Docker を実行（バックグラウンドで実行する場合は `-d` を追加）

```bash
docker compose up
```

ニュース記事デモデータセットを操作するには `http://localhost:8080/` に接続してください。

#### Text2vec-transformers (without GPU)

Docker Compose ファイルには、`text2vec-contextionary`、`NER`、`Q&A`、`spellcheck` の各モジュールを組み込んだ Weaviate とデータセットの両方が含まれています。

Docker Compose ファイルをダウンロード

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-transformers-newspublications/docker-compose.yml
```

Docker を実行（バックグラウンドで実行する場合は `-d` を追加）

```bash
docker compose up
```

ニュース記事デモデータセットを操作するには `http://localhost:8080/` に接続してください。

#### Text2vec-transformers (with GPU enabled)

Docker Compose ファイルには、`text2vec-contextionary`、`NER`、`Q&A`、`spellcheck` の各モジュールを組み込んだ Weaviate とデータセットの両方が含まれています。この構成を使用する場合、マシンに GPU が搭載されている必要があります。

Docker Compose ファイルをダウンロード

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/weaviate/weaviate-examples/main/weaviate-transformers-newspublications/docker-compose-gpu.yaml
```

Docker を実行（バックグラウンドで実行する場合は `-d` を追加）

```bash
docker compose up
```

ニュース記事デモデータセットを操作するには `http://localhost:8080/` に接続してください。

### 手動で実行

**外部** ホストまたは Docker Compose を使用しないローカルホストで独自の Weaviate を実行している場合:

```bash
# WEAVIATE ORIGIN (e.g., https://foobar.weaviate.network), note paragraph basics for setting the local IP
export WEAVIATE_ORIGIN=WEAVIATE_ORIGIN
# Optionally you can specify which newspaper language you want (only two options `cache-en` or `cache-nl`, if not specified by default it is `cache-en` )
export CACHE_DIR=<YOUR_CHOICE_OF_CACHE_DIR>
# Optionally you can set the batch size (if not specified by default 200)
export BATCH_SIZE=<YOUR_CHOICE_OF_BATCH_SIZE>
# Make sure to replace WEAVIATE_ORIGIN with the Weaviate origin as mentioned in the basics above
docker run -it -e weaviate_host=$WEAVIATE_ORIGIN -e cache_dir-$CACHE_DIR -e batch_size=$BATCH_SIZE semitechnologies/weaviate-demo-newspublications:latest

```

Docker を使用してローカル（Docker Compose あり）で実行する場合:

_注意：Docker Compose ファイルがある同じディレクトリで実行してください_

```bash
# This gets the Weaviate container name and because the docker uses only lowercase we need to do it too (Can be found manually if 'tr' does not work for you)
export WEAVIATE_ID=$(echo ${PWD##*/}_weaviate_1 | tr "[:upper:]" "[:lower:]")
# WEAVIATE ORIGIN (e.g., http://localhost:8080), note the paragraph "basics" for setting the local IP
export WEAVIATE_ORIGIN="http://$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $WEAVIATE_ID):8080"
# WEAVIATE NETWORK (see paragraph: Running on the localhost)
export WEAVIATE_NETWORK=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' $WEAVIATE_ID)
# Optionally you can specify which newspaper language you want (only two options `cache-en` or `cache-nl`, if not specified by default it is `cache-en` )
export CACHE_DIR=<YOUR_CHOICE_OF_CACHE_DIR>
# Optionally you can set the batch size (if not specified by default 200)
export BATCH_SIZE=<YOUR_CHOICE_OF_BATCH_SIZE>
# Run docker
docker run -it --network=$WEAVIATE_NETWORK -e weaviate_host=$WEAVIATE_ORIGIN -e cache_dir-$CACHE_DIR -e batch_size=$BATCH_SIZE  semitechnologies/weaviate-demo-newspublications:latest
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

