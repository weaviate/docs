---
title: Console
sidebar_position: 2
description: "Browse and manage Engram projects, memories, users, runs, and API keys from the Weaviate Cloud console."
---

The Engram console is a graphical interface for inspecting and managing your Engram projects in [Weaviate Cloud](https://console.weaviate.cloud). Browse memories, users, and runs, manage API keys, and review your project's groups and topics, all without writing code.

To open it, sign in to [Weaviate Cloud](https://console.weaviate.cloud), select the **Engram** product from the top navigation, and choose a project. The left-hand menu gives you access to the **Dashboard**, **Users**, **Memories**, **Runs**, **API Keys**, and **Plans** pages.

## Dashboard

import DashboardImg from '/docs/engram/_includes/console/dashboard.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={DashboardImg} alt="Engram console dashboard"/>
        </div>
        <div class="card__body">
            <p>The dashboard is the overview for the selected project. The top of the page shows your current plan and usage for the period, including how many [runs](concepts/pipelines.md#runs) you have used against your monthly cap.</p>
            <br/>
            <p>The summary cards report the project's totals: memories, users, API keys, and runs in the last 24 hours.</p>
        </div>
    </div>
</div>
<br/>

The **Groups** section lists the project's [groups](concepts/groups.md) and the [topics](concepts/topics.md) in each one. For every topic you can see its description and its [scope](concepts/scopes.md) requirements, such as `user` or `conversation_id`. Use **Edit Group** to review a group's configuration.

:::note
Groups and topics are defined when a project is created. Editing them in the console is read-only for now, and creating new groups from the console is coming soon.
:::

## Users

import UsersImg from '/docs/engram/_includes/console/users.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={UsersImg} alt="Engram console users page"/>
        </div>
        <div class="card__body">
            <p>A [user](concepts/scopes.md) is created automatically the first time a memory is written with a new `user_id`. The Users page lists every user in the project.</p>
            <br/>
            <p>Each row shows the user's name (`user_id`), when it was created and last updated, how many memories and conversations it has, and when it was last active. Use the action on the right of a row to delete a user and its memories.</p>
        </div>
    </div>
</div>
<br/>

## Memories

import MemoriesImg from '/docs/engram/_includes/console/memories.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={MemoriesImg} alt="Engram console memories page"/>
        </div>
        <div class="card__body">
            <p>The Memories page lists the [memories](concepts/memories.md) stored in the project. The **Activity** tab shows recent memories, and the **Search** tab lets you run a query against them.</p>
            <br/>
            <p>Filter the list by group, topic, user, or conversation using the dropdowns at the top. Each row shows the memory's ID, topic, group, user, properties, and when it was last updated. Use **Create Memory** to add a memory directly from the console.</p>
        </div>
    </div>
</div>
<br/>

import MemoryDetailImg from '/docs/engram/_includes/console/memory-detail.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={MemoryDetailImg} alt="Engram console memory detail panel"/>
        </div>
        <div class="card__body">
            <p>Select a memory to open the **Memory Detail** panel. It shows the memory's full content along with its topic, group, user, [properties](concepts/scopes.md), and created and updated timestamps.</p>
            <br/>
            <p>Use **Delete memory** in the panel to remove a single memory.</p>
        </div>
    </div>
</div>
<br/>

## Runs

import RunsImg from '/docs/engram/_includes/console/runs.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={RunsImg} alt="Engram console runs page"/>
        </div>
        <div class="card__body">
            <p>Every time content is sent to Engram, it runs through an asynchronous [pipeline](concepts/pipelines.md) that can create, update, or delete memories. Each of these executions is a [run](concepts/pipelines.md#runs).</p>
            <br/>
            <p>The Runs page lists recent runs and lets you filter by status. Each row shows the run ID, status, input type, user, the number of memory operations, and when it started and finished.</p>
        </div>
    </div>
</div>
<br/>

import RunDetailImg from '/docs/engram/_includes/console/run-detail.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={RunDetailImg} alt="Engram console run detail panel"/>
        </div>
        <div class="card__body">
            <p>Select a run to open the **Run Detail** panel. It shows the run's status, input type, user, group, and starting step, along with timestamps.</p>
            <br/>
            <p>The memory operations section lists the memories the run created, updated, or deleted, so you can trace exactly what changed.</p>
        </div>
    </div>
</div>
<br/>

## API Keys

import ApiKeysImg from '/docs/engram/_includes/console/api-keys.png';

<div class="row">
    <div class="card">
        <div class="card__image">
            <img src={ApiKeysImg} alt="Engram console API keys page"/>
        </div>
        <div class="card__body">
            <p>API keys authenticate your application with a project. The API Keys page lists each key by name, with its key prefix, when it was created, and when it was last used.</p>
            <br/>
            <p>Use **Create Key** to generate a new key. The full key is shown only once, so copy and store it securely. Use the action on the right of a row to delete a key.</p>
        </div>
    </div>
</div>
<br/>

## Plans

The **Plans** page shows your current plan and lets you upgrade. Your plan determines limits such as the number of pipeline runs allowed per month. When a free plan reaches its monthly run cap, new runs are rejected until the cap resets.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
