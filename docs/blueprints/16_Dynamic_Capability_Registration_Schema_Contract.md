# Blueprint: Dynamic Capability Registration & Schema Contract

**Status:** Crystallized (Formal Architectural Specification)

**Tags:** #architecture #capability-model #dynamic-registration #json-schema #rpc

## Core Principle

**The orchestrator knows nothing of the MCU; it knows only the schema.**

Cloud107 rejects hardcoded platform-specific execution targets in the core control plane. Nodes dynamically advertise their capabilities, input schemas, and execution constraints at runtime.

## 1. Dynamic Capability Registration

When a node initializes or reconnects to the sovereign mesh, it transmits its capability inventory to the control plane.

A registration contains:

- Node identity.
- Provider identity.
- Capability URN: the immutable, versioned capability identity.
- Type: action, readonly, or stream.
- Schema: JSON Schema describing accepted operation input.
- Constraints: execution limits such as frequency, privilege, and payload size.

Example registration:

    {
      "urn": "pkg:cloud107/capability/sensor.gpio.read@1.0.0",
      "type": "readonly",
      "constraints": {
        "maxFrequencyHz": 100,
        "requiresPrivilege": false,
        "maxPayloadBytes": 512
      }
    }

## 2. Control-Plane Boundary

The control plane interacts with the capability contract rather than concrete substrate implementations:

    Node / MCU Substrate
           | capability inventory
           v
    Capability Registry
           | capability URN + schema
           v
    ProviderResolver
           | validated operation
           v
    Native Provider Execution

A provider can introduce a new execution substrate without modifying the core capability-selection model.

## 3. Registration Lifecycle

1. Registration: the node advertises its capability inventory.
2. State update: the registry stores the inventory as part of node capability state.
3. Capability lookup: execution planning resolves a capability by its canonical URN.
4. Input validation: the operation payload is validated against the advertised schema.
5. Constraint validation: execution limits are checked before transport.
6. Provider execution: the provider translates the validated operation into native substrate primitives.
7. Observation: execution results and resulting state are returned to the control plane.

## 4. Constrained Substrates

The registration contract supports constrained devices without introducing MCU-specific fields into the orchestrator. Constraints may express memory or payload limits, maximum operation frequency, required privilege, transport requirements, and idempotency or retry characteristics.

The provider remains responsible for translating the contract into its native transport and execution mechanism.