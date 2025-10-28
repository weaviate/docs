---
title: Hardening your EKS Deployment
description: Harden your self-hosted Weaviate deployment on Amazon EKS.
---

Let's talk security.

You've got a Weaviate deployment running on EKS, awesome! At this point, you're either thinking "Is this thing actually secure?" or  your security team is asking some *pointed* questions about authentication, encryption, and network policies. Don't worry, we've all been there.

While Weaviate is a powerful vector database, like any self-hosted service, it does need love and attention to secure it properly. Your first deployment is focused on getting things up and running, not on being a fortress. For development and testing, that is *okay*. For production? We'll need to tighten things up, my friend.

Let's walk through all of the practical steps to make your deployment solid. This won't show you *exactly* how to implement and configure things, but it'll make sure that you don't miss the important stuff. This is a security checklist made by a friend who's already stepped on landmines, so you don't have to.

### Authentication and authorization

You've got to control who can access Weaviate *and* what actions they are allowed to perform.

#### Disable anonymous access

Although convenient for testing, anonymous access in production is like leaving your front door open wide with a sign saying "Free stuff inside!".

[Kubernetes anonymous access](../configuration/authentication#anonymous-access-kubernetes)

#### Enable API Key authentication

Enable proper API key authentication by using strong, random keys (32+ characters), storing them in K8s secrets and rotating them regularly. Be sure to map each key to a specific user or service so you know who's doing what. 

[API Key Authentication for Kubernetes](../configuration/authentication#api-keys-kubernetes)

#### Enable OIDC authentication

If you're using an enterprise identify provider (Okta, Azure AD, etc.), you should definitely integrate with that. Your security team will love you for it, and users get the benefit of single sign-on. 

[OIDC Integration](../configuration/authentication.md#oidc-kubernetes)

#### Configure authorization

For authorization, you've got two options:

- [RBAC](../configuration/authorization.md#role-based-access-control-rbac)
  - If you are on v1.29+ and need granular control, this will be the best option. It allows you to create custom roles and control access at the collection level. This is perfect for teams with different responsibilities. 
- [Admin Lists](../configuration/authorization.md#admin-list-kubernetes)
  - This is simpler and less complex. You get `admin` users who can do everything, and `read-only` users who can only query. If you're a small team or have a very simple setup, this can work for you. 

:::tip Pro tip: 
Use IRSA (IAM roles for Service Accounts) to secure AWS access without using static credentials.
:::

#### Create IAM roles for Weaviate with IRSA

Instead of using static AWS credentials, use IRSA. This will allow your pods to access AWS services securely using temporary credentials. 

#### Enable CloudTrail for IAM auditing

Make sure CloudTrail is enabled and logging all API calls. Set up alerts for suspicious activity, like repeated access denied errors. 

### Network security

:::tip AWS Network Security Best Practices
Take a peek at the [AWS network security best practices](net-security-bp.md) for more tips.
:::

#### Encrypt everything with TLS

Get your TLS set up properly, no excuses! You can use cert-manager for automatic certificate management and make sure HTTP redirects to HTTPS. Your data should **never travel in plaintext.**

#### Keep it private

Be sure to deploy your worker nodes in private subnets only. Use NAT gateways for outbound internet access, and set up VPC endpoints for AWS services. The goal is to never expose Weaviate directly to the internet.

#### Lock down network access

Implement network policies to control pod-to-pod communication. Start with a default-deny policy and then explicitly allow only the traffic that you need. Your security groups should also follow the principle of least privilege. 


### Kubernetes security

#### Apply pod security standards

Enable the "restricted" pod security standard on your Weaviate namespace. This will prevent dangerous configurations like running as root, privileged containers, and host namespace access. 

#### Configure non-root container

Configure your containers to run as non-root users. Drop unnecessary capabilities, prevent privilege escalation, and enable `readd-only` filesystems where possible. 

#### Set resource requests and limits

Prevent resource starvation by setting resource requests and limits.

#### Use dedicated service accounts

Create a dedicated service account for Weaviate with minimal RBAC permissions. 

:::info Service Accounts
Don't use the default service account, and **definitely** do not give it `cluster-admin` rights. 
:::

#### Use dedicated node groups

If budget permits, use dedicated node groups for your Weaviate workloads. This will give you better resource isolation and predictable performance. 



### Data Protection

Through encryption and backups you should protect data confidentiality and availability. 

#### Enable EBS volume encryption

Use encrypted EBS volumes with customer-managed KMS keys. Enable key rotation and restrict 

#### Configure S3 Backups with encryption

Configure automated backups to S3 with server-side encryption. Be sure to enable versioning, set up lifecycle policies to manage costs, and block all public access.

[S3 backup module](../configuration/backups#s3-aws-or-s3-compatible)

#### Test backup restore procedure

:::warning 
We can't stress this enough...test your backup and restore procedures regularly! A backup you can't restore is just expensive storage. Document your RTO and RPO so everyone knows what to expect.

:::


### Monitoring and logging 

#### Enable metrics collection

[Turn on Prometheus metrics](../configuration/monitoring) and set up proper monitoring. You need visibility into what's happening in your system. 

#### Configure critical alerts

Set up alerts for the stuff that matters: pods going down, high error rates, resource exhaustion, and backup failures. But don't go overboard, alert fatigue is a real thing!

#### Use proper dashboards

[Import or create Grafana dashboards to visualize your metrics.](../configuration/monitoring.md#sample-dashboards) You'll want to track things like memory usage, query latency, error rates, and disk usage.

#### Enable audit logging

Turn on EKS control plane logging, especially the audit logs. Your security team will probably want these for compliance purposes, and you'll want them when something goes wrong.


### Additional resources and information

- [Authentication](../configuration/authentication.md)
- [Authorization](../configuration/authorization.md)
- [OIDC Configuration](../configuration/oidc.md)
- [RBAC](../configuration/configuring-rbac.md)
- [Backups](../configuration/backups.md)
- [Monitoring](../configuration/monitoring.md)
- [AWS network security best practices](../aws/net-security-bp.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
