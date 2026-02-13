[Composio](https://docs.composio.dev/introduction/intro/overview) は、function calling を使用してツールを言語モデルや AI エージェントと連携・統合します。  

## Composio と Weaviate 
Weaviate の検索機能を利用することで、エージェントをパーソナライズし、よりコンテキストを把握させることができます。 

この統合は、LangChain ベクトルストアを介してサポートされています。 

統合を設定するには、ベクトルストアを作成し、ご使用の Weaviate インスタンスに接続します:  
```python
WeaviateVectorStore.from_documents( )
```

ベクトルストアの作成方法については [こちら](https://python.langchain.com/v0.2/docs/integrations/vectorstores/weaviate/#step-1-data-import) をご覧ください。

## 参考リソース 
[ **Hands on Learning**](#hands-on-learning): エンドツーエンドのチュートリアルで技術的理解を深めましょう。

### ハンズオン学習

| トピック | 説明 | リソース | 
| --- | --- | --- |
| Gmail エージェント | Composio の Gmail ツールを Weaviate と統合し、新着メッセージに返信するエージェントを作成します。 | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/function-calling/composio/agent.ipynb) |

