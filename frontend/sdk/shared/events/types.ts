/** SDK event map — extends plugin events with OS-level lifecycle events */
export type SDKEventMap = {
  ToolLoaded: { moduleId: string; route: string };
  ProjectOpened: { moduleId: string; projectId: string };
  ChatStarted: { moduleId: string; sessionId: string };
  AgentFinished: { moduleId: string; agentId: string; ok: boolean };
  DeploymentComplete: { moduleId: string; target: string };
  FileGenerated: { moduleId: string; path: string };
  DatabaseUpdated: { moduleId: string; collection: string };
  PluginInstalled: { pluginId: string; version: string };
  WorkflowCompleted: { moduleId: string; workflowId: string };
  ModuleStateChanged: { moduleId: string; state: string };
  SDKRegistered: { moduleId: string; targets: string[] };
};

export type SDKEventName = keyof SDKEventMap;

export type SDKEventHandler<K extends SDKEventName = SDKEventName> = (
  payload: SDKEventMap[K],
) => void;
