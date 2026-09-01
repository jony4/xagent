import { describe, expect, it } from "vitest";

import { expectsUserResponse, getMessageSurface } from "./message-surface";

describe("message surface contract", () => {
  it("keeps ordinary agent messages in chat without waiting", () => {
    const data = { message_type: "info", expect_response: false };

    expect(getMessageSurface("agent_message", data)).toBe("chat");
    expect(expectsUserResponse("agent_message", data)).toBe(false);
  });

  it("routes progress and explicit timeline messages to the timeline", () => {
    expect(getMessageSurface("agent_progress", {})).toBe("timeline");
    expect(
      getMessageSurface("agent_message", { message_type: "progress" }),
    ).toBe("timeline");
    expect(getMessageSurface("agent_message", { display: "timeline" })).toBe(
      "timeline",
    );
  });

  it("preserves status and final-answer stream surfaces", () => {
    expect(getMessageSurface("agent_status", {})).toBe("status");
    expect(getMessageSurface("final_answer_delta", {})).toBe("stream");
  });

  it("keeps questions visible and preserves legacy question waiting", () => {
    const legacyQuestion = { message_type: "question", expect_response: false };
    const waitingQuestion = { message_type: "question", expect_response: true };

    expect(getMessageSurface("agent_message", legacyQuestion)).toBe("chat");
    expect(expectsUserResponse("agent_message", legacyQuestion)).toBe(true);
    expect(expectsUserResponse("agent_message", waitingQuestion)).toBe(true);
    expect(
      getMessageSurface("agent_message", {
        expect_response: true,
        visible: false,
      }),
    ).toBe("chat");
  });

  it("honors hidden messages before any display hint", () => {
    expect(
      getMessageSurface("agent_message", { visible: false, display: "chat" }),
    ).toBe("ignore");
  });

  it("uses metadata display and ignores invalid display values", () => {
    expect(
      getMessageSurface("agent_message", {
        metadata: { display: "timeline" },
      }),
    ).toBe("timeline");
    expect(getMessageSurface("agent_message", { display: "unsupported" })).toBe(
      "chat",
    );
  });

  it("keeps transcript event types chat-visible by default", () => {
    expect(getMessageSurface("ai_message", {})).toBe("chat");
    expect(getMessageSurface("chat_message", {})).toBe("chat");
  });
});
