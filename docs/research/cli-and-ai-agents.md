# CLI and AI Agent References

This document records relevant open-source CLI projects and documents how an AI agent can divide work between a user and Cloud107 without replacing the user's authority.

## Open-source CLI projects

### Git
Git is a distributed version-control system with a command-line interface covering repositories, branches, commits, diffs, remotes, tags, and history.
Documentation: https://git-scm.com/docs

### GitHub CLI (gh)
GitHub CLI provides command-line access to GitHub repositories, issues, pull requests, releases, workflows, and other GitHub operations.
Documentation: https://cli.github.com/manual/

### Docker CLI
The Docker CLI manages images, containers, networks, volumes, builds, and registries.
Documentation: https://docs.docker.com/reference/cli/docker/

### kubectl
kubectl is the Kubernetes command-line client for cluster resources, workloads, configuration, logs, execution, and lifecycle operations.
Documentation: https://kubernetes.io/docs/reference/kubectl/

### Helm
Helm is a Kubernetes package manager with a CLI for charts, releases, repositories, installation, upgrades, rollback, and inspection.
Documentation: https://helm.sh/docs/

### Terraform / OpenTofu CLI
Terraform and OpenTofu provide declarative infrastructure workflows through command-line tooling for initialization, planning, validation, application, and state management.
Terraform documentation: https://developer.hashicorp.com/terraform/cli
OpenTofu documentation: https://opentofu.org/docs/cli/

### Ansible
Ansible provides command-line automation for configuration management, application deployment, orchestration, and remote execution.
Documentation: https://docs.ansible.com/

### Nix
Nix provides reproducible package/environment management through a command-line interface and declarative expressions.
Documentation: https://nix.dev/manual/nix/

### systemd / systemctl
systemd provides Linux service and system management, while systemctl is its primary management CLI.
Documentation: https://www.freedesktop.org/software/systemd/man/latest/systemctl.html

### OpenSSH
OpenSSH provides secure remote login, command execution, tunneling, file transfer, and key-based authentication.
Documentation: https://www.openssh.com/manual.html

## Cloud provider CLIs

Major cloud providers also expose CLIs relevant to provider adapters:
- Google Cloud CLI (gcloud): https://cloud.google.com/sdk/gcloud
- AWS CLI: https://docs.aws.amazon.com/cli/
- Azure CLI (az): https://learn.microsoft.com/cli/azure/

These CLIs expose provider-specific resources and operations. Cloud107 can use them where an official provider API, SDK, or direct integration is not more appropriate.

## AI agent division of work

The AI agent reduces low-level command selection and coordination while keeping the user's objective and authority explicit.

User → intent/objective → AI agent → capability/tool selection → Cloud107/CLI/API → execution/validation/observation → AI agent → result → user

The agent can:
- understand the request
- break it into bounded steps
- select an available capability
- select an appropriate tool or CLI
- prepare commands or API operations
- validate prerequisites
- request confirmation when authority or risk requires it
- inspect authoritative results
- explain the result.

### Example: simple task

User: "Run my Python project."

The agent can inspect the project, identify its declared environment, prepare the appropriate execution path, and execute it when authorized. The user does not need to manually determine every environment, dependency, container, or command detail.

### Example: infrastructure task

User: "Deploy this service to three nodes."

The agent can inspect the project, identify compatible nodes, validate required images and toolchains, construct the Cloud107 or Kubernetes operations, obtain confirmation where required, execute through the authorized interface, inspect rollout and health, and report the actual result.

The agent must not invent node capacity, deployment state, cost, or permissions.

### Example: maintenance task

User: "Update Cloud107."

The agent can invoke the Cloud107 update interface. The update system remains responsible for provenance, signature verification, hashes, compatibility, checkpointing, activation, health verification, and rollback.

The agent therefore coordinates the operation rather than becoming the trust boundary.

## Command authority levels

### Explain
The agent explains what should be done without executing it.

### Prepare
The agent generates a command, plan, patch, or operation for review.

### Execute
The agent performs an authorized operation through Cloud107 or another explicitly permitted interface.

### Verify
The agent reads authoritative output and reports what actually happened.

These levels can be exposed through Cloud107 permissions and user settings rather than being implicit in the model.

## Work decomposition

For larger requests:

Goal → Plan → Capability requirements → Small executable tasks → Validation boundaries → Final result

This lets the user focus on the objective while the agent handles repetitive technical coordination. The division should remain observable and reversible where the underlying operation permits it. Users should be able to inspect planned operations, execution history, and resulting state.

## Cloud107 boundary

