---
title: Python Client
description: "Use the Python client to interact with Weaviate Agents."
image: og/docs/agents.jpg
# tags: ['agents', 'clients', 'python']
---

<!-- Details of the python client, some of:
* More detailed installation
* Link to the full API docs -->
<!-- * Link to the github -->

The Python client allows you to easily interact with the Weaviate Agents API from your Python applications. 

It relies on the [Weaviate Client package](../../weaviate/client-libraries/python/index.mdx), and handles authentication and connection to your Weaviate instance from there.

## Client Documentation

[See here for the full client documentation of the Weaviate Agents Python Client.](https://weaviate-python-client.readthedocs.io/en/stable/weaviate-agents-python-client/docs/)

## Github

[See here for the Github repository for the Weaviate Agents Python Client.](https://github.com/weaviate/weaviate-agents-python-client)

## Installation

The Weaviate Agents Python client is distributed as the [`weaviate-agents`](https://pypi.org/project/weaviate-agents/) package on PyPI, and depends on the [`weaviate-client`](https://pypi.org/project/weaviate-client/) package. You can install it in one of two equivalent ways.

**Recommended: install via the `weaviate-client` extra**

```shell
pip install -U "weaviate-client[agents]"
```

This installs `weaviate-client` together with its `agents` extra, which pulls in a compatible version of `weaviate-agents`. This is the recommended form because it makes the relationship explicit — `weaviate-agents` is a sub-package designed to be used alongside `weaviate-client`.

**Alternative: install `weaviate-agents` directly**

```shell
pip install -U weaviate-agents
```

`weaviate-agents` declares `weaviate-client` as a hard dependency, so this command also installs both packages. The end result is the same set of installed packages as the recommended form.

### Imports

Both install commands install the same two packages (`weaviate-client` and `weaviate-agents`), so the following two import styles both work and are equivalent in practice — pick whichever you prefer:

```python
# Style A — import directly from the agents package
from weaviate_agents.query import QueryAgent
```

```python
# Style B — import via the weaviate.agents namespace
from weaviate.agents.query import QueryAgent
```

:::info Importing without Agents
If you try to import a Weaviate agent from the Weaviate Python Client without the agents package being installed, i.e.
```python
from weaviate.agents import ...
```
it will raise a `WeaviateAgentsNotInstalledError`. Simply install the agents package via the above installation options to fix.
:::

#### Troubleshooting: Force `pip` to install the latest version

For existing installations, even `pip install -U "weaviate-client[agents]"` may not upgrade `weaviate-agents` to the [latest version](https://pypi.org/project/weaviate-agents/). If this occurs, additionally try to explicitly upgrade the `weaviate-agents` package:

```shell
pip install -U weaviate-agents
```

Or install a [specific version](https://github.com/weaviate/weaviate-agents-python-client/tags):

```shell
pip install -U weaviate-agents==||site.weaviate_agents_version||
```
