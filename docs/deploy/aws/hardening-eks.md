---
title: Hardening your EKS Deployment
description: Harden your self-hosted Weaviate deployment on Amazon EKS.
---

Let's talk security.

You've got a Weaviate deployment running on EKS, awesome! At this point, you're either thinking "Is this thing actually secure?" or  your security team is asking some *pointed* questions about authentication, encryption, and network policies. Don't worry, we've all been there.

While Weaviate is a powerful vector database, like any self-hosted service, it does need love and attention to secure it properly. Your first deployment is focused on getting things up and running, not on being a fortress. For development and testing, that is *okay*. For production? We'll need to tighten things up, my friend.

Let's walk through all of the practical steps to make your deployment solid. This is a security checklist made by a friend who's already stepped on landmines, so you don't have to.

## Authentication and authorization

You've got to control who can access Weaviate *and* what actions they are allowed to perform.

### What you need to do

#### Disable anonymous access

#### Enable API Key authentication

#### Enable OIDC authentication

#### Configure authorization

#### Rotate API keys regularly

## Network security

Network traffic needs to be protected with encryption, isolation, and access controls.

## K8s security

### What you need to do

#### Apply pod security standards

#### Configure non-root container

#### Set resource requests and limits

#### Create minimal RBAC ServiceAccount

#### Configure pod disruption budget

#### Use dedicated node groups

#### Enable node auto-patching

## IAM and AWS Permissions

*Pro tip: User IRSA (IAM roles for Service Accounts) to secure AWS access without using static credentials.

### What you need to do

#### Enable OIDC provider on EKS

#### Create IAM role for Weaviate with IRSA

#### Add KMS permissions for encryption

#### Restrict IAM policies to specific resources

#### Enable CloudTrail for IAM auditing

#### Set up alerts for unauthorized API calls

## Data Protection

Through encryption and backups you should protect data confidentiality and availability. 

### What you need to do

#### Enable EBS volume encryption

#### Configure S3 Backups with encryption

#### Set up automated daily backups

#### Configure S3 lifecycle policies

#### Test backup restore procedure

#### Enable cross-region replication

## Monitoring and logging 