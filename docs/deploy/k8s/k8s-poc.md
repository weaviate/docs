# Building with Weaviate: Getting to Production

## Introduction

You are a developer who has already deployed Weaviate on a test cluster and want to take things a step further by deploying and testing Weaviate on a self-managed K8s (Kubernetes) cluster. This guide shows how to validate Weaviate’s capabilities in your enterprise environment.  

At the end of this guide, expect to have:

- A configured Helm-based deployment and networking setup
- Basic scaling, persistent storage, and resource management
- TLS, RBAC, and security best practices implements
- Monitoring, logging, and backup strategies enabled

## Prerequisites

Before beginning, ensure that you have the following:

### Technical Knowledge

- Basic Kubernetes and containerization conceptual knowledge
- Basic experience with Helm and `kubectl`

:::note

Check out the Academy course  [“Run Weaviate on Kubernetes”](https://weaviate.io/developers/academy/deployment/k8s) if you need assistance. 

:::

### Required Tools

- A running Kubernetes cluster with Weaviate installed
- `kubectl` installed
- Helm installed

### Step 1: Configure your Helm Chart

- Use the official [Weaviate Helm chart](https://github.com/weaviate/weaviate-helm) for your installation.
- Customize the values to fit your enterprise requirements (e.g., resource allocation, storage settings).
- Deploy the chart and verify pod health.

### Step 2: Network Security

- Configure an ingress controller to securely expose Weaviate.
- Enable TLS with a certificate manager and enforce TLS encryption for all client-server communication.
- Assign a domain name for external access.
- Implement RBAC to restrict user access:

```yaml
authorization:
  rbac:
    enabled: true
    # root_users:
    # - admin_user1
    # - admin_user2
```

[Configuring RBAC](/docs/weaviate/configuration/rbac/configuration.md)

- **Optional**: Implement admin lists (if not using RBAC):

```yaml
  admin_list:
    enabled: true
    # users:
    # - admin_user1
    # - admin_user2
    # - api-key-user-admin
    # read_only_users:
    # - readonly_user1
    # - readonly_user2
    # - api-key-user-readOnly
```
:::tip
Using an admin list will allow you to define your admin or read-only user/API-key pairs across all Weaviate resources. Whereas RBAC allows you more granular permissions by defining roles and assigning them to users either via API keys or OIDC.
:::

[Admin List Configuration](/docs/weaviate/configuration/authorization.md#admin-list-kubernetes)
### Step 3: Scaling

- Implement horizontal scaling to ensure high availability:

```yaml
replicaCount: 3
```

- Define CPU/memory limits and requests to optimize pod efficiency:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "1Gi"
  limits:
    cpu: "2"
    memory: "4Gi"
```

### Step 4: Monitoring and Logging

- Use Prometheus and Grafana to collect and analyze performance metrics:

```yaml
serviceMonitor:
  enabled: true
  interval: 30s
  scrapeTimeout: 10s
```

- Implement alerting for issue resolution.

### Step 5: Upgrades and Backups

- Use the rolling update strategy used by Helm to minimize downtime:

```yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

- Test new Weaviate versions before deploying into production.
- Implement disaster recovery procedures to ensure that data is restored quickly.

### Conclusion

Voila! You now have a deployment that is *somewhat* ready for production. Your next step will be to complete the self-assessment and identify any gaps. 

### Next Steps: [Production Readiness Self-Assessment](./production-readiness.md)