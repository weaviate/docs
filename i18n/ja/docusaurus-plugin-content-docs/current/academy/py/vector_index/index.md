---
title: "230 ベクトル インデックス"
description: Weaviate で ベクトル インデックス を 実装し、検索 クエリ を 高速化 します。
sidebar_position: 230
---

import LearningGoals from '/src/components/Academy/learningGoals.jsx';
import CourseUnits from '/src/components/Academy/courseUnits.jsx';
import { courseData } from '/src/components/Academy/courseData.js'

## <i class="fa-solid fa-chalkboard-user"></i> コース概要

:::info 前提条件
このコースは 単体 で 学習 できます。 しかし、[テキスト](../starter_text_data/index.md)、[独自 ベクトル](../starter_custom_vectors/index.md)、または [マルチモーダル データ](../starter_multimodal_data/index.md) を 取り扱う 101 レベル の いずれか の コース を 先に 受講する こと を 推奨 します。
:::

ベクトル インデックス は Weaviate の 検索 機能 の 主要 コンポーネント です。 これ により、クエリ ベクトル との 類似度 に 基づいて ベクトル を 検索 し、それら の ベクトル に 関連付け られた オブジェクト を 取得 できます。

Weaviate は 複数 の ベクトル インデックス を 提供しており、それぞれ に 長所 と 短所 が あります。 各 インデックス は 設定 可能 で、ユースケース に 合わせて パフォーマンス を 調整 できます。

この コース では、Weaviate で 利用 できる さまざま な ベクトル インデックス と、それら を ユースケース に 合わせて 設定 する 方法 を 学び ます。

## <i class="fa-solid fa-chalkboard-user"></i> 学習目標

<LearningGoals courseName="vector_index"/>

## <i class="fa-solid fa-book-open-reader"></i> ユニット

<CourseUnits courseData={courseData} courseName="vector_index" />