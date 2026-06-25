import { omniAI } from "../ai/OmniAI";
import type { AIValidationResult } from "./types";

/** OmniAIValidator — prompt pipeline, memory, conversation, provider validation. */
export class OmniAIValidator {
  results: AIValidationResult[] = [];

  validatePromptPipeline(templateId?: string) {
    const rendered = templateId
      ? omniAI.promptEngine.render(templateId, {})
      : omniAI.promptEngine.optimize("test prompt");
    const passed = !!rendered;
    const result = { check: "prompt_pipeline", passed, detail: passed ? "render_ok" : "render_failed" };
    this.results.push(result);
    return result;
  }

  validateMemory() {
    omniAI.memory.set("session", "qa-test", "value");
    const entry = omniAI.memory.get("session", "qa-test");
    const passed = entry?.value === "value";
    const result = { check: "memory", passed, detail: passed ? "read_write_ok" : "memory_mismatch" };
    this.results.push(result);
    return result;
  }

  validateConversation() {
    const conv = omniAI.conversations.create("developer-agent", "qa", "QA Test");
    const msg = omniAI.conversations.append(conv.id, "user", "hello");
    const passed = !!msg && conv.messages.length === 1;
    const result = { check: "conversation", passed, detail: passed ? "append_ok" : "conversation_failed" };
    this.results.push(result);
    return result;
  }

  validateProviderRegistry() {
    const providers = omniAI.providers.list();
    const passed = providers.length > 0;
    const result = { check: "providers", passed, detail: `${providers.length} providers` };
    this.results.push(result);
    return result;
  }

  validateInferenceQueue() {
    const job = omniAI.queue.enqueue("qa prompt", { priority: 0 });
    const passed = job.status === "queued";
    const result = { check: "inference_queue", passed, detail: job.id };
    this.results.push(result);
    return result;
  }

  runAll() {
    this.results = [];
    this.validateProviderRegistry();
    this.validatePromptPipeline();
    this.validateMemory();
    this.validateConversation();
    this.validateInferenceQueue();
    return this.results;
  }

  allPassed() {
    return this.results.every((r) => r.passed);
  }
}

export const omniAIValidator = new OmniAIValidator();
