# Design

UI, workspace structure, interaction patterns, and design decisions.

## Design architecture

```text
                         Cloud107
                            │
                            ▼
                     User interface
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
       Overview          Projects           Nodes
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                       Operations
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
       Terminal          Settings          Workloads
                            │
                            ▼
                     Cloud107 API
```

**Note:** The workspace exposes the main Cloud107 concepts first. Technical implementation details should remain available through progressive disclosure rather than being required for basic use.

## Workspace model

| Surface | Purpose | Technical boundary |
|---|---|---|
| **Overview** | Current system summary | Application state |
| **Projects** | Project/workload organization | Project data |
| **Nodes** | Connected execution/resource endpoints | Node state |
| **Operations** | Current and recent operations | Runtime state |
| **Terminal** | Direct command-line interaction | c107 / shell |
| **Settings** | Configuration and controls | Application configuration |

## Interaction flow

```text
User intent
    ↓
Workspace action
    ↓
API / CLI operation
    ↓
Cloud107 execution
    ↓
Observed result
    ↓
Workspace state
```

**Note:** The UI should display the state returned by the application/runtime. It should not fabricate health, resource, billing, node, or workload information.

## Platform boundary

The same capability model can be presented through platform-appropriate interfaces:

| Platform | Interface |
|---|---|
| Web | Browser workspace |
| Windows | Desktop application / workspace |
| Linux | Desktop application / workspace |
| Apple | Native/platform-appropriate interface |
| WSL | Workspace and terminal integration |
| IoT / MCU | Runtime/control interface without requiring a graphical workspace |

These are architectural targets where implementation is not yet complete.

## UI technology

| Layer | Current / intended technology |
|---|---|
| Web UI | React / TypeScript |
| Build | Vite |
| Markup | HTML |
| Styling | CSS / Tailwind CSS |
| API | Node.js / Express / TypeScript |
| State | Application/API state |
| Native extensions | Platform-native implementation where required |

**Note:** A technology listed as a platform target is not proof that its implementation is complete.

## Design references

Use upstream documentation for the technologies actually used:

- [React documentation](https://react.dev/learn)
- [Vite documentation](https://vite.dev/guide/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [HTML Living Standard — WHATWG](https://html.spec.whatwg.org/)
- [CSS specifications — W3C](https://www.w3.org/Style/CSS/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Local reference

The existing [BusPass Management System using Flutter Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template) is a useful local reference for Flutter application organization.

Relevant areas include:

```text
lib/
├── blocs/
├── pages/
├── models/
├── custom_widgets/
└── resources/

pubspec.yaml
assets/
```

**Note:** This is a reference project, not a Cloud107 dependency.

## Design validation

Before accepting a UI change:

- [ ] User flow is understandable without reading implementation details.
- [ ] Current runtime state is represented from authoritative data.
- [ ] Technical controls remain accessible.
- [ ] Platform-specific behavior is documented where relevant.
- [ ] The affected UI is tested at its intended viewport/platform.
- [ ] No unsupported capability is presented as available.
