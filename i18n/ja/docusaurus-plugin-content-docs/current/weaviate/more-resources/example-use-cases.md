---
title: ユースケースとデモの例
sidebar_position: 6
image: og/docs/more-resources.jpg
# tags: ['use cases']
---

このページでは、オープンソースのデモ プロジェクトを通じて vector データベースのさまざまなユースケースを紹介します。どのプロジェクトもフォークして自由に変更できます。

ご自身のプロジェクトをこのページに掲載したい場合は、[GitHub](https://github.com/weaviate/docs/issues) で Issue を作成してください。

## 類似検索

vector データベースは、テキストや画像などあらゆるモダリティ、またはそれらの組み合わせに対して、高速かつ効率的な類似検索を実現します。この類似検索機能は、従来の機械学習アプリケーションにおけるレコメンデーション システムなど、より複雑なユースケースにも利用できます。

| Title | Description | Modality | Code |
| --- | --- | --- | --- |
| Plant search | 植物に対するセマンティック検索。 | テキスト | [JavaScript](https://github.com/weaviate-tutorials/DEMO-text-search-plants) |
| Wine search | ワインに対するセマンティック検索。 | テキスト | [Python](https://github.com/weaviate-tutorials/DEMO-text-search-wines) |
| Book recommender system ([Video](https://www.youtube.com/watch?v=SF1ZlRjVsxw), [Demo](https://bookrecs.weaviate.io/)) | 検索クエリに基づいて書籍をおすすめ。 | テキスト | [TypeScript](https://github.com/weaviate/BookRecs) |
| Movie recommender system ([Blog](https://medium.com/towards-data-science/recreating-andrej-karpathys-weekend-project-a-movie-search-engine-9b270d7a92e4)) | 類似した映画を検索。 | テキスト | [JavaScript](https://github.com/weaviate-tutorials/awesome-moviate) |
| Multilingual Wikipedia Search | 複数言語の Wikipedia を検索。 | テキスト | [TypeScript](https://github.com/weaviate/weaviate-examples/tree/main/cohere-multilingual-wikipedia-search/frontend) |
| Podcast search | ポッドキャスト エピソードに対するセマンティック検索。 | テキスト | [Python](https://github.com/weaviate-tutorials/DEMO-semantic-search-podcast) |
| Video Caption Search | 動画内で質問への回答があるタイムスタンプを検索。 | テキスト | [Python](https://github.com/weaviate-tutorials/DEMO-text-search-video-captions) |
| Facial Recognition | 画像内の人物を識別します。 | 画像 | [Python](https://github.com/weaviate-tutorials/DEMO-face-recognition) |
| Image Search over dogs ([Blog](https://weaviate.io/blog/how-to-build-an-image-search-application-with-weaviate)) | アップロードした画像に基づいて似た犬種の画像を検索。 | 画像 | [Python](https://github.com/weaviate-tutorials/DEMO-image-search-dogs) |
| Text to image search | テキスト クエリに最も近い画像を検索。 | マルチモーダル | [JavaScript](https://github.com/weaviate-tutorials/DEMO-multimodal-text-to-image-search) |
| Text to image and image to image search | テキストまたは画像クエリに最も近い画像を検索。 | マルチモーダル | [Python](https://github.com/weaviate-tutorials/DEMO-multimodal-search) |

## LLM と検索

vector データベースと LLM はクッキーとミルクのように相性抜群です！

vector データベースは、LLM への入力の一部として関連情報を検索・提供することで、ハルシネーションなど LLM の課題を軽減します。

| Title | Description | Modality | Code |
| --- | --- | --- | --- |
| Verba, the golden RAGtriever ([Video](https://www.youtube.com/watch?v=OSt3sFT1i18 ), [Demo](https://verba.weaviate.io/)) | Weaviate のドキュメントとブログ記事とチャットできる Retrieval augmented generation (RAG) システム。 | テキスト | [Python](https://github.com/weaviate/Verba) |
| HealthSearch ([Blog](https://weaviate.io/blog/healthsearch-demo), [Demo](https://healthsearch-frontend.onrender.com/)) | 症状に基づきヘルスケア製品をレコメンド。 | テキスト | [Python](https://github.com/weaviate/healthsearch-demo) |
| Magic Chat | 『Magic: The Gathering』のカードを検索。 | テキスト | [Python](https://github.com/weaviate/st-weaviate-connection/tree/main) |
| AirBnB Listings ([Blog](https://weaviate.io/blog/generative-feedback-loops-with-llms)) | Generative Feedback Loops を用いて AirBnB のリスティング向けにカスタマイズされた広告を生成。 | テキスト | [Python](https://github.com/weaviate/Generative-Feedback-Loops/) |
| Distyll | テキストや動画コンテンツを要約。 | テキスト | [Python](https://github.com/databyjp/distyll) |

詳しくは、[LLM と検索](https://weaviate.io/blog/llms-and-search) のブログ記事をご覧ください。

## 分類

Weaviate はベクトライザー機能を活用し、セマンティックな理解に基づいて未知の新しいコンセプトをリアルタイムで自動分類できます。

| Title | Description | Modality | Code |
| --- | --- | --- | --- |
| Toxic Comment Classification | コメントが有害か無害かを分類します。 | テキスト | [Python](https://github.com/weaviate-tutorials/DEMO-classification-toxic-comment) |
| Audio Genre Classification | 音声ファイルの音楽ジャンルを分類します。 | 画像 | [Python](https://github.com/weaviate-tutorials/DEMO-classification-audio-genre/) |

## その他のユースケース

Weaviate の[モジュラー エコシステム](../modules/index.md)により、[固有表現抽出](../modules/ner-transformers.md)や[スペル チェック](../modules/spellcheck.md)など、Weaviate vector データベースのさらなるユースケースが広がります。

| Title | Description | Code |
| --- | --- | --- |
| Named Entity Recognition (NER) | tbd | [Python](https://github.com/weaviate/weaviate-examples/tree/main/example-with-NER-module) |

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

