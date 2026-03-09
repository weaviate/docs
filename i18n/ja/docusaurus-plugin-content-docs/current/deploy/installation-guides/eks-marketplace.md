---
title: マーケットプレイス - Kubernetes
description: AWS Marketplace を通じて EKS クラスターに Weaviate をインストールし、迅速にクラウドへデプロイします。
image: og/docs/installation.jpg
# tags: ['installation', 'AWS Marketplace']
---

import ReactPlayer from 'react-player/lazy'

<!-- NOTE: To show this page on the sidebar, remove the `sidebar_class_name: hidden` line above. -->

[AWS Marketplace](https://aws.amazon.com/marketplace) を利用して、直接 Weaviate クラスターを起動できます。

デリバリーには [AWS CloudFormation テンプレート](https://aws.amazon.com/cloudformation/) を使用します。

:::info 前提条件

- 十分なクレジット／支払い方法を設定した AWS アカウント  
- （推奨）AWS と AWS コンソールの利用経験

:::

<details>
  <summary>
    どのリソースが作成・インストールされるのか？
  </summary>

以下のリソースがセットアップされます。

- 単一ノードグループを持つ EKS クラスター  
  - デフォルト VPC、または CIDR 10.0.0.0/16 の新規 VPC
- EKS 用 Load Balancer Controller  
- EKS 用 aws-ebs-csi-driver  
- 選択した最新版の Weaviate（例: `1.20` を選択した場合は `1.20.3`）  
  - 公式 Helm chart を使用してインストールされます

</details>

## インストール手順

### 動画

動画をご覧になりたい場合は、以下のウォークスルーをご参照ください。2023 年 9 月に収録されており、一部詳細が変更されている可能性があります。

<details>
  <summary>
    動画: AWS Marketplace で Weaviate を実行する方法
  </summary>

<ReactPlayer className="react-player" url='https://youtu.be/_2rBrKp83iM' controls='true' />
<br/>

</details>

### AWS Marketplace

1. Weaviate の [AWS Marketplace リスティング](https://aws.amazon.com/marketplace/pp/prodview-cicacyv63r43i) へアクセス  
1. ページの案内に従って AWS Marketplace で本製品を購読します。（2023 年 8 月現在の手順）  
   1. <kbd>Continue to Subscribe</kbd> をクリックして次のページへ  
   1. <kbd>Continue to Configuration</kbd> をクリックして次のページへ  
   1. 一覧から Fulfillment オプションとソフトウェアバージョンを選択し、<kbd>Continue to Launch</kbd> をクリック  
1. CloudFormation テンプレートを使用してソフトウェアを起動します（希望するアベイラビリティゾーン用のテンプレートを下表から選択）。

| Region | CloudFormation テンプレートリンク（アベイラビリティゾーン別） |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AP     | [ap-northeast-1](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [ap-northeast-2](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [ap-northeast-3](https://ap-northeast-3.console.aws.amazon.com/cloudformation/home?region=ap-northeast-3#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [ap-south-1](https://ap-south-1.console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [ap-southeast-1](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [ap-southeast-2](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home?region=ap-southeast-2#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json) |
| CA     | [ca-central-1](https://ca-central-1.console.aws.amazon.com/cloudformation/home?region=ca-central-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json) |
| EU     | [eu-central-1](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [eu-north-1](https://eu-north-1.console.aws.amazon.com/cloudformation/home?region=eu-north-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [eu-west-1](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [eu-west-2](https://eu-west-2.console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [eu-west-3](https://eu-west-3.console.aws.amazon.com/cloudformation/home?region=eu-west-3#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json) |
| SA     | [sa-east-1](https://sa-east-1.console.aws.amazon.com/cloudformation/home?region=sa-east-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json) |
| US     | [us-east-1](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [us-east-2](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [us-west-1](https://us-west-1.console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json); [us-west-2](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://weaviate-aws-marketplace.s3.amazonaws.com/cdk-assets/latest/WeaviateEKS.template.json) |

### 設定とクラスター作成

:::info 開始前の注意点

#### 起動後に変更できない設定があります

起動後に変更できない設定もあります。例として以下は現在変更できません。

- weaviatePVCSize  
- albDriver  
- ebsDriver  
- vpcUseDefault  

#### 変更によりクラスターが再作成される設定があります

- インスタンスタイプを変更すると、ノードプールが再作成されます。

#### 推奨設定

- 既定値は大半のケースで適切です。  
- `weaviatePVCSize`: 本番環境では StatefulSet ポッドあたり少なくとも 500GB を推奨します（開発環境ではより小さいディスクでも可）。  
- `weaviateAuthType`: Weaviate を匿名アクセスで実行しないことを推奨します。`apikey` を設定し、例えば `pwgen -A -s 32` で生成したランダム文字列をキーとして設定してください。

:::

CloudFormation テンプレートを開くと、以下のようなオプションが表示されます。

ここで以下を設定できます。

1. AWS でスタックを識別するための `stack name`（必須）  
1. Weaviate／AWS の各種パラメーター  
   - ノード数  
   - インスタンスタイプ  
   - Weaviate 認証パラメーター  
1. 必要なリソースを確認し、<kbd>Create stack</kbd> へ進む  
   - このテンプレートでは追加のリソースと権限が必要になる場合があります  

<kbd>Create stack</kbd> をクリックすると、作成にはおよそ 30 分程度かかる場合があります。

`Events` タブで個々のリソースの状態を確認できます。スタックの作成が完了すると、ステータスは `✅ CREATE_COMPLETE` に変わります。

## クラスターへのアクセス

スタック作成後、[`kubectl`](https://kubernetes.io/docs/tasks/tools/) を使ってクラスターに、ロードバランサーを使って Weaviate にアクセスできます。

### `kubectl` を使った操作

以下のコマンドを実行すると、Weaviate クラスター用の kubeconfig ファイルを更新または作成できます。

```
aws eks update-kubeconfig --name [cluster-name] --region [aws-region]--role-arn arn:aws:iam::[AccountID]:role/[StackName]-MastersRole[XX]
```

:::tip kubectl コマンドの場所
正確なコマンドは CloudFormation スタックの `Outputs` タブにある `EKSClusterConfigCommand` 出力で確認できます。
:::

設定が完了したら、通常どおり `kubectl` コマンドを実行できます。例:

- `kubectl get pods -n weaviate` — `weaviate` ネームスペース内のポッド一覧  
- `kubectl get svc --all-namespaces` — すべてのネームスペースのサービス一覧  



### Weaviate URL の確認

スタックが作成されたら、ロードバランサーの URL から Weaviate にアクセスできます。

Weaviate のエンドポイント URL は次の方法で確認できます。

- AWS の `Services` セクションで `EC2` > `Load Balancers` に移動し、対象のロードバランサーの `DNS name` 列を確認します。  
- `kubectl get svc -n weaviate` を実行し、`weaviate` サービスの `EXTERNAL-IP` を確認します。

ロードバランサーの URL（例: `a520f010285b8475eb4b86095cabf265-854109584.eu-north-1.elb.amazonaws.com`）が Weaviate の URL（例: `http://a520f010285b8475eb4b86095cabf265-854109584.eu-north-1.elb.amazonaws.com`）となります。

## クラスターの削除

CloudFormation スタックを削除すると、クラスターも削除されます。

 :::caution 
 この操作により Weaviate 内のデータが削除されます。データを保持したい場合は、クラスターを削除する前にバックアップやエクスポートを行ってください。
:::

### 一部のリソースは手動削除が必要な場合があります

:::caution
未使用リソースがすべて削除されたことを確認してください。削除されていないリソースには費用が発生し続けます。
:::

CloudFormation スタックを削除しても、自動的に削除されない AWS リソースが存在する場合があります。たとえば、EBS ボリュームや Key Management Service (KMS) キーが削除されないことがあります。

これらは手動で削除する必要があります。

#### ヒント

- CloudFormation スタックが "DELETE_FAILED" と表示された場合、該当リソースの削除を再実行できる場合があります。  
- CloudFormation スタックの `Resources` タブを確認し、削除されていないリソースを特定してください。  
- Key Management Service (KMS) キーは KMS コンソールから手動で削除できます。キーの削除をスケジュールする必要がある場合があります。  

## 課金

Weaviate および関連リソースの費用は AWS から直接請求されます。

たとえば、EC2 インスタンス、EBS ボリューム、その他クラスターで使用されるリソースが含まれます。

### その他のマーケットプレイス製品

- [Weaviate serverless cloud](https://aws.amazon.com/marketplace/pp/prodview-ng2dfhb4yjoic?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)
- [Weaviate enterprise cloud](https://aws.amazon.com/marketplace/pp/prodview-27nbweprm7hha?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)


## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

