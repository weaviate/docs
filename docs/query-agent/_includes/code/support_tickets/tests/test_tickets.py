"""Offline behavior tests; these do not grade the hosted agent's answers."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest
from reflex.istate.proxy import StateProxy
from reflex_base.event.context import EventContext
from weaviate.agents.classes import AskModeResponse, ProgressMessage, StreamedTokens
from weaviate_agents.query.classes.response import Source

from tickets import service as service_module
from tickets.load_data import import_rows
from tickets.models import COLLECTION, Turn, source_card
from tickets.service import SetupError, TicketService
from tickets.state import State


class BackgroundProxy(StateProxy):
    """Exercise Reflex mutation guards with an observable session lock."""

    def __init__(self, state):
        """Create a proxy without a running server."""
        with EventContext(token="test", state_manager=None, enqueue_impl=AsyncMock()):
            super().__init__(state)
        self._self_lock = asyncio.Lock()

    async def __aenter__(self):
        """Acquire the simulated session lock."""
        await self._self_lock.acquire()
        self._self_mutable = True
        return self

    async def __aexit__(self, *exc):
        """Restore mutation guards and release the lock."""
        self._self_mutable = False
        self._self_lock.release()


def final_response(answer="A complete answer.", sources=None):
    """Build an actual SDK response rather than a lookalike payload."""
    return AskModeResponse(
        searches=[],
        aggregations=[],
        usage={"model_units": 1, "usage_in_plan": True, "remaining_plan_requests": 10},
        total_time=0.1,
        is_partial_answer=None,
        missing_information=None,
        final_answer=answer,
        sources=sources,
    )


def test_missing_source_retains_identity():
    """An unavailable record must not be replaced with generated ticket details."""
    card = source_card(COLLECTION, "id", None)
    assert card.missing and card.object_id == "id"


def test_ticket_fields_and_missing_workaround():
    """Display source fields exactly and explicitly flag absent workarounds."""
    card = source_card(
        COLLECTION,
        "id",
        {
            "ticket_id": "SUP-101",
            "title": "Login fails",
            "status": "Open",
            "priority": "High",
            "product": "Identity",
            "workaround": "",
        },
    )
    assert card.ticket_id == "SUP-101" and card.name == "Login fails"
    assert card.status == "Open" and card.product == "Identity"
    assert card.workaround == "No workaround documented."


async def test_sources_are_deduplicated_batched_and_bounded():
    """One DB query fetch eight unique, ordered records."""
    service = TicketService()
    ids = [str(UUID(int=i)) for i in range(1, 16)]
    fetch = AsyncMock(
        return_value=SimpleNamespace(
            objects=[
                SimpleNamespace(uuid=UUID(ids[0]), properties={"title": "First ticket"})
            ]
        )
    )
    service.client = MagicMock()
    service.client.collections.use.return_value.query.fetch_objects = fetch
    sources = [Source(collection=COLLECTION, object_id=i) for i in ids]
    cards, total = await service.resolve_sources([sources[0], *sources])
    assert total == 15 and len(cards) == 8
    assert cards[0].name == "First ticket"
    assert cards[1].missing
    assert fetch.await_count == 1
    assert fetch.call_args.kwargs["limit"] == 8


async def test_connection_is_reused_and_closed(monkeypatch):
    """Concurrent sessions share a client; shutdown closes it."""
    service = TicketService()
    monkeypatch.setenv("WEAVIATE_URL", "https://example.weaviate.network")
    monkeypatch.setenv("WEAVIATE_API_KEY", "test-placeholder")
    client = MagicMock()
    client.connect = AsyncMock()
    client.close = AsyncMock()
    client.collections.exists = AsyncMock(return_value=True)
    connect = MagicMock(return_value=client)
    monkeypatch.setattr(
        service_module.weaviate, "use_async_with_weaviate_cloud", connect
    )
    monkeypatch.setattr(service_module, "AsyncQueryAgent", MagicMock())
    async with service.lifespan(None):
        first, second = await asyncio.gather(service.get_agent(), service.get_agent())
        assert first is second and connect.call_count == 1
    client.close.assert_awaited_once()
    assert service.client is None


async def test_missing_configuration_is_actionable(monkeypatch):
    """A new checkout can render without credentials and explains setup on use."""
    monkeypatch.setattr(service_module, "load_dotenv", lambda: None)
    monkeypatch.delenv("WEAVIATE_URL", raising=False)
    monkeypatch.delenv("WEAVIATE_API_KEY", raising=False)
    with pytest.raises(SetupError, match="WEAVIATE_URL"):
        await TicketService().get_agent()


async def test_failed_connection_is_closed(monkeypatch):
    """A failed collection check must not leave a partially initialized client."""
    monkeypatch.setenv("WEAVIATE_URL", "https://example.weaviate.network")
    monkeypatch.setenv("WEAVIATE_API_KEY", "test-placeholder")
    client = MagicMock(connect=AsyncMock(), close=AsyncMock())
    client.collections.exists = AsyncMock(return_value=False)
    monkeypatch.setattr(
        service_module.weaviate, "use_async_with_weaviate_cloud", lambda **kw: client
    )
    service = TicketService()
    with pytest.raises(SetupError, match="load_data"):
        await service.get_agent()
    client.close.assert_awaited_once()
    assert service.agent is None


async def test_stream_releases_lock_and_rejects_duplicate_submission(monkeypatch):
    """Typing stays responsive during provider waits; duplicate asks do no work."""
    state = State(_reflex_internal_init=True)
    proxy = BackgroundProxy(state)
    started, release = asyncio.Event(), asyncio.Event()
    calls = []

    async def stream(conversation, status):
        assert not proxy._self_lock.locked()
        calls.append(conversation)
        yield ProgressMessage(stage="search", message="Searching tickets")
        yield StreamedTokens(delta="Draft")
        started.set()
        await release.wait()
        yield final_response("Finished")

    monkeypatch.setattr(service_module.service, "stream", stream)
    monkeypatch.setattr(
        service_module.service, "resolve_sources", AsyncMock(return_value=([], 0))
    )
    task = asyncio.create_task(State.ask.fn(proxy, {"question": "Login failures"}))
    try:
        await asyncio.wait_for(started.wait(), 2)
        async with proxy:
            State.set_question.fn(proxy, "Next question")
            State.clear.fn(proxy)
            assert state.turns[0].answer == "Draft"
        await State.ask.fn(proxy, {"question": "Duplicate"})
        release.set()
        await asyncio.wait_for(task, 2)
    finally:
        release.set()
        if not task.done():
            task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    assert State.ask.is_background
    assert len(calls) == 1
    assert state.turns[0].answer == "Finished" and state.turns[0].complete
    assert state.question == "Next question" and not state.busy
    assert State(_reflex_internal_init=True).turns == []


async def test_followup_contains_only_completed_session_history(monkeypatch):
    """Failed or partial answers must not become context for later questions."""
    state = State(_reflex_internal_init=True)
    state.turns = [Turn("Earlier", "Answer", complete=True), Turn("Failed", "Partial")]
    captured = []

    async def stream(conversation, status):
        captured.extend(conversation)
        yield final_response()

    monkeypatch.setattr(service_module.service, "stream", stream)
    monkeypatch.setattr(
        service_module.service, "resolve_sources", AsyncMock(return_value=([], 0))
    )
    await State.ask.fn(BackgroundProxy(state), {"question": "Which have workarounds?"})
    assert captured == [
        {"role": "user", "content": "Earlier"},
        {"role": "assistant", "content": "Answer"},
        {"role": "user", "content": "Which have workarounds?"},
    ]


async def test_interrupted_stream_restores_composer_without_leaking_errors(monkeypatch):
    """Provider response bodies are not displayed, even after partial output."""

    async def stream(conversation, status):
        yield StreamedTokens(delta="Partial")
        raise RuntimeError("private-provider-response-secret")

    monkeypatch.setattr(service_module.service, "stream", stream)
    state = State(_reflex_internal_init=True)
    await State.ask.fn(BackgroundProxy(state), {"question": "Hello"})
    assert not state.busy and not state.turns[0].complete
    assert state.turns[0].answer == "Partial"
    assert "secret" not in state.error and state.error
    assert state.question == "Hello"


async def test_source_lookup_failure_preserves_complete_answer(monkeypatch):
    """A source fetch error must not discard a successful response."""

    async def stream(conversation, status):
        yield final_response()

    monkeypatch.setattr(service_module.service, "stream", stream)
    monkeypatch.setattr(
        service_module.service,
        "resolve_sources",
        AsyncMock(side_effect=RuntimeError("private")),
    )
    state = State(_reflex_internal_init=True)
    await State.ask.fn(BackgroundProxy(state), {"question": "Hello"})
    assert state.turns[0].complete and state.turns[0].answer == "A complete answer."
    assert "could not be loaded" in state.turns[0].note and not state.busy


def test_reimport_skips_existing_deterministic_ids():
    """Loading the same data twice creates no duplicate records."""
    collection = MagicMock()
    collection.query.fetch_objects.return_value = SimpleNamespace(objects=[])
    collection.batch.failed_objects = []
    assert (
        import_rows(collection, [{"ticket_id": "SUP-101", "title": "Login fails"}]) == 1
    )
    batch = collection.batch.dynamic.return_value.__enter__.return_value
    uid = batch.add_object.call_args.kwargs["uuid"]
    collection.query.fetch_objects.return_value = SimpleNamespace(
        objects=[SimpleNamespace(uuid=UUID(uid))]
    )
    assert (
        import_rows(collection, [{"ticket_id": "SUP-101", "title": "Login fails"}]) == 0
    )
    assert batch.add_object.call_count == 1


def test_status_change_resets_conversation_and_rejects_invalid_values():
    """Changing scope cannot retain context from a different ticket subset."""
    state = State(_reflex_internal_init=True)
    state.turns = [Turn("Old", "Answer", complete=True)]
    State.set_status.fn(state, "Open")
    assert state.status == "Open" and state.turns == []
    state.turns = [Turn("New")]
    state.busy = True
    State.set_status.fn(state, "Resolved")
    assert state.status == "Open" and len(state.turns) == 1
    state.busy = False
    State.set_status.fn(state, "Unrecognized")
    assert state.status == "Open" and len(state.turns) == 1


async def test_status_filter_is_per_request_not_shared():
    """Concurrent visitors pass independent database filters to the shared agent."""
    captured = []

    async def ask_stream(conversation, collections, result_evaluation):
        assert result_evaluation == "llm"
        captured.append(collections[0].model_dump(mode="json"))
        yield "event"

    instance = TicketService()
    instance.get_agent = AsyncMock(return_value=SimpleNamespace(ask_stream=ask_stream))

    async def collect(status):
        return [event async for event in instance.stream([], status)]

    await asyncio.gather(collect("Open"), collect("Resolved"), collect("All statuses"))
    assert captured[0]["additional_filters"]["value"] == "Open"
    assert captured[1]["additional_filters"]["value"] == "Resolved"
    assert captured[2]["additional_filters"] is None
    with pytest.raises(ValueError, match="Unknown ticket status"):
        await collect("unknown")


async def test_source_lookup_applies_status_filter():
    """Fetching cards cannot silently broaden the current query's scope."""
    instance = TicketService()
    fetch = AsyncMock(return_value=SimpleNamespace(objects=[]))
    instance.client = MagicMock()
    instance.client.collections.use.return_value.query.fetch_objects = fetch
    await instance.resolve_sources(
        [Source(collection=COLLECTION, object_id=str(UUID(int=1)))], "Open"
    )
    filters = fetch.call_args.kwargs["filters"]
    assert filters.operator.value == "And"
    assert filters.filters[1].value == "Open"


