"""Collection constants and display models for the ticket explorer."""

from dataclasses import dataclass, field

COLLECTION = "ReflexSupportTickets"
COLLECTIONS = [COLLECTION]
MAX_SOURCES = 8
STATUSES = ["All statuses", "Open", "In progress", "Resolved"]


@dataclass
class SourceCard:
    """A ticket displayed using stored properties, without model-generated fields."""

    object_id: str
    collection: str
    name: str
    ticket_id: str = ""
    status: str = ""
    priority: str = ""
    product: str = ""
    description: str = ""
    workaround: str = ""
    missing: bool = False


@dataclass
class Turn:
    """A question, its filter scope, answer, and supporting records."""

    question: str
    answer: str = ""
    answer_markdown: str = ""
    sources: list[SourceCard] = field(default_factory=list)
    note: str = ""
    complete: bool = False
    status: str = "All statuses"


def source_card(collection: str, object_id: str, properties: dict | None) -> SourceCard:
    """Convert stored ticket properties into a source card."""
    if properties is None:
        return SourceCard(
            object_id,
            collection,
            "Ticket unavailable",
            description="This ticket was not returned within the selected status.",
            missing=True,
        )
    return SourceCard(
        object_id=object_id,
        collection=collection,
        name=str(properties.get("title") or "Untitled ticket"),
        ticket_id=str(properties.get("ticket_id") or ""),
        status=str(properties.get("status") or ""),
        priority=str(properties.get("priority") or ""),
        product=str(properties.get("product") or ""),
        description=str(properties.get("description") or "No description provided."),
        workaround=str(properties.get("workaround") or "No workaround documented."),
    )
