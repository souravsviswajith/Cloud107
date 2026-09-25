# Hypervisor References

This document records relevant open-source hypervisor projects and their documentation for Cloud107's hardware, virtualization, and execution model.

## KVM / Linux virtualization

### KVM

KVM (Kernel-based Virtual Machine) is the Linux kernel virtualization subsystem. It exposes hardware-assisted virtualization through a kernel API and is commonly used with userspace VMMs such as QEMU.

Documentation: https://www.kernel.org/doc/html/latest/virt/kvm/index.html

### QEMU

QEMU can operate as a machine emulator and as a virtualizer when paired with KVM. Its system emulation provides virtual CPUs, memory, devices, buses, firmware, and machine models.

Documentation: https://www.qemu.org/docs/master/

Cloud107 relevance: QEMU + KVM provides a major open-source reference for combining machine/device emulation with hardware-assisted virtualization.

## Xen

Xen is an open-source type-1 hypervisor architecture supporting multiple guest operating systems and virtualization modes. It provides a hypervisor layer below guest operating systems and supports hardware-assisted virtualization.

Documentation: https://xenbits.xen.org/docs/latest/

Cloud107 relevance: Xen is a reference for a dedicated hypervisor architecture and for managing multiple isolated guest domains.

## bhyve

bhyve is a BSD hypervisor using hardware virtualization extensions. It is integrated into FreeBSD and provides virtual-machine execution with a relatively small architecture.

Documentation: https://bhyve.org/

Cloud107 relevance: bhyve is a useful reference for BSD-based virtualization and for a comparatively direct VMM/hypervisor architecture.

## Microsoft Hyper-V

Hyper-V is Microsoft's native hypervisor architecture for Windows and Windows Server. Its documentation covers virtual machines, virtual networking, virtual storage, nested virtualization, and management APIs.

Documentation: https://learn.microsoft.com/windows-server/virtualization/hyper-v/

Cloud107 relevance: Hyper-V is important for Windows/WSL integration and for understanding Windows-native virtualization boundaries.

## Open-source hypervisor / VMM building blocks

### Cloud Hypervisor

Cloud Hypervisor is an open-source VMM designed around modern cloud workloads. It uses KVM and focuses on a small device model, isolation, and cloud-oriented virtual machines.

Documentation: https://www.cloudhypervisor.org/docs/

### Firecracker

Firecracker is an open-source VMM based on KVM that provides lightweight microVMs with a deliberately small virtual device surface.

Documentation: https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md

Cloud107 relevance: Firecracker is a useful reference for workload isolation where a full traditional VM device model is unnecessary.

### crosvm

crosvm is an open-source virtual machine monitor written in Rust. It is used in ChromeOS and focuses on secure, sandboxed virtualization.

Documentation: https://chromium.googlesource.com/crosvm/crosvm/

Cloud107 relevance: crosvm is relevant to browser/desktop-adjacent virtualization, sandboxing, and Rust-based VMM design.

### rust-vmm

rust-vmm is a collection of Rust crates for building secure and performant VMMs rather than one complete hypervisor product. Components include abstractions for KVM, virtual CPUs, memory, devices, and virtualization infrastructure.

Documentation: https://github.com/rust-vmm/community

Cloud107 relevance: rust-vmm is a reference for building specialized virtualization components without implementing an entire VMM monolithically.

## Virtualization standards and interfaces

### VirtIO

VirtIO defines standardized virtual device interfaces used by virtual machines for devices such as block storage, networking, memory, and other resources.

Specification: https://docs.oasis-open.org/virtio/

Cloud107 relevance: VirtIO is particularly important when Cloud107 needs portable virtual devices across different VMMs and hypervisor environments.

### UEFI / OVMF

OVMF provides UEFI firmware for virtual machines and is based on EDK II. It is relevant to booting guest operating systems through standardized firmware interfaces.

Documentation: https://github.com/tianocore/tianocore.github.io/wiki/OVMF

## Relationship to Cloud107

Hypervisors and VMMs belong below the Cloud107 execution/control layer:

```
Cloud107
   ↓
Execution / workload model
   ↓
Virtual machine or native workload
   ↓
Hypervisor / VMM
   ├── KVM
   ├── Xen
   ├── bhyve
   ├── Hyper-V
   ├── Cloud Hypervisor
   ├── Firecracker
   └── crosvm
        ↓
Virtual CPU / memory / devices
        ↓
Guest OS or workload
```

For a Linux host, one possible path is:

```
Cloud107
  ↓
QEMU / Cloud Hypervisor / another VMM
  ↓
KVM
  ↓
CPU virtualization extensions
  ↓
Guest OS
```

Cloud107 should select the smallest appropriate virtualization layer for the workload. A microVM, full VM, container, emulated machine, or native process are different execution choices and should not be treated as interchangeable.

## Scope boundary

These are external open-source references and documented integration candidates. Their inclusion does not mean that Cloud107 currently integrates every hypervisor or VMM listed here. Hardware virtualization also depends on host CPU capabilities, firmware configuration, operating-system support, and available resources.
