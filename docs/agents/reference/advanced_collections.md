---
title: Collection Configuration
description: "Connect Weaviate collections to an agent to enable searching and retrieval over your data."
image: og/docs/agents.jpg
# tags: ['agents', 'reference', 'collections']
---

Contains:
* Explanation on how the QA can choose which collections are queried
* Detail on how you can pass either string or `QueryAgentCollectionConfig` to the `collections` argument to `.ask()` or `.search()`
* Full breakdown of `QueryAgentCollectionConfig` and all its arguments:
    * `target_vector`
    * `view_properties`
    * `additional_filters` and link to additional filters reference page