---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/multi-vector/multi-vector-colipali-rag.ipynb
toc: True
title: "マルチベクトル RAG: PDF ドキュメント コレクションの検索に Weaviate を利用する"
featured: False
integration: False
agent: False
tags: ['ColPali', 'Named Vectors']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/multi-vector/multi-vector-colipali-rag.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

## はじめに

このノートブックでは、Weaviate のマルチベクトル機能を使用して PDF ドキュメント コレクションを効果的にインデックスし、テキストと図を含むドキュメント内容に対するテキスト検索をサポートする方法を紹介します。

ここでは、2023-01-01 から 2024-09-30 の期間における [arXiv で最も引用された AI 論文トップ 40](https://arxiv.org/abs/2412.12121) のデータセットを使用します。

ドキュメントの各ページとクエリの両方を同じマルチベクトル空間に埋め込み、MaxSim 類似度の下で ColBERT スタイルのマルチベクトルによる近似最近傍検索に問題を帰着させることで、この PDF コレクションに対して検索を行います。

埋め込み生成に用いるアプローチは、最近発表された論文 [ColPali: Efficient Document Retrieval with Vision Language Models](https://arxiv.org/abs/2407.01449) で概説されています。この論文は、OCR（Optical Character Recognition）ソフトウェアの使用やテキストと図の個別処理を必要とする従来の PDF 前処理手法を簡素化かつ高速化できることを示しています。具体的には、ページ全体の画像（スクリーンショット）を Vision Language Model に入力し、ColBERT スタイルの埋め込みを生成します。

![colipali pipeline](https://raw.githubusercontent.com/weaviate/recipes/refs/heads/main/weaviate-features/multi-vector/figures/colipali_pipeline.jpeg)

本デモでは、公開されているモデル [ColQwen2-v1.0](https://huggingface.co/vidore/colqwen2-v1.0) を使用して埋め込みを生成します。

## 検索例

構築するシステムの例として、以下の実際のデモ クエリと、その結果として得られた PDF ページ（最近傍）を紹介します。

- クエリ: 「DeepSeek-V2 は LLaMA 系列の LLM と比較してどのように優れていますか？」
- 最近傍:  "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" (arXiv: 2405.04434), Page: 1

[DeepSeek-V2 論文](https://arxiv.org/abs/2405.04434) の 1 ページ目を見ると、クエリに関連する図が確かに含まれていることがわかります。

![deepseek efficiency](https://raw.githubusercontent.com/weaviate/recipes/refs/heads/main/weaviate-features/multi-vector/figures/deepseek_efficiency.jpeg)

## Retrieval Augmented Generation への拡張

上記の例では、クエリに答えるためにまず参照すべき最も関連性の高いページを取得できました。現在の Vision Language Model は非常に強力で、クエリと関連ページをモデルに与えることで、クエリに対する回答をテキストで生成できます。

これを達成するために、最上位の検索結果を最先端の VLM である [Qwen/Qwen2.5-VL-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct) に入力します。

## デモの概要

このデモでは、以下の手順で実行可能な検索例を構築します。

1. Hugging Face から ColQwen モデルを読み込み、画像とクエリをベクトル化するための便利な関数を追加する  
2. Hugging Face から PDF ページのサンプル データセットをロードする  
3. ローカル Weaviate サーバーを起動し、独自ベクトル持ち込み型のマルチベクトル コレクションを作成する  
4. コレクションにクエリを投げて結果を表示する  
5. Qwen2.5-VL を設定して検索拡張生成を実現する  

## 前提条件

- Pipfile に記載されている Python パッケージ  
- 5–10 GB のメモリでニューラルネットワークを実行できるマシン  
- Weaviate バージョン >= 1.29.0 のローカル インスタンス  

[ Pipfile](https://github.com/weaviate/recipes/blob/main/weaviate-features/multi-vector/Pipfile) に記載の全依存関係は、`pipenv install` でインストールできます。

本デモでは、いずれも複数ギガバイトのメモリを必要とする 2 種類の Vision Language Model を使用します。ハードウェアに合わせた最適な実行方法は、各モデルのドキュメントおよび PyTorch の一般ドキュメントをご参照ください。

```python
# Load the ColQWEN model
import torch
from colpali_engine.models import ColQwen2, ColQwen2Processor
import os

# Get rid of process forking deadlock warnings.
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# A convenience class to wrap the functionality we will use from
# https://huggingface.co/vidore/colqwen2-v1.0
class Colqwen:
    def __init__(self):
        """Load the model and processor from huggingface."""
        # About a 5 GB download and similar memory usage.
        self.model = ColQwen2.from_pretrained(
            "vidore/colqwen2-v1.0",
            torch_dtype=torch.bfloat16,
            device_map="mps",  # or "cuda:0" if using a NVIDIA GPU
            attn_implementation="eager",  # or "flash_attention_2" if available
        ).eval()
        self.processor = ColQwen2Processor.from_pretrained("vidore/colqwen2-v1.0")

    # A batch size of one appears to be most performant when running on an M4.
    # Note: Reducing the image resolution speeds up the vectorizer and produces
    # fewer multi-vectors.
    def multi_vectorize_image(self, img):
        """Return the multi-vector image of the supplied PIL image."""
        image_batch = self.processor.process_images([img]).to(self.model.device)
        with torch.no_grad():
            image_embedding = self.model(**image_batch)
        return image_embedding[0]

    def multi_vectorize_text(self, query):
        """Return the multi-vector embedding of the query text string."""
        query_batch = self.processor.process_queries([query]).to(self.model.device)
        with torch.no_grad():
            query_embedding = self.model(**query_batch)
        return query_embedding[0]

    def maxsim(self, query_embedding, image_embedding):
        """Compute the MaxSim between the query and image multi-vectors."""
        return self.processor.score_multi_vector(
            [query_embedding], [image_embedding]
        ).item()

# Instantiate the model to be used below.
colqwen = Colqwen()
```

Python output:
```text
Running cells with 'Python 3.13.1' requires the ipykernel package.

Install 'ipykernel' into the Python environment. 

Command: '/opt/homebrew/bin/python3 -m pip install ipykernel -U --user --force-reinstall'
```
```python
# Load a dataset from huggingface
from datasets import load_dataset

page_data = load_dataset("weaviate/arXiv-AI-papers-multi-vector").with_format(
    "numpy", columns=["colqwen_embedding"], output_all_columns=True
)["train"]

img = page_data[12]["page_image"]
display(img)
```

```python
# Verify that the embedding of images and queries works as intended.
page_embedding = colqwen.multi_vectorize_image(img)
print(page_embedding.shape)  # torch.Size([755, 128])

queries = [
    "A table with LLM benchmark results.",
    "A figure detailing the architecture of a neural network.",
]

query_embeddings = [colqwen.multi_vectorize_text(q) for q in queries]
print(query_embeddings[0].shape)  # torch.Size([20, 128])

# The page matches the first query but not the second. Verify that the
# similarity scores reflect this.
print(colqwen.maxsim(query_embeddings[0], page_embedding))  # 13.4375
print(colqwen.maxsim(query_embeddings[1], page_embedding))  # 9.5625
```

```python
# Make sure that you have weaviate >= 1.29.0 running locally.
!docker run --detach -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:1.29.0
```

```python
# Create the Pages collection that will hold our page embeddings.
import weaviate
import weaviate.classes.config as wc
from weaviate.classes.config import Configure

client = weaviate.connect_to_local()
client.collections.create(
    name="Pages",
    properties=[
        wc.Property(name="page_id", data_type=wc.DataType.INT),
        wc.Property(name="dataset_index", data_type=wc.DataType.INT),
        wc.Property(name="paper_title", data_type=wc.DataType.TEXT),
        wc.Property(name="paper_arxiv_id", data_type=wc.DataType.TEXT),
        wc.Property(name="page_number", data_type=wc.DataType.INT)
    ],
    vectorizer_config=[Configure.NamedVectors.none(
        name="colqwen",
        vector_index_config=Configure.VectorIndex.hnsw(
            multi_vector=Configure.VectorIndex.MultiVector.multi_vector()
        )
    )]
)
client.close()
```

```python
# Load data into weaviate.
import numpy as np
client = weaviate.connect_to_local()
pages = client.collections.get("Pages")

# Map of page ids to images to support displaying the image corresponding to a 
# particular page id.
page_images = {}

with pages.batch.dynamic() as batch:
    for i in range(len(page_data)):
        p = page_data[i]
        page_images[p["page_id"]] = p["page_image"]

        batch.add_object(
            properties={
                "page_id": p["page_id"],
                "paper_title": p["paper_title"], 
                "paper_arxiv_id": p["paper_arxiv_id"], 
                "page_number": p["page_number"]
                }, vector={"colqwen": p["colqwen_embedding"]})
        
        if i % 25 == 0:
            print(f"Added {i+1}/{len(page_data)} Page objects to Weaviate.") 

client.close()
```

```python
# Example of retrieving relevant PDF pages to answer a query.
import weaviate
from weaviate.classes.query import MetadataQuery

query_text = "How does DeepSeek-V2 compare against the LLaMA family of LLMs?"

query_embedding = colqwen.multi_vectorize_text(query_text).cpu().float().numpy()

with weaviate.connect_to_local() as client:
    pages = client.collections.get("Pages")
    response = pages.query.near_vector(
        near_vector=query_embedding,
        target_vector="colqwen",
        limit=10,
        return_metadata=MetadataQuery(distance=True),
    )
    for i, o in enumerate(response.objects):
        print(
            f"{i+1}) MaxSim: {-o.metadata.distance:.2f}, "
            + f"Title: \"{o.properties['paper_title']}\" "
            + f"(arXiv: {o.properties['paper_arxiv_id']}), "
            + f"Page: {int(o.properties['page_number'])}"
        )
```

```python
# Setting up Qwen2.5-VL-3B-Instruct for generating answers from a query string 
# plus a collection of (images of) PDF pages.
# Note: I had to install the transformers package using the command
# pip install git+https://github.com/huggingface/transformers accelerate
# in order to get this bleeding-edge model to work.
import torch
from transformers import Qwen2_5_VLForConditionalGeneration, AutoTokenizer, AutoProcessor
from qwen_vl_utils import process_vision_info
import base64
from io import BytesIO

class QwenVL:
    def __init__(self):
        # Adjust the settings to your available architecture, see the link
        # https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct for examples.
        self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            "Qwen/Qwen2.5-VL-3B-Instruct",
            torch_dtype=torch.bfloat16,
            device_map="mps",
            attn_implementation="eager"
        )

        min_pixels = 256*28*28
        max_pixels = 1280*28*28
        self.processor = AutoProcessor.from_pretrained(
            "Qwen/Qwen2.5-VL-3B-Instruct", min_pixels=min_pixels, max_pixels=max_pixels)

    def query_images(self, query, images):
        """Generate a textual response to the query (text) based on the information in the supplied list of PIL images."""
        # Preparation for inference.
        # Convert the images to base64 strings.
        content = []
        for img in images:
            buffer = BytesIO()
            img.save(buffer, format="jpeg")
            img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
            content.append({"type": "image", "image": f"data:image;base64,{img_base64}"})

        content.append({"type": "text", "text": query})
        messages = [{"role": "user", "content": content}]

        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
        )
        inputs = inputs.to("mps")

        # Inference: Generation of the output.
        generated_ids = self.model.generate(**inputs, max_new_tokens=128)
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        return self.processor.batch_decode(
            generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )[0]

# Instantiate the model to be used below.
qwenvl = QwenVL()
```

"# RAG examples

下で実際に試してみてください。

### クエリ 1: DeepSeek-V2 は既存の最先端 LLM をどのようにして上回ったのですか？

クエリ「DeepSeek-V2 は既存の最先端 LLM をどのようにして上回ったのですか？」に対する関連度順の最も関連性が高いドキュメント:

1) MaxSim: 30.03, Title: "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" (arXiv: 2405.04434), Page: 4  
2) MaxSim: 29.13, Title: "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" (arXiv: 2405.04434), Page: 1  
3) MaxSim: 27.68, Title: "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" (arXiv: 2405.04434), Page: 5  

これらのドキュメントを基に Qwen2.5-VL-3B-Instruct から得られた回答:
```
DeepSeek-V2 achieved this by optimizing the attention modules and Feed-Forward 
Networks (FFNs) within the Transformer framework, introducing Multi-head 
Latent Attention (MLA) and DeepSeekMoE architectures, and employing expert 
segmentation and shared expert isolation for higher potential in expert 
specialization. Additionally, it demonstrated strong performance with only 21B
activated parameters, saving 42.5% of training costs, reducing the KV cache by 
93.3%, and boosting the maximum generation throughput to 5.76 times
```

### Query 2: 論文 "Adding Conditional Control to Text-to-Image Diffusion Models" の表紙に掲載された図を説明してください

問い合わせ「論文 "Adding Conditional Control to Text-to-Image Diffusion Models" の表紙にある図を説明してください」に対して、関連度順に最も関連性の高いドキュメントは以下のとおりです。

1) MaxSim: 31.99, タイトル: "Adding Conditional Control to Text-to-Image Diffusion Models" (arXiv: 2302.05543), ページ: 1  
2) MaxSim: 25.26, タイトル: "Stable Video Diffusion: Scaling Latent Video Diffusion Models to Large Datasets" (arXiv: 2311.15127), ページ: 1  
3) MaxSim: 24.71, タイトル: "SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis" (arXiv: 2307.01952), ページ: 8  

これらのドキュメントに基づく Qwen2.5-VL-3B-Instruct からの回答:  
```
The figure on the front page of the paper "Adding Conditional Control to 
Text-to-Image Diffusion Models" is titled "Figure 1: Controlling Stable 
Diffusion with learned conditions." It illustrates how users can control the 
image generation of large pretrained diffusion models using learned 
conditions, such as Canny edges, human pose, and other attributes.

Here's a detailed description of the figure:

### Figure 1: Controlling Stable Diffusion with learned conditions

#### Top Row:
1. **Input Canny edge**: A black-and-white sketch of a deer.
2. **Default**: The default output without any additional conditions.
3.
```

### Query 3: 検索拡張生成を実行する際に retrieval ステップが必要なのはなぜですか？

問い合わせ「検索拡張生成を実行する際に retrieval ステップが必要なのはなぜですか？」に対して、関連度順に最も関連性の高いドキュメントは以下のとおりです。

1) MaxSim: 24.53, タイトル: "Retrieval-Augmented Generation for Large Language Models: A Survey" (arXiv: 2312.10997), ページ: 2  
2) MaxSim: 23.41, タイトル: "Retrieval-Augmented Generation for Large Language Models: A Survey" (arXiv: 2312.10997), ページ: 1  
3) MaxSim: 21.06, タイトル: "Retrieval-Augmented Generation for Large Language Models: A Survey" (arXiv: 2312.10997), ページ: 4  

