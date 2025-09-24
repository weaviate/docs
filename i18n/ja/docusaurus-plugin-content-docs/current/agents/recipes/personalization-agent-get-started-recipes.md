---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/personalization-agent-get-started-recipes.ipynb
toc: True
title: "Weaviate パーソナライズ エージェントの構築 - フードレコメンダー"
featured: False
integration: False
agent: True
tags: ['Personalization Agent']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/personalization-agent-get-started-recipes.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

このレシピでは、Weaviate の新しい `PersonalizationAgent` を使用し、ユーザーごとにパーソナライズされた方法で Weaviate コレクションからオブジェクトを取得します。この新しいエージェント方式の取得は、ユーザーのペルソナ プロファイルとこれまでのコレクションとのやり取りに基づいて行われます。

> 📚 `PersonalizationAgent` の使い方の詳細は、弊社ブログ「[Introducing the Weaviate Personalization Agent](https://weaviate.io/blog/personalization-agent?utm_source=recipe&utm_campaign=agents)」および[ドキュメント](https://docs.weaviate.io/agents/personalization)をご覧ください。

すぐに試せるように、Hugging Face datasets 🤗 にいくつかのデモデータセットを用意しました。  
- [Recipes](https://huggingface.co/datasets/weaviate/agents/viewer/personalization-agent-recipes): 料理名、短い説明、料理の種類を含むデータセット  
- [Movies](https://huggingface.co/datasets/weaviate/agents/viewer/personalization-agent-movies): 映画、評価、オリジナル言語などを含むデータセット  

本例では、Recipes データセットを使用してフード レコメンダー サービスを作成します。

```python
!pip install 'weaviate-client[agents]' datasets
```

## Weaviate のセットアップとデータのインポート

Weaviate Personalization Agent を使うには、まず [Weaviate Cloud](tps://weaviate.io/deployment/serverless?utm_source=recipe&utm_campaign=agents) アカウントを作成してください👇  
1. [Serverless Weaviate Cloud アカウント](https://weaviate.io/deployment/serverless?utm_source=recipe&utm_campaign=agents)を作成し、無料の [Sandbox](https://docs.weaviate.io/cloud/manage-clusters/create#sandbox-clusters?utm_source=recipe&utm_campaign=agents) をセットアップします  
2. 「Embedding」に移動して有効化します。デフォルトでは `Snowflake/snowflake-arctic-embed-l-v2.0` が埋め込みモデルとして使用されます  
3. クラスターに接続するため `WEAVIATE_URL` と `WEAVIATE_API_KEY` を控えておきます  

> Info: 外部埋め込みプロバイダー用の追加キーを用意する必要がないため、[Weaviate Embeddings](https://docs.weaviate.io/weaviate/model-providers/weaviate) の使用を推奨します。

```python
import os

import weaviate
from weaviate.auth import Auth
from getpass import getpass

if "WEAVIATE_API_KEY" not in os.environ:
  os.environ["WEAVIATE_API_KEY"] = getpass("Weaviate API Key")
if "WEAVIATE_URL" not in os.environ:
  os.environ["WEAVIATE_URL"] = getpass("Weaviate URL")

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ.get("WEAVIATE_URL"),
    auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
```

### 新しいコレクションの作成

次に、Weaviate に "Recipes" という名前の新しいコレクションを作成します。Weaviate のエージェントサービスでは、コレクション内プロパティの説明を含めることが推奨されます。これらの説明はエージェントによって利用されます。

```python
from weaviate.classes.config import Configure, DataType, Property

# if client.collections.exists("Recipes"):
#     client.collections.delete("Recipes")

client.collections.create(
    "Recipes",
    description="A dataset that lists recipes with titles, desctiptions, and labels indicating cuisine",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(
            name="title", data_type=DataType.TEXT, description="title of the recipe"
        ),
        Property(
            name="labels",
            data_type=DataType.TEXT,
            description="the cuisine the recipe belongs to",
        ),
        Property(
            name="description",
            data_type=DataType.TEXT,
            description="short description of the recipe",
        ),
    ],
)
```

```python
from datasets import load_dataset

dataset = load_dataset("weaviate/agents", "personalization-agent-recipes", split="train", streaming=True)

recipes_collection = client.collections.use("Recipes")

with recipes_collection.batch.dynamic() as batch:
    for item in dataset:
        batch.add_object(properties=item["properties"])

```

## パーソナライズ エージェントの作成

以下では `"Recipes"` コレクションの `PersonalizationAgent` を作成します。すでにこのコレクション用のエージェントが存在する場合は、単に接続するだけです。

新しく `PersonalizationAgent` を作成する際、任意で `user_properties` を定義できます。

ユーザープロパティは、エージェントに追加されるユーザーに関する有用な情報なら何でも構いません。今回はフード レコメンダー サービスを作成するため、各ペルソナに `favorite_cuisines`、`likes`、`dislikes` を追加することにします。

```python
from weaviate.agents.personalization import PersonalizationAgent

if PersonalizationAgent.exists(client, "Recipes"):
  agent = PersonalizationAgent.connect(
          client=client,
          reference_collection="Recipes",
      )
else:
  agent = PersonalizationAgent.create(
          client=client,
          reference_collection="Recipes",
          user_properties={
              "favorite_cuisines": DataType.TEXT_ARRAY,
              "likes": DataType.TEXT_ARRAY,
              "dislikes": DataType.TEXT_ARRAY
          },
      )

```

### 新規ペルソナの追加

`add_persona` を使って新しいユーザーを追加でき、その際に先ほど定義したユーザープロパティを指定します。お好みで下のコードブロックを自身の情報に変更して試してみてください👇

```python
from uuid import uuid4
from weaviate.agents.classes import Persona, PersonaInteraction

persona_id = uuid4()
agent.add_persona(
    Persona(
        persona_id=persona_id,
        properties={
            "favorite_cuisines": ["Italian", "Thai"],
            "likes": ["chocolate", "salmon", "pasta", "most veggies"],
            "dislikes": ["okra", "mushroom"],
        },
    )
)
```

```python
agent.get_persona(persona_id)

```

Python output:  
```text
Persona(persona_id=UUID('df987437-4d10-44d6-b613-dfff31f715fb'), properties={'favorite_cuisines': ['Italian', 'Thai'], 'dislikes': ['okra', 'mushroom'], 'allergies': None, 'likes': ['chocolate', 'salmon', 'pasta', 'most veggies']})
```

### インタラクションの追加

少なくとも 1 つのペルソナを作成したら、そのペルソナに対するインタラクションを追加できます。フード レコメンダー サービスの場合、ペルソナの食事レビューを追加するのが理にかなっています。

各インタラクションには -1.0（ネガティブ）から 1.0（ポジティブ）までの重みを設定できます。以下では、いくつかの料理に対するレビューを追加してみましょう。

どのようなエンドアプリケーションがこれらのインタラクションを送信するか、また各重みが何を表すのかをルール化しておくと良いでしょう。例えばレシピサイトを想定すると:  
- 1.0: お気に入りの料理  
- 0.8: 料理を気に入った  
- 0.5: レシピページを閲覧した  
- -0.5: 料理が好みではない  
- -1.0: 料理を完全に嫌った 👎  

```python
from uuid import UUID
from weaviate.collections.classes.filters import Filter

reviewed_foods = [
    "Coq au Vin",
    "Chicken Tikka Masala",
    "Gnocchi alla Sorrentina",
    "Matcha Ice Cream",
    "Fiorentina Steak",
    "Nabe",
    "Duck Confit",
    "Pappardelle with Porcini"
]

reviews_dict = {
    recipe.properties["title"]: recipe
    for recipe in recipes_collection.query.fetch_objects(
        filters=Filter.by_property("title").contains_any(reviewed_foods), limit=20
    ).objects
}

interactions = [
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Coq au Vin"].uuid, weight=0.8
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Chicken Tikka Masala"].uuid, weight=0.8
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Matcha Ice Cream"].uuid, weight=0.8
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Gnocchi alla Sorrentina"].uuid, weight=0.5
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Fiorentina Steak"].uuid, weight=0.8
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Nabe"].uuid, weight=0.5
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Duck Confit"].uuid, weight=1.0
    ),
    PersonaInteraction(
        persona_id=persona_id, item_id=reviews_dict["Pappardelle with Porcini"].uuid, weight=-1.0
    ),

]
```

```python
agent.add_interactions(interactions=interactions)
```

## レコメンデーションと根拠の取得

ペルソナとそのインタラクションを用意できたので、`get_objects` でエージェントからオブジェクトを推薦してもらいましょう。ここでは `use_agent_ranking` を設定するかどうかの 2 通りがあります。

`use_agent_ranking` を使用しない場合、返却されたオブジェクトは従来の機械学習クラスタリングでランク付けされます。一方、使用する場合は、LLM による追加の再ランキングが行われ、任意の `instruction` も渡せます。

エージェント ランキングを使用すると、下記のように `ranking_rationale` でランキングの根拠も確認できます👇

```python
response = agent.get_objects(persona_id, limit=25, use_agent_ranking=True)

print(response.ranking_rationale)
for i, obj in enumerate(response.objects):
    print(f"*****{i}*****")
    print(obj.properties["title"])
    print(obj.properties["description"])
    print(obj.properties["labels"])
```

Python output:  
```text
Based on your love for Italian cuisine and positive interactions with dishes like Gnocchi alla Sorrentina and Fiorentina Steak, Italian dishes like Frittata di Zucca e Pancetta and Classic Italian Margherita Pizza are highlighted. Your fondness for Chicken Tikka Masala also brought Indian dishes such as Spicy Indian Tikka Masala forward. Although you enjoyed Coq au Vin, the included mushrooms might not be to your liking, which is reflected in a balanced way within French dishes.
*****0*****
Frittata di Zucca e Pancetta
A fluffy egg omelette with sweet potatoes and pancetta, seasoned with herbs and grated cheese, a beloved dish from the heart of Italy.
Italian
*****1*****
Pizza Margherita
A simple yet iconic pizza with San Marzano tomatoes, mozzarella di bufala, fresh basil, and extra-virgin olive oil, encapsulating the Neapolitan pizza tradition.
Italian
*****2*****
Lasagna alla Bolognese
Layers of pasta sheets, Bolognese sauce, and béchamel, all baked to golden perfection, embodying the comforting flavors of Emilia-Romagna.
Italian
*****3*****
Lasagna alla Bolognese
Layers of flat pasta sheets, rich Bolognese sauce, and béchamel, baked to perfection.
Italian
*****4*****
Spicy Indian Tikka Masala
A rich tomato and cream sauce with chunks of chicken, covered in a fiery blend of spices and charred chunks of chicken.
Indian
*****5*****
Classic Italian Margherita Pizza
Thin crust pizza topped with San Marzano tomatoes, fresh mozzarella, basil, and extra-virgin olive oil, representing the simplicity of Italian cuisine.
Italian
*****6*****
Chicken Tikka Masala
Marinated chicken drumsticks grilled on a spit and then simmered in a spicy tomato sauce with cream, a popular dish in Indian cuisine.
Indian
*****7*****
Butter Chicken
A creamy and aromatic tomato sauce with tender chunks of chicken, marinated in a blend of spices and cooked with yogurt and cream, often served with rice or naan bread.
Indian
*****8*****
French Coq au Vin
A hearty stew of chicken braised with wine, mushrooms, and garlic, capturing the essence of French country cooking.
French
*****9*****
Sicilian Arancini
Deep-fried balls of risotto mixed with cheese and peas, coated with breadcrumbs and Parmesan cheese.
Italian
*****10*****
Ramen
A noodle soup dish with Chinese influences, typically containing Chinese-style noodles served in a meat or fish-based broth, often flavored with soy sauce or miso, and uses toppings such as sliced pork, green onions, and nori.
Japanese
*****11*****
Oden
A hearty Japanese hotpot dish made with simmered fish cakes, tofu, konnyaku, and vegetables, in a dashi-based broth.
Japanese
*****12*****
Shabu-Shabu
A Japanese hot pot dish where thinly sliced meat and vegetables are cooked in boiling water at the table.
Japanese
*****13*****
Tempura
A Japanese dish usually made with seafood, vegetables, and sometimes meat, battered and deep-fried until crisp.
Japanese
*****14*****
Oden
A Japanese stew containing fish cakes, daikon radish, konnyaku, tofu, and boiled eggs, typically flavored with miso or dashi broth.
Japanese
*****15*****
Tandoori Chicken
Marinated in yogurt and spices, then cooked in a tandoor (clay oven), resulting in a tangy and spicy chicken dish.
Indian
*****16*****
Beef Bourguignon
A flavorful beef stew cooked slowly in red wine, beef broth, and a bouquet garni, with carrots, onions, and mushrooms, typically served with potatoes or noodles.
French
*****17*****
Pizza Margherita
Simple pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra-virgin olive oil, reflecting the colors of the Italian flag.
Italian
*****18*****
Butter Chicken
Soft and tender pieces of chicken in a rich and creamy sauce made with butter, tomatoes, and a blend of Indian spices.
Indian
*****19*****
Chicken Biryani
A flavorful rice dish cooked with basmati rice, chicken, and a mix of aromatic spices such as cardamom, cinnamon, and cloves, layered with meat and vegetables.
Indian
*****20*****
Milanesa a la Napolitana
A breaded cutlet, typically veal, topped with melted cheese and tomato sauce, a popular street food item.
Argentinian
*****21*****
Tempura Udon
Thick udon noodles served with crispy tempura shrimp and vegetables, lightly coated in a dashi-based sauce for a delicate taste.
Japanese
*****22*****
Miso Soup
A traditional Japanese soup consisting of a stock called dashi into which softened miso paste is mixed, often with pieces of tofu and seaweed.
Japanese
*****23*****
Udon Noodles
A type of thick wheat flour noodle common in Japanese cuisine, served hot or cold with a dipping sauce.
Japanese
*****24*****
Pappardelle with Porcini
Thick wide ribbons of pasta served with a creamy porcini mushroom sauce and grated Parmesan cheese.
Italian
```

### instructions 付きレコメンデーションの取得

オプションとして、エージェントに instruction を与えることもできます。これにより、エージェント LLM がどのような推薦を行うべきかについて、より多くの文脈を得られます。

また、初期ランキングの件数を多めに設定し、その後エージェント ランキングで絞り込むと良い場合もあります。以下ではその例を示します👇

```python
response = agent.get_objects(persona_id,
                             limit=50,
                             use_agent_ranking=True,
                             instruction="""Your task is to recommend a diverse set of dishes to the user
                             taking into account their likes and dislikes. It's especially important to avoid their dislikes.""",
)

print(response.ranking_rationale)
for i, obj in enumerate(response.objects[:10]):
    print(f"*****{i}*****")
    print(obj.properties["title"])
    print(obj.properties["description"])
    print(obj.properties["labels"])
```

Python output:  
```text
As you love Italian cuisine and have a special liking for foods like pasta and salmon, while disliking mushrooms, we've focused on offering you a variety of Italian and other delightful dishes without mushroom content. We've also incorporated a touch of diversity with dishes from other cuisines you enjoy, while carefully avoiding those with ingredients you dislike.
*****0*****
Chicken Tikka Masala
Marinated chicken drumsticks grilled on a spit and then simmered in a spicy tomato sauce with cream, a popular dish in Indian cuisine.
Indian
*****1*****
Pasta alla Norma
Pasta served with fried eggplant, tomato sauce, and ricotta salata, a flavorful dish that showcases the vibrant flavors of Sicilian cuisine.
Italian
*****2*****
Classic Italian Margherita Pizza
Thin crust pizza topped with San Marzano tomatoes, fresh mozzarella, basil, and extra-virgin olive oil, representing the simplicity of Italian cuisine.
Italian
*****3*****
Pizza Margherita
Simple pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra-virgin olive oil, reflecting the colors of the Italian flag.
Italian
*****4*****
Spicy Indian Tikka Masala
A rich tomato and cream sauce with chunks of chicken, covered in a fiery blend of spices and charred chunks of chicken.
Indian
*****5*****
Lasagna alla Bolognese
Layers of flat pasta sheets, rich Bolognese sauce, and béchamel, baked to perfection.
Italian
*****6*****
Fettuccine Alfredo
Creamy pasta dish made with fettuccine pasta tossed in a rich sauce of butter, heavy cream, and Parmesan cheese.
Italian
*****7*****
Sicilian Arancini
Deep-fried balls of risotto mixed with cheese and peas, coated with breadcrumbs and Parmesan cheese.
Italian
*****8*****
Frittata di Zucca e Pancetta
A fluffy egg omelette with sweet potatoes and pancetta, seasoned with herbs and grated cheese, a beloved dish from the heart of Italy.
Italian
*****9*****
Paneer Tikka
Small cubes of paneer marinated in spices and yogurt, then grilled and served in a spicy tomato sauce.
Indian
```

