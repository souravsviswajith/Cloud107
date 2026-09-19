packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "g5.2xlarge" # Includes NVIDIA A10G GPU for hardware encoding/CUDA
}

source "amazon-ebs" "windows_11_golden" {
  ami_name      = "cloud-workspace-win11-golden-{{timestamp}}"
  instance_type = var.instance_type
  region        = var.region
  communicator  = "winrm"
  winrm_username = "Administrator"
  winrm_use_ssl  = true
  winrm_insecure = true

  # Start from a clean Windows Server 2022 / Windows 11 base image
  source_ami_filter {
    filters = {
      name                = "Windows_Server-2022-English-Full-Base-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }

  user_data_file = "./scripts/bootstrap-winrm.txt"

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 128
    volume_type           = "gp3"
    delete_on_termination = true
  }
}

build {
  name    = "cloud-workspace-golden"
  sources = ["source.amazon-ebs.windows_11_golden"]

  # 1. Install Package Manager (Chocolatey / Winget)
  provisioner "powershell" {
    script = "./scripts/01-install-package-managers.ps1"
  }

  # 2. Install Developer Toolchain (VS Code, Docker, Python, etc.)
  provisioner "powershell" {
    script = "./scripts/02-install-toolchain.ps1"
  }

  # 3. Install AI & GPU drivers (CUDA, cuDNN)
  provisioner "powershell" {
    script = "./scripts/03-install-gpu-drivers.ps1"
  }

  # 4. Optimize OS for low-latency streaming
  provisioner "powershell" {
    script = "./scripts/04-optimize-os.ps1"
  }

  # 5. Sysprep to generalize the image
  provisioner "powershell" {
    inline = [
      "C:\\Windows\\System32\\Sysprep\\sysprep.exe /generalize /oobe /quit /quiet"
    ]
  }
}
