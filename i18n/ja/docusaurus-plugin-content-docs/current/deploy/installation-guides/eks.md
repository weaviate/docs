---
title: セルフマネージド EKS
description: AWS CLI を使用して EKS に Weaviate をデプロイする
---

Weaviate は、クラスターの作成と管理を行う `eksctl` コマンドライン ツールを使用して EKS クラスターにデプロイできます。  
本ドキュメントを読み終える頃には、コマンドラインから EKS クラスターを作成し、永続ストレージを追加し、そのクラスター上に Weaviate をデプロイするために必要な情報がすべて得られます。

:::info Prerequisites

- Helm がインストールされていること
- 最新版の AWS CLI がインストールされていること
- `kubectl` がインストールされていること
- `eksctl` がインストールされていること
:::

<details>
<summary> AWS policies needed </summary>

EKS クラスターを作成し操作するための十分な権限を持っていることを確認してください。  
以下のポリシーがあれば、クラスターを作成するための権限が適切に付与されます。 

- eks:CreateCluster
- eks:DescribeCluster
- eks:ListClusters
- eks:UpdateClusterConfig
- eks:DeleteCluster
- iam:CreateRole
- iam:AttachRolePolicy
- iam:PutRolePolicy
- iam:GetRole
- iam:ListRolePolicies
- iam:ListAttachedRolePolicies
- ec2:DescribeSubnets
- ec2:DescribeVpcs
- ec2:DescribeSecurityGroups
- ec2:CreateSecurityGroup
- ec2:AuthorizeSecurityGroupIngress
- ec2:RevokeSecurityGroupIngress
- cloudformation:CreateStack
- cloudformation:DescribeStacks
- cloudformation:UpdateStack
- cloudformation:DeleteStack
- ec2:CreateTags
- ec2:DescribeInstances
- ec2:DescribeNetworkInterfaces
- ec2:DescribeAvailabilityZones

</details>

<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe 
    id="zklzyv5bop" 
    src="https://app.guideflow.com/embed/zklzyv5bop" 
    width="100%" 
    height="100%" 
    style={{overflow: "hidden", position: "absolute", border: "none"}} 
    scrolling="no" 
    allow="clipboard-read; clipboard-write" 
    webKitAllowFullScreen 
    mozAllowFullScreen 
    allowFullScreen 
    allowTransparency="true"
  />
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="zklzyv5bop"></script>
</div>

#### ツールの確認

開始する前に、以下のツールがインストールされていることを確認してください:

```bash
helm version
aws --version
kubectl version
eksctl version
```



### ステップ 1: クラスター作成

クラスターを作成するには、任意の名前 (例: `eks-cluster.yaml`) で `yaml` ファイルを用意します。

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: <your-cluster-name>
  region: <your-region>
  version: "1.31"
  
managedNodeGroups:
  - name: node-group-name
    labels: { role: worker }
    instanceType: t3.large     # Choose your instance type
    desiredCapacity: 3         # Number of nodes
    minSize: 2                 # Minimum number of nodes for autoscaling
    maxSize: 5                 # Maximum number of nodes for autoscaling
    privateNetworking: true    # Use private networking
    volumeSize: 80             # Root volume size in GB
    volumeType: gp3            # Root volume type

addons:
  - name: vpc-cni
    version: latest
    attachPolicyARNs:
      - arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy
  - name: coredns
    version: latest
  - name: kube-proxy
    version: latest
  - name: aws-ebs-csi-driver
    version: latest
    wellKnownPolicies:
      ebsCSIController: true   # Enable EBS CSI driver
```

これにより、指定したリージョンにオートスケーリング ノードグループを持つ EKS クラスターが作成されます。  
高可用性のために 3 つのノードが用意されており、オートスケーリングを有効にすることで、需要に応じてリソースを動的に調整できます。

#### 次のコマンドを実行して EKS クラスターを作成します:

```bash
eksctl create cluster -f <your-file-name.yaml>
```

#### 新しく作成したクラスターとやり取りできるよう `kubectl` を有効化します:

```bash
aws eks --region <your-region> update-kubeconfig --name <your-cluster-name>
```

#### クラスターが作成され、操作できることを確認します:

```bash
kubectl get nodes
```



### ステップ 2: ストレージクラスの追加

クラスターを作成し操作可能であることを確認した後、`storageclass.yaml` ファイルを作成します:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: <your-storageclass-name>
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
reclaimPolicy: Retain
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

ストレージクラスを作成したら、適用します:  
```bash
kubectl apply -f <your-storageclass-name>.yaml
```


#### ストレージクラスが作成され適用されていることを確認します

```bash
kubectl get sc
```



### ステップ 3: EKS へ Weaviate を追加

クラスターに永続ストレージを追加したら、Weaviate をデプロイできます。  

#### Weaviate 用の namespace を作成します:

```bash
kubectl create namespace weaviate
```

#### Weaviate Helm チャートを追加します:

```bash
helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm repo update
```

Weaviate Helm チャートを追加したら、クラスターへデプロイする前に `values.yaml` ファイルを設定してください。

```bash
helm show values weaviate/weaviate > values.yaml
```

Weaviate をデプロイする前に、`storgeclass` を変更し、`values.yaml` ファイルで Replica 数が指定されていることを確認します。

```yaml
storage:
  size: 32Gi
  storageClassName: "<your-storage-class-name>"
```

```yaml
replicas: 3
```

#### クラスターへの Weaviate のデプロイ:

```bash
helm upgrade --install weaviate weaviate/weaviate \
  --namespace weaviate \
  --values values.yaml \
```

#### デプロイの確認

```bash
kubectl get pods -n weaviate
```


## 追加リソース

- [Kubernetes の永続ストレージ](https://aws.amazon.com/blogs/storage/persistent-storage-for-kubernetes/)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

