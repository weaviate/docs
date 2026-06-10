---
title: "AWS: Hardening your EKS deployment"
sidebar_label: Hardening EKS deployments
description: Harden your self-hosted Weaviate deployment on Amazon EKS.
---

You've got a Weaviate deployment running on EKS—awesome! Now it's time to make it production-ready and secure.

While Weaviate is a powerful vector database, like any self-hosted service, it needs proper security hardening. Your first deployment focused on getting things running; for production, we need to tighten things up.

This guide walks through practical steps to secure your deployment. 

:::tip Quick Security Checklist
Before going to production, ensure you've covered:

- ✅ Authentication enabled (API keys or OIDC)
- ✅ Anonymous access disabled
- ✅ TLS/HTTPS configured
- ✅ Network policies implemented
- ✅ Encrypted storage (EBS + S3)
- ✅ Backups tested and working
- ✅ Monitoring and alerts configured
  :::

---

## Authentication and authorization

Control who can access Weaviate and what actions they can perform.

### Disable anonymous access

Anonymous access is convenient for testing, but in production it's like leaving your front door wide open.

**Action:** Disable anonymous access immediately.

📚 [How to disable anonymous access](../../configuration/authentication.md#anonymous-access-kubernetes)

### Enable API Key authentication

Use strong authentication with properly managed credentials.

**Best practices:**

- Generate strong, random keys (32+ characters minimum)
- Store keys in Kubernetes secrets
- Rotate keys regularly
- Map each key to a specific user or service for accountability

📚 [API Key authentication setup](../../configuration/authentication.md#api-keys-kubernetes)

### Enable OIDC authentication

If you're using an enterprise identity provider (Okta, Azure AD, Auth0, etc.), integrate with it for single sign-on.

**Benefits:**

- Centralized user management
- Single sign-on experience

📚 [OIDC integration guide](../../configuration/authentication.md#oidc-kubernetes)

### Configure authorization

Choose the authorization model that fits your needs:

#### Option 1: RBAC

Best for teams needing granular access control.

**Features:**

- Custom role creation
- Collection-level access control
- Perfect for teams with different responsibilities

📚 [RBAC configuration](../../configuration/authorization.md#role-based-access-control-rbac)

#### Option 2: Admin lists

Simpler model for small teams or basic setups.

**Features:**

- `admin` users: full access
- `read-only` users: query access only

📚 [Admin list setup](../../configuration/authorization.md#admin-list-kubernetes)

### Secure AWS access with IRSA

Instead of static AWS credentials, use IAM Roles for Service Accounts (IRSA) for temporary, secure credentials.

**Benefits:**

- No static credentials to manage
- Automatic credential rotation
- Fine-grained IAM permissions

:::tip Pro Tip

Use IRSA (IAM Roles for Service Accounts) to secure AWS access without static credentials.

:::

### Enable CloudTrail auditing

Set up CloudTrail to log all IAM API calls and configure alerts for suspicious activity (repeated access denied errors, unusual access patterns).

---

## Network security

:::info AWS Best Practices
See [AWS network security best practices](./network-security.md) for detailed recommendations.
:::

### Encrypt all traffic with TLS

This is a must-have, configure TLS properly.

**Requirements:**

- Use cert-manager for automatic certificate management
- Configure HTTP-to-HTTPS redirects
- Ensure data never travels in plaintext

**Rule:** Your data should **never** travel unencrypted.

### Keep infrastructure private

Deploy all worker nodes in private subnets only.

**Architecture:**

- Worker nodes: private subnets only
- Outbound internet: NAT gateways
- AWS services: VPC endpoints
- **Never** expose Weaviate directly to the internet

### Implement network policies

Lock down pod-to-pod communication with Kubernetes network policies.

**Approach:**

1. Start with default-deny policy
2. Explicitly allow only required traffic
3. Apply principle of least privilege to security groups

---

## Kubernetes security

### Apply pod security standards

Enable the "restricted" pod security standard on your Weaviate namespace.

**Prevents:**

- Running as root
- Privileged containers
- Host namespace access
- Other dangerous configurations

### Configure non-root containers

Secure your container runtime.

**Configuration checklist:**

- ✅ Run as non-root user
- ✅ Drop unnecessary capabilities
- ✅ Prevent privilege escalation
- ✅ Enable read-only filesystems where possible

### Set resource requests and limits

Prevent resource starvation and ensure predictable performance by setting CPU and memory requests/limits.

### Use dedicated service accounts

Create a dedicated service account for Weaviate with minimal RBAC permissions.

:::warning Service Account Security

- Don't use the default service account
- **Never** grant `cluster-admin` rights
  :::

### Use dedicated node groups

If budget permits, use dedicated node groups for Weaviate workloads.

**Benefits:**

- Better resource isolation
- Predictable performance
- Easier capacity planning

---

## Data protection

Protect data confidentiality and availability through encryption and backups.

### Enable EBS volume encryption

**Configuration:**

- Use encrypted EBS volumes
- Use customer-managed KMS keys
- Enable automatic key rotation
- Restrict key access with IAM policies

### Configure S3 Backups with encryption

Set up automated, encrypted backups to S3.

**Checklist:**

- ✅ Enable server-side encryption
- ✅ Enable bucket versioning
- ✅ Set up lifecycle policies for cost management
- ✅ Block all public access

📚 [S3 backup configuration](../../configuration/backups.md#s3-aws-or-s3-compatible)

### Test backup and restore procedures

:::danger Critical
Test your backup and restore procedures regularly!

A backup you can't restore is just expensive storage. Document your RTO (Recovery Time Objective) and RPO (Recovery Point Objective) so everyone knows what to expect.
:::

---

## Monitoring and logging

### Enable metrics collection

Turn on Prometheus metrics for system visibility.

📚 [Monitoring setup guide](../../configuration/monitoring.md)

### Configure critical alerts

Set up alerts for issues that matter:

- 🚨 Pods going down
- 🚨 High error rates
- 🚨 Resource exhaustion
- 🚨 Backup failures

:::tip Alert Fatigue
Don't go overboard—alert fatigue is real. Focus on actionable, critical alerts.
:::

### Use proper dashboards

Import or create Grafana dashboards to visualize key metrics.

**Track:**

- Memory usage
- Query latency
- Error rates
- Disk usage

📚 [Sample dashboards](../../configuration/monitoring.md#sample-dashboards)

### Enable audit logging

Turn on EKS control plane logging, especially audit logs.

**Why:**

- Required for compliance
- Essential for incident investigation
- Security team requirements

---

## Additional resources

- [Authentication](../../configuration/authentication.md)
- [Authorization](../../configuration/authorization.md)
- [OIDC Configuration](../../configuration/oidc.md)
- [RBAC](../../configuration/configuring-rbac.md)
- [Backups](../../configuration/backups.md)
- [Monitoring](../../configuration/monitoring.md)
- [AWS network security - Best practices](../aws/network-security.md)

---

## Questions and Feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
