from __future__ import annotations

from typing import Literal, cast

MessageDisplay = Literal["chat", "timeline", "status", "stream", "ignore"]

MESSAGE_DISPLAYS = frozenset({"chat", "timeline", "status", "stream", "ignore"})
FINAL_ANSWER_EVENT_TYPES = frozenset(
    {
        "final_answer_start",
        "final_answer_delta",
        "final_answer_end",
        "final_answer_error",
    }
)


def resolve_message_display(
    *,
    display: str | None = None,
    event_type: str | None = None,
    message_type: str | None = None,
    expect_response: bool = False,
    visible: bool = True,
) -> MessageDisplay:
    """Resolve where an outbound message is rendered.

    Visibility and response waiting are deliberately separate concerns. A
    response-bearing message is always chat-visible, while legacy messages
    without an explicit display retain their established semantic defaults.
    """

    if expect_response or message_type == "question":
        return "chat"
    if not visible:
        return "ignore"
    if isinstance(display, str) and display in MESSAGE_DISPLAYS:
        return cast(MessageDisplay, display)
    if event_type in FINAL_ANSWER_EVENT_TYPES:
        return "stream"
    if event_type == "agent_status":
        return "status"
    if event_type == "agent_progress" or message_type == "progress":
        return "timeline"
    if event_type in {
        "agent_message",
        "ai_message",
        "chat_message",
        "user_message",
    }:
        return "chat"
    return "timeline"
