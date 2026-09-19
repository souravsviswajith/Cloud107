<#
.SYNOPSIS
Installs NVIDIA GPU Drivers, CUDA, cuDNN, and AI tools.
#>

Write-Host "Installing NVIDIA Display Drivers for Datacenter GPUs..."
# This assumes an AWS G5/G4dn instance running NVIDIA Grid/Tesla drivers
choco install -y nvidia-display-driver

Write-Host "Installing CUDA Toolkit..."
choco install -y cuda

Write-Host "Installing cuDNN..."
choco install -y cudnn

Write-Host "Installing AI/ML Frameworks..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install tensorflow jupyterlab

Write-Host "Installing Ollama for Local LLMs..."
Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "C:\Windows\Temp\OllamaSetup.exe"
Start-Process -FilePath "C:\Windows\Temp\OllamaSetup.exe" -ArgumentList "/S" -Wait

Write-Host "Phase 3 Complete."
