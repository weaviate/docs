---
title: Docker
image: og/docs/installation.jpg
# tags: ['installation', 'Docker']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Weaviate supports deployment with Docker.

You can [run Weaviate with default settings from a command line](#run-weaviate-with-default-settings), or [customize your configuration](#customize-your-weaviate-configuration) by creating your own `docker-compose.yml` file.

## Run Weaviate with default settings

To run Weaviate with Docker using default settings, run this command from from your shell:

```bash
docker run -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
```

The command sets the following default [environment variables](#environment-variables) in the container:

- `PERSISTENCE_DATA_PATH` defaults to `./data`
- `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED` defaults to `true`.
- `QUERY_DEFAULTS_LIMIT` defaults to `10`.

import TelemetryNotice from '/_includes/telemetry-notice.mdx';

<TelemetryNotice/>

## Customize your Weaviate configuration

You can customize your Weaviate configuration by creating a `docker-compose.yml` file. Start from our [sample Docker Compose file](#sample-docker-compose-file), or use the interactive [Configurator](#configurator) to generate a `docker-compose.yml` file.

## Sample Docker Compose file

This starter Docker Compose file allows:
* Use of any [API-based model provider integrations](/weaviate/model-providers/index.md) (e.g. `OpenAI`, `Cohere`, `Google`, and `Anthropic`).
    * This includes the relevant embedding model, generative, and reranker [integrations](/weaviate/model-providers/index.md).
* Searching pre-vectorized data (without a vectorizer).
* Mounts a persistent volume called `weaviate_data` to `/var/lib/weaviate` in the container to store data.

### Download and run

<Tabs queryString="docker-compose">
  <TabItem value="anonymous" label="Anonymous access" default>

Save the code below as `docker-compose.yml` to download and run Weaviate with anonymous access enabled:

```yaml
---
services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 50051:50051
    volumes:
    - weaviate_data:/var/lib/weaviate
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node1'
volumes:
  weaviate_data:
...
```

:::caution
Anonymous access is strongly discouraged except for development or evaluation purposes.
:::

  </TabItem>
  <TabItem value="auth" label="With authentication and authorization enabled">

Save the code below as `docker-compose.yml` to download and run Weaviate with authentication (non-anonymous access) and authorization enabled:

```yaml
---
services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 50051:50051
    volumes:
    - weaviate_data:/var/lib/weaviate
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node1'
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'false'
      AUTHENTICATION_APIKEY_ENABLED: 'true'
      AUTHENTICATION_APIKEY_ALLOWED_KEYS: 'user-a-key,user-b-key'
      AUTHENTICATION_APIKEY_USERS: 'user-a,user-b'
      AUTHORIZATION_ENABLE_RBAC: 'true'
      AUTHORIZATION_RBAC_ROOT_USERS: 'user-a'
volumes:
  weaviate_data:
...
```

This setup enables API-key based [authentication](/deploy/configuration/authentication.md) and role-based access control [authorization](/deploy/configuration/authorization.md).

It defines the users `user-a` and `user-b` and corresponding keys `user-a-key` and `user-b-key` which serve as authentication credentials for connecting to your Weaviate instance.

The user `user-a` is granted admin access rights using the **Role-based access control (RBAC)** method. A custom role can be assigned to the user `user-b` by following the [authorization and RBAC guide](/deploy/configuration/authorization.md).

  </TabItem>
</Tabs>

Edit the `docker-compose.yml` file to suit your needs. You can add or remove [environment variables](#environment-variables), change the port mappings, or add additional [model provider integrations](/weaviate/model-providers/index.md), such as [Ollama](/weaviate/model-providers/ollama/index.md), or [Hugging Face Transformers](/weaviate/model-providers/transformers/index.md).

To start your Weaviate instance, run this command from your shell:

```bash
docker compose up -d
```

## Hosting

To make Weaviate accessible over both HTTP and gRPC, you need to expose their respective ports (by default `8080` for HTTP and `50051` for gRPC). To access these services via a domain, configure your reverse proxy to forward traffic to both ports. The recommended approach is to use a subdomain prefixed with `grpc-` for gRPC traffic, which ensures compatibility with most Weaviate clients.

For example, if your domain is `weaviate.example.com`, configure your reverse proxy as follows:
- `weaviate.example.com` → `localhost:8080` (HTTP)
- `grpc-weaviate.example.com` → `localhost:50051` (gRPC, typically using h2c)

## Configurator

The Configurator (experimental) can generate a `docker-compose.yml` file for you. Use the Configurator to select specific Weaviate modules, including vectorizers that run locally (i.e. `text2vec-transformers`, or `multi2vec-clip`)

import WeaviateConfigurator from '@site/src/components/WeaviateConfigurator';

<WeaviateConfigurator />

## Environment variables

You can use environment variables to control your Weaviate setup, authentication and authorization, module settings, and data storage settings.

:::info List of environment variables
A comprehensive of list environment variables [can be found on this page](/deploy/configuration/env-vars/index.md).
:::

## Example configurations

Here are some examples of how to configure `docker-compose.yml`.

### Persistent volume

We recommended setting a persistent volume to avoid data loss as well as to improve reading and writing speeds.

Make sure to run `docker compose down` when shutting down. This writes all the files from memory to disk.

**With named volume**
```yaml
services:
  weaviate:
    volumes:
        - weaviate_data:/var/lib/weaviate
    # etc

volumes:
    weaviate_data:
```

After running a `docker compose up -d`, Docker will create a named volume `weaviate_data` and mount it to the `PERSISTENCE_DATA_PATH` inside the container.

**With host binding**
```yaml
services:
  weaviate:
    volumes:
      - /var/weaviate:/var/lib/weaviate
    # etc
```

After running a `docker compose up -d`, Docker will mount `/var/weaviate` on the host to the `PERSISTENCE_DATA_PATH` inside the container.

### Weaviate without any modules

An example Docker Compose setup for Weaviate without any modules can be found below. In this case, no model inference is performed at either import or search time. You will need to provide your own vectors (e.g. from an outside ML model) at import and search time:

```yaml
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 50051:50051
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node1'
```

### Weaviate with the `text2vec-transformers` module

An example Docker Compose file with the transformers model [`sentence-transformers/multi-qa-MiniLM-L6-cos-v1`](https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1) is:

```yaml
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    restart: on-failure:0
    ports:
    - 8080:8080
    - 50051:50051
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      DEFAULT_VECTORIZER_MODULE: text2vec-transformers
      ENABLE_MODULES: text2vec-transformers
      TRANSFORMERS_INFERENCE_API: http://text2vec-transformers:8080
      CLUSTER_HOSTNAME: 'node1'
  text2vec-transformers:
    image: cr.weaviate.io/semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
    environment:
      ENABLE_CUDA: 0 # set to 1 to enable
      # NVIDIA_VISIBLE_DEVICES: all # enable if running with CUDA
```

Note that transformer models are neural networks built to run on GPUs. Running Weaviate with the `text2vec-transformers` module and without GPU is possible, but it will be slower. Enable CUDA with `ENABLE_CUDA=1` if you have a GPU available.

For more information on how to set up the environment with the
`text2vec-transformers` integration, see [this
page](/weaviate/model-providers/transformers/embeddings.md).

The `text2vec-transformers` module requires at least Weaviate version `v1.2.0`.

### Unreleased versions

import RunUnreleasedImages from '/_includes/configuration/run-unreleased.mdx'

<RunUnreleasedImages />

## Multi-node configuration

To configure Weaviate to use multiple host nodes, follow these steps:

- Configure one node as a "founding" member
- Set the `CLUSTER_JOIN` variable for the other nodes in the cluster.
- Set the `CLUSTER_GOSSIP_BIND_PORT` for each node.
- Set the `CLUSTER_DATA_BIND_PORT` for each node.
- Set the `RAFT_JOIN` each node.
- Set the `RAFT_BOOTSTRAP_EXPECT` for each node with the number of voters.
- Optionally, set the hostname for each node using `CLUSTER_HOSTNAME`.

(Read more about [horizontal replication in Weaviate](/weaviate/concepts/cluster.md).)

So, the Docker Compose file includes environment variables for the "founding" member that look like this:

```yaml
  weaviate-node-1:  # Founding member service name
    ...  # truncated for brevity
    environment:
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3
```

And the other members' configurations may look like this:

```yaml
  weaviate-node-2:
    ...  # truncated for brevity
    environment:
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7102'
      CLUSTER_DATA_BIND_PORT: '7103'
      CLUSTER_JOIN: 'weaviate-node-1:7100'  # This must be the service name of the "founding" member node.
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3
```

Below is an example configuration for a 3-node setup. You may be able to test [replication](/deploy/configuration/replication.md) examples locally using this configuration.


<details>
  <summary>Docker Compose file for a replication setup with 3 nodes</summary>

```yaml
services:
  weaviate-node-1:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 6060:6060
    - 50051:50051
    restart: on-failure:0
    volumes:
      - ./data-node-1:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3

  weaviate-node-2:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8081:8080
    - 6061:6060
    - 50052:50051
    restart: on-failure:0
    volumes:
      - ./data-node-2:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7102'
      CLUSTER_DATA_BIND_PORT: '7103'
      CLUSTER_JOIN: 'weaviate-node-1:7100'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3

  weaviate-node-3:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8082:8080
    - 6062:6060
    - 50053:50051
    restart: on-failure:0
    volumes:
      - ./data-node-3:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node3'
      CLUSTER_GOSSIP_BIND_PORT: '7104'
      CLUSTER_DATA_BIND_PORT: '7105'
      CLUSTER_JOIN: 'weaviate-node-1:7100'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3
```

</details>

:::note Port number conventions
It is a Weaviate convention to set the `CLUSTER_DATA_BIND_PORT` to 1 higher than `CLUSTER_GOSSIP_BIND_PORT`.
:::


## Shell attachment options

The output of `docker compose up` is quite verbose as it attaches to the logs of all containers.

You can attach the logs only to Weaviate itself, for example, by running the following command instead of `docker compose up`:

```bash
# Run Docker Compose
docker compose up -d && docker compose logs -f weaviate
```

Alternatively you can run docker compose entirely detached with `docker compose up -d` _and_ then poll `{bindaddress}:{port}/v1/meta` until you receive a status `200 OK`.

<!-- TODO:
1. Check that all environment variables are also applicable for the kubernetes setup and associated values.yaml config file.
2. Take this section out and into References; potentially consolidate with others as they are strewn around the docs. (E.g. backup env variables are not included here.) -->

## Troubleshooting

### Set `CLUSTER_HOSTNAME` if it may change over time

In some systems, the cluster hostname may change over time. This is known to create issues with a single-node Weaviate deployment. To avoid this, set the `CLUSTER_HOSTNAME` environment variable in your `docker-compose.yml` file to the cluster hostname.

```yaml
---
services:
  weaviate:
    # ...
    environment:
      CLUSTER_HOSTNAME: 'node1'
...
```

### `bind: address already in use`

Docker refuses to start a container when a port it publishes is already taken on the host. The message names the port, which tells you which part of Weaviate cannot start:

| Port | Used for | If it is taken |
| --- | --- | --- |
| `8080` | REST API, and the readiness and liveness endpoints | Nothing can reach Weaviate. Clients fail to connect. |
| `50051` | gRPC API, which the clients use for queries and batch imports | The REST API works, but client connections fail their gRPC health check. |
| `6060` | Go profiling endpoint, published only by the three-node example | Only profiling is affected. |

The three-node example publishes one set per node, so it also uses `8081` and `8082`, `50052` and `50053`, and `6061` and `6062`.

The clustering ports are not published to the host: `7100`–`7105` (`CLUSTER_GOSSIP_BIND_PORT` and `CLUSTER_DATA_BIND_PORT`) and `8300` and `8301` (Raft) are reached over the Compose network between containers, so they cannot collide with a process on your machine. Change the left-hand side of a `ports` mapping to move a published port, for example `8081:8080`.

### A port stays busy after a crash

If Docker or the container stopped without a clean shutdown, a `docker-proxy` process can keep holding the published port. `docker ps` shows nothing, but the next `docker compose up` still fails with `address already in use`.

Find what holds the port:

```bash
sudo lsof -i :8080
```

If the holder is `docker-proxy`, restart Docker — `sudo systemctl restart docker` on Linux, or quit and reopen Docker Desktop — which releases the port and leaves Docker's own bookkeeping consistent.

### Running Weaviate from a UI with no Compose file

Some container UIs, such as Portainer, let you create a container but give you no way to put a `docker-compose.yml` on the server's filesystem. Nothing in the sample Compose file needs one: it is an image, two port mappings, a volume, and a set of environment variables. Pass them directly instead:

```bash
docker run -d --name weaviate -p 8080:8080 -p 50051:50051 -v weaviate_data:/var/lib/weaviate -e PERSISTENCE_DATA_PATH=/var/lib/weaviate -e CLUSTER_HOSTNAME=node1 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false -e AUTHENTICATION_APIKEY_ENABLED=true -e AUTHENTICATION_APIKEY_ALLOWED_KEYS=user-a-key -e AUTHENTICATION_APIKEY_USERS=user-a -e AUTHORIZATION_ENABLE_RBAC=true -e AUTHORIZATION_RBAC_ROOT_USERS=user-a cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
```

In a UI, put the same values into its image, ports, volumes, and environment-variable fields.

### What survives a restart, `down`, and `down -v` {#what-survives-what}

The sample Compose files mount a named volume, `weaviate_data`, at `/var/lib/weaviate`, and point `PERSISTENCE_DATA_PATH` at it. A named volume has its own lifecycle, separate from the container:

| What you do | Container | Data |
| --- | --- | --- |
| Crash, `docker restart`, host reboot | Restarted or recreated | Kept |
| `docker compose down` | Removed | Kept — the named volume is left alone |
| `docker compose down -v` | Removed | **Deleted** — `-v` removes the named volume too |
| `docker rm weaviate` | Removed | Kept |

Run `docker compose down` rather than killing the container: it gives Weaviate time to flush in-memory data to disk.

The one case where data does not survive is a container started with no volume at all — including the `docker run` command at the top of this page. Its data lives in the container's writable layer and goes away with the container. Add `-v weaviate_data:/var/lib/weaviate` and set `PERSISTENCE_DATA_PATH` to `/var/lib/weaviate` to keep it.

## Related pages

- If you are new to Docker, see [Docker Introduction for Weaviate Users](https://weaviate.io/blog/docker-and-containers-with-weaviate).

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
