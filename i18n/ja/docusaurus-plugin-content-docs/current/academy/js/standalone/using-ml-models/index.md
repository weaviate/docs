---
title: Weaviate における機械学習モデルの利用
sidebar_position: 10
---

# Weaviate における機械学習モデルの利用

## <i class="fa-solid fa-chalkboard-user"></i> 概要

Weaviate は、AI ネイティブアプリケーションを支えるために 2 種類の基本的な機械学習モデルを活用します。

1. **Embedding Models** - データを高次元の ベクトル 表現へ変換します  
2. **Generative Models** - 入力プロンプトとコンテキストに基づき新しいコンテンツを生成します  

本ガイドでは、これらのモデルを Weaviate で設定・利用する方法と、その高レベルでの動作を簡潔にご紹介します。  

Weaviate がサポートする 2 種類の埋め込みモデル、**テキスト埋め込み** と **マルチモーダル埋め込み** によって実現される検索の使い方を見ていきます。  

また、セマンティック検索からエージェント型 RAG アプリケーションまで、実践的なユースケースも取り上げます。

### <i class="fa-solid fa-clipboard-list-check"></i> 前提条件

- `weaviate-client` がインストールされた Node.js 環境  
- Weaviate の検索機能に関する基本的な理解  
- 中級レベルの JavaScript プログラミングスキル  
- [クイックスタート](/weaviate/quickstart) を完了していること  

## <i class="fa-solid fa-chalkboard-user"></i> 学習目標

import LearningGoalsExp from '/src/components/Academy/learningGoalsExp.mdx';

<LearningGoalsExp />

import LearningGoals from '/src/components/Academy/learningGoals.jsx';

<LearningGoals unitName="using_ml_models"/>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>