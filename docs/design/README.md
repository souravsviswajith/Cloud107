# Design

UI, workspace structure, interaction patterns, and design decisions.

The design keeps the main user actions visible while allowing technical details to appear when the user needs them.

## Guide

### 1. UI architecture

<table>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 WORKSPACE</strong><br><sub>React 19 · TypeScript · Vite 6 · HTML/CSS · Tailwind CSS 4</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>OVERVIEW</strong><br><sub>System state</sub></td>
<td align="center"><strong>PROJECTS</strong><br><sub>Projects / workloads</sub></td>
<td align="center"><strong>NODES</strong><br><sub>Resource endpoints</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>OPERATIONS</strong><br><sub>Runtime state</sub></td>
<td align="center"><strong>TERMINAL</strong><br><sub>c107 · Node.js · POSIX</sub></td>
<td align="center"><strong>SETTINGS</strong><br><sub>Configuration</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 API</strong><br><sub>Node.js · Express · TypeScript · HTTP</sub></td>
</tr>
</table>

**Note:** The workspace exposes the main Cloud107 concepts first. Technical details appear through progressive disclosure.

**Reference:** [Architecture](../architecture/) · [React documentation](https://react.dev/learn)

### 2. UI implementation boundary

| Layer | Current implementation |
|---|---|
| Entry | `src/App.tsx` |
| Landing surface | `LandingPage` |
| Workspace shell | `WorkspaceShell` |
| Main workspace | `Dashboard`, `Workspace`, `AppLibrary`, `ApplicationMode` |
| Technical surface | `DiagnosticsDashboard`, `CommandPalette`, `NotificationsPanel` |
| AI surface | `AIAssistantPanel` |
| Persistent workspace control | `FloatingWorkspaceBar` |
| UI framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 6 |
| Styling | HTML / CSS / Tailwind CSS 4 |
| Motion | Motion |
| Icons | Lucide React |
| Markdown rendering | React Markdown + remark-gfm |
| State | Application / API state through the existing shell and auth contexts |

**Note:** This table describes the current repository implementation. A platform target is not proof that its implementation is complete.

### 3. Workspace model

| Surface | Purpose | Technical boundary |
|---|---|---|
| **Overview** | Current system summary | Application state |
| **Projects** | Project/workload organization | Project data |
| **Nodes** | Connected execution/resource endpoints | Node state |
| **Operations** | Current and recent operations | Runtime state |
| **Terminal** | Direct command-line interaction | c107 / shell |
| **Settings** | Configuration and controls | Application configuration |

<table>
<tr><td><strong>Overview</strong></td><td>Projects</td><td>Nodes</td></tr>
<tr><td>Operations</td><td>Terminal</td><td>Settings</td></tr>
</table>

**Note:** These surfaces are UI boundaries. Their displayed state should come from the corresponding application or runtime source.

**Reference:** [Runtime](../runtime/) · [Nodes](../nodes/) · [Operations](../operations/)

### 4. Interaction flow

<table>
<tr><th>Stage</th><th>Boundary</th></tr>
<tr><td>1. User intent</td><td>Workspace action</td></tr>
<tr><td>2. Workspace action</td><td>API / CLI operation</td></tr>
<tr><td>3. API / CLI operation</td><td>Cloud107 execution</td></tr>
<tr><td>4. Cloud107 execution</td><td>Observed result</td></tr>
<tr><td>5. Observed result</td><td>Workspace state</td></tr>
</table>

**Note:** The UI should display the state returned by the application or runtime. It must not fabricate health, resource, billing, node, or workload information.

**Expected result:** A completed action produces an observable state change or an explicit operation/error result.

**Reference:** [APIs](../APIs/) · [Operations](../operations/)

### 5. UI technology lock

| Layer | Locked baseline |
|---|---|
| Web foundation | HTML · CSS · JavaScript |
| UI | React 19 · TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 · CSS |
| Motion | Motion |
| Icons | Lucide React |
| Markdown | React Markdown · remark-gfm |
| API boundary | Node.js · Express · TypeScript |
| Browser interface | Standard Web Platform APIs |
| Native extensions | Platform-native implementation where required |

**Lock rule:** The UI stack is selected for the current Cloud107 workspace. Other languages and runtimes remain available to other subsystems when their requirements justify them; they do not need to be forced into the browser layer.

**Note:** The technology lock does not claim that every planned platform target is already implemented.

**Reference:** [React](https://react.dev/learn) · [Vite](https://vite.dev/guide/) · [TypeScript](https://www.typescriptlang.org/docs/) · [Tailwind CSS](https://tailwindcss.com/docs) · [HTML Living Standard](https://html.spec.whatwg.org/) · [CSS specifications](https://www.w3.org/Style/CSS/)

### 6. Platform boundary

<table>
<tr><th>Platform</th><th>Interface</th><th>State</th></tr>
<tr><td>Web</td><td>Browser workspace</td><td>Current</td></tr>
<tr><td>Windows</td><td>Desktop application / workspace</td><td>Target</td></tr>
<tr><td>Linux</td><td>Desktop application / workspace</td><td>Target</td></tr>
<tr><td>Apple</td><td>Native/platform-appropriate interface</td><td>Target</td></tr>
<tr><td>WSL</td><td>Workspace and terminal integration</td><td>Target</td></tr>
<tr><td>IoT / MCU</td><td>Runtime/control interface without requiring a graphical workspace</td><td>Target</td></tr>
</table>

**Note:** Keep target platforms explicitly marked until their implementation is complete and validated.

**Reference:** [HTML](https://html.spec.whatwg.org/) · [Web APIs — MDN](https://developer.mozilla.org/en-US/docs/Web/API)

### 7. Local Flutter reference

<table>
<tr><th>Reference project</th><th>Relevant organization</th></tr>
<tr><td>Flutter application</td><td><code>lib/</code> → blocs · pages · models · custom_widgets · resources</td></tr>
<tr><td>Project configuration</td><td><code>pubspec.yaml</code></td></tr>
<tr><td>Assets</td><td><code>assets/</code></td></tr>
</table>

**Note:** The existing Flutter project is a local reference for application organization. It is not a Cloud107 dependency.

**Reference:** [BusPass Management System using Flutter Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template) · [Flutter documentation](https://docs.flutter.dev/)

### 8. Design validation

<table>
<tr><th>Validation area</th><th>Check</th></tr>
<tr><td>User flow</td><td>Understandable without reading implementation details</td></tr>
<tr><td>Authoritative state</td><td>Displayed state comes from authoritative data</td></tr>
<tr><td>Technical controls</td><td>Required controls remain accessible</td></tr>
<tr><td>Platform behavior</td><td>Platform-specific behavior is documented where relevant</td></tr>
<tr><td>Viewport/platform</td><td>Affected UI is tested at its intended target</td></tr>
<tr><td>Capability claims</td><td>No unsupported capability is presented as available</td></tr>
</table>

**Note:** Validation checks both what the user sees and whether the displayed state is actually supported by the application.

**Reference:** [MDN Web Docs](https://developer.mozilla.org/) · [React testing guidance](https://react.dev/learn)

---
