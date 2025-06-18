---

title: Deployment FAQs

---

Looking for guidance on deploying Weaviate in a production environment? Whether you're scaling up from a proof-of-concept to an enterprise-wide implementation, migrating from another solution, or optimizing for specific workloads, you'll find practical answers to streamline your deployment process. Our goal is to help you achieve reliable performance, maintain data integrity, and minimize operational overhead as you harness the power of vector search for your applications!


#### Q1: Why did my cluster suddenly become read-only?

<details>

<summary> Answer </summary>

This almost always means you've run out of disk space. Weaviate protects itself by switching to read-only mode when disk usage exceeds a configured threshold. You'll need to increase the disk size available to Weaviate and then reset the read-only status.

</details>

#### Q2: How do I deploy Weaviate using AWS Marketplace?

<details>

<summary> Answer </summary>

This [page](../installation-guides/aws-marketplace.md) will walk you through all the necessary steps to deploy Weaviate using AWS marketplace. 

</details>

#### Q3: How do I deploy Weaviate using GCP Marketplace?

<details>

<summary> Answer </summary>

This [page](../installation-guides/gcp-marketplace.md) will walk you through all the necessary steps to deploy Weaviate using GCP marketplace. 

</details>

#### Q4: Is there a recommended limit for collections?

<details>

<summary> Answer </summary>

If you plan to create more than **20** collections, you may want to consider multi-tenancy instead for better scaling and performance. 

**Additional information:** [Scaling limits with collections](/weaviate/starter-guides/managing-collections/collections-scaling-limits.mdx)

</details>

#### Q5: What are some common issues that occur during deployment?

<details>

<summary> Answer </summary>

Common issues that occur during deployment include:

- The cluster becoming `read-only`.
- Query results being inconsistent.
- Nodes unable to maintain consensus. 
- Creating too many collections.

#### Further resources 

For further information, the [troubleshooting page](./troubleshooting.md) will help with some of the common issue encountered. 

</details>

#### Q6: What's the difference between Weaviate and other databases?

<details>

<summary> Answer </summary>

Weaviate has complex processes which means that ingestion and deletion require more steps than other types of databases. Data ingestion tends to take longer than a traditional database because of vectorization and deleting objects can be expensive due to the embedding costs. 
</details>

#### Q7: Do my resources free up immediately after deleting objects?

<details>

<summary> Answer </summary>

No, it does not happen instantaneously. When you delete objects a tombstone is created. The data removal and index cleanup occur as background processes. 

</details>

#### Q8: What's the difference between client timeouts and module timeouts?

<details>

<summary> Answer </summary>

- **Client timeout:** These are timeouts between the client and Weaviate server. 

- **Module timeout:** These are timeouts that occurs when Weaviate interacts with external modules like LLMs and vectorizers. 

</details>

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>