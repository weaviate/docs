---
title: Weaviate Resource Sizing Calculator
---

## Overview

The Weaviate Resource Sizing tool is a **community-created** calculator designed to help estimate memory, CPU, and storage requirements for your Weaviate deployments. The guidance is based on official Weaviate documentation and benchmarks to assist with capacity and resource planning and allocation. 

[Resource Sizing Calculator](https://weaviate-memory-cpu-calculator.streamlit.app/)


## :rotating_light: Important disclaimers

:::warning Community tool

This sizing tool is **community-created and maintained** and based on Weaviate's official documentation. This should be used as a **guidance tool only.**

- This tool is subject to change and may not reflect the latest Weaviate features or optimizations. 
- Calculations may vary from actual production requirements. 
- For capacity planning, the results should be used as a starting point. 
- Additional configuration may be required based on your specific use case. 
:::

:::tip Best practice
Before deploying to your production environment, validate these estimates against your actual workloads and perform thorough testing. 
:::

### Features

#### Calculations

- Memory formula with 2x garbage collection overhead
- HNSW calculation
- CPU formula
- All compression methods supported 

#### Comprehensive resource planning

- Memory requirements with and without compression
- CPU calculations based on target QPS and latency
- Disk storage estimates
- Deployment recommendations

#### Compression methods

- Product quantization (PQ): 85% memory reduction for the **best balance**
- Binary quantization (BQ): 97% memory reduction for **maximum savings**
- Scalar quantization (SQ): 75% memory reduction for **fast compression**
- Rotational quantization (RQ): 75% memory reduction with **no training required**

### Sizing tool demo


## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
