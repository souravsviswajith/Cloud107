provider "aws" {
  region = var.region
}

variable "region" {
  default = "us-east-1"
}

# VPC and Networking
resource "aws_vpc" "cloud_workspace_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "cloud-workspace-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnets" {
  count                   = 2
  vpc_id                  = aws_vpc.cloud_workspace_vpc.id
  cidr_block              = cidrsubnet(aws_vpc.cloud_workspace_vpc.cidr_block, 8, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "cloud-workspace-public-subnet-${count.index}"
  }
}

# Security Group for VMs
resource "aws_security_group" "vm_sg" {
  name        = "cloud-workspace-vm-sg"
  description = "Security Group for Windows Workstations"
  vpc_id      = aws_vpc.cloud_workspace_vpc.id

  # WebRTC UDP Ports
  ingress {
    from_port   = 50000
    to_port     = 60000
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound access for updates/downloads
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
