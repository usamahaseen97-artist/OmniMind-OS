"""Enterprise Pydantic models for OmniCore platform APIs."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from schemas.strict import StrictModel


class EnterpriseDocument(BaseModel):
    """Validated JSON document — allows extension fields for stub persistence."""

    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)


class ProjectsSaveBody(StrictModel):
    projects: list[dict[str, Any]] = Field(default_factory=list, max_length=1000)


class ItemsSaveBody(StrictModel):
    items: list[dict[str, Any]] = Field(default_factory=list, max_length=5000)


class SettingsSaveBody(StrictModel):
    settings: list[dict[str, Any]] = Field(default_factory=list, max_length=500)


class AgentsSaveBody(StrictModel):
    agents: list[dict[str, Any]] = Field(default_factory=list, max_length=500)


class OrganizationsSaveBody(StrictModel):
    organizations: list[dict[str, Any]] = Field(default_factory=list, max_length=200)


class WorkflowsSaveBody(StrictModel):
    workflows: list[dict[str, Any]] = Field(default_factory=list, max_length=500)


class RegistrySaveBody(StrictModel):
    registry: list[dict[str, Any]] = Field(default_factory=list, max_length=2000)


class PinsSaveBody(StrictModel):
    pins: list[dict[str, Any]] = Field(default_factory=list, max_length=200)


class PromptBody(StrictModel):
    prompt: str = Field(..., min_length=1, max_length=16000)


class PromptOptionsBody(StrictModel):
    prompt: str = Field(..., min_length=1, max_length=16000)
    options: dict[str, Any] = Field(default_factory=dict)


class ContextBody(StrictModel):
    context: str = Field(default="", max_length=8000)


class WorkflowRunBody(StrictModel):
    background: bool = False
    priority: int = Field(default=5, ge=1, le=10)
    input: dict[str, Any] = Field(default_factory=dict)


class WorkflowSaveBody(EnterpriseDocument):
  pass


class AgentRegisterBody(EnterpriseDocument):
    pass


class ConversationSaveBody(EnterpriseDocument):
    pass


class MemorySaveBody(StrictModel):
    entries: list[dict[str, Any]] = Field(default_factory=list, max_length=5000)


class MemoryEntryBody(EnterpriseDocument):
    pass


class TaskEnqueueBody(EnterpriseDocument):
    pass


class ActivityBody(EnterpriseDocument):
    kind: str = Field(default="system", max_length=64)
    title: str = Field(default="", max_length=512)


class BackgroundJobBody(EnterpriseDocument):
    kind: str = Field(default="code", max_length=64)
    label: str = Field(default="Background job", max_length=256)


class SidebarSaveBody(StrictModel):
    pins: list[dict[str, Any]] = Field(default_factory=list, max_length=200)


class InviteBody(EnterpriseDocument):
    orgId: str = Field(default="", max_length=64)
    email: str = Field(default="", max_length=256)
    role: str = Field(default="viewer", max_length=32)


class PermissionCheckBody(StrictModel):
    userId: str = Field(..., min_length=1, max_length=128)
    orgId: str = Field(..., min_length=1, max_length=64)
    permission: str = Field(..., min_length=3, max_length=64)


class PluginInstallBody(StrictModel):
    pluginId: str = Field(..., min_length=1, max_length=128)


class PluginUninstallBody(StrictModel):
    pluginId: str = Field(..., min_length=1, max_length=128)


class VersionSaveBody(EnterpriseDocument):
    targetId: str = Field(default="", max_length=128)


class BackupCreateBody(StrictModel):
    label: str = Field(default="Backup", max_length=256)


class AssetSaveBody(EnterpriseDocument):
    pass


class SearchIndexBody(StrictModel):
    items: list[dict[str, Any]] = Field(default_factory=list, max_length=10000)


class SessionSaveBody(EnterpriseDocument):
    pass


class LogAppendBody(StrictModel):
    source: str = Field(default="backend", max_length=64)
    message: str = Field(default="", max_length=4000)
    level: str = Field(default="info", max_length=16)


class AgentControlBody(EnterpriseDocument):
    pass


class RemoteJobBody(EnterpriseDocument):
    kind: str = Field(default="render-image", max_length=64)
    label: str = Field(default="", max_length=256)


class OfflineQueueBody(EnterpriseDocument):
    pass


class MemoryCloudBody(StrictModel):
    entries: list[dict[str, Any]] = Field(default_factory=list, max_length=2000)


class SyncBody(EnterpriseDocument):
    pass


class ConflictResolveBody(EnterpriseDocument):
    pass


class SnapshotBody(EnterpriseDocument):
    pass


class FailedLoginBody(StrictModel):
    email: Optional[str] = Field(default=None, max_length=256)
    reason: str = Field(default="invalid_credentials", max_length=256)
    ip: Optional[str] = Field(default=None, max_length=64)


class ImagingAIAnalyzeBody(StrictModel):
    study_id: str = Field(..., min_length=1, max_length=128)
    series_id: Optional[str] = Field(default=None, max_length=128)
    instance_id: Optional[str] = Field(default=None, max_length=128)
    model_id: Optional[str] = Field(default=None, max_length=128)


class LaboratoryAIAnalyzeBody(StrictModel):
    report_id: str = Field(..., min_length=1, max_length=128)
    patient_id: Optional[str] = Field(default=None, max_length=128)
    model_id: Optional[str] = Field(default=None, max_length=128)


class ProjectCreateBody(EnterpriseDocument):
    name: str = Field(default="Untitled", max_length=256)


class SerializeBody(EnterpriseDocument):
    pass


class QueueBody(EnterpriseDocument):
    pass


class ExportQueueBody(EnterpriseDocument):
    pass


class GenericIdActionBody(StrictModel):
    action: str = Field(default="", max_length=64)
