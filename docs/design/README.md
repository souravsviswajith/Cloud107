# Design

UI, workspace structure, interaction patterns, and design decisions.

The design uses a macOS-style glass workspace: translucent surfaces, depth, spacing, system controls, and progressive disclosure. The interface keeps common actions visible while allowing technical details to appear when needed. The uploaded Stitch UI references are the visual source for this direction.

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

### 3. Current interface model

| Surface | Direction |
|---|---|
| Main workspace | macOS-style glass interface rather than a uniformly dark dashboard |
| Settings | System-settings organization similar to macOS and GNU desktop environments |
| Terminal | Universal terminal and remote-control surface for local and connected systems |
| Code / text editor | Open-source Notepad application, based on the feature model of editors such as Notepad++, with syntax support for multiple languages and common text/configuration formats |
| Knowledge / documentation | Obsidian remains the external knowledge-management and project-notes tool |
| Development IDE | Visual Studio Code is the development IDE reference; Antigravity is not part of the current Cloud107 interface definition |

**Note:** The glass treatment is a UI implementation characteristic, not a requirement that every screen use the same background, color, or density. Settings should follow familiar system-configuration patterns. Terminal access remains available when the user needs direct control.

**UI reference:** Uploaded Google Stitch Cloud107 screens and the existing repository implementation.

### Notepad

The Cloud107 Notepad is an **open-source, cross-platform text and source-code editor**. It is not the Windows Notepad application. Its feature model is comparable to Notepad++: fast text editing, tabs, syntax highlighting, search/replace, file/workspace access, and support for many programming and configuration languages. Notepad++ is used here as a functional reference, not as a Cloud107 dependency or implementation requirement. urlNotepad++ documentationhttps://notepad-plus-plus.org/

| Function | Requirement |
|---|---|
| Text editing | Plain-text editing without requiring an IDE |
| Language support | Syntax highlighting and language-aware editing for the supported programming/configuration languages |
| Formats | Source code, JSON, YAML, TOML, XML, HCL, Markdown, SQL, shell scripts, and other text formats used by the project |
| File access | Open and edit files available to the current workspace or project |
| Integration | Open from projects, terminal output, diagnostics, and file references where applicable |
| Scope | Lightweight editing; full development workflows remain available through Visual Studio Code and the terminal |

**Note:** Notepad is intended for small edits, configuration changes, logs, scripts, documentation, and quick source inspection. It is not a replacement for Visual Studio Code.

### 4. UX principles

<table>
<tr><th>Principle</th><th>Rule</th></tr>
<tr><td><strong>Clarity</strong></td><td>Show the user's current context, available action, and resulting state without requiring implementation knowledge.</td></tr>
<tr><td><strong>Progressive disclosure</strong></td><td>Keep the primary workflow visible; expose diagnostics, runtime details, logs, and advanced controls when needed.</td></tr>
<tr><td><strong>State authority</strong></td><td>Displayed status, health, resources, operations, and billing data must come from authoritative application/runtime sources.</td></tr>
<tr><td><strong>Technical access</strong></td><td>The UI must not hide the underlying technical controls. Terminal, diagnostics, operations, and configuration remain reachable.</td></tr>
<tr><td><strong>Familiar system patterns</strong></td><td>Settings and configuration use established desktop conventions so users can locate controls without learning a Cloud107-specific interaction model.</td></tr>
<tr><td><strong>Direct control</strong></td><td>The universal terminal remains available for direct local or remote operations through the supported Cloud107 command interface.</td></tr>
<tr><td><strong>Context preservation</strong></td><td>Moving between workspace surfaces should preserve the selected project, node, workload, application, or operation context where applicable.</td></tr>
<tr><td><strong>Feedback</strong></td><td>Actions expose a clear pending, success, failure, or unavailable state. Silent state changes are avoided.</td></tr>
<tr><td><strong>Recovery</strong></td><td>Failed operations expose the recorded error and the available recovery path rather than masking the failure.</td></tr>
<tr><td><strong>Responsive surface</strong></td><td>The web workspace adapts to supported viewport sizes without changing the underlying execution model.</td></tr>
<tr><td><strong>Accessibility</strong></td><td>Interactive controls, keyboard navigation, text alternatives, focus behavior, and readable contrast are part of UI validation.</td></tr>
<tr><td><strong>Visual restraint</strong></td><td>Use hierarchy, spacing, typography, and state indicators to communicate information without relying on decorative effects.</td></tr>
</table>

**UX flow**

<table>
<tr>
<td align="center"><strong>Context</strong></td>
<td>→</td>
<td align="center"><strong>Action</strong></td>
<td>→</td>
<td align="center"><strong>System response</strong></td>
<td>→</td>
<td align="center"><strong>Result / recovery</strong></td>
</tr>
</table>

**Note:** UX describes how a user moves through Cloud107. UI describes the visual and interactive implementation of that flow.

**Reference:** [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG/) · [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### 5. Workspace model

| Surface | Purpose | Technical boundary |
|---|---|---|
| **Overview** | Current system summary | Application state |
| **Projects** | Project/workload organization | Project data |
| **Nodes** | Connected execution/resource endpoints | Node state |
| **Operations** | Current and recent operations | Runtime state |
| **Terminal** | Direct local and remote command-line interaction | c107 / shell / connected node |
| **Settings** | Configuration and controls | Application configuration |
| **Notepad** | Edit source, configuration, markup, scripts, and other text files | Local/project file access |

<table>
<tr><td><strong>Overview</strong></td><td>Projects</td><td>Nodes</td></tr>
<tr><td>Operations</td><td>Terminal</td><td>Notepad</td></tr>
<tr><td>Settings</td><td colspan="2">System configuration</td></tr>
</table>

**Note:** These surfaces are UI boundaries. Their displayed state should come from the corresponding application or runtime source.

**Reference:** [Runtime](../runtime/) · [Nodes](../nodes/) · [Operations](../operations/)

### 6. Interaction flow

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

### 7. UI technology lock

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

### 8. Platform boundary

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

### 9. Local Flutter reference

<table>
<tr><th>Reference project</th><th>Relevant organization</th></tr>
<tr><td>Flutter application</td><td><code>lib/</code> → blocs · pages · models · custom_widgets · resources</td></tr>
<tr><td>Project configuration</td><td><code>pubspec.yaml</code></td></tr>
<tr><td>Assets</td><td><code>assets/</code></td></tr>
</table>

**Note:** The existing Flutter project is a local reference for application organization. It is not a Cloud107 dependency.

**Reference:** [BusPass Management System using Flutter Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template) · [Flutter documentation](https://docs.flutter.dev/)

### 10. Design validation

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
