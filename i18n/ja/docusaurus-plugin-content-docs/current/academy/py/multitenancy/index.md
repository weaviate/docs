---
title: "280 マルチテナンシー (MT)"
description: "Python アプリケーションにおいて、分離されたデータ環境のために Weaviate でマルチテナンシーを実装します。"
sidebar_position: 280
---

import LearningGoals from '/src/components/Academy/learningGoals.jsx';
import CourseUnits from '/src/components/Academy/courseUnits.jsx';
import { courseData } from '/src/components/Academy/courseData.js'

## <i class="fa-solid fa-chalkboard-user"></i> コース概要

:::info 前提条件
このコースは自己完結型です。ただし、[テキスト](../starter_text_data/index.md)、[独自の ベクトル](../starter_custom_vectors/index.md)、または[マルチモーダル データ](../starter_multimodal_data/index.md)を扱う 101 レベルのコースのいずれかを先に受講することをおすすめします。
:::

マルチテナンシーを使用すると、多数の軽量な「テナント」を含む Weaviate コレクションを作成できます。

テナントは、分離された同一のデータ構造を保持するよう設計されています。これは、各エンドユーザーのデータをテナント単位で管理するソフトウェア・アズ・ア・サービス (SaaS) タイプのアプリケーションなどのユースケースに適しています。テナントは個別に管理でき、メモリやディスク使用量を削減するためにコールドストレージへオフロードすることも可能です。

このコースでは、マルチテナンシーの概要を紹介し、Weaviate でマルチテナント コレクションを有効化・設定する方法、そしてテナントおよびテナント データを操作する方法を学びます。

## <i class="fa-solid fa-chalkboard-user"></i> 学習目的

<LearningGoals courseName="multi-tenancy"/>

## <i class="fa-solid fa-book-open-reader"></i> ユニット

<CourseUnits courseData={courseData} courseName="multi-tenancy" />