"""A focused support investigation workspace with original source tickets."""

import reflex as rx

from tickets.models import STATUSES, Turn
from tickets.service import service
from tickets.state import State


def status_badge(status: rx.Var[str]) -> rx.Component:
    """Give each ticket status a readable label and a distinct visual marker."""
    return rx.el.span(
        rx.el.span(class_name="status-dot"),
        status,
        class_name=rx.match(
            status,
            ("Open", "status-pill status-open"),
            ("In progress", "status-pill status-progress"),
            ("Resolved", "status-pill status-resolved"),
            "status-pill status-all",
        ),
    )


def inline_ticket(*children, **props) -> rx.Component:
    """Keep ticket references inside the answer and open their original record."""
    href = rx.Var("props.href", _var_type=str).to(str)
    return rx.el.span(
        rx.cond(
            State.ticket_lookup.contains(href),
            rx.el.button(
                *children,
                type="button",
                on_click=State.open_ticket(href),
                aria_haspopup="dialog",
                title="Open original ticket",
                class_name="inline-ticket",
            ),
            rx.link(*children, href=href, is_external=True),
        ),
        class_name="inline-ticket-wrapper",
    )


def ticket_dialog() -> rx.Component:
    """Show a ticket only when its inline reference is selected."""
    source = State.selected_source
    return rx.dialog.root(
        rx.dialog.content(
            rx.box(
                rx.box(
                    rx.icon("ticket", size=18),
                    rx.text(source.ticket_id, class_name="ticket-id"),
                    status_badge(source.status),
                    class_name="dialog-meta",
                ),
                rx.dialog.close(
                    rx.el.button(
                        rx.icon("x", size=18),
                        class_name="icon-button",
                        aria_label="Close ticket",
                    )
                ),
                class_name="dialog-top",
            ),
            rx.dialog.title(source.name, class_name="dialog-title"),
            rx.dialog.description(
                "Original ticket from the sample dataset.",
                class_name="dialog-description",
            ),
            rx.box(
                rx.box(
                    rx.text("Product", class_name="detail-label"),
                    rx.text(source.product, class_name="detail-value"),
                ),
                rx.box(
                    rx.text("Priority", class_name="detail-label"),
                    rx.text(source.priority, class_name="detail-value"),
                ),
                class_name="ticket-properties",
            ),
            rx.box(
                rx.heading("Reported issue", size="3"),
                rx.text(source.description, class_name="ticket-body"),
                class_name="issue-section",
            ),
            rx.box(
                rx.box(
                    rx.icon("wrench", size=17),
                    rx.heading("Documented workaround", size="3"),
                    class_name="workaround-title",
                ),
                rx.text(source.workaround, class_name="ticket-body"),
                class_name="workaround",
            ),
            rx.el.details(
                rx.el.summary("Database record"),
                rx.text(source.collection),
                rx.code(source.object_id),
                class_name="record-details",
            ),
            rx.box(
                rx.text("Check the original report before acting on an answer."),
                rx.dialog.close(
                    rx.el.button("Done", type="button", class_name="primary-button")
                ),
                class_name="dialog-footer",
            ),
            class_name="ticket-dialog",
        ),
        open=State.ticket_open,
        on_open_change=State.set_ticket_open,
    )


def conversation_turn(turn: Turn) -> rx.Component:
    """Render one answer with inline links to its original ticket records."""
    return rx.el.article(
        rx.box(
            rx.box(
                rx.box(
                    rx.text("You asked", class_name="section-label"),
                    status_badge(turn.status),
                    class_name="question-meta",
                ),
                rx.heading(turn.question, class_name="question-heading"),
                class_name="question-block",
            ),
            rx.box(
                rx.box(rx.icon("scan-search", size=17), class_name="answer-mark"),
                rx.text("Triage", class_name="answer-name"),
                rx.cond(turn.complete, rx.text("Answer", class_name="answer-label")),
                class_name="answer-byline",
            ),
            rx.cond(
                turn.answer != "",
                rx.box(
                    rx.markdown(
                        rx.cond(
                            turn.answer_markdown != "",
                            turn.answer_markdown,
                            turn.answer,
                        ),
                        component_map={"a": inline_ticket},
                    ),
                    class_name="answer",
                ),
                rx.text(
                    rx.cond(
                        State.busy & (turn.note == ""),
                        "Searching the selected tickets…",
                        "The request did not complete.",
                    ),
                    class_name="pending-answer",
                ),
            ),
            rx.cond(turn.note != "", rx.text(turn.note, class_name="answer-note")),
            class_name="answer-column",
        ),
        class_name="conversation-turn",
    )


