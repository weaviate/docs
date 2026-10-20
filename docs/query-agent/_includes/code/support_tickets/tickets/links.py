"""Connect ticket references to retrieved records without changing chat history."""

import re

from tickets.models import SourceCard

_TOKENS = re.compile(
    r"```[\s\S]*?(?:```|\Z)|~~~[\s\S]*?(?:~~~|\Z)"
    r"|!?\[[^\]\n]*\]\([^\n)]*\)|\[[^\]\n]*\]\[[^\]\n]*\]"
    r"|`+[^`\n]*`+|\b[A-Z][A-Z0-9]*-\d+\b"
)


def link_tickets(answer: str, sources: list[SourceCard], turn: int) -> str:
    """Link known ticket IDs, preserving code blocks and existing Markdown links."""
    known = {source.ticket_id for source in sources if not source.missing}

    def replace(match: re.Match) -> str:
        """Replace a bare or inline-code ticket ID with its local reference."""
        token = match.group(0)
        ticket_id = token.strip("`")
        if ticket_id in known:
            return f"[{ticket_id}](#ticket-{turn}-{ticket_id})"
        return token

    return _TOKENS.sub(replace, answer)
