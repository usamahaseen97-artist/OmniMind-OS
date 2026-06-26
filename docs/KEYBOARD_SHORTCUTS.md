# OmniMind Keyboard Shortcuts — 1.0.0-rc1

Fully customizable via `omniCore.shortcuts.register()`. Default profile: `default`.

---

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Shift+P** | Command Palette |
| **Ctrl+K** | Command Palette / Search |
| **Ctrl+P** | Quick Open (Search Everywhere) |
| **Ctrl+F** | Quick Search (when not typing) |
| **Ctrl+S** | Save workspace |
| **Ctrl+Shift+S** | Save snapshot |
| **Ctrl+B** | Toggle sidebar |
| **Ctrl+`** | Toggle terminal |
| **Ctrl+/** | Go to symbol / search |
| **Ctrl+Z** | Undo (OmniCore) |
| **Ctrl+Shift+Z** | Redo |
| **Ctrl+Shift+A** | AI Assistant panel |
| **Ctrl+Tab** | Next project tab |
| **Alt+Tab** | Next workspace (registered) |
| **Ctrl+1 … Ctrl+9** | Switch tool by index |
| **Ctrl+Enter** | Run / preview |
| **F5** | Run preview |

> macOS: **Ctrl** = **⌘** where applicable.

---

## Command Palette Natural Language

| Prefix | Example | Action |
|--------|---------|--------|
| `ask ` | `ask summarize this project` | AI fill-prompt |
| `>` | `> build landing page` | AI fill-prompt |
| `ai ` | `ai optimize bundle` | AI fill-prompt |

---

## Tool-Scoped Shortcuts

Universal Tool Framework (`useUniversalToolKeyboardShortcuts`):

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Tool save |
| Ctrl+Z / Ctrl+Y | Tool undo/redo |
| Ctrl+Shift+E | Export |

---

## Customization

```typescript
omniCore.shortcuts.register({
  id: "sc-custom",
  label: "My Action",
  keys: "Ctrl+Alt+M",
  scope: "global",
  toolSlug: null,
  profileId: "default",
});

// Conflict detection
omniCore.shortcuts.detectConflicts();
```

---

## Implementation

- Registry: `core/omnicore/OmniShortcutManager.ts`
- DOM handler: `components/ecosystem/OmniMindKeyboardBindings.tsx`
- Events: `shortcut:triggered` on `omniCore.eventBus`
