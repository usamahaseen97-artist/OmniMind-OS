import { omniAIApiClient } from "../../core/ai/OmniAIApiClient";

/** @deprecated Prefer omniAIApiClient — retained for bridge backward compatibility. */
export const omnicoreAiApi = {
  listAgents: () => omniAIApiClient.listAgents(),
  saveAgents: omniAIApiClient.saveAgents.bind(omniAIApiClient),
  listPrompts: () => omniAIApiClient.listPrompts(),
  savePrompt: omniAIApiClient.savePrompt.bind(omniAIApiClient),
  complete: omniAIApiClient.complete.bind(omniAIApiClient),
  listConversations: omniAIApiClient.listConversations.bind(omniAIApiClient),
  saveConversation: omniAIApiClient.saveConversation.bind(omniAIApiClient),
  listMemory: omniAIApiClient.listMemory.bind(omniAIApiClient),
  gatewayStatus: () => omniAIApiClient.gatewayStatus(),
};
