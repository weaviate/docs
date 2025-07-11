---
title: Self-Managed EKS
description: Deploy Weaviate on EKS using the AWS CLI
---

Weaviate can be deployed on an EKS cluster using the `eksctl` command-line tool that creates and manages clusters. By the end of this document, you'll have all the necessary information to create an EKS cluster using the command line, add persistent storage to your cluster and then deploy Weaviate onto the cluster. 

:::info Prerequisites

- Helm installed
- The AWS CLI installed with the latest version
- `kubectl` installed
- `eksctl` installed
:::

<details>
<summary> AWS policies needed </summary>

Ensure that you have adequate permissions to create and interact wth an EKS cluster. The following policies should provide you the adequate permissions to create your cluster: 

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

#### Verify your tools

Before starting, ensure that your tools are installed:

```bash
helm version
aws --version
kubectl version
eksctl version
```



### Step 1: Create the Cluster

To create your cluster, prepare a `yaml` file that with a name of your choosing (e.g. `eks-cluster.yaml`)

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

This creates an EKS cluster within your specified region with an autoscaling node group. There are 3 nodes for high availability and having autoscaling enabled allows for the cluster to dynamically adjust resources based on demand.

#### Run this command to create your EKS cluster:

```bash
eksctl create cluster -f <your-file-name.yaml>
```

#### Enable `kubectl` to interact with the newly created cluster:

```bash
aws eks --region <your-region> update-kubeconfig --name <your-cluster-name>
```

#### Verify that the cluster has been created and that you are able to interact with it:

```bash
kubectl get nodes
```

### Step 2: Add Storage Class

After creating your cluster and verifying that you can interact with it , you'll need to create a `storageclass.yaml` file:
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

After creating the storage class, apply it: 
```bash
kubectl apply -f <your-storageclass-name>.yaml
```


#### Verify your storage class and has been created and applied

```bash
kubectl get sc
```

### Step 3: Add Weaviate to EKS

After adding persistent storage to your cluster, you can now deploy Weaviate into it.  

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

```bash
helm show values weaviate/weaviate > values.yaml
```

Before deploying Weaviate, change the `storgeclass` and ensure that you have replicas specified in your `values.yaml` file. 

```yaml
storage:
  size: 32Gi
  storageClassName: "<your-storage-class-name>"
```

```yaml
replicas: 3
```

#### Deploy Weaviate on your cluster:

```bash
helm upgrade --install weaviate weaviate/weaviate \
  --namespace weaviate \
  --values values.yaml \
```

#### Verify your deployment

```bash
kubectl get pods -n weaviate
```


## Further Resources

- [Persistent storage for Kubernetes](https://aws.amazon.com/blogs/storage/persistent-storage-for-kubernetes/)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
