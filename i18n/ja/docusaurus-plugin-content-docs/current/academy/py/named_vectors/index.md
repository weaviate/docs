---
title: "220 名前付き ベクトル"
description: "Python でのクエリ関連性を高めるために Weaviate で名前付き ベクトル を使用する方法を理解します."
sidebar_position: 220
---

import LearningGoals from '/src/components/Academy/learningGoals.jsx';  
import CourseUnits from '/src/components/Academy/courseUnits.jsx';  
import { courseData } from '/src/components/Academy/courseData.js'  

## <i class="fa-solid fa-chalkboard-user"></i> コース概要

同じデータを複数の方法で表現したいことがあります。たとえば、記事を本文、タイトル、あるいはその両方で表現したい場合などです。  

名前付き ベクトル を使うと、これが可能になります。名前付き ベクトル では、1 つのオブジェクトに対して複数の ベクトル 埋め込みを保存し、それぞれの ベクトル 空間を用いて検索できます。これにより、データの表現と検索方法に大きな柔軟性が生まれます。  

本コースでは、マルチモーダリティの観点から名前付き ベクトル の使い方を学びます。タイトルや概要といったテキスト属性、ポスターなどの画像属性を ベクトル 化して、映画を表現・検索する方法を紹介します。  

マルチモーダル データを使う予定がなくても問題ありません。ここで学ぶ概念は、どのようなデータや ベクトライザー にも応用できます。  

## <i class="fa-solid fa-chalkboard-user"></i> 学習目標

<LearningGoals courseName="named_vectors"/>

## <i class="fa-solid fa-book-open-reader"></i> ユニット

<CourseUnits courseData={courseData} courseName="named_vectors" />