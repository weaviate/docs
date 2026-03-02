---
title: Groups
sidebar_position: 2
description: "Groups in Engram: containers of topics and pipelines that map 1:1 to use cases."
---

A group is a container of topics and a pipeline definition — a bundle of configuration that maps 1:1 to a use case. If you have multiple use cases (e.g. personalization and continual learning), create separate groups for each.

Each project can have multiple named groups, but most use cases only need the `default` group.

## What groups provide

- A stable UUID identifier for the pipeline configuration
- Topic definitions that control what gets extracted
- Pipeline steps that define the processing flow
- Topic name isolation — different groups can have topics with the same name without collision (e.g. two agents can each have a `user_preferences` topic in separate groups)

## Default groups

When you create a project, Engram sets up two default groups:

- **`default_personalisation`** — User-scoped. Requires a `user_id` when storing and searching. Use this for per-user preferences, facts, and context.
- **`default_continual_learning`** — Project-wide. No `user_id` needed. Use this for things an agent learns about how to perform a task, regardless of which user it's working with.

## When to create additional groups

Create additional groups when you have distinct use cases that need different topic definitions or pipeline configurations. For example, a customer support agent might have one group for tracking user preferences and another for learning resolution patterns.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
