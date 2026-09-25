# Device Connectivity

Cloud107 uses connectivity capabilities already provided by the user's device, operating system, network, and attached hardware.

The current architecture does not introduce a custom mesh-networking layer.

## Connectivity

User device
- Wi-Fi / Ethernet — IP networking
- Bluetooth / BLE — nearby devices and peripherals
- NFC — short-range device interaction

## Wi-Fi / Ethernet

Primary connectivity for:

- Cloud107 workspace access
- node communication
- workload access
- local network resources
- Internet-connected resources

Cloud107 uses the platform network stack rather than replacing it.

## Bluetooth / BLE

Used where the host platform exposes supported Bluetooth capabilities.

Potential workloads include:

- peripherals
- controllers
- sensors
- local device interaction
- device provisioning

The actual available operations depend on the host operating system and hardware.

## NFC

Used where NFC hardware and platform APIs are available.

Potential workloads include:

- short-range discovery
- provisioning
- identity exchange
- device interaction

NFC is not required for Cloud107 operation.

## Home ecosystem integrations

Cloud107 may provide optional integrations with:

- Google Home
- Apple Home
- Amazon Alexa

These integrations are adapters around existing ecosystems. They are not Cloud107 core dependencies.

Home ecosystem request → Cloud107 integration adapter → Cloud107 capability / operation → authoritative runtime state.

A home ecosystem request must not bypass Cloud107's authorization and execution boundaries.

## Existing infrastructure principle

Cloud107 should use capabilities already present on modern user devices and infrastructure where practical.

It should not recreate:

- operating-system networking
- Bluetooth stacks
- NFC stacks
- consumer home-control networks
- general-purpose device discovery systems

Cloud107's responsibility is to:

1. discover supported capabilities;
2. expose them through a stable Cloud107 interface;
3. authorize requested operations;
4. execute through the platform or connected provider;
5. report the resulting authoritative state.

## Mesh networking

Custom mesh networking is deferred for at least two years.

The following are outside the current architecture:

- Headscale/Tailscale control planes
- custom mesh routing
- mesh-specific node discovery
- custom NAT traversal infrastructure
- mesh-specific network identity architecture

This deferral does not remove independent requirements for authentication, authorization, node identity, or encrypted transport where those are required by a particular Cloud107 interface.

## Platform boundary

Device capabilities are platform-dependent.

Cloud107 should therefore represent capability availability explicitly rather than assuming that every device supports every interface.

Hardware → operating system → platform API → Cloud107 capability adapter → Cloud107 operation → result.

A capability that is unavailable on a particular device is reported as unavailable; the system does not fabricate support.

## Phase 2 scope

For the current Phase 2 implementation, device connectivity is an integration surface rather than a new networking subsystem.

The immediate objective is to establish clean capability boundaries that can later be connected to platform-specific implementations and optional home-ecosystem adapters.

Mesh networking is not required for Phase 2 artifact release.
