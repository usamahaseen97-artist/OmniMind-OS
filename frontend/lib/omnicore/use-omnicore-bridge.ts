"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createScopedRegistry } from "../shared/memory-registry";
import {
  omniCore,
  type AccessibilityPrefs,
  type LocaleId,
  type OmniProject,
  type OmniToolSlug,
  type ThemeId,
} from "../../core/omnicore";
import type { OmniCoreContextSlice } from "./omnicore-context-types";
import { omnicoreApi } from "./omnicore-api";
import type { AiAgentId } from "../../core/ai/types";
import type { CompleteOptions } from "../../core/ai/OmniAI";
import { omnicoreAiApi } from "./omnicore-ai-api";
import type { AssetSearchFilter } from "../../core/assets/types";
import type { ExplorerView } from "../../core/assets/types";
import { omnicoreAssetsApi } from "./omnicore-assets-api";
import type { OmniPluginType } from "../../core/plugins/omnicore-platform/types";
import { omnicorePluginsApi } from "./omnicore-plugins-api";
import { omnicoreCollaborationApi } from "./omnicore-collaboration-api";
import { omnicoreSecurityApi } from "./omnicore-security-api";
import type { OrgPermission, OrgRole } from "../../core/collaboration/types";

export function useOmniCoreBridge(): OmniCoreContextSlice {
  const [coreReady, setCoreReady] = useState(false);
  const [projects, setProjects] = useState(omniCore.projects.projects);
  const [workspacePresets, setWorkspacePresets] = useState(omniCore.workspace.presets);
  const [activeWorkspacePresetId, setActiveWorkspacePresetId] = useState(omniCore.workspace.activePresetId);
  const [layoutPresets, setLayoutPresets] = useState(omniCore.layout.presets);
  const [dockState, setDockState] = useState(omniCore.dock.snapshot());
  const [notifications, setNotifications] = useState(omniCore.notifications.items);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(omniCore.commandPalette.open);
  const [commandQuery, setCommandQueryState] = useState(omniCore.commandPalette.query);
  const [searchQuery, setSearchQueryState] = useState(omniCore.search.query);
  const [searchResults, setSearchResults] = useState(omniCore.search.search(""));
  const [locale, setLocaleState] = useState(omniCore.i18n.locale);
  const [accessibility, setAccessibility] = useState(omniCore.accessibility.get());
  const [session, setSession] = useState(omniCore.session.get());
  const [activeThemeId, setActiveThemeId] = useState(omniCore.theme.activeThemeId);
  const [aiReady, setAiReady] = useState(false);
  const [aiAgents, setAiAgents] = useState(omniCore.ai.agents.list());
  const [activeAgentId, setActiveAgentId] = useState<AiAgentId | null>(omniCore.ai.agentManager.activeAgentId);
  const [aiModels, setAiModels] = useState(omniCore.ai.models.list());
  const [activeModelId, setActiveModelId] = useState(omniCore.ai.models.activeModelId);
  const [aiProviders] = useState(omniCore.ai.providers.list());
  const [aiMonitoring, setAiMonitoring] = useState(omniCore.ai.monitoring());
  const [inferenceQueue, setInferenceQueue] = useState(omniCore.ai.queue.list());
  const [assetsReady, setAssetsReady] = useState(false);
  const [universalProjects, setUniversalProjects] = useState(omniCore.assets.projects.projects);
  const [activeUniversalProjectId, setActiveUniversalProjectId] = useState(omniCore.assets.projects.activeProjectId);
  const [assetList, setAssetList] = useState(omniCore.assets.assets.assets);
  const [explorerView, setExplorerViewState] = useState<ExplorerView>(omniCore.assets.explorer.view);
  const [collections, setCollections] = useState(omniCore.assets.collections.list());
  const [cloudSync, setCloudSync] = useState(omniCore.assets.cloud.state);
  const [favoriteAssets, setFavoriteAssets] = useState(omniCore.assets.favorites.listAssets());
  const [pluginsReady, setPluginsReady] = useState(false);
  const [extensionPlugins, setExtensionPlugins] = useState(omniCore.plugins.registry.list());
  const [marketplaceListings, setMarketplaceListings] = useState(omniCore.plugins.marketplace.listings);
  const [collaborationReady, setCollaborationReady] = useState(false);
  const [organizations, setOrganizations] = useState(omniCore.collaboration.organization.list());
  const [activeOrgId, setActiveOrgId] = useState<string | null>(omniCore.collaboration.organization.activeOrgId);
  const [orgMembers, setOrgMembers] = useState(omniCore.collaboration.organization.members);
  const [orgWorkspaces, setOrgWorkspaces] = useState(omniCore.collaboration.orgWorkspace.workspaces);
  const [collabNotifications, setCollabNotifications] = useState(omniCore.collaboration.notifications.items);
  const [activityEvents, setActivityEvents] = useState(omniCore.collaboration.activity.events);
  const [securityReady, setSecurityReady] = useState(false);

  useEffect(() => {
    const registry = createScopedRegistry();
    omniCore.boot();
    setCoreReady(true);
    setAiReady(true);
    setAssetsReady(true);
    setPluginsReady(true);
    setCollaborationReady(true);
    setSecurityReady(true);
    void omnicoreSecurityApi.threatDashboard().then((r) => {
      if (r.dashboard) {
        /* sync server security state when available */
      }
    }).catch(() => undefined);
    void omnicoreCollaborationApi.listOrganizations().then((r) => {
      if (r.organizations?.length) {
        omniCore.collaboration.organization.organizations = r.organizations;
        setOrganizations([...r.organizations]);
        const orgId = r.organizations[0]?.id;
        if (orgId) {
          omniCore.collaboration.organization.setActive(orgId);
          setActiveOrgId(orgId);
          void omnicoreCollaborationApi.listMembers(orgId).then((mr) => {
            if (mr.members?.length) {
              omniCore.collaboration.organization.members = mr.members;
              setOrgMembers([...mr.members]);
            }
          }).catch(() => undefined);
          void omnicoreCollaborationApi.listWorkspaces(orgId).then((wr) => {
            if (wr.workspaces?.length) {
              omniCore.collaboration.orgWorkspace.workspaces = wr.workspaces;
              setOrgWorkspaces([...wr.workspaces]);
            }
          }).catch(() => undefined);
          void omnicoreCollaborationApi.listActivity(orgId).then((ar) => {
            if (ar.events?.length) {
              omniCore.collaboration.activity.events = ar.events;
              setActivityEvents([...ar.events]);
            }
          }).catch(() => undefined);
        }
      }
    }).catch(() => undefined);
    void omnicorePluginsApi.listRegistry().then((r) => {
      if (r.plugins?.length) {
        r.plugins.forEach((p) => omniCore.plugins.registry.register(p));
        setExtensionPlugins(omniCore.plugins.registry.list());
      }
    }).catch(() => undefined);
    void omnicoreAssetsApi.listProjects().then((r) => {
      if (r.projects?.length) {
        omniCore.assets.projects.projects = r.projects;
        setUniversalProjects([...r.projects]);
      }
    }).catch(() => undefined);
    void omnicoreAssetsApi.listAssets().then((r) => {
      if (r.assets?.length) {
        omniCore.assets.assets.assets = r.assets;
        setAssetList([...r.assets]);
      }
    }).catch(() => undefined);
    void omnicoreAiApi.listAgents().then((r) => {
      if (r?.agents?.length) {
        r.agents.forEach((a) => omniCore.ai.agents.register(a));
        setAiAgents(omniCore.ai.agents.list());
      }
    }).catch(() => undefined);
    void omnicoreApi.listProjects().then((r) => {
      if (r?.projects?.length) {
        omniCore.projects.projects = r.projects;
        setProjects([...r.projects]);
      }
    }).catch(() => undefined);
    void omnicoreApi.listRecent().then((r) => {
      if (r?.items?.length) omniCore.recent.items = r.items;
    }).catch(() => undefined);

    registry.setInterval(() => {
      omniCore.collaboration.realtime.clearStaleSessions();
      omniCore.ai.conversations.prune();
      omniCore.ai.promptEngine.clearCache();
    }, 300_000);

    return () => registry.dispose();
  }, []);

  const persistProjects = useCallback(() => {
    void omnicoreApi.saveProjects(omniCore.projects.projects).catch(() => undefined);
  }, []);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === omniCore.projects.activeProjectId) ?? null,
    [projects],
  );

  const openProject = useCallback((id: string, toolSlug: OmniToolSlug) => {
    omniCore.projects.open(id, toolSlug);
    omniCore.recent.push("project", omniCore.projects.get(id)?.name ?? id, toolSlug);
    omniCore.session.setActiveProject(id);
    setProjects([...omniCore.projects.projects]);
    setSession(omniCore.session.get());
    persistProjects();
  }, [persistProjects]);

  const createProject = useCallback((name: string, kind: OmniProject["kind"], toolSlugs: OmniToolSlug[] = []) => {
    omniCore.projects.create(name, kind, toolSlugs);
    setProjects([...omniCore.projects.projects]);
    persistProjects();
  }, [persistProjects]);

  const toggleProjectPin = useCallback((id: string) => {
    omniCore.projects.togglePin(id);
    setProjects([...omniCore.projects.projects]);
    persistProjects();
  }, [persistProjects]);

  const switchWorkspacePreset = useCallback((id: string) => {
    omniCore.workspace.switchPreset(id);
    setActiveWorkspacePresetId(omniCore.workspace.activePresetId);
    setWorkspacePresets([...omniCore.workspace.presets]);
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    omniCore.notifications.show(title, body);
    setNotifications([...omniCore.notifications.items]);
  }, []);

  const toggleCommandPalette = useCallback((open?: boolean) => {
    const next = omniCore.commandPalette.toggle(open);
    setCommandPaletteOpen(next);
    if (!next) setCommandQueryState("");
  }, []);

  const setCommandQuery = useCallback((q: string) => {
    omniCore.commandPalette.setQuery(q);
    setCommandQueryState(q);
  }, []);

  const executeCommand = useCallback((id: string) => {
    omniCore.commandPalette.execute(id);
    setCommandPaletteOpen(false);
    setCommandQueryState("");
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    const results = omniCore.search.setQuery(q);
    setSearchQueryState(q);
    setSearchResults(results);
    void omnicoreApi.search(q).catch(() => undefined);
  }, []);

  const setLocale = useCallback((next: LocaleId) => {
    omniCore.i18n.setLocale(next);
    setLocaleState(next);
  }, []);

  const updateAccessibility = useCallback((patch: Partial<AccessibilityPrefs>) => {
    omniCore.accessibility.update(patch);
    omniCore.accessibility.applyDocumentHints();
    setAccessibility(omniCore.accessibility.get());
  }, []);

  const setTheme = useCallback((themeId: ThemeId) => {
    omniCore.theme.setTheme(themeId);
    setActiveThemeId(themeId);
  }, []);

  const undo = useCallback((toolSlug: OmniToolSlug) => {
    omniCore.undo.undo(toolSlug, omniCore.projects.activeProjectId);
  }, []);

  const redo = useCallback((toolSlug: OmniToolSlug) => {
    omniCore.undo.redo(toolSlug, omniCore.projects.activeProjectId);
  }, []);

  const copyToClipboard = useCallback((text: string, toolSlug: OmniToolSlug | null = null) => {
    omniCore.clipboard.copy(text, "text/plain", toolSlug);
  }, []);

  const selectAgent = useCallback((id: AiAgentId) => {
    omniCore.ai.agentManager.select(id);
    setActiveAgentId(omniCore.ai.agentManager.activeAgentId);
  }, []);

  const setActiveModel = useCallback((id: string) => {
    omniCore.ai.models.setActive(id);
    setActiveModelId(omniCore.ai.models.activeModelId);
  }, []);

  const aiComplete = useCallback(async (prompt: string, opts?: CompleteOptions) => {
    const result = await omniCore.ai.complete(prompt, opts);
    setAiMonitoring(omniCore.ai.monitoring());
    setInferenceQueue(omniCore.ai.queue.list());
    return result;
  }, []);

  const createProjectFromTemplate = useCallback((templateId: string, name: string) => {
    omniCore.assets.projects.createFromTemplate(templateId, name);
    setUniversalProjects([...omniCore.assets.projects.projects]);
    void omnicoreAssetsApi.saveProjects(omniCore.assets.projects.projects).catch(() => undefined);
  }, []);

  const archiveProject = useCallback((id: string) => {
    omniCore.assets.projects.archive(id);
    setUniversalProjects([...omniCore.assets.projects.projects]);
    void omnicoreAssetsApi.saveProjects(omniCore.assets.projects.projects).catch(() => undefined);
  }, []);

  const assetSearch = useCallback((query: string, filter?: AssetSearchFilter) => {
    return omniCore.assets.searchAssets(query, filter);
  }, []);

  const toggleAssetFavorite = useCallback((assetId: string) => {
    omniCore.assets.favorites.toggleAsset(assetId);
    setFavoriteAssets(omniCore.assets.favorites.listAssets());
    setAssetList([...omniCore.assets.assets.assets]);
  }, []);

  const setExplorerView = useCallback((view: ExplorerView) => {
    omniCore.assets.explorer.setView(view);
    setExplorerViewState(view);
  }, []);

  const installExtension = useCallback(async (pluginId: string) => {
    const result = await omniCore.plugins.installAndLoad(pluginId);
    setExtensionPlugins(omniCore.plugins.registry.list());
    void omnicorePluginsApi.install(pluginId).catch(() => undefined);
    return { ok: result.ok };
  }, []);

  const enableExtension = useCallback((pluginId: string) => {
    omniCore.plugins.manager.enable(pluginId);
    setExtensionPlugins(omniCore.plugins.registry.list());
  }, []);

  const disableExtension = useCallback((pluginId: string) => {
    omniCore.plugins.manager.disable(pluginId);
    setExtensionPlugins(omniCore.plugins.registry.list());
  }, []);

  const browseMarketplace = useCallback((category?: string, type?: OmniPluginType) => {
    return omniCore.plugins.marketplace.browse(category, type);
  }, []);

  const switchOrganization = useCallback((orgId: string) => {
    omniCore.collaboration.organization.setActive(orgId);
    setActiveOrgId(orgId);
    setOrgMembers([...omniCore.collaboration.organization.listMembers(orgId)]);
    setOrgWorkspaces([...omniCore.collaboration.orgWorkspace.list(orgId)]);
    setActivityEvents([...omniCore.collaboration.activity.list(orgId)]);
    void omnicoreCollaborationApi.listMembers(orgId).catch(() => undefined);
    void omnicoreCollaborationApi.listWorkspaces(orgId).catch(() => undefined);
  }, []);

  const inviteMember = useCallback(async (email: string, role: OrgRole) => {
    const orgId = omniCore.collaboration.organization.activeOrgId;
    if (!orgId) return { ok: false };
    const inv = omniCore.collaboration.invites.invite(orgId, email, role);
    omniCore.collaboration.notifications.push(orgId, "system", "Invitation sent", `Invited ${email} as ${role}`);
    setCollabNotifications([...omniCore.collaboration.notifications.items]);
    void omnicoreCollaborationApi.invite(orgId, email, role).catch(() => undefined);
    return { ok: !!inv };
  }, []);

  const checkPermission = useCallback((userId: string, permission: OrgPermission) => {
    const orgId = omniCore.collaboration.organization.activeOrgId;
    if (!orgId) return false;
    return omniCore.collaboration.can(userId, orgId, permission);
  }, []);

  const activeOrg = useMemo(
    () => (activeOrgId ? omniCore.collaboration.organization.get(activeOrgId) : null),
    [activeOrgId],
  );

  const collabSnapshot = useMemo(() => omniCore.collaboration.snapshot(), [
    activeOrgId,
    orgMembers.length,
    orgWorkspaces.length,
    collabNotifications.length,
  ]);

  const securitySnapshot = useMemo(() => omniCore.security.snapshot(), [securityReady]);

  const authorizeAction = useCallback((userId: string, permission: string) => {
    const decision = omniCore.security.authorize(
      { userId, attributes: {} },
      permission as import("../../core/security/types").SecurityPermission,
    );
    return decision.allowed;
  }, []);

  return useMemo(
    () => ({
      coreReady,
      coreVersion: omniCore.version,
      projects,
      activeProject,
      openProject,
      createProject,
      toggleProjectPin,
      workspacePresets,
      activeWorkspacePresetId,
      switchWorkspacePreset,
      layoutPresets,
      dockState,
      notifications,
      showNotification,
      commandPaletteOpen,
      toggleCommandPalette,
      commandQuery,
      setCommandQuery,
      commands: omniCore.commandPalette.list(),
      executeCommand,
      searchQuery,
      searchResults,
      setSearchQuery,
      shortcuts: omniCore.shortcuts.list(),
      shortcutConflicts: omniCore.shortcuts.detectConflicts(),
      locale,
      setLocale,
      t: (key: string) => omniCore.i18n.t(key),
      accessibility,
      updateAccessibility,
      session,
      activeThemeId,
      setTheme,
      undo,
      redo,
      copyToClipboard,
      aiReady,
      aiVersion: omniCore.ai.version,
      aiAgents,
      activeAgentId,
      selectAgent,
      aiModels,
      activeModelId,
      setActiveModel,
      aiProviders,
      aiComplete,
      aiMonitoring,
      inferenceQueue,
      assetsReady,
      assetsVersion: omniCore.assets.version,
      universalProjects,
      activeUniversalProjectId,
      createProjectFromTemplate,
      archiveProject,
      assetList,
      assetSearch,
      toggleAssetFavorite,
      explorerView,
      setExplorerView,
      collections,
      cloudSync,
      favoriteAssets,
      pluginsReady,
      pluginsVersion: omniCore.plugins.version,
      extensionPlugins,
      marketplaceListings,
      installExtension,
      enableExtension,
      disableExtension,
      browseMarketplace,
      collaborationReady,
      collaborationVersion: omniCore.collaboration.version,
      organizations,
      activeOrgId,
      activeOrg,
      orgMembers,
      orgWorkspaces,
      collabNotifications,
      activityEvents,
      switchOrganization,
      inviteMember,
      checkPermission,
      collabSnapshot,
      securityReady,
      securityVersion: omniCore.security.version,
      securitySnapshot,
      authorizeAction,
    }),
    [
      coreReady,
      projects,
      activeProject,
      openProject,
      createProject,
      toggleProjectPin,
      workspacePresets,
      activeWorkspacePresetId,
      switchWorkspacePreset,
      layoutPresets,
      dockState,
      notifications,
      showNotification,
      commandPaletteOpen,
      toggleCommandPalette,
      commandQuery,
      setCommandQuery,
      executeCommand,
      searchQuery,
      searchResults,
      setSearchQuery,
      locale,
      setLocale,
      accessibility,
      updateAccessibility,
      session,
      activeThemeId,
      setTheme,
      undo,
      redo,
      copyToClipboard,
      aiReady,
      aiAgents,
      activeAgentId,
      selectAgent,
      aiModels,
      activeModelId,
      setActiveModel,
      aiProviders,
      aiComplete,
      aiMonitoring,
      inferenceQueue,
      assetsReady,
      universalProjects,
      activeUniversalProjectId,
      createProjectFromTemplate,
      archiveProject,
      assetList,
      assetSearch,
      toggleAssetFavorite,
      explorerView,
      setExplorerView,
      collections,
      cloudSync,
      favoriteAssets,
      pluginsReady,
      extensionPlugins,
      marketplaceListings,
      installExtension,
      enableExtension,
      disableExtension,
      browseMarketplace,
      collaborationReady,
      organizations,
      activeOrgId,
      activeOrg,
      orgMembers,
      orgWorkspaces,
      collabNotifications,
      activityEvents,
      switchOrganization,
      inviteMember,
      checkPermission,
      collabSnapshot,
      securityReady,
      securitySnapshot,
      authorizeAction,
    ],
  );
}
