# Release Channels and Distribution

**Status:** Release architecture  
**Applies to:** Cloud Emulation and compatible 107 ecosystem applications.  
**Canonical source:** The project's Git repository and its tagged, signed release artifacts.

## 1. Distribution channels

| Channel | Primary package / content | Intended audience | Distribution role |
|---|---|---|---|
| GitHub Releases | Source archives, checksums, signatures, release notes, supported desktop artifacts | Developers and technical users | Canonical public release record and provenance |
| SourceForge | Mirrored source archives and selected downloadable release artifacts | Open-source users and users who prefer software-download mirrors | Secondary mirror; never the source of truth |
| Uptodown | Eligible Android APK releases and app listing, where accepted | Android users | Additional Android discovery/distribution channel; not a replacement for Google Play |
| Microsoft Store (Windows) | Properly packaged and signed MSIX/MSIXBundle or other store-supported package | Windows users | Store-managed discovery, installation, updates, and certification |
| Google Play Store (Android) | Android App Bundle (AAB) submitted for Play distribution; APKs may be used for compatible non-Play channels | Android users | Primary Android store channel, subject to Play policy and review |
| Direct project downloads | Platform-specific installers, portable archives, or browser-hosted web app | Users who need direct installation or do not use a store | Optional distribution path with verifiable checksums/signatures |

Store and mirror availability is conditional on account eligibility, platform requirements, content policies, signing, certification, and review. Listing a channel in this architecture does not mean the application is already published or approved there.

## 2. Source of truth and release flow

The repository remains authoritative. Mirrors and stores are publication targets, not dependencies of the application.

`source → CI build/test → package → sign → generate manifest/checksums → maintainer approval → publish → verify → observe`

1. Build each supported OS/architecture from a tagged source revision using reproducible, documented CI steps where practical.
2. Run the applicable unit, integration, packaging, security, and smoke tests.
3. Produce platform-appropriate packages; do not distribute one binary across incompatible targets.
4. Generate release notes and a manifest containing version, source tag/commit, OS, architecture, package type, SHA-256, signature/provenance, license, permissions, and test status.
5. Publish the canonical GitHub release first. Publish approved artifacts to mirrors and stores from the same release candidate.
6. Verify uploaded package hashes where the destination preserves the exact artifact; otherwise verify package identity, version, signing metadata, and store listing state.
7. Record publication URLs and review status. A release is not marked published for a channel until the listing or artifact is actually accessible.

## 3. Platform packaging rules

### Windows / Microsoft Store

- Produce a Store-compliant, signed MSIX/MSIXBundle or another package format explicitly supported for the selected submission.
- Validate architecture and minimum Windows version, package identity, publisher identity, capabilities, installation/uninstallation, and update behavior.
- Keep direct downloads available where appropriate, but ensure direct and Store packages have clear provenance and supported update paths.
- Treat WSL/Linux execution as a separate runtime capability; a Windows Store package does not automatically package or certify every WSL workload.

### Android / Google Play / Uptodown

- Build and test the Android application separately from desktop binaries.
- Use an Android App Bundle for Google Play when required by Play's current submission rules; manage upload/signing keys securely.
- Use a signed APK for channels that distribute APKs directly, only when that channel's current rules permit it. Never publish debug builds or expose signing keys in source control or CI logs.
- Verify target API level, permissions, privacy disclosures, data-safety declarations, device compatibility, and store policies before submission.
- Google Play and Uptodown may have different review, signing, update, and policy requirements. Maintain separate publication adapters and check the current rules for each channel.

### SourceForge

- Mirror only approved, redistributable release artifacts and source archives.
- Publish the matching version, release notes, checksums, license, and link to the canonical release.
- Do not let a mirror-hosted file silently replace a canonical artifact; investigate hash mismatches and remove or flag stale files.

## 4. Updates, rollback, and channel parity

- Each channel uses the same logical release version and release manifest, while package identifiers, signing, and platform-specific metadata remain channel-specific.
- Store-managed installations update through the store's supported mechanism. Direct installations use the project's verified update mechanism or explicit user download; do not assume cross-channel automatic updates.
- Maintain a known-good prior release and document rollback steps. For stores, rollback may require submitting a corrected release or using store-specific staged rollout controls rather than replacing an already published package.
- Use staged rollout where the channel supports it; monitor crashes, install failures, compatibility reports, and update failures before expanding rollout.
- Compatibility is required across supported targets; exact feature or execution-host parity is not. Clearly document unsupported capabilities and fallbacks.

## 5. Governance and security

- Contributors propose changes through pull requests; maintainers retain merge and release authority.
- Store credentials, signing keys, and API tokens belong in the platform's secure secret store, with least-privilege permissions and rotation.
- CI should use protected release environments and require maintainer approval before publishing.
- Do not collect personal data or add advertising/subscription requirements merely to support distribution. Collect only operational telemetry that is necessary, disclosed, and consented to where applicable.
- Keep application functionality independent of any one store, mirror, cloud service, or paid distribution backend.
- Confirm third-party license, model/data rights, and redistribution permissions before publishing every artifact.

## 6. Release checklist

- [ ] Version and source tag are final.
- [ ] CI tests and packaging checks pass for the target.
- [ ] Package is signed and the manifest/checksum is generated.
- [ ] License, permissions, privacy disclosures, and third-party notices are included.
- [ ] Canonical GitHub release is available.
- [ ] SourceForge / Uptodown / Microsoft Store / Google Play submissions are made only for eligible artifacts.
- [ ] Each channel's listing, version, package identity, and installation path are verified.
- [ ] Publication status and URLs are recorded; unapproved channels are marked pending rather than published.
- [ ] Rollback and support notes are ready.

## 7. Relationship to the shared 107 architecture

Release management is a cross-project operational capability, not a new global runtime dependency. Cloud107 may coordinate build/release workloads and artifacts; Cloud Emulation validates execution environments; Compiler107 owns IR transformations; each product repository retains ownership of its own source, packaging, and release-specific implementation. Racoon remains independent and is not included in this 107 release plan.
