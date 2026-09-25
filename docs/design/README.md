# Design

UI, workspace structure, interaction patterns, and design decisions.

The design keeps the main user actions visible while allowing technical details to appear when the user needs them.

## Guide

### 1. Design architecture

<table>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 WORKSPACE</strong><br><sub>(React · TypeScript · Vite · HTML/CSS · Web Platform)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>OVERVIEW</strong><br><sub>(System state)</sub></td>
<td align="center"><strong>PROJECTS</strong><br><sub>(Projects / workloads)</sub></td>
<td align="center"><strong>NODES</strong><br><sub>(Resource endpoints)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>OPERATIONS</strong><br><sub>(Runtime state)</sub></td>
<td align="center"><strong>TERMINAL</strong><br><sub>(c107 · Node.js · POSIX)</sub></td>
<td align="center"><strong>SETTINGS</strong><br><sub>(Configuration)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 API</strong><br><sub>(Node.js · Express · HTTP · RFC 9110)</sub></td>
</tr>
</table>

**Note:** The workspace exposes the main Cloud107 concepts first. Technical details appear through progressive disclosure.

**Reference:** [Architecture](../architecture/) · [React documentation](https://react.dev/learn)

### 2. Workspace model

| Surface | Purpose | Technical boundary |
|---|---|---|
| **Overview** | Current system summary | Application state |
| **Projects** | Project/workload organization | Project data |
| **Nodes** | Connected execution/resource endpoints | Node state |
| **Operations** | Current and recent operations | Runtime state |
| **Terminal** | Direct command-line interaction | c107 / shell |
| **Settings** | Configuration and controls | Application configuration |

```text
Overview
   │
   ├── Projects
   ├── Nodes
   ├── Operations
   ├── Terminal
   └── Settings
```

**Note:** These surfaces are UI boundaries. Their displayed state should come from the corresponding application or runtime source.

**Reference:** [Runtime](../runtime/) · [Nodes](../nodes/) · [Operations](../operations/)

### 3. Interaction flow

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

**Note:** The UI should display the state returned by the application or runtime. It must not fabricate health, resource, billing, node, or workload information.

**Expected result:** A completed action produces an observable state change or an explicit operation/error result.

**Reference:** [APIs](../APIs/) · [Operations](../operations/)

### 4. UI technology

```text
Browser
  │
  ├── HTML
  ├── CSS / Tailwind CSS
  └── React + TypeScript
          │
          ▼
        Vite
          │
          ▼
      Cloud107 API
```

| Layer | Technology |
|---|---|
| Web UI | React / TypeScript |
| Build | Vite |
| Markup | HTML |
| Styling | CSS / Tailwind CSS |
| API | Node.js / Express / TypeScript |
| State | Application/API state |
| Native extensions | Platform-native implementation where required |

**Note:** A platform target is not proof that its implementation is complete.

**Reference:** [React](https://react.dev/learn) · [Vite](https://vite.dev/guide/) · [TypeScript](https://www.typescriptlang.org/docs/) · [Tailwind CSS](https://tailwindcss.com/docs) · [HTML Living Standard](https://html.spec.whatwg.org/) · [CSS specifications](https://www.w3.org/Style/CSS/)

### 5. Platform boundary

```text
Cloud107 capability
        │
        ├── Web ────────► Browser workspace
        ├── Windows ────► Desktop/workspace target
        ├── Linux ──────► Desktop/workspace target
        ├── Apple ──────► Native/platform target
        ├── WSL ────────► Workspace + terminal target
        └── IoT / MCU ──► Runtime/control interface
```

| Platform | Interface | State |
|---|---|---|
| Web | Browser workspace | Current |
| Windows | Desktop application / workspace | Target |
| Linux | Desktop application / workspace | Target |
| Apple | Native/platform-appropriate interface | Target |
| WSL | Workspace and terminal integration | Target |
| IoT / MCU | Runtime/control interface without requiring a graphical workspace | Target |

**Note:** Keep target platforms explicitly marked until their implementation is complete and validated.

**Reference:** [HTML](https://html.spec.whatwg.org/) · [Web APIs — MDN](https://developer.mozilla.org/en-US/docs/Web/API)

### 6. Local Flutter reference

```text
Flutter reference project
        │
        ├── lib/
        │    ├── blocs/
        │    ├── pages/
        │    ├── models/
        │    ├── custom_widgets/
        │    └── resources/
        ├── pubspec.yaml
        └── assets/
```

**Note:** The existing Flutter project is a local reference for application organization. It is not a Cloud107 dependency.

**Reference:** [BusPass Management System using Flutter Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template) · [Flutter documentation](https://docs.flutter.dev/)

### 7. Design validation

```text
UI change
   │
   ├── user flow
   ├── authoritative state
   ├── technical controls
   ├── platform behavior
   └── viewport/platform test
   │
   ▼
Validated UI
```

**Checklist**

- [ ] User flow is understandable without reading implementation details.
- [ ] Current runtime state comes from authoritative data.
- [ ] Technical controls remain accessible.
- [ ] Platform-specific behavior is documented where relevant.
- [ ] The affected UI is tested at its intended viewport/platform.
- [ ] No unsupported capability is presented as available.

**Note:** Validation should check both what the user sees and whether the displayed state is actually supported by the application.

**Reference:** [MDN Web Docs](https://developer.mozilla.org/) · [React testing guidance](https://react.dev/learn)
