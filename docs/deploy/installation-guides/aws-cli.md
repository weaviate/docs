---
title: AWS EKS Installation
description: Deploy Weaviate on EKS using the AWS CLI
---

Weaviate can be deployed on an EKS cluster using the `eksctl` command-line tool that creates and manages clusters. By the end of this document, you'll have all the necessary information to create an EKS cluster using the command line, add persistent storage to your cluster and then deploy Weaviate onto the cluster. 

:::info Prerequisites

- Helm installed
- The AWS CLI installed with the latest version
- `kubectl` installed
- `eksctl` installed
:::

#### Verify your tools

Before starting, ensure that your tools are installed:

```bash
helm version
aws --version
kubectl version
eksctl version
```

### Step 1: Create the Cluster

```bash
eksctl create cluster --name <your-cluster-name-here> --region <your-region-here> --nodegroup-name <nodegroup-name-here> --nodes 3 --nodes-min 2 --nodes-max 4 --node-type t3.medium
```

This creates an EKS cluster within your specified region with an autoscaling node group. There are 3 nodes for high availability and having autoscaling enabled allows for the cluster to dynamically adjust resources based on demand. 

#### Enable `kubectl` to interact with the newly created cluster:

```bash
aws eks --region <your-region> update-kubeconfig --name <your-cluster-name>
```

#### Verify that the node has been created and that you are able to interact with the cluster:

```bash
kubectl get nodes
```

### Step 2: Enable Persistent Storage on the Cluster

Peristent storage is required for running Weaviate on a Kubernetes cluster, it ensures that data is retained should a pod restart, a node crashes, or a cluster scales up or down. 

#### Add the EBS CSI Driver Add-On
```bash
eksctl create addon --name aws-ebs-csi-driver --cluster <your-cluster-name> --region <your-region> --service-account-role-arn <arn:aws:iam::<your-account-id>:role/AmazonEKS_EBS_CSI_DriverRole>
```

The above adds the EBS CSI Driver add-on for your cluster. After adding the add-on, a storage class and `PersistentValueClaim` is needed to enable persistent storage.

#### Add Storage Class

After adding the EBS CSI Driver add-on, you'll need to create a `storageclass.yaml` file:
```
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

After creating the storage class, apply it: ```kubectl apply -f <your-storageclass-name>.yaml```

#### Create a `PersistentValueClaim`

After creating and applying the Storage class, you'll need to also create a `PersistentValueClaim` file:

```apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <your-pvc-name>
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: <your-storageclass-name>
  resources:
    requests:
      storage: 10Gi
```
After creating the persistent value claim, you also need to apply it: 
```kubectl apply -f <your-pvc-name>.yaml```

#### Verify your storage class and PersistentValueClaim have both been applied

```
kubectl get sc
kubectl get pvc
```

### Step 3: Add Weaviate to EKS

After creating

#### Create a Weaviate namespace:

```bash
kubectl create namespace weaviate
```

#### Add the Weaviate Helm chart:

```bash
helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm repo update
```

After you've added the Weaviate Helm chart, configure the `values.yaml` file before you deploy Weaviate on the cluster. 


#### Deploy Weaviate on your cluster:

```bash
helm upgrade --install weaviate weaviate/weaviate \
  --namespace weaviate \
  --values values.yaml \
```

#### Verify your deployment

```bash
kubectl get pods
```


### Next Steps: [Connecting to Weaviate](docs/weaviate/connections/index.mdx)

### Further Resources

- [Persistent storage for Kubernetes](https://aws.amazon.com/blogs/storage/persistent-storage-for-kubernetes/)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
