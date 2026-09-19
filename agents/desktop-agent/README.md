# Cloud Workspace Desktop Agent

This is the Windows Desktop Agent for Cloud Workspace. It runs as a Windows Service and communicates with the Cloud107 backend over WebSockets to provide user-facing capabilities like launching applications, managing windows, capturing screenshots, and syncing the clipboard.

## Features
- **Application Manager**: Launch, terminate, and list apps.
- **Window Manager**: Enumerate windows, bring to front, minimize, close.
- **Process Manager**: Monitor processes, CPU, and RAM.
- **Clipboard Manager**: Sync clipboard securely.
- **File Transfer**: Upload and download to the workspace folder.
- **Screenshot Service**: Capture desktop and windows.
- **Performance Monitor**: Report CPU, GPU, RAM, Disk usage.

## Setup for Development
1. Install Python 3.12+ (Windows).
2. Install dependencies:
   \`\`\`cmd
   pip install -r requirements.txt
   \`\`\`
3. Run standalone:
   \`\`\`cmd
   python main.py
   \`\`\`

## Building the Windows Service
1. Install PyInstaller:
   \`\`\`cmd
   pip install pyinstaller
   \`\`\`
2. Build the executable:
   \`\`\`cmd
   pyinstaller build.spec
   \`\`\`
3. The executable will be in the \`dist/\` folder.

## Installation
Run \`install_service.bat\` as Administrator from the \`dist/\` directory.
