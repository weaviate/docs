---

title: デプロイに関する FAQ

---

本番環境で Weaviate をデプロイするためのガイダンスをお探しですか？PoC からエンタープライズ規模への拡張、他ソリューションからの移行、または特定のワークロード向けの最適化など、デプロイを円滑に進めるための実践的な回答をまとめました。ベクトル検索の力をアプリケーションで最大限に活用しながら、信頼性の高いパフォーマンスを実現し、データ整合性を維持し、運用コストを最小化できるようサポートします。

#### Q1: クラスターが突然読み取り専用になったのはなぜですか？

<details>

<summary> 回答 </summary>

ほとんどの場合、ディスク容量が不足しています。Weaviate は、ディスク使用量が設定した閾値を超えると自動的に読み取り専用モードに切り替えて自己保護を行います。Weaviate が利用できるディスクサイズを増やし、その後読み取り専用ステータスをリセットしてください。

</details>

#### Q2: AWS Marketplace で Weaviate をデプロイするにはどうすればよいですか？

<details>

<summary> 回答 </summary>

こちらの [ページ](../installation-guides/aws-marketplace.md) で、AWS Marketplace を利用して Weaviate をデプロイするための手順をすべてご確認いただけます。 

</details>

#### Q3: GCP Marketplace で Weaviate をデプロイするにはどうすればよいですか？

<details>

<summary> 回答 </summary>

こちらの [ページ](../installation-guides/gcp-marketplace.md) で、GCP Marketplace を利用して Weaviate をデプロイするための手順をすべてご確認いただけます。 

</details>

#### Q4: コレクション数の推奨上限はありますか？

<details>

<summary> 回答 </summary>

20 以上のコレクションを作成する予定がある場合は、スケーリングとパフォーマンス向上のためにマルチテナンシーを検討することをお勧めします。 

**追加情報:** [コレクションのスケーリング制限](/weaviate/starter-guides/managing-collections/collections-scaling-limits.mdx)

</details>

#### Q5: デプロイ時によく起こる問題は何ですか？

<details>

<summary> 回答 </summary>

デプロイ時によく発生する問題には、次のようなものがあります。  

- クラスターが `read-only` になる。  
- クエリ結果が一貫しない。  
- ノードがコンセンサスを維持できない。  
- コレクションを作り過ぎている。  

#### 参考リソース 

詳細については、[トラブルシューティングページ](./troubleshooting.md) をご覧ください。一般的な問題への対処方法を確認できます。 

</details>

#### Q6: Weaviate と他のデータベースの違いは何ですか？

<details>

<summary> 回答 </summary>

Weaviate には複雑な処理があるため、取り込みと削除には他のデータベースより多くのステップが必要です。ベクトル化を行うためデータ取り込みは従来のデータベースより時間がかかり、オブジェクト削除も埋め込みのコストがかかるため高価になります。 
</details>

#### Q7: オブジェクトを削除するとリソースはすぐに解放されますか？

<details>

<summary> 回答 </summary>

いいえ、即時には解放されません。オブジェクトを削除するとトゥームストーンが作成され、データ削除とインデックスクリーンアップはバックグラウンドプロセスとして行われます。 

</details>

#### Q8: クライアントタイムアウトとモジュールタイムアウトの違いは何ですか？

<details>

<summary> 回答 </summary>

- **Client timeout:** クライアントと Weaviate サーバー間のタイムアウトです。  
- **Module timeout:** Weaviate が LLM やベクトライザーなどの外部モジュールと連携する際に発生するタイムアウトです。 

</details>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