The AI agent is an orchestration layer.

Cloud107 remains responsible for resource discovery, capability validation, authorization, execution, state, health, update verification, rollback, and authoritative resource or billing information where available.

The agent can choose and sequence operations, but it must not fabricate or override authoritative infrastructure state.

## Scope boundary

The CLI projects listed here are open-source references and possible execution components. Their inclusion does not claim that Cloud107 currently integrates every CLI listed.
## Everyday and interactive CLI utilities

Cloud107's CLI ecosystem should also account for small Unix-style tools that make direct computer use faster. These are not infrastructure controllers; they are focused user tools that can become useful building blocks for an AI-assisted terminal.

### Fastfetch / Neofetch

Fastfetch is a maintained, cross-platform system-information tool inspired by Neofetch. It can expose OS, hardware, software, graphics, memory, storage, and other system information through a terminal interface. Neofetch itself is a historical reference; Fastfetch is the maintained project to evaluate for current integrations.

Fastfetch source: https://github.com/fastfetch-cli/fastfetch
Fastfetch documentation: https://fastfetch.dev/

### Ranger

Ranger is a console file manager with vi-style key bindings, directory navigation, file previews, file operations, and integration with external programs.

Source/documentation: https://github.com/ranger/ranger

### Atuin

Atuin is a shell-history and command-management tool. It provides searchable command history and synchronization capabilities and can replace or augment traditional shell history workflows.

Source/documentation: https://github.com/atuinsh/atuin

### zoxide / autojump

zoxide is a smarter directory-navigation command inspired by z and autojump. It learns frequently used directories and provides ranked navigation. Its documentation also supports importing history from autojump and other directory-jumping tools.

Source/documentation: https://github.com/ajeetdsouza/zoxide

### fzf

fzf is a general-purpose command-line fuzzy finder. It can provide interactive selection for files, commands, history, processes, and other text streams and is commonly composed with other CLI tools.

Source/documentation: https://github.com/junegunn/fzf

### ripgrep

ripgrep is a recursive search tool optimized for searching files and directories while respecting common ignore rules.

Source/documentation: https://github.com/BurntSushi/ripgrep

### fd

fd is a simple, fast alternative to traditional find usage for common filesystem-search tasks.

Source/documentation: https://github.com/sharkdp/fd

### bat

bat is a cat replacement with syntax highlighting, paging, and Git-aware display features.

Source/documentation: https://github.com/sharkdp/bat

### eza

eza is a modern replacement for ls with additional metadata, tree views, Git integration, and configurable display options.

Source/documentation: https://github.com/eza-community/eza

### jq

jq is a command-line JSON processor. It is particularly useful for composing CLI and API workflows because structured output can be filtered and transformed without requiring a full programming language runtime.

Source/documentation: https://jqlang.org/

### btop

btop is an interactive resource monitor covering CPU, memory, disks, network, and processes.

Source/documentation: https://github.com/aristocratos/btop

### ncdu

ncdu is a disk-usage browser designed for interactive terminal use. It is useful for quickly locating storage consumption without a graphical disk analyzer.

Source/documentation: https://dev.yorhel.nl/ncdu

### tmux

tmux is a terminal multiplexer that allows multiple terminal sessions and panes to run within one terminal environment and persist independently of the client connection.

Source/documentation: https://github.com/tmux/tmux

### lazygit

lazygit is a terminal UI for Git repositories. It provides interactive views and operations for commits, branches, staging, diffs, and other Git workflows.

Source/documentation: https://github.com/jesseduffield/lazygit

## Why these tools matter to the AI-agent model

These utilities demonstrate a different kind of agent integration from cloud orchestration:

- Fastfetch → discover local system characteristics
- Ranger → inspect and navigate project files
- Atuin → search previous commands and workflows
- zoxide → navigate to known working locations
- fzf → interactively select among candidates
- ripgrep / fd → locate relevant files
- bat / jq → inspect structured or source content
- btop / ncdu → inspect resource and storage state
- tmux → maintain long-running terminal workflows
- lazygit → inspect and operate Git state

The agent can compose these capabilities instead of requiring a user to remember every command.

Example:

User: Find the project where I was working on the Kubernetes deployment yesterday and open its deployment file.

Possible agent workflow:

1. use available history/context information to identify likely project locations
2. use zoxide or filesystem inspection to reach the location
3. use fd/rg to locate Kubernetes manifests
4. inspect the relevant file
5. present the result or open it through the authorized workspace interface

The tools remain ordinary Unix-style programs. The agent is the coordination layer that turns a natural-language objective into a sequence of small tool operations.