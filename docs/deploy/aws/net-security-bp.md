---
title: Network Security Best Practices
description: "Expert recommendations for maximizing network security in your Weaviate deployment."

---

# Best practices and tips

This page serves as a reference for AWS-specific networking best practices for your Weaviate deployment. It outlines a network security architecture designed to protect your Weaviate deployments.

:::tip 

- If you need general best practices, you can find them [here](/docs/weaviate/best-practices/index.md).

- If you need deployment-specific best practices, you can find them [here](/docs/deploy/faqs/index.md).

:::

### A robust network security architecture will: 

- Minimize the attack surface through network segmentation and access controls.
- Enable automated scaling while maintaining security boundaries.
- Ensure high availability with comprehensive disaster recovery.
- Provide end-to-end observability and threat detection.
- Establish secure administrative access patterns.

### Access control

Access control is the cornerstone of this network security strategy. It implements a zero-trust model where no resource is inherently trusted with continuous verification of all access requests.

#### Private subnet strategy

Network isolation is the foundation of our this strategy. Critical infrastructure should reside in private subnets with no direct internet connectivity. This eliminates internet-based attacks and forces all access through controlled entry points.

#### Core components

- Private subnets with NAT gateways providing controlled outbound internet access.
- Multi-factor authentication (MFA) for all administrative access.
- Security groups implementing the principle of least privilege enforced through granular permissions.
- ALBs with integrated WAF protection.

#### Access patterns

- Ingress traffic filtered through load balancers and security groups.
- Egress traffic controlled through NAT gateways with logging.
- Administrative access requiring a VPN and strong authentication.
- RBAC aligned with organizational structure.

#### VPN strategy for secure administrative access

- Site-to-site VPN for corporate office connectivity.
- Client VPN with individual certificates for administrative access.
- Multi-AZ VPN gateways ensuring high availability.

### Kubernetes access control

#### Administrative controls

- All `kubectl` access requires an established VPN connection.
- Integration with corporate IDPs.
- MFA for all administrative operations.
- Session timeout and activity monitoring.

### Network architecture with defense-in-depth

Security boundaries are created with network segmentation, this limits the potential impact of security breaches. This defense-in-depth strategy implements both horizontal and vertical segmentation.

#### Application tier segmentation

The application tier hosts all customer-facing services and business logic components:

- Dedicated subnets per application environment (development,staging, production).
- WAFs inspecting all inbound HTTP/HTTPS traffic.
- Container network isolation using Kubernetes network policies.
- API gateway enforcement of authentication and rate limiting.

#### Database tier isolation

The database tier (where Weaviate is deployed) requires enhanced security due to potentially sensitive data storage.

- Private subnets with no internet route.
- Database activity monitoring and audit logging.
- Routine security patching and vulnerability assessments.
- Backup systems in isolated subnets with restricted access.

#### Monitoring infrastructure

Centralized monitoring and observability infrastructure requires special considerations to prevent blind spots during security incidents.

- Isolated subnets prevent monitoring system compromise.
- Separate administrative access paths for monitoring systems.
- Network-level isolation preventing lateral movement to monitoring systems.
- Access controls limiting monitoring data to authorized personnel.

### VPC endpoints and private connectivity

Implementing CloudWatch VPC endpoint eliminates internet routing for monitoring data, these are the requirements for configuration:

- Interface VPC endpoint deployment in each availability zone.
- DNS resolution configuration for seamless service integration.
- Security group rules allowing HTTPS traffic from monitoring sources.
- Route table configuration directing CloudWatch API calls to VPC endpoint.

#### Security benefits

- Monitoring data will never reach the public internet.
- Eliminating internet gateway dependency reduces attack surface.
- Network-level access controls for monitoring data transmission.
- Compliance with data residency requirements.

#### S3 VPC endpoint for secure data operations

Data transfer for backups and application data can be secured, this is what is needed for configuration:

- Route table entries to direct S3 traffic through the VPC endpoint(s).
- Bucket policies that restrict access to VPC endpoint traffic.
- IAM policies to control which services can access S3 resources.
- CloudTrail logging for all S3 API operations.  

