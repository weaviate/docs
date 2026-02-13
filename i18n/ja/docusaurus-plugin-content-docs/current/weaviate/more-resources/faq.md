---
title: よくある質問
sidebar_position: 3
image: og/docs/more-resources.jpg
# tags: ['FAQ']
---

## 一般

#### Q: Weaviate を ベクトル データベースとして使用する理由は何ですか？

<details>
  <summary>回答</summary>

> 私たちの目標は三つあります。  
> 1. まず、他の人が独自のセマンティック システムや ベクトル 検索エンジンをできる限り簡単に作成できるようにすることです（そのため API は GraphQL ベースです）。  
> 2. 次に、セマンティック要素（「ベクトル データベース」における「知識」部分）に強くフォーカスしています。最終的には、 Weaviate がデータの管理・インデックス作成・「理解」を支援し、より新しく、優れた、そして高速なアプリケーションを構築できるようにすることがゴールです。  
> 3. そして三つ目に、どこでも実行できるようにしたいと考えています。そのため Weaviate はコンテナ化されています。  

</details>

#### Q: Weaviate と Elasticsearch などとの違いは何ですか？

<details>
  <summary>回答</summary>

> 他のデータベース システム（例: Elasticsearch）は転置インデックスに依存しており、高速な検索が可能です。 Weaviate もデータと値を保存するために転置インデックスを使用します。さらに、 Weaviate は ベクトル ネイティブ検索データベースでもあり、データを ベクトル として保存することでセマンティック検索を実現します。このデータ保存方式の組み合わせはユニークで、エンドツーエンドで高速・フィルタリング付き・セマンティック検索を可能にします。

</details>

#### Q: Weaviate をマネージド サービスとして提供していますか？

<details>
  <summary>回答</summary>

