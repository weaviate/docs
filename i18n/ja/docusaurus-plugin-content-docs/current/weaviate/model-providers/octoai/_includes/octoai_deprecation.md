:::warning Deprecated integrations

### OctoAI インテグレーションの非推奨

<!-- They have been removed from the Weaviate codebase from `v1.25.22`, `v1.26.8` and `v1.27.1`. -->

OctoAI は 2024 年 10 月 31 日 までに商用サービスの提供を終了すると発表しました。これに伴い、Weaviate の OctoAI インテグレーションは非推奨となります。新しいプロジェクトではこれらのインテグレーションを使用しないでください。
<br/>

OctoAI インテグレーションを使用しているコレクションをお持ちの場合、埋め込みモデルを利用しているか（[検討事項](#for-collections-with-octoai-embedding-integrations)）、生成モデルを利用しているか（[検討事項](#for-collections-with-octoai-generative-ai-integrations)）に応じて対応をご検討ください。

#### OctoAI 埋め込みインテグレーションを使用するコレクション

OctoAI は `thenlper/gte-large` を埋め込みモデルとして提供していました。このモデルは [Hugging Face API](../../huggingface/embeddings.md) からも利用できます。
<!-- , and through the [locally hosted Transformers](../../transformers/embeddings.md) integration. -->
<br/>

サービス終了日以降、このモデルは OctoAI からは利用できなくなります。このインテグレーションをご利用の場合、次の選択肢があります。
<br/>

**Option 1: 既存のコレクションを使用し、独自の ベクトル を提供する**
<br/>

既存のコレクションをそのまま使い、新しいデータやクエリに必要な埋め込みは別の方法でご自身で生成できます。「bring your own ベクトル」方式に慣れていない場合は、[スターターガイド](../../../starter-guides/custom-vectors.mdx) をご参照ください。
<br/>

**Option 2: 別のモデルプロバイダーを用いた新しいコレクションへ移行する**

あるいは、データを新しいコレクションに移行することもできます（[手順はこちら](#how-to-migrate)）。この際、既存の埋め込みを再利用することも、新しいモデルを選択することも可能です。
<br/>

- **既存の埋め込みを再利用する** ことで、時間と推論コストを節約できます。
- **新しいモデルを選択する** と、最新モデルを試せるほか、アプリケーション性能を向上できる可能性があります。

既存の埋め込みを再利用する場合は、同じ埋め込みモデルを提供しているモデルプロバイダー（例: [Hugging Face API](../../huggingface/embeddings.md)）を選択してください。
<br/>

任意の埋め込みモデルプロバイダーで新しいモデルを選択することもできます。その場合は既存の埋め込みと互換性がないため、データの埋め込みを再生成する必要があります。
<br/>

#### OctoAI 生成 AI インテグレーションを使用するコレクション

生成 AI インテグレーションのみを使用している場合、データを新しいコレクションへ移行する必要はありません。
<br/>

[このハウツー](../../../manage-collections/generative-reranker-models.mdx#update-the-generative-model-integration) に従い、新しい生成 AI モデルプロバイダーでコレクションを再設定してください。これは Weaviate `v1.25.23`、`v1.26.8`、`v1.27.1` 以降が必要です。
<br/>

生成 AI モデルを提供している任意のモデルプロバイダーを選択できます。
<br/>

OctoAI で使用していたのと同じモデルを継続利用したい場合は、[Anyscale](../../anyscale/generative.md)、[FriendliAI](../../friendliai/generative.md)、[Mistral](../../mistral/generative.md)、あるいは [Ollama](../../ollama/generative.md) を用いたローカルモデルなどで、OctoAI が提供していたモデル群の一部を利用できます。
<br/>

#### 移行方法

移行プロセスの概要は次のとおりです。
<br/>

- 希望するモデルプロバイダーのインテグレーションを使って、新しいコレクションを作成します。
- 既存のコレクションからデータをエクスポートします。
    - （任意）既存の埋め込みを再利用する場合は、埋め込みを含めてエクスポートします。
- データを新しいコレクションにインポートします。
    - （任意）既存の埋め込みを再利用する場合は、埋め込みを含めてインポートします。
- アプリケーションを更新して、新しいコレクションを使用するようにします。
<br/>

データオブジェクトをコレクション間で移行する例については、[How-to manage data: migrate data](../../../manage-collections/migrate.mdx) をご覧ください。

:::

