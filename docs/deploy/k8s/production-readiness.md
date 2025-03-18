---
sidebar_label: Production Readiness Self-Assessment
---

# Kubernetes Production Readiness Self-Assessment

Think you’re ready for production? Ensuring that your Weaviate cluster is production-ready requires careful planning, configuration, and ongoing maintenance. Ensuring that you have a stable, reliable deployment requires you to think of your *ending* at the *beginning.* This guide provides you with introspective questions to assess readiness and identify any potential gaps before moving your workloads into production.

### High Availability and Resilience

- [ ]  Are your clusters deployed across multiple availability zones (AZs) or regions to prevent downtime?
- [ ]  Are replicas deployed across multiple nodes for redundancy?
- [ ]  Is your control plane highly available?
- [ ]  Is your application fault-tolerant *without* your control plane?
- [ ]  Are the worker nodes distributed across multiple zones to mitigate failures?
- [ ]  Are there automatic node repair or self-healing mechanisms in place?
- [ ]  Have failover scenarios been tested to validate resilience?
- [ ]  Are you utilizing Weaviate’s backup capabilities for disaster recovery?
    - [ ]  How often are these mechanisms tested?
    - [ ]  Has the ability to recover from a node failure or database corruption been tested?
- [ ]  Are rolling updates performed to avoid downtime?
- [ ]  Are canary deployments implemented to safely test new releases?
- [ ]  Do you have development or test environments to safely test changes?

### Resource Management

- [ ]  Have you considered your data’s consumption pattern(s)?
    - [ ]  Has your memory allocation been right-sized to match workload demand?
    - [ ]  Has your storage/compute allocation also been right-sized to match workload demand?
    - [ ]  Is there a process to delete old or unused objects?
- [ ]  Have multiple replicas been configured to balance read-heavy workloads?
- [ ]  Has the proper storage class been selected for your needs?
    - [ ]  Does your storage class support volume expansion so that you can support growth over time?
- [ ]  Is the data within your cluster properly backed up, including the persistent storage?

### Security

- [ ]  Are the components of your cluster communicating via SSL/TLS and trusted certificates?
- [ ]  Is the *“principle of least privilege”* being followed?
- [ ]  Are your container security defaults set properly?
- [ ]  Is access to your cluster strictly limited?
- [ ]  Has [RBAC](/docs/weaviate/configuration/rbac/index.mdx) been implemented to restrict access?
- [ ]  Have network policies been implemented to limit pod-to-pod communication?
- [ ]  Are secrets secured with K8s Secrets or a vault solution?
- [ ]  Do you have a process for when secrets are exposed, when access is lost to a key or certificate, and when secrets need to be rotated?

### Monitoring and Observability

- [ ]  Is logging implemented?
    - [ ]  Are the collected logs stored centrally?
- [ ]  Is metric collection enabled using Prometheus (or Alloy, DataDog, or another monitoring platform)?
- [ ]  Are health and performance metrics being visualized in Grafana?
- [ ]  Are alerts configured for events?

Evaluate these key areas to build a highly available, resilient, and efficient deployment that will scale to meet your business needs. By ensuring that these self-assessment questions have been addressed, you can proactively identify potential risks and maximize the reliability of your deployment. 

:::tip
If you *do* identify gaps within your deployment, be sure to reach out to your SE (sales engineer) who can help steer you on the path to production success!
:::
