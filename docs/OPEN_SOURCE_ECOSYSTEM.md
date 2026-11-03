# 107 Open-Source Ecosystem Registry

> Status: initial account-wide connection map. This registry records relationships and integration intent; it does **not** claim that every repository is already integrated, tested, or maintained by the 107 core.

## Purpose

Connect the public repositories in the `souravsviswajith` personal account to the 107 ecosystem so work can be divided by capability, reused safely, and contributed upstream.

## Operating rules

1. Repositories remain independently versioned. No mass merge or source-code consolidation.
2. Preserve original authorship, upstream attribution, licenses, notices, and project boundaries.
3. Treat forks as upstream-derived projects. Audit the fork delta before adopting code; do not assume the fork owner authored the upstream implementation.
4. Prefer stable APIs, adapters, packages, and documented contracts over direct cross-repository coupling.
5. Send generally useful fixes upstream through pull requests when practical.
6. Do not modify organizations or repositories outside the personal account without explicit authorization.
7. Mesh-related repositories are reference-only pending a separate provenance and confidentiality review. Do not import or publish proprietary mesh implementation details.
8. A registry entry is not an endorsement, security review, dependency approval, or claim of production readiness.

## 107 capability map

| 107 workstream | Repositories and capability relationships | Intended workload boundary |
|---|---|---|
| Cloud platform, deployment and DevOps | [HyperCloud107](https://github.com/souravsviswajith/HyperCloud107), [Project-Atlas-Bootstrap](https://github.com/souravsviswajith/Project-Atlas-Bootstrap), [devops-demo](https://github.com/souravsviswajith/devops-demo), [maven-demo](https://github.com/souravsviswajith/maven-demo), [AWS-Zero-to-Hero](https://github.com/souravsviswajith/AWS-Zero-to-Hero), [Voting-App-Docker](https://github.com/souravsviswajith/Voting-App-Docker) | Runtime, provisioning, CI/CD, deployment examples and infrastructure adapters. Keep demos separate from production services. |
| AI, LLM and agent systems | [airllm](https://github.com/souravsviswajith/airllm), [awesome-llm-apps](https://github.com/souravsviswajith/awesome-llm-apps), [GLM-5](https://github.com/souravsviswajith/GLM-5), [langflow](https://github.com/souravsviswajith/langflow), [OpenShell](https://github.com/souravsviswajith/OpenShell), [rea](https://github.com/souravsviswajith/rea), [stitch-sdk](https://github.com/souravsviswajith/stitch-sdk) | Model execution, agent orchestration, workflow composition, safe execution and UI-generation integrations. Evaluate model/runtime licenses and hardware requirements independently. |
| Data, ML and analytics | [Anomaly-detection](https://github.com/souravsviswajith/Anomaly-detection), [anomaly-detection-webapp-for-invoices](https://github.com/souravsviswajith/anomaly-detection-webapp-for-invoices), [anomaly-detection-webapp-v2](https://github.com/souravsviswajith/anomaly-detection-webapp-v2), [Basic-_ML_Projects](https://github.com/souravsviswajith/Basic-_ML_Projects), [SampleDatasets](https://github.com/souravsviswajith/SampleDatasets), [math](https://github.com/souravsviswajith/math) | Dataset, experimentation, model evaluation and analytics components. Keep datasets and model artifacts versioned separately from application code. |
| Media, rendering and creative tools | [web-tv](https://github.com/souravsviswajith/web-tv), [musiclounge](https://github.com/souravsviswajith/musiclounge), [dlss5-visual-enhancer](https://github.com/souravsviswajith/dlss5-visual-enhancer), [OpenDLSS-NR](https://github.com/souravsviswajith/OpenDLSS-NR), [FXNotifications](https://github.com/souravsviswajith/FXNotifications) | Media clients, playback, rendering research and platform-specific integration candidates. Validate upstream status, compatibility and licensing before reuse. |
| Mobile, application and user experience | [BusPass-Management-System-using-flutter-Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template), [kurozora-android](https://github.com/souravsviswajith/kurozora-android), [profile-readme-generator](https://github.com/souravsviswajith/profile-readme-generator), [profile.github](https://github.com/souravsviswajith/profile.github), [home](https://github.com/souravsviswajith/home) | Android/mobile patterns, application UI, profile tooling and web experience. Integrate through application contracts rather than sharing unrelated UI internals. |
| Networking and mesh research — restricted | [bitchat](https://github.com/souravsviswajith/bitchat), [BitChatClient](https://github.com/souravsviswajith/BitChatClient), [knit](https://github.com/souravsviswajith/knit), [meshlive-android](https://github.com/souravsviswajith/meshlive-android) | External reference projects only for now. No proprietary mesh code, credentials, protocols or unpublished designs are to be exposed through this registry or imported into public 107 components. |
| Developer tooling, language and security | [braces](https://github.com/souravsviswajith/braces), [vscode-codeql](https://github.com/souravsviswajith/vscode-codeql), [cemu.cfw.guide](https://github.com/souravsviswajith/cemu.cfw.guide), [sn-mvfoul](https://github.com/souravsviswajith/sn-mvfoul), [.github](https://github.com/souravsviswajith/.github), [Streamline](https://github.com/souravsviswajith/Streamline) | Reusable developer utilities, static analysis, documentation and integration patterns. Review provenance and repository purpose before making any runtime dependency. |
| Learning, samples and networking education | [netwoking-lab-sample-code-for-students](https://github.com/souravsviswajith/netwoking-lab-sample-code-for-students), [AWS-Zero-to-Hero](https://github.com/souravsviswajith/AWS-Zero-to-Hero), [SampleDatasets](https://github.com/souravsviswajith/SampleDatasets) | Learning material, examples and reproducible exercises. Keep educational samples clearly separated from production modules. |
| Assessments and domain applications | [psychometric-assessment-107](https://github.com/souravsviswajith/psychometric-assessment-107), [SMC_ICT_Library](https://github.com/souravsviswajith/SMC_ICT_Library) | Assessment and domain-specific research modules. Require domain review and clear data/usage boundaries before platform integration. |
| Profile and ecosystem entry point | [souravsviswajith](https://github.com/souravsviswajith/souravsviswajith), [portfolio-website-demo](https://github.com/souravsviswajith/portfolio-website-demo) | Public discovery and navigation. The profile repository is the human-facing index; this registry is the technical relationship map. |

## Repository inventory

### Original repositories (14)

These are marked as non-forks in the account inventory. Ownership does not by itself establish that every line of code is original; inspect commit history and dependencies before reuse.

- [Anomaly-detection](https://github.com/souravsviswajith/Anomaly-detection) — invoice anomaly detection.
- [anomaly-detection-webapp-for-invoices](https://github.com/souravsviswajith/anomaly-detection-webapp-for-invoices) — invoice anomaly web application.
- [anomaly-detection-webapp-v2](https://github.com/souravsviswajith/anomaly-detection-webapp-v2) — invoice anomaly application iteration.
- [Basic-_ML_Projects](https://github.com/souravsviswajith/Basic-_ML_Projects) — ML learning projects.
- [BusPass-Management-System-using-flutter-Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template) — Flutter application template.
- [devops-demo](https://github.com/souravsviswajith/devops-demo) — DevOps demonstration.
- [home](https://github.com/souravsviswajith/home) — web application.
- [HyperCloud107](https://github.com/souravsviswajith/HyperCloud107) — 107 ecosystem integration and hybrid platform.
- [maven-demo](https://github.com/souravsviswajith/maven-demo) — Maven/Java demonstration.
- [netwoking-lab-sample-code-for-students](https://github.com/souravsviswajith/netwoking-lab-sample-code-for-students) — networking learning examples.
- [portfolio-website-demo](https://github.com/souravsviswajith/portfolio-website-demo) — website demonstration.
- [Project-Atlas-Bootstrap](https://github.com/souravsviswajith/Project-Atlas-Bootstrap) — Windows setup/bootstrap framework.
- [psychometric-assessment-107](https://github.com/souravsviswajith/psychometric-assessment-107) — assessment application.
- [souravsviswajith](https://github.com/souravsviswajith/souravsviswajith) — GitHub profile README.

### Forked repositories (30)

These are upstream-derived repositories. Their current fork deltas, upstream owners, branch divergence and local modifications still need individual inspection.

- [.github](https://github.com/souravsviswajith/.github)
- [airllm](https://github.com/souravsviswajith/airllm)
- [awesome-llm-apps](https://github.com/souravsviswajith/awesome-llm-apps)
- [AWS-Zero-to-Hero](https://github.com/souravsviswajith/AWS-Zero-to-Hero)
- [bitchat](https://github.com/souravsviswajith/bitchat)
- [BitChatClient](https://github.com/souravsviswajith/BitChatClient)
- [braces](https://github.com/souravsviswajith/braces)
- [cemu.cfw.guide](https://github.com/souravsviswajith/cemu.cfw.guide)
- [dlss5-visual-enhancer](https://github.com/souravsviswajith/dlss5-visual-enhancer)
- [FXNotifications](https://github.com/souravsviswajith/FXNotifications)
- [GLM-5](https://github.com/souravsviswajith/GLM-5)
- [knit](https://github.com/souravsviswajith/knit)
- [kurozora-android](https://github.com/souravsviswajith/kurozora-android)
- [langflow](https://github.com/souravsviswajith/langflow)
- [math](https://github.com/souravsviswajith/math)
- [meshlive-android](https://github.com/souravsviswajith/meshlive-android)
- [musiclounge](https://github.com/souravsviswajith/musiclounge)
- [OpenDLSS-NR](https://github.com/souravsviswajith/OpenDLSS-NR)
- [OpenShell](https://github.com/souravsviswajith/OpenShell)
- [profile-readme-generator](https://github.com/souravsviswajith/profile-readme-generator)
- [profile.github](https://github.com/souravsviswajith/profile.github)
- [rea](https://github.com/souravsviswajith/rea)
- [SampleDatasets](https://github.com/souravsviswajith/SampleDatasets)
- [SMC_ICT_Library](https://github.com/souravsviswajith/SMC_ICT_Library)
- [sn-mvfoul](https://github.com/souravsviswajith/sn-mvfoul)
- [stitch-sdk](https://github.com/souravsviswajith/stitch-sdk)
- [Streamline](https://github.com/souravsviswajith/Streamline)
- [Voting-App-Docker](https://github.com/souravsviswajith/Voting-App-Docker)
- [vscode-codeql](https://github.com/souravsviswajith/vscode-codeql)
- [web-tv](https://github.com/souravsviswajith/web-tv)

## Workload allocation model

Use capability ownership to prevent a single repository or contributor from becoming a bottleneck:

- **Platform/integration lane:** 107 core contracts, registry, auth boundaries, observability and deployment integration.
- **Cloud/DevOps lane:** infrastructure, bootstrap, CI/CD, runtime packaging and operational automation.
- **AI/data lane:** model adapters, inference, agent workflows, datasets and evaluation.
- **Application/media lane:** mobile, web, media and rendering adapters.
- **Research/education lane:** examples, documentation, reproducible experiments and assessments.
- **Upstream maintenance lane:** fork-delta review, issue triage, compatibility tracking and upstream pull requests.

Each task should have one owning repository, one accountable maintainer, a defined interface, acceptance tests and a documented upstream contribution path. Avoid assigning the same implementation to multiple repositories.

## Integration maturity

Every relationship must move through these states:

1. **Catalogued** — repository identity, origin and license recorded.
2. **Reviewed** — code, fork delta, security posture, dependencies and maintenance status inspected.
3. **Compatible** — interface and version contract defined.
4. **Integrated** — adapter or dependency wired into a 107 workflow.
5. **Verified** — automated tests, provenance and operational behavior validated.
6. **Maintained** — owner, update cadence and upstream contribution process established.

No repository in this initial registry is marked integrated or verified solely because it appears here.

## Next audit tasks

- Resolve upstream repository, default branch and fork parent for all 30 forks.
- Compare each fork with its upstream and identify the user-authored delta.
- Record license, copyright notices, security advisories, dependency health, CI, tests and release status.
- Inspect original repositories for missing licenses; do not choose or apply a license automatically.
- Identify actual dependency edges and APIs from source manifests before converting these proposed groupings into runtime dependencies.
- Add a machine-readable manifest only after the first source audit confirms stable repository identifiers and relationship types.

## Scope

This registry currently covers the 44 public repositories returned by the personal GitHub account inventory (14 non-forks and 30 forks). It does not claim to enumerate organization repositories, private repositories, or projects that are modules within another repository.
