"""Session-isolated conversation state and streaming updates."""

import asyncio
import logging

import reflex as rx
from weaviate.agents.classes import AskModeResponse, ProgressMessage, StreamedTokens

from tickets.links import link_tickets
from tickets.models import STATUSES, SourceCard, Turn
from tickets.service import SetupError, service

logger = logging.getLogger(__name__)


class State(rx.State):
    """Keep each visitor's conversation separate from shared API resources."""

    status: str = "All statuses"
    question: str = ""
    turns: list[Turn] = []
    busy: bool = False
    progress: str = ""
    error: str = ""
    ticket_open: bool = False
    selected_source: SourceCard = SourceCard("", "", "")

    @rx.var
    def ticket_lookup(self) -> dict[str, SourceCard]:
        """Resolve links against the source records from their own answer."""
        return {
            f"#ticket-{index}-{source.ticket_id}": source
            for index, turn in enumerate(self.turns)
            for source in turn.sources
            if source.ticket_id and not source.missing
        }

    @rx.event
    def open_ticket(self, reference: str):
        """Open only a known source from this visitor's conversation."""
        if reference in self.ticket_lookup:
            self.selected_source = self.ticket_lookup[reference]
            self.ticket_open = True

    @rx.event
    def set_ticket_open(self, value: bool):
        """Handle closing the dialog by button, Escape, or outside click."""
        self.ticket_open = value

    @rx.event
    def set_question(self, value: str):
        """Update the composer."""
        self.question = value

    @rx.event
    def suggest(self, question: str):
        """Put an example question into the composer for review."""
        self.question = question

    @rx.event
    def clear(self):
        """Clear this session once its current answer has finished."""
        if not self.busy:
            self.turns = []
            self.ticket_open = False
            self.question = self.error = ""

    @rx.event
    def set_status(self, value: str):
        """Start fresh when the search scope changes; ignore changes while busy."""
        if not self.busy and value in STATUSES and value != self.status:
            self.status = value
            self.turns = []
            self.ticket_open = False
            self.question = self.error = ""

    # START StreamAnswer
    @rx.event(background=True)
    async def ask(self, form_data: dict):
        """Stream a question without holding the session lock during API waits."""
        async with self:
            question = str(form_data.get("question", "")).strip()
            if self.busy or not question:
                return
            if len(question) > 2000:
                self.error = "Keep your question under 2,000 characters."
                return
            # START ConversationHistory
            conversation = []
            for turn in self.turns[-6:]:
                if turn.complete:
                    conversation.extend(
                        [
                            {"role": "user", "content": turn.question},
                            {"role": "assistant", "content": turn.answer},
                        ]
                    )
            conversation.append({"role": "user", "content": question})
            # END ConversationHistory
            status = self.status
            index = len(self.turns)
            self.turns.append(Turn(question=question, status=status))
            self.busy = True
            self.question = self.error = ""
            self.progress = "Searching support tickets…"
        try:
            final_received = False
            async with asyncio.timeout(120):
                # START StreamPayloads
                async for event in service.stream(conversation, status):
                    if isinstance(event, ProgressMessage):
                        async with self:
                            self.progress = event.message
                    elif isinstance(event, StreamedTokens):
                        async with self:
                            self.turns[index].answer += event.delta
                    elif isinstance(event, AskModeResponse):
                        async with self:
                            self.turns[index].answer = event.final_answer
                            self.turns[index].complete = True
                            self.progress = "Loading source details…"
                        final_received = True
                        # END StreamPayloads
                        try:
                            cards, count = await service.resolve_sources(
                                event.sources or [], status
                            )
                        except Exception:
                            async with self:
                                self.turns[
                                    index
                                ].note = "The answer arrived, but source details could not be loaded."
                        else:
                            async with self:
                                self.turns[index].sources = cards
                                self.turns[index].answer_markdown = link_tickets(
                                    self.turns[index].answer, cards, index
                                )
                                self.turns[index].note = (
                                    f"Showing {len(cards)} of {count} retrieved sources."
                                    if count > len(cards)
                                    else "No individual source records were returned."
                                    if not cards
                                    else ""
                                )
                if not final_received:
                    raise RuntimeError(
                        "The answer stream ended before its final payload."
                    )
        except SetupError as exc:
            async with self:
                self.error = str(exc)
        except Exception as exc:
            # Never expose provider response bodies or credentials in the UI or logs.
            logger.warning("Query failed (%s)", type(exc).__name__)
            async with self:
                self.error = (
                    "The request did not finish. Check your connection, Query Agent access, "
                    "and Cloud usage limits, then retry."
                )
                self.turns[index].note = "This response may be incomplete."
        finally:
            async with self:
                if self.error and not self.question:
                    self.question = question
                self.busy = False
                self.progress = ""

    # END StreamAnswer