#### Performance and security optimization

- Eliminates NAT gateway costs for S3 traffic.
- Improved data transfer performance through AWS.
- Network-level protection prevents data exfiltration through the internet.
- Integration with AWS Config for compliance monitoring.

### Scaling and performance strategies

#### Application load balancer (ALB) configuration

#### SSL/TLS management

- Automated certificate provisioning through AWS Certificate Manager.
- PFS enabled for all connections.
- HTTP to HTTPS redirection preventing unencrypted communications.

#### WAF integration

- WAF rules protecting against common web vulnerabilities.
- Custom rules based on application-specific threat patterns.
- Managed rule sets for OWASP Top 10 protection.
- Real-time metrics and alerting for blocked requests.

#### Health check configuration

- Application-specific health checks verifying service functionality.
- Multi-tier health checks ensuring database connectivity.
- Graceful handling of unhealthy targets during scaling events.
- Custom health check endpoints providing details service status.

### Autoscaling security considerations

Secure scaling policies maintains security posture during capacity changes.

#### Scaling triggers

- CPU utilization with security-adjusted thresholds.
- Memory utilization accounting for security tooling overhead.
- Custom metrics, including security event rates.
- Predictive scaling based on historical patterns and threat intelligence.

#### Security during scaling

- Automated security group updates for new instances.
- Security tooling deployment through user data scripts.
- Configuration management to ensure consistent security baselines.
- Monitoring integration providing immediate visibility into new instances.

### High availability and disaster recovery

#### Multi-AZ architecture

#### Weaviate configuration

- **Minimum** 3 replicas distributed across AZs.
- Automatic failover and cross-AZ replication.
- Automated backups to S3 with cross-region replication.

### Observability and monitoring

#### Grafana infrastructure

- Centralized dashboards for system health and security metrics.
- Tiered alerting to prevent notification fatigue.
- Integration with incident response systems.

#### Network visibility

- VPC flow logs to capture traffic metadata for security analysis.
- Real0time streaming to SIEMs.
- Baseline establishment and anomaly detection.

#### Security monitoring

- Threat detection using behavioral analysis and threat intelligence.
- Automated incident creation and response workflows.
- Forensic data collection and preservation capabilities.

### Service mesh security

#### Istio implementation

Istio is a service mesh that provides comprehensive security and observability for service communications.

#### Key features

- **Mutual TLS (mTLS):** Automatic encryption and authentication for all service communications.
- **Certificate management:** Automated provisioning, rotation, and revocation.
- **Identity verification:** Pod-level authentication before communication establishment.

Istio also has a zero-trust model which has these features:

- Default deny-all policies requiring explicit communication permissions.
- Continuous identity verification for all service requests.
- Fine-grained traffic policies supporting security and deployment requirements.

#### Benefits

- Encryption without application code changes.
- Centralized policy enforcement across all services.
- Detailed traffic analytics and security monitoring.

### Kubernetes network policies

#### Calico or Cilium implementation

- Advanced network policy features with pod-level segmentation.
- eBPF-based enforcement for optimal performance.
- Application-aware policies supporting HTTP/gRPC.

#### Policy framework

- **Default deny:** all traffic is blocked by default.
- **Namespace isolation:** prevents unauthorized cross-namespace communications.
- **Selective allow:** Explicit rules for required communications.
- **GitOps management:** Version-controlled policy deployment and testing.

#### Implementation

- Network policies should prevent lateral movement between pods.
- Integration with service mesh for consistent enforcement.
- Regular policy auditing and optimization.
- Automated testing to ensure policy effectiveness.

### Framework alignment

Our AWS-specific best practices are aligned with the following security frameworks:

- **NIST Cybersecurity framework:** Complete identify, protect, detect, respond, and recover capabilities.
- **ISO 27001:** Information security management system implementation.
- **SOC 2:** Trust services criteria compliance for security, availability, and confidentiality.

### Additional resources and information

- [Monitoring documentation](../configuration/monitoring.md)
- [Replication documentation](../configuration/replication.md)
- [Backups documentation](../configuration/backups.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
