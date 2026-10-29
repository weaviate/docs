"""Run explicitly to verify two hosted Query Agent calls after loading data."""

import asyncio

from weaviate.agents.classes import AskModeResponse, StreamedTokens

from tickets.service import service


async def main():
    """Check streaming, follow-up responses, and resolvable sources."""
    history = []
    async with service.lifespan(None):
        for question in [
            "Which tickets describe login or sign-in failures? Include ticket IDs.",
            "Which of those tickets have a documented workaround?",
        ]:
            history.append({"role": "user", "content": question})
            final = None
            chunks = 0
            async with asyncio.timeout(120):
                async for event in service.stream(history, "Open"):
                    if isinstance(event, StreamedTokens):
                        chunks += 1
                    elif isinstance(event, AskModeResponse):
                        final = event
            assert final is not None and final.final_answer.strip()
            assert chunks > 0, "No answer tokens were streamed."
            cards, count = await service.resolve_sources(final.sources or [], "Open")
            assert cards and any(not card.missing for card in cards), (
                "No source objects resolved."
            )
            assert all(card.status == "Open" for card in cards if not card.missing)
            print(
                f"Received answer: {chunks} chunks, {count} sources, {len(cards)} cards."
            )
            print(final.final_answer)
            history.append({"role": "assistant", "content": final.final_answer})


if __name__ == "__main__":
    asyncio.run(main())
