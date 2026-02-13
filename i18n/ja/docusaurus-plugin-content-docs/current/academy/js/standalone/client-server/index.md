---
title: クライアント-サーバー アプリケーションの構築
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';


## <i class="fa-solid fa-square-chevron-right"></i> 概要

JavaScript で Weaviate を使用し、[weaviate-client](https://www.npmjs.com/package/weaviate-client) を利用して Web アプリケーションを構築する場合は、クライアント-サーバー アーキテクチャを採用することを推奨します。

使用する開発ツールによって、この推奨事項は変わる場合があります。  

Next.js のようなフルスタック フレームワークは、サーバーサイド開発や Weaviate と通信するための API 作成をサポートしています。これは REST 呼び出し、または Next.js では Server 関数を通じて実現されます。このアプローチではクライアント アプリケーションとサーバー アプリケーションが密に結合されます。  

Express などのバックエンド Web フレームワークを使用すると、Weaviate と通信するための API を作成できます。クライアント アプリケーションはこの API を REST 呼び出しで利用します。この方法ではクライアント アプリケーションとサーバー アプリケーションを完全に分離できます。


### <i class="fa-solid fa-clipboard-list-check"></i> 前提条件

- `weaviate-client` がインストールされた Node.js 環境  
- Weaviate の検索機能に関する知識  
- JavaScript でモダンな Web アプリケーションを構築した経験  
- 中級程度のコーディングスキル (例: JavaScript)  

## <i class="fa-solid fa-chalkboard-user"></i> 学習目標

import LearningGoalsExp from '/src/components/Academy/learningGoalsExp.mdx';

<LearningGoalsExp />



import LearningGoals from '/src/components/Academy/learningGoals.jsx';

<LearningGoals unitName="client_server"/>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>