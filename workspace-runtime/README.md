# Cloud Workspace Runtime

This is the Windows Workspace Runtime for Cloud Workspace. It runs as a native Windows Service separately from the Desktop Agent.
While the Desktop Agent handles UI interactions (windows, applications), the Runtime is responsible for:

- Workspace lifecycle management
- Health and Telemetry monitoring
- Plugin administration
- Software and Configuration management
- Policy enforcement

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
