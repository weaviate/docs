# Support-ticket explorer with Reflex and Weaviate

Investigate a bundled set of 24 fictional support tickets. Choose a status, ask a question, read the streamed answer, and open the original tickets to check the evidence. The app is read-only and uses one Weaviate collection.

## Run

You need Python 3.14+, [uv](https://docs.astral.sh/uv/), and a Weaviate Cloud cluster with Query Agent access, Weaviate Embeddings enabled, and one available collection slot.

```bash
uv sync --locked
cp .env.example .env
```

Add `WEAVIATE_URL` and `WEAVIATE_API_KEY` to `.env`, then run:

```bash
uv run python -m tickets.load_data
uv run reflex run --env prod --single-port
```

Open the URL printed by Reflex, normally `http://localhost:3000`. Restart the server after editing code or CSS. The key stays on the Python backend and `.env` is excluded from Git.

The loader creates `ReflexSupportTickets`. On the first run it inserts 24 records; repeating the import skips existing ticket IDs. It never deletes collections or overwrites existing tickets. The data is fictional and bundled in `tickets/sample_tickets.json`, so no dataset downloads or external image services are needed. Embedding and agent calls consume your Cloud service allowance.

## Try it

1. Select **Open** and ask: “Which tickets describe login or sign-in failures? Include ticket IDs.”
2. Select a linked ticket ID in the answer. Compare its status, description, and recorded workaround with the answer.
3. Ask: “Which of those tickets have a documented workaround?”
4. Select **Resolved**. This clears the previous conversation. Ask the first question again and compare the records.

The status control applies a per-request database filter to both agent retrieval and source lookup. It is a search control, not an authorization boundary. Conversations are separate per visitor; a filter change starts fresh to avoid mixing contexts. Linked ticket IDs open dialogs containing stored fields rather than model-generated summaries. Answer evaluation narrows the returned sources; this extra model step adds latency and usage but does not guarantee correctness. Aggregate answers may have no individual sources. The app resolves up to eight source records and links matching IDs directly in the answer.

## Code map

- `tickets/tickets.py`: Reflex components, filter buttons, composer, and ticket dialogs.
- `tickets/state.py`: session history, short state locks, streamed updates, and errors.
- `tickets/service.py`: shared async connection, request-scoped filters, and batched source lookup.
- `tickets/load_data.py`: schema and repeatable import of bundled tickets.
- `tickets/models.py`: display models and allowed statuses.

## Check the example

```bash
uv run pytest -q
uv run ruff check .
uv run reflex compile --dry
```

To make two real Query Agent calls after importing the sample:

```bash
uv run python -m tickets.smoke_test
```

Offline tests cover session and filter isolation, failure handling, source lookup, and repeat imports. The live smoke test checks streaming, follow-ups, and source status. Neither automatically grades answer quality. Compare answers with the original records.

## Use your own data

Adapt `sample_tickets.json` and the loader for your schema. IDs are stable: the loader skips existing IDs rather than updating them. Use explicit update operations if ticket contents change. Keep private ticket data out of a public example. Before publishing a real support tool, add authentication, enforce access on the server, and set per-user request limits.
