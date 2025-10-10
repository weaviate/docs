---
title: Community Tools Homepage
sidebar_position: 1
---

This section contains community-created tools designed to help you ro plan, configure, and optimize your Weaviate deployment. These tools are based on Weaviate documentation and provides interactive calculators and configuration generators. 

:::warning Community-maintained tools

The tools listed in this section are **community-created and maintained.** They should be used as *guidance tools* only.

**Important considerations**

- These tools are based on Weaviate documentation but they may not reflect the latest Weaviate features. 
- The results of these tools are estimates and may vary from actual production requirements. 
- **ALWAYS** validate the outputs through testing in *your* environment. 
- Additional configuration and tuning may be required for your use case. 
:::


## Available Tools

### Resource Sizing Estimator

Estimate memory and CPU requirements for your Weaviate deployment

The Resource Sizing Estimator can help you plan infrastructure requirements by estimating memory, CPU, and basic storage needs based on your dataset characteristics and performance requirements.

#### Key features:

- Memory calculations including HNSW index overhead and garbage collection
- CPU recommendations based on target QPS and latency
- Compression savings analysis (PQ, BQ, SQ, RQ)
- Visual breakdowns of resource allocation
- Optimization suggestions

#### Best for:

- Initial capacity planning
- Understanding resource trade-offs
- Comparing compression strategies
- Pre-deployment sizing estimate

[Access it here](https://weaviate-memory-cpu-calculator.streamlit.app/)

[Estimator GitHub Repo](https://github.com/Shah91n/Weaviate-Memory-CPU-Calculator)

---

### Disk Storage Estimator

Calculate disk space requirements for your Weaviate instance. The Disk Storage Estimator provides comprehensive estimates for disk space requirements, including vector storage, metadata, inverted indices, and Write-Ahead Logs (WAL).

#### Key features:

- Detailed disk usage breakdowns.
- Storage requirements for vectors, objects, and indices
- Compression impact on disk usage
- Growth planning calculations
- File system overhead estimates

#### Best for:

- Storage capacity planning
- Understanding disk space allocation
- Planning for data growth
- Optimizing storage costs

[Access it here](https://weaviate-disk-calculator.streamlit.app/)

[Estimator GitHub Repo](https://github.com/Shah91n/Weaviate-Disk-Storage-Calculator/tree/main)

---



### EKS Cluster Configuration Generator

Generate a production-ready EKS cluster configuration for Weaviate. The EKS Configuration Generator creates properly formatted `eksctl` configurations and storage classes for Amazon EKS deployments, eliminating YAML syntax errors and configuration headaches. 

#### Key features:

- Complete cluster configurations with managed node groups
- Three pre-configured storage classes (gp3, gp3-high-performance, io1)
- EKS add-ons setup (VPC CNI, CoreDNS, Kube Proxy, EBS CSI Driver)
- IAM roles and policies properly configured

#### Best for:

- AWS EKS cluster setup
- Production-ready configurations
- Quick EKS deployments (15-20 minutes)
- Avoiding YAML configuration errors

:::info Coming Soon!

The EKS cluster configuration generator will be here soon! :sunglasses:

:::

---

## When and how to use these tools

These tools are valuable during the planning phase when you are designing your Weaviate architecture and choosing your deployment configurations. They'll help to establish baseline resource estimations, generate configuration files, identify potential bottlenecks, and plan for scaling and growth...before you even deploy to production. 

:::danger How NOT to use these tools
They tools do **not** replace load testing with production-like data, performance monitoring, iterative optimization based on real workloads, or the official Weaviate documentation and best practices. 

These are starting points to provide informed estimates to begin your journey. Always validate the outputs through testing in your environment. 

:::


## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