def sidebar() -> rx.Component:
    """Keep the search scope visible without adding nonfunctional navigation."""
    return rx.el.aside(
        rx.box(
            rx.box(rx.icon("inbox", size=21), class_name="brand-mark"),
            rx.box(
                rx.text("Triage", class_name="brand-name"),
                rx.text("Support workspace", class_name="brand-caption"),
            ),
            class_name="brand",
        ),
        rx.box(
            rx.text("Search scope", class_name="sidebar-label"),
            rx.box(
                *[
                    rx.el.button(
                        rx.icon(icon, size=17),
                        rx.text(label),
                        rx.cond(
                            State.status == label,
                            rx.icon("check", size=15, class_name="filter-check"),
                        ),
                        on_click=State.set_status(label),
                        disabled=State.busy,
                        aria_pressed=State.status == label,
                        type="button",
                        class_name=rx.cond(
                            State.status == label,
                            "scope-option selected",
                            "scope-option",
                        ),
                    )
                    for label, icon in zip(
                        STATUSES,
                        ["layers-2", "circle", "circle-dashed", "circle-check"],
                        strict=True,
                    )
                ],
                class_name="scope-options",
                role="group",
                aria_label="Filter tickets by status",
            ),
            rx.text(
                "Changing scope starts a new investigation.", class_name="scope-help"
            ),
            class_name="scope-section",
        ),
        rx.box(
            rx.box(
                rx.icon("database", size=16),
                rx.text("Sample dataset", class_name="dataset-title"),
                class_name="dataset-heading",
            ),
            rx.text(
                "Fictional support tickets for Identity, Billing, Reports, and API.",
                class_name="dataset-description",
            ),
            rx.box(
                rx.el.span(class_name="dataset-dot"),
                rx.text("Read-only example"),
                class_name="dataset-footnote",
            ),
            class_name="dataset-note",
        ),
        class_name="sidebar",
    )


def empty_state() -> rx.Component:
    """Offer useful starting questions without hiding the composer."""
    return rx.box(
        rx.box(rx.icon("messages-square", size=26), class_name="welcome-mark"),
        rx.heading("What needs investigating?", class_name="welcome-title"),
        rx.text(
            "Find related issues and documented workarounds. Select a ticket ID in the answer to check the original report.",
            class_name="welcome-description",
        ),
        rx.box(
            *[
                rx.el.button(
                    rx.box(rx.icon(icon, size=18), class_name="prompt-icon"),
                    rx.box(
                        rx.text(label, class_name="prompt-title"),
                        rx.text(detail, class_name="prompt-detail"),
                    ),
                    rx.icon("arrow-up-right", size=17, class_name="prompt-arrow"),
                    on_click=State.suggest(prompt),
                    type="button",
                    class_name="prompt-row",
                )
                for icon, label, detail, prompt in [
                    (
                        "key-round",
                        "Investigate sign-in failures",
                        "Find related login and authentication tickets",
                        "Which tickets describe login or sign-in failures? Include ticket IDs.",
                    ),
                    (
                        "wrench",
                        "Find a documented workaround",
                        "Look for next steps recorded in export tickets",
                        "Which report export tickets have a documented workaround?",
                    ),
                    (
                        "webhook",
                        "Understand webhook issues",
                        "Review delivery failures and signature checks",
                        "Summarize the webhook delivery and signature problems. Include ticket IDs.",
                    ),
                ]
            ],
            class_name="prompt-list",
        ),
        class_name="empty-state",
    )


def composer() -> rx.Component:
    """Anchor the input below the scrolling investigation, with clear scope."""
    return rx.el.footer(
        rx.cond(
            State.error != "",
            rx.callout(
                State.error,
                icon="circle-alert",
                color_scheme="red",
                class_name="error-banner",
            ),
        ),
        rx.cond(
            State.busy,
            rx.box(
                rx.spinner(size="1"),
                rx.text(State.progress),
                role="status",
                aria_live="polite",
                class_name="progress-line",
            ),
        ),
        rx.form(
            rx.box(
                rx.input(
                    name="question",
                    placeholder=rx.cond(
                        State.turns.length() > 0,
                        "Ask a follow-up question…",
                        "Ask about your support tickets…",
                    ),
                    value=State.question,
                    on_change=State.set_question,
                    max_length=2000,
                    auto_complete=False,
                    aria_label="Ask about support tickets",
                    class_name="question-input",
                ),
                rx.el.button(
                    rx.text("Ask"),
                    rx.icon("arrow-up", size=17),
                    type="submit",
                    disabled=State.busy | (State.question.strip() == ""),
                    aria_label="Send question",
                    class_name="send-button",
                ),
                class_name="composer-row",
            ),
            rx.box(
                rx.box(
                    rx.icon("list-filter", size=13),
                    rx.text(State.status),
                    class_name="composer-scope",
                ),
                rx.text("Enter to send", class_name="composer-keyboard"),
                class_name="composer-meta",
            ),
            on_submit=State.ask,
            class_name="composer",
        ),
        rx.text(
            "Answers can be wrong. Check the source tickets.",
            class_name="composer-hint",
        ),
        class_name="composer-dock",
    )


def index() -> rx.Component:
    """Build a responsive workspace with independent content and composer areas."""
    return rx.box(
        ticket_dialog(),
        sidebar(),
        rx.box(
            rx.el.header(
                rx.box(
                    rx.icon("messages-square", size=18),
                    rx.heading("Investigations", size="3"),
                    class_name="workspace-heading",
                ),
                rx.el.button(
                    rx.icon("plus", size=16),
                    rx.text("New investigation"),
                    on_click=State.clear,
                    disabled=State.busy,
                    class_name="new-button",
                    type="button",
                ),
                class_name="workspace-header",
            ),
            rx.el.main(
                rx.cond(
                    State.turns.length() == 0,
                    empty_state(),
                    rx.box(
                        rx.foreach(State.turns, conversation_turn),
                        class_name="conversation",
                    ),
                ),
                class_name="workspace-content",
            ),
            composer(),
            class_name="workspace",
        ),
        class_name="app-shell",
    )


app = rx.App(stylesheets=["/tickets.css"])
app.add_page(
    index,
    title="Triage | Reflex + Weaviate",
    description="Investigate fictional support tickets with streaming answers and original source records.",
)
app.register_lifespan_task(service.lifespan)