def test_fixture_is_small_consistent_and_covers_statuses():
    """The bundled example contains predictable records without duplicate IDs."""
    from tickets.load_data import sample_rows

    rows = sample_rows()
    assert len(rows) == len({r["ticket_id"] for r in rows}) == 24
    assert {r["status"] for r in rows} == {"Open", "In progress", "Resolved"}
    assert {r["product"] for r in rows} == {"Identity", "Billing", "Reports", "API"}
    assert any(not r["workaround"] for r in rows)


def test_ticket_links_only_resolve_known_records():
    """Link known IDs inline, preserving unknown IDs, code blocks, and URLs."""
    from tickets.links import link_tickets

    card = source_card(COLLECTION, "one", {"ticket_id": "SUP-101"})
    answer = "**SUP-101** and `SUP-101`; SUP-999.\n```\nSUP-101\n```\n[SUP-101](https://example.com)"
    rendered = link_tickets(answer, [card], 2)
    assert (
        rendered
        == "**[SUP-101](#ticket-2-SUP-101)** and [SUP-101](#ticket-2-SUP-101); SUP-999.\n```\nSUP-101\n```\n[SUP-101](https://example.com)"
    )


def test_ticket_dialog_uses_the_requested_turn():
    """Identical IDs in separate answers must open the corresponding record."""
    first = source_card(
        COLLECTION, "one", {"ticket_id": "SUP-101", "title": "First report"}
    )
    second = source_card(
        COLLECTION, "two", {"ticket_id": "SUP-101", "title": "Later report"}
    )
    state = State(_reflex_internal_init=True)
    state.turns = [
        Turn(question="First", sources=[first]),
        Turn(question="Second", sources=[second]),
    ]
    state.open_ticket("#ticket-1-SUP-101")
    assert state.ticket_open and state.selected_source.object_id == "two"
    state.set_ticket_open(False)
    state.open_ticket("#ticket-8-SUP-101")
    assert not state.ticket_open