これらのドキュメントに基づく Qwen2.5-VL-3B-Instruct からの回答:

```
The retrieval step is necessary in Retrieval-Augmented Generation (RAG) because 
it allows the model to access and utilize external knowledge from databases or 
other sources. This external knowledge can provide context, enhance the accuracy 
of the generated response, and help the model understand the user's query 
better. By incorporating this external knowledge, RAG can improve its 
performance on tasks that require domain-specific knowledge or require 
continuous updates based on new information.
```

```python
import weaviate
from weaviate.classes.query import MetadataQuery

# Some example queries. Answering a query takes about a minute on an M4 Macbook.

# query_text = "How did DeepSeek-V2 manage to outperform existing state of the art LLMs?"
# query_text = "Describe the figure on the front page of the paper \"Adding Conditional Control to Text-to-Image Diffusion Models\""

query_text = "Why do we need the retrieval step when performing retrieval augmented generation?"
query_embedding = colqwen.multi_vectorize_text(query_text).cpu().float().numpy()

with weaviate.connect_to_local() as client:
    pages = client.collections.get("Pages")
    response = pages.query.near_vector(
        near_vector=query_embedding, 
        target_vector="colqwen",
        limit=3,
        return_metadata=MetadataQuery(distance=True)
    )
    print(f"The most relevant documents for the query \"{query_text}\" by order of relevance:\n")
    result_images = [] 
    for i, o in enumerate(response.objects):
        p = o.properties
        print(
            f"{i+1}) MaxSim: {-o.metadata.distance:.2f}, "
            + f"Title: \"{p['paper_title']}\" "
            + f"(arXiv: {p['paper_arxiv_id']}), "
            + f"Page: {int(p['page_number'])}"
        )
        result_images.append(page_images[p["page_id"]])
    
print(f"\nThe answer from Qwen2.5-VL-3B-Instruct based on these documents:\n{qwenvl.query_images(query_text, result_images)}")
```

