<#
.SYNOPSIS
Installs all requested development tools using Chocolatey.
#>

Write-Host "Installing Core Utilities..."
choco install -y 7zip powertoys everything sysinternals

Write-Host "Installing Development Tools..."
choco install -y git gh git-lfs vscode visualstudio2022community nodejs-lts yarn pnpm bun python cmake
choco install -y jdk21 maven gradle golang rust
choco install -y awscli azure-cli gcloudsdk terraform

Write-Host "Installing Containers & DBs..."
choco install -y docker-desktop kubernetes-cli kubernetes-helm postgresql mysql redis mongodb

Write-Host "Installing Android Toolchain..."
choco install -y androidstudio android-sdk

Write-Host "Installing Cloud107 CLI..."
npm install -g cloud107

Write-Host "Installing Python tools (uv)..."
pip install uv

Write-Host "Setting up WSL default to Ubuntu..."
wsl --install -d Ubuntu

Write-Host "Development toolchain setup complete."
