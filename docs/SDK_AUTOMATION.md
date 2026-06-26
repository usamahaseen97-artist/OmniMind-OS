# Automation SDK Guide

## TypeScript (`frontend/sdk/automation`)

```typescript
import { OmniAutomationSDK, automationSDK } from "@/sdk/automation";

const workflows = await automationSDK.listWorkflows();
const wf = await automationSDK.generate("When a PDF uploads, run medical analysis and notify me");
const execution = await automationSDK.run(wf.id, { background: true, priority: 8 });

// Plugin hooks
const off = automationSDK.onTrigger("file-added", (payload) => {
  console.log("File added", payload);
});
automationSDK.emitTrigger("file-added", { path: "/assets/report.pdf" });
```

### OmniCore integration

```typescript
import { omniCore } from "@/core/omnicore/OmniCore";

await omniCore.automation.boot();
omniCore.automation.builder.create({ ... });
omniCore.automation.ai.generateFromNaturalLanguage("Deploy on every build");
```

## Python (`backend/sdk/automation_client.py`)

```python
from sdk.automation_client import OmniAutomationClient

client = OmniAutomationClient("http://127.0.0.1:8000/api/v1/omnicore/automation")
workflows = client.list_workflows()
wf = client.generate("Weekly business analytics export")
execution = client.run(wf["id"], background=True)
metrics = client.metrics()
```

## CLI (via existing OmniMind SDK CLI)

```bash
# Extend omnimind CLI with automation commands (future)
omnimind automation list
omnimind automation run <workflow-id> --background
```

## Plugin hooks

Plugins emit/listen for `omnimind:automation:<triggerId>` window events or register via `OmniAutomationSDK.onTrigger`.

Permissions required: `automation` plugin type + `tool-access` for cross-tool actions.