> はい、提供しています。詳しくは [Weaviate Cloud](https://weaviate.io/pricing) をご覧ください。

</details>

## 設定とセットアップ

#### Q: インスタンスのサイズはどのように設定すれば良いですか？

<details>
  <summary>回答</summary>

> ドキュメントの [アーキテクチャ セクション](/weaviate/concepts/resources.md#an-example-calculation) を参照してください。

</details>

#### Q: Weaviate を利用するのに Docker（Compose）を理解している必要がありますか？

<details>
  <summary>回答</summary>

> Weaviate はリリースを配布する手段として Docker イメージを使用し、モジュールが豊富なランタイムをまとめるために Docker Compose を利用します。これらの技術に不慣れな場合は、[Docker Introduction for Weaviate Users](https://medium.com/semi-technologies/what-weaviate-users-should-know-about-docker-containers-1601c6afa079) をお読みいただくことをおすすめします。

</details>

#### Q: Weaviate の Docker コンテナが再起動した場合、データは失われますか？

<details>
  <summary>回答</summary>

> 3 つのレベルがあります。  
> 1. ボリュームを設定していない（ `Docker Compose` ファイルのデフォルト）場合、コンテナが再起動しても（例: クラッシュや `docker stop/start`）データは保持されます。  
> 2. ボリュームを設定していない状態でコンテナを削除した場合（例: `docker compose down` や `docker rm`）、データは失われます。  
> 3. ボリュームを設定している場合、コンテナに何が起きてもデータは保持されます。コンテナを完全に削除・置換しても、次回ボリューム付きで起動すればすべてのデータがそこにあります。  

</details>

#### Q: Weaviate で RBAC を有効にするには？

<details>
  <summary>回答</summary>

> RBAC（ロールベースアクセス制御）は、 `AUTHORIZATION_RBAC_ENABLED` 環境変数で Weaviate を設定するときに有効化できます。詳細は [RBAC: Configuration](/deploy/configuration/configuring-rbac.md) ガイドをご覧ください。

</details>

## スキーマとデータ構造

#### Q: スキーマを設計する際に考慮すべきベストプラクティスやガイドラインはありますか？

*(例: 書籍の内容に対してセマンティック検索を行う場合、スキーマに Chapter や Paragraph を表現すべきか、それとも小説全体を 1 つのプロパティに含める方が良いかなど)*

<details>
  <summary>回答</summary>

> 大まかな目安として、単位が小さいほど検索は高精度になります。たとえば文という 2 つのオブジェクトは、共通の ベクトル（実質的には文の平均値）よりも多くの情報を ベクトル 埋め込みに含む傾向があります。一方で、オブジェクト数が増えるとインポート時間が長くなり（各 ベクトル もデータ量になるため）ディスク容量も増加します。例として、 transformers を使用する場合、1 つの ベクトル は 768×float32 = 3 KB です。数百万の ベクトル があれば大きな差になります。一般的に、 ベクトル が多いほどメモリも多く必要になります。  
>
> つまり、いくつかのトレードオフがあります。私たちの経験では、段落を個別の単位として扱うと非常に良い結果が得られました。より細粒度にしても大きなメリットはなく、章全体よりはるかに高精度だからです。  
>
> 章を段落へリンクする際などにはクロスリファレンスを使用できます。ただし、クロスリファレンスを解決するにはパフォーマンス上のペナルティがあります。実質的に A1→B1 を解決するコストは A1 と B1 の両方を個別に検索するのと同じです。大規模になるとこのコストが積み重なります。  
>
> そのため、データを正規化せず、クロスリファレンスを実際に参照せずとも解決できる形で保存する（デノーマライズする）ことを検討してください。これはデータベースで一般的なパターンであり、 Weaviate でも同様です。  

</details>

#### Q: スキーマで参照（リファレンス）を使うべきですか？

<details>
  <summary>回答</summary>

> 端的に言えば、利便性のためにデータ スキーマへリレーションを追加すると、コードやクエリが少なくて済みますが、クエリ実行時に参照を解決する分だけパフォーマンスが低下します。  
>
> 1. 最終的な目標がパフォーマンスであれば、参照は付加価値を生まない可能性があります。解決コストがかかるためです。  
> 2. データ項目間の複雑な関係を表現することが目的であれば、大いに役立ちます。1 回のクエリで参照を解決できるため、複数のリンクを持つコレクションでは特に便利です。一方で、単一の（双方向）参照しかない場合は、リンクをデノーマライズ（例: ID フィールド）し検索時に解決する方法もあります。  

</details>

#### Q: スキーマで 1 対多のリレーションシップを作成できますか？

<details>
  <summary>回答</summary>

> はい、クロスリファレンスを使用して 1 つまたは複数のオブジェクト（Class → 複数の Class）を参照できます。プリミティブのリストまたは配列への参照については、[こちら](https://github.com/weaviate/weaviate/issues/1611) で近日対応予定です。

</details>

#### Q: `text` と `string`、そして `valueText` と `valueString` の違いは何ですか？

<details>
  <summary>回答</summary>

> `text` と `string` のデータ型はトークナイズ方法が異なります。`string` は現在非推奨です。詳細は [このセクション](../config-refs/collections.mdx#tokenization) をご覧ください。

</details>



#### Q: Weaviate コレクションには名前空間がありますか？

<details>
  <summary>回答</summary>

はい。各コレクション自体が名前空間のように機能します。さらに、[マルチテナンシー](../concepts/data.md#multi-tenancy)機能を使用して、テナントごとに分離されたストレージを作成できます。これは、1 つのクラスターが複数の顧客やユーザーのデータを保存するユースケースで特に有用です。

</details>

#### Q: UUID の形式に制限はありますか？何か標準に従う必要がありますか？

<details>
  <summary>回答</summary>

> UUID は、[Canonical Textual representation](https://en.wikipedia.org/wiki/Universally_unique_identifier#Format) に一致する文字列として提供する必要があります。UUID を指定しない場合、 Weaviate は `v4`、つまりランダム UUID を生成します。ご自身で生成する場合は、ランダムに生成するか、保有するフィールドに基づいて決定論的に生成するかを選べます。その場合は、[`v3` または `v5`](https://en.wikipedia.org/wiki/Universally_unique_identifier#Versions_3_and_5_(namespace_name-based)) を使用する必要があります。

</details>

#### Q: データオブジェクト追加時に UUID を指定しないと、 Weaviate が自動で生成しますか？

<details>
  <summary>回答</summary>

> はい、 UUID を指定しない場合は Weaviate が自動で生成します。

</details>


#### Q: なぜ Weaviate にはオントロジーではなくスキーマがあるのですか？

<details>
  <summary>回答</summary>

> スキーマはデータの表現（本ケースでは GraphQL API）に焦点を当てているためです。しかし、 Weaviate のスキーマを使ってオントロジーを表現することもできます。 Weaviate のコア機能の 1 つは、スキーマ（およびそのオントロジー）を意味的に解釈し、形式的に定義されたエンティティではなく概念で検索できるようにすることです。

</details>

#### Q: Weaviate のデータスキーマ、オントロジー、タクソノミーの違いは何ですか？

<details>
  <summary>回答</summary>

> タクソノミー、オントロジー、スキーマが Weaviate とどのように関連しているかについては、[このブログ記事](https://medium.com/semi-technologies/taxonomies-ontologies-and-schemas-how-do-they-relate-to-weaviate-9f76739fc695)をご覧ください。

</details>

## テキストと言語の処理

#### Q: カスタム用語はどのように扱えばよいですか？

<details>
  <summary>回答</summary>

> ユーザーが略語や専門用語などのカスタム用語を使用することがあります。エンドポイントの使用方法については [こちら](/weaviate/modules/text2vec-contextionary.md#extending-the-contextionary) を参照してください。

</details>

#### Q: セマンティックな意味を失わずにほぼリアルタイムでデータをインデックスするには？

<details>
  <summary>回答</summary>

> すべてのデータオブジェクトは、そのセマンティックな意味に基づいたベクトル埋め込みを取得します。要するに、データオブジェクトに使用されている語や概念に基づいてベクトル位置を計算します。コンテキショナリーに既に含まれるモデルだけで十分なコンテキストが得られます。詳細を確認したい場合は [こちらのコード](https://github.com/weaviate/contextionary/tree/master/server)を参照するか、[Stack Overflow](https://stackoverflow.com/tags/weaviate/) で Weaviate タグを付けて具体的な質問をしてください。

</details>

#### Q: 自分の言語用の text2vec-contextionary が存在しないのはなぜですか？

<details>
  <summary>回答</summary>

> おそらく、あなたがその言語を最初に必要としているからです！[GitHub でこちら](https://github.com/weaviate/weaviate/issues)にお知らせいただければ、次のリリースで対応します（ただし、[Silbo Gomero](https://en.wikipedia.org/wiki/Silbo_Gomero) など笛で話す言語は除きます）。

</details>

#### Q: 多義語はどのように処理しますか？

<details>
  <summary>回答</summary>

> 「会社（ビジネス）」を意味するのか、「軍隊の部隊」を意味するのかを Weaviate はどのように解釈するのでしょうか？これはスキーマ構造と追加するデータに基づいて行います。 Weaviate のスキーマには company コレクションがあり、そのプロパティ name に Apple という値が入っているとします。このシンプルな表現（company, name, apple）だけで、データオブジェクトのベクトル位置がビジネスや iPhone 方面に引き寄せられます。詳細は[こちら](../)を参照するか、[Stack Overflow](https://stackoverflow.com/tags/weaviate/) で Weaviate タグを付けて具体的な質問をしてください。

</details>

#### Q: クエリ／ドキュメント埋め込みモデルの複数バージョンを同時に利用できますか？（新モデルのライブ実験に便利）

<details>
  <summary>回答</summary>

> Weaviate のスキーマで複数のコレクションを作成できます。1 つのコレクションは Kubernetes のネームスペースや Elasticsearch のインデックスのように機能します。スペース同士は完全に独立しているため、スペース 1 はスペース 2 とはまったく異なる埋め込みを使用できます。設定されたベクトライザーは常に単一のコレクションのみにスコープされます。また、 Weaviate のクロスリファレンス機能を使用して Class 1 のオブジェクトと Class 2 の対応オブジェクトをグラフ状に接続し、別スペースの同等オブジェクトを簡単に参照できます。

</details>

## クエリ

#### Q: コレクション内のオブジェクト総数を取得するには？

<details>
  <summary>回答</summary>

import HowToGetObjectCount from '/_includes/how.to.get.object.count.mdx';

> この `Aggregate` クエリはコレクション内のオブジェクト総数を返します。

<HowToGetObjectCount/>

</details>

#### Q: Weaviate の certainty からコサイン類似度を求めるには？

<details>
  <summary>回答</summary>

> Weaviate の `certainty` から[コサイン類似度](https://en.wikipedia.org/wiki/Cosine_similarity)を取得するには、`cosine_sim = 2*certainty - 1` を使用してください。

</details>

#### Q: 指定した limit によって検索結果の品質が変わるのはなぜですか？どうすれば解決できますか？

<details>
  <summary>回答</summary>

Weaviate はベクトル検索を提供するために ANN インデックスを使用します。ANN インデックスとは近似最近傍 (approximate nearest neighbor) インデックスです。「近似」はリコールとクエリ速度のトレードオフを意味します。このトレードオフは [ANN ベンチマークセクション](/weaviate/benchmarks/ann.md#benchmark-results)で詳細に説明しています。たとえば、特定の HNSW パラメータでリコール 98% とは、結果の 2% が真の最近傍と一致しないことを意味します。どのビルドパラメータがどのリコールにつながるかはデータセットによって異なります。ベンチマークページでは 4 つの例示データセットを示しています。ご自身の本番ワークロードに最も近い特性を持つデータセットを基に、各ビルドおよびクエリ時パラメータでのリコールを推定できます。

一般的に、デフォルトパラメータより高いリコールが必要な場合は、より強いパラメータを使用できます。これはビルド時（`efConstruction`, `maxConnections`）かクエリ時（`ef`）に設定できます。概ね、クエリ時に `ef` を大きくすると検索がより綿密になり、レイテンシーはやや増えますがリコールも向上します。

指定した limit を変更すると、暗黙的に `ef` パラメータも変わります。これはデフォルトの `ef` が `-1` に設定されており、 Weaviate が limit に基づいて `ef` を決定するためです。動的な `ef` 値は、下限となる `dynamicEfMin`、上限となる `dynamicEfMax`、limit から目標 `ef` を導出する係数 `dynamicEfFactor` によって制御されます。

例: デフォルトパラメータ `ef=-1`, `dynamicEfMin=100`, `dynamicEfMax=500`, `dynamicEfFactor=8` を使用した場合、limit に応じた `ef` は以下のようになります。

* `limit=1` の場合: 計算上 `ef=1*8=8`。下限を下回るため `ef` は `100`。
* `limit=20` の場合: 計算上 `ef=20*8=160`。範囲内のため `ef` は `160`。
* `limit=100` の場合: 計算上 `ef=100*8=800`。上限を超えるため `ef` は `500`。

特定の limit でより高い検索品質が必要な場合は、次の選択肢を検討できます。

1. 動的 `ef` の代わりに、望ましいリコールを満たす固定値を使用する。
1. クエリ時の `ef` によって検索品質が大きく変動する場合は、より強力なビルドパラメータを選択することも検討してください。[ANN ベンチマークセクション](/weaviate/benchmarks/ann.md#benchmark-results)には、さまざまなデータセットに対する多数のパラメータ組み合わせが掲載されています。

</details>



#### Q: なぜ SPARQL ではなく GraphQL を使用したのですか?

<details>
  <summary>Answer</summary>

> ユーザー エクスペリエンスのためです。スタックへ Weaviate を統合する作業をできる限り簡単にしたいと考えており、それに対する答えが GraphQL だと信じています。GraphQL を取り巻くコミュニティとクライアント ライブラリは非常に豊富で、そのほとんどを Weaviate で利用できます。

</details>

## データ管理

#### Q: オブジェクトを反復処理する最良の方法は何ですか？ページネーションされた API 呼び出しは可能ですか？

<details>
  <summary>Answer</summary>

> はい、Weaviate はカーソル ベースのイテレーションと結果セットのページネーションの両方をサポートしています。
>
> すべてのオブジェクトを反復処理するには、[`after` 演算子](../manage-objects/read-all-objects.mdx)を使用できます。
>
> 結果セットをページネーションする場合は、GraphQL API 呼び出しで `offset` と `limit` 演算子を使用できます。パフォーマンス上のヒントや制限事項を含むこれらの演算子の使い方については、[このページ](../api/graphql/filters.md)をご覧ください。

</details>

#### Q: データを更新する際のベストプラクティスは何ですか？

<details>
  <summary>Answer</summary>

> データを更新する際のベストプラクティスを 3 つ挙げます:  
> 1. [バッチ API](../manage-objects/import.mdx) を使用する  
> 2. まず 1 バッチあたり 100 件程度の小さめのバッチ サイズから始める。非常に高速であれば増やし、タイムアウトが発生する場合は減らす  
> 3. 一方向のリレーションシップ (例: `Foo -> Bar`) がある場合は、まずすべての `Bar` オブジェクトをインポートし、その後リファレンスを設定済みの `Foo` オブジェクトをインポートするのが最も簡単です。より複雑なリレーションシップがある場合は、まずリファレンスなしでオブジェクトをインポートし、その後で[リファレンスを追加](../manage-objects/import.mdx#import-with-references)してコレクション間のリンクを任意の方向に設定できます。

</details>

## モジュール

#### Q: 独自のモジュールを接続できますか？

<details>
  <summary>Answer</summary>

> [はい!](/weaviate/modules/custom-modules.md)

</details>

#### Q: 自分で text2vec-contextionary ベクトライザー モジュールをトレーニングできますか？

<details>
  <summary>Answer</summary>

> 現時点ではできません。現在は[既存の contextionary](../weaviate/modules/text2vec-contextionary.md)を複数の言語で使用でき、必要に応じて転移学習機能でカスタム概念を追加できます。

</details>

## Weaviate におけるインデックス

#### Q: Weaviate は Hnswlib を使用していますか？

<details>
  <summary>Answer</summary>

> いいえ  
>   
> Weaviate は、[hnswlib](https://github.com/nmslib/hnswlib) の制限 (永続性要件、CRUD サポート、プリフィルタリング など) を克服した独自実装の HNSW を使用しています。  
>   
> Weaviate におけるカスタム HNSW 実装の参考情報:  
>   
> - [HNSW プラグイン (GitHub)](https://github.com/weaviate/weaviate/tree/master/adapters/repos/db/vector/hnsw)  
> - [vector dot product ASM](https://github.com/weaviate/weaviate/blob/master/adapters/repos/db/vector/hnsw/distancer/asm/dot_amd64.s)  
>   
> さらに詳しく:  
>   
> - [Weaviate, an ANN Database with CRUD support – DB-Engines.com](https://db-engines.com/en/blog_post/87) ⬅️ このトピックで最も優れた資料  
> - [Weaviate の HNSW 実装 (ドキュメント)](/weaviate/concepts/indexing/vector-index.md#hierarchical-navigable-small-world-hnsw-index)  
>   
> _Note I: HNSW は Weaviate で使用されている実装の 1 つに過ぎません。Weaviate は[こちら](/weaviate/concepts/indexing/vector-index.md)で説明されているように複数のインデックス アルゴリズムをサポートできます_

</details>

#### Q: すべての ANN アルゴリズムが Weaviate のインデックス プラグイン候補になり得ますか？

<details>
  <summary>Answer</summary>

> いいえ  
>   
> 一部のアルゴリズム (例: Annoy や ScaNN) は、ビルド後は完全にイミュータブルで、変更や段階的な構築ができません。すべてのベクトルがそろった状態で一度だけビルドし、その後はクエリのみ可能で、要素の追加や変更はできません。したがって、Weaviate がサポートしたい CRUD 操作には対応できません。

</details>

#### Q: Weaviate は ANN インデックス検索でプレフィルタリングとポストフィルタリングのどちらを使っていますか？

<details>
  <summary>Answer</summary>

> 現在、Weaviate はフィルター付き ANN 検索においてプレフィルタリングのみを採用しています。詳細は「Weaviate の ベクトル とスカラー フィルタリングの仕組み」をご覧ください。

</details>

#### Q: Weaviate の ベクトル とスカラー フィルタリングの仕組みは？

<details>
  <summary>Answer</summary>

> 2 ステップのプロセスです:  
>   
> 1. インポート時に構築される転置インデックスがクエリを実行し、指定されたドキュメント ID の許可リストを生成します。その後、ANN インデックスがこの許可リストを使ってクエリされます (このリストが独自実装の理由の一つです)。  
> 2. 近いマッチではあるが許可リストに存在しないドキュメント ID に遭遇した場合、その ID は候補として扱われ (評価するリンク リストに追加)、結果セットには追加されません。許可された ID だけを結果セットに追加するため、上位 k 要素に到達する前に早期終了しません。  
>   
> 技術的な実装の詳細については、[この動画](https://www.youtube.com/watch?v=6hdEJdHWXRE)をご覧ください。

</details>

#### 埋め込みの ベクトル 次元数の最大値は？

<details>
  <summary>Answer</summary>

> 現在、埋め込みは `uint16` で保存されているため、最大長は 65535 です。

</details>



## パフォーマンス

#### Q: Weaviate のクエリ速度にとってより重要なのは何ですか?  より多くの CPU パワーですか、それともより多くの RAM ですか?

より具体的には: 16 GB の RAM と 2 つの CPU を搭載したマシンと、8 GB の RAM と 4 つの CPU を搭載したマシンのどちらを選びますか?

<details>
  <summary>回答</summary>

> これを 100% 正確に答えるのは非常に難しいですが、いくつかの要因があります:
> * **ベクトル検索自体**  
>   この部分は CPU ボトルネックですが、スループットに関してのみです。1 件の検索はシングルスレッドで実行されますが、複数の並列検索は複数スレッドを利用できます。そのため、ほかに処理がない状態で単一リクエストの時間を測定すると、マシンが 1 core でも 100 core でも同じです。しかし QPS が CPU のスループットに近づくと、コア数を増やすことで大きなメリットが得られます。  
> * **オブジェクトの取得**  
>   ベクトル検索が終わると、n 個の ID のリストを実際のオブジェクトへ解決する必要があります。これは一般的に IO ボトルネックです。ただし、すべてのディスクファイルはメモリマップされています。そのため、メモリが多いほどディスク状態をメモリに保持できます。とはいえ検索は均一に分散しているわけではありません。たとえば検索の 90% が 10% のオブジェクトだけを返すとしましょう（人気のある検索結果）。その 10% のディスクオブジェクトがすでにメモリにキャッシュされていれば、メモリを追加してもメリットはありません。  
>
> 以上を踏まえると、スループットが問題なら CPU を増やし、応答時間が問題ならメモリを増やすことを慎重に推奨できます。ただし後者は、キャッシュ可能なものが十分にある場合にのみ価値があります。ディスク状態（少なくとも大半のクエリに関連する部分）全体をキャッシュできるだけのメモリがすでにある場合、これ以上メモリを増やしてもメリットはありません。  
> なお、インポートについては HNSW インデックス作成のコストによりほぼ常に CPU ボトルネックです。もしインポート時とクエリ実行時でリサイズできるなら、インポート時は CPU を優先し、その後クエリ実行時に徐々に CPU をメモリに置き換えていくことをお勧めします。効果がなくなるまで続けてください。（実運用でインポートとクエリが分離していない場合もあります。）  

</details>

#### Q: データのインポートが時間がかかる／遅いのですが、原因と対策は?

<details>
  <summary>回答</summary>

> HNSW はクエリ時には非常に高速ですが、ベクトル化時は遅くなります。つまり、データオブジェクトの追加や更新には比較的時間がかかります。[非同期インデックス作成](../config-refs/indexing/vector-index.mdx#asynchronous-indexing)を試すことで、データ取り込みとベクトル化を分離できます。

</details>

#### Q: 遅いクエリをどのように最適化できますか?

<details>
  <summary>回答</summary>

> フィルタリングや解決が必要な深いネスト参照を含むクエリは時間がかかることがあります。最適化戦略については [こちら](./performance.md#costs-of-queries-and-operations) をご覧ください。

</details>


#### Q: スカラー検索とベクトル検索を組み合わせた場合、スカラーフィルタは最近傍（ベクトル）検索の前に実行されますか、それとも後に実行されますか?

<details>
  <summary>回答</summary>

> Weaviate における混合構造化ベクトル検索はプリフィルタ方式です。最初に転置インデックスにクエリをかけ、許可リストを作成します。HNSW 検索ではこのリストを使用し、許可されていないドキュメント ID は接続をたどるノードとしてのみ扱い、結果セットには追加しません。

</details>

#### Q: 「フィルタ付きベクトル検索」について: これは 2 段階のパイプラインですが、ID のリストはどのくらい大きくなりますか? そのサイズはクエリ性能にどのように影響しますか?

<details>
  <summary>回答</summary>

> ID のリストは内部ドキュメント ID を使用しており、型は `uint64`、1 ID あたり 8 バイトです。メモリが許す限りリストを拡張できます。たとえば空きメモリが 2 GB なら 250 M ID、20 GB なら 2.5 B ID を保持できます。  
>
> 性能面では 2 つのポイントがあります:  
> 1. ルックアップリストの作成  
> 2. ベクトル検索時の結果フィルタリング  
>
> リストの作成は典型的な転置インデックスのルックアップで、演算子に応じて == の場合は 1 回の読み取り、範囲検索（例: >7）の場合は値行を 7 から無限大まで読み取ります。このプロセスは従来の検索エンジン（Elasticsearch など）と同じく効率的です。  
>
> ベクトル検索中のフィルタリングは、フィルタの制約度合いによって異なります。ご質問のように多くの ID が含まれる場合は非常に効率的です。許可リストにすべての ID が含まれている状態がフィルタなし検索に相当し、HNSW インデックスは通常どおり動作します。ただしリストが存在する場合は毎回許可リストに含まれているかを確認する必要があり、これはハッシュマップのルックアップで O(1) ですが、わずかなオーバーヘッドがあります。  
>
> 逆にリストが非常に制限的で ID が少ない場合は、かなり時間がかかります。HNSW インデックスは近傍 ID を見つけても、それらがリストに含まれていなければ候補に追加できず、接続の評価だけを行います。極端に制限的なリスト（例: 10 件 / 1 B）の場合、フィルタ対象の ID がクエリから遠いと検索が網羅的になり、インデックスなしの総当たりベクトル検索の方が効率的になります。このように、ブラインドフォース検索の方が効率的になる境界があります。現在このカットオフポイントを検出してインデックスをスキップする最適化は実装されていませんが、実際に問題になれば比較的簡単に実装できるはずです。

</details>

#### Q: Weaviate インスタンスが期待以上のメモリを使用しています。どのようにデバッグできますか?

<details>
  <summary>回答</summary>

> インポートに使用している Weaviate のバージョンが最新か確認してください。`v1.12.0` と `v1.12.1` では、大量のデータをディスクに書き込み、再起動後に過剰なメモリ消費を招く [問題](https://github.com/weaviate/weaviate/issues/1868) が修正されています。アップグレードしても解決しない場合は、[メモリ使用状況のプロファイリング方法](https://stackoverflow.com/a/71793178/5322199) を参照してください。

</details>

## トラブルシューティング / デバッグ

#### Q: Weaviate のスタックトレースを出力する方法は?

<details>
  <summary>回答</summary>

`SIGQUIT` シグナルをプロセスに送ることでスタックトレースをコンソールに出力できます。ログレベルとデバッグ変数は `LOG_LEVEL` と `DEBUG` の [環境変数](/deploy/configuration/env-vars/index.md) で設定できます。

SIGQUIT については [こちら](https://en.wikipedia.org/wiki/Signal_(IPC)#SIGQUIT) と、この [StackOverflow の回答](https://stackoverflow.com/questions/19094099/how-to-dump-goroutine-stacktraces/35290196#35290196) をご覧ください。

</details>

#### Q: コレクション作成時に 'invalid properties' エラーが発生する（Python クライアント 4.16.0〜4.16.3）

<details>
  <summary>回答</summary>

Weaviate Python クライアントの `4.16.0` から `4.16.3` では、text2vec_xxx ベクトライザーで以下のパターンでコレクションを作成するとエラーになります:

```python
client.collections.create(
    "CollectionName",
    vector_config=Configure.Vectorizer.text2vec_cohere(),  # also applies to other vectorizers
)
```

エラーメッセージ例:

```text
UnexpectedStatusCodeError: Collection may not have been created properly.! Unexpected status code: 422, with response body: {'error': [{'message': "module 'text2vec-cohere': invalid properties: didn't find a single property which is of type string or text and is not excluded from indexing....
```

これは既知の問題で、ベクトライザー定義を設定しながらコレクションに `TEXT` または `TEXT_ARRAY` プロパティを 1 つも定義せず、AutoSchema にスキーマ作成を任せた場合に発生します。

**この問題は Weaviate Python クライアントのパッチリリース `4.16.4` で修正されています。バージョン `4.16.4` 以降へのアップデートを推奨します。**

もし該当バージョンから変更できない場合は、次のいずれかの方法で回避できます。

1. コレクションスキーマで少なくとも 1 つの `TEXT` または `TEXT_ARRAY` プロパティを明示的に定義する:

```python
client.collections.create(
    "CollectionName",
    properties=[
        Property(name="<property_name>", data_type=DataType.TEXT),
    ],
    vector_config=Configure.Vectorizer.text2vec_cohere(),
    # Additional configuration not shown
)
```

2. ベクトライザー定義で `vectorize_collection_name` を `True` に設定する:

```python
client.collections.create(
    "CollectionName",
    vector_config=Configure.Vectorizer.text2vec_cohere(
        vectorize_collection_name=True
    ),
    # Additional configuration not shown
)
```

</details>

## その他

#### Q: Weaviate に機能追加をリクエストできますか?

<details>
  <summary>回答</summary>

> もちろんです（[プルリクエスト](https://github.com/weaviate/weaviate/pulls) も大歓迎です 😉）。[こちら](https://github.com/weaviate/weaviate/issues) にリクエストを追加してください。GitHub アカウントさえあれば OK ですし、ついでにスターもぜひ 😇。

</details>



#### Q: 分散セットアップにおける Weaviate の整合性モデルは何ですか？

<details>
  <summary>回答</summary>

> Weaviate は一般的に Availability を Consistency より優先するようにモデル化されており ( AP over CP ) 、可用性が整合性よりもビジネス上クリティカルな状況で、高スループット下でも低い検索レイテンシを提供できるよう設計されています。データに対して厳密なシリアライザビリティが必要な場合は、別のプライマリデータストアにデータを保存し、 Weaviate を補助的なデータストアとして使用し、両者間でレプリケーションを設定することを推奨します。シリアライザビリティが不要で最終的な整合性で十分なユースケースであれば、 Weaviate をプライマリデータストアとして使用できます。
>
> Weaviate にはトランザクションの概念がなく、操作は常に正確に 1 つのキーにのみ影響するため、シリアライザビリティは適用されません。分散セットアップ ( 開発中 ) では、 Weaviate の整合性モデルは最終的な整合性です。クラスタが健全な状態の場合、書き込みがユーザーに ACK されるまでに、すべての変更が影響を受けるすべてのノードにレプリケートされます。インポートリクエストが完了すると、オブジェクトはすべてのノードの検索結果に即座に表示されます。インポート操作と同時に検索クエリが行われた場合、ノード間でまだ同期が取れていない可能性があります。つまり、一部のノードには新しく追加または更新されたオブジェクトが既に含まれている一方で、他のノードにはまだ含まれていない場合があります。健全なクラスタでは、インポートリクエストが正常に完了するまでにすべてのノードが収束します。一時的にノードが利用不可になり再参加した場合、一時的に同期が取れていないことがあります。その場合、当該ノードは他のレプリカノードから欠落している変更を同期し、最終的には再び同じデータを提供します。

</details>

#### Q: 集計でタイムバケットを作成する方法が見当たりませんでしたが、可能ですか？

<details>
  <summary>回答</summary>

> 現時点では、タイムシリーズをタイムバケットに集計することはまだできませんが、アーキテクチャ的には障壁はありません。要望があれば素晴らしい機能リクエストになりそうですので、[こちら](https://github.com/weaviate/weaviate/issues) で issue を送っていただけます。 ( 私たちは非常に小さな会社であり、現在は水平スケーリングが優先事項です ) 。

</details>

#### Q: Docker Compose で最新の master ブランチを実行するにはどうすればよいですか？

<details>
  <summary>回答</summary>

> `Docker Compose` を使用して Weaviate を実行する場合、[`master`](https://github.com/weaviate/weaviate) ブランチから独自のコンテナをビルドできます。これは正式にリリースされた Weaviate のバージョンではないため、バグが含まれている可能性がある点にご注意ください。
>
> ```sh
> git clone https://github.com/weaviate/weaviate.git
> cd weaviate
> docker build --target weaviate -t name-of-your-weaviate-image .
> ```
>
> その後、この新しいイメージを使用して `docker-compose.yml` ファイルを作成します。例:
>
> ```yml
>
> services:
>   weaviate:
>     image: name-of-your-weaviate-image
>     ports:
>       - 8080:8080
>     environment:
>       CONTEXTIONARY_URL: contextionary:9999
>       QUERY_DEFAULTS_LIMIT: 25
>       AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
>       PERSISTENCE_DATA_PATH: './data'
>       ENABLE_MODULES: 'text2vec-contextionary'
>       AUTOSCHEMA_ENABLED: 'false'
>   contextionary:
>     environment:
>       OCCURRENCE_WEIGHT_LINEAR_FACTOR: 0.75
>       EXTENSIONS_STORAGE_MODE: weaviate
>       EXTENSIONS_STORAGE_ORIGIN: http://weaviate:8080
>       NEIGHBOR_OCCURRENCE_IGNORE_PERCENTILE: 5
>       ENABLE_COMPOUND_SPLITTING: 'false'
>     image: cr.weaviate.io/semitechnologies/contextionary:en0.16.0-v1.0.2
> ```
>
> ビルドが完了したら、docker compose でこの Weaviate ビルドを実行できます:

```bash
docker compose up
```

</details>

#### Q: Windows で Weaviate を実行できますか？

<details>
  <summary>回答</summary>

Weaviate は、[Docker](/deploy/installation-guides/docker-installation.md) や [WSL](https://learn.microsoft.com/en-us/windows/wsl/) などのコンテナ化された環境を通じて Windows で利用できます。

現在、ネイティブ Windows サポートは提供していないため、[Weaviate Embedded](/docs/deploy/installation-guides/embedded.md) のようなデプロイオプションは避けてください。

</details>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

