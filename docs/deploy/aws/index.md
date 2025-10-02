---
title: Deploying Weaviate on AWS
sidebar_title:
sidebar_position: 0
---


This section provides comprehensive guidance for deploying and running Weaviate on Amazon Web Services (AWS). Whether you're setting up a development environment, deploying to production, or integrating with AWS services, you'll find AWS-specific installation guides, tutorials, how-tos, and reference materials tailored for the AWS ecosystem.


## What you'll find here:

- **Installation Guides:** Step-by-step instructions for deploying Weaviate using various AWS services.
- **Tutorials:** End-to-end walkthroughs for common AWS deployment scenarios.
- **How-to Guides:** Task-focused instructions for specific AWS configurations and integrations.
- **Reference Documentation:** AWS-specific configuration options, best practices, and troubleshooting guides.

## Deployment methods

Weaviate has multiple pathways to deploy on AWS, each suited to different use cases and operational needs:

### Marketplace offerings

#### [AWS marketplace - Serverless Cloud](../installation-guides/aws-marketplace.md)

Deploy Weaviate Serverless Cloud directly through the AWS Marketplace for quick cloud deployment with AWS billing integration. 

This SaaS solution is specifically built for AWS customers who need:

- AWS billing integration
- Regulatory requirements with specific regional deployments
- Quick setup without infrastructure management

#### [AWS marketplace - Kubernetes cluster](../installation-guides/eks-marketplace.md)

Deploys Weaviate on Amazon EKS through the AWS Marketplace using AWS CloudFormation templates. This sets up an EKS cluster with a single node group, load balancer controller, and EBS CSI driver via a CloudFormation template.

#### Resources Created:

- EKS Cluster with single node group
- Load Balancer Controller for EKS
- AWS EBS CSI driver for persistent storage
- Latest selected version of Weaviate via official Helm chart

**Best for**: Production environments, teams wanting managed Kubernetes without setup complexity, enterprise-grade deployments.

#### [AWS marketplace - EC2 instance](../installation-guides/ecs-marketplace.md)

Deploys a fully operational Weaviate instance on a single EC2 instance using Docker through the AWS Marketplace. This option also uses CloudFormation templates and is perfect for developers who want to prototype and test Weaviate quickly.

#### Specifications:

- Single EC2 instance (default: m7g.medium)
- Docker container deployment
- Monthly contract (billed immediately through AWS)
- Best for testing and development (no enterprise support included)

### Self-managed options

#### [Self-managed EKS](../installation-guides/eks.md)

Create and manage your own EKS cluster using the `eksctl` command-line tool, providing full control over cluster configuration, scaling, and management.

#### Features:

- Complete control over cluster configuration
- Custom autoscaling node groups
- Choice of instance types and storage classes
- Integration with AWS EBS CSI driver for persistent storage

**Best for:** Organizations with Kubernetes expertise, custom infrastructure requirements, maximum flexibility and control

### Deployment comparison

![deployment comparison matrix](./img/deployment-matrix.png)


Each deployment option offers different levels of management and control:

- **Serverless Cloud:** Fully managed SaaS with automatic scaling and zero infrastructure management.
- **Marketplace EKS:** Managed Kubernetes control plane with pre-configured infrastructure via CloudFormation.
- **Marketplace EC2:** Single-instance Docker deployment with monthly billing, ideal for development.
- **Self-Managed EKS:** Complete control over EKS cluster configuration and management.


## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
