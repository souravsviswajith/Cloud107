# Multi-Experience Workspace Architecture

## 1. Updated System Architecture

The Cloud Workspace platform introduces a multi-experience frontend architecture while retaining a single, unified backend and VM lifecycle manager.

- **Frontend Layer:** Implements a `ModeManager` that handles transitions between Dashboard, Desktop, and Application modes without destroying the underlying session state.
- **Backend Layer:** Tracks the active session per VM. Multiple frontend modes can connect to the same WebRTC signaling endpoint.
- **Host Agent Layer:** The Windows WebRTC agent supports two streaming paradigms:
  1. **Full Desktop Capture (DXGI):** Streams the entire desktop buffer.
  2. **RemoteApp/Rail Capture:** Streams only the bounding box and window contents of a specific application process, masking the rest of the desktop.

## 2. Mode Manager Architecture

The Mode Manager is a React Context/State machine responsible for:

- **State:** `activeMode` (dashboard | desktop | application), `activeVm` (VmInstance), `activeApp` (Application).
- **Transitions:** Handles smooth swapping of the UI layer. When switching from Desktop to Dashboard, the WebRTC connection can be paused or kept alive in the background (picture-in-picture or hidden canvas) to allow instant return.
- **Session Preservation:** Ensures that returning to the Dashboard does not trigger a VM shutdown unless explicitly requested.

## 3. Navigation Flow

```text
Login
  ↓
Dashboard (Workspace List)
  ↓
Select Workspace (Click on a VM)
  ├── Launch Desktop ──────────────→ Desktop Mode
  └── Launch Application ──────────→ App Library
                                        ↓
                                     Select App
                                        ↓
                                     Application Mode
```

## 4. UI Wireframes & Routing Structure

- `/` - Dashboard (List of VMs and Global Settings)
- `/workspace/:id/desktop` - Desktop Mode (Fullscreen canvas, floating toolbar)
- `/workspace/:id/apps` - Application Library (Grid of available apps for the VM)
- `/workspace/:id/app/:appId` - Application Mode (Frameless application stream canvas)

## 5. Session Management Design

- **Single Source of Truth:** The VM runs continuously once booted.
- **Mode Switching:** Switching modes sends a control message via WebRTC DataChannel to the Host Agent to switch capture modes (e.g., from DXGI full screen to Window-specific capture).
- **Graceful Degradation:** If Application Mode fails to hook the application window, it falls back to Desktop Mode and notifies the user.
