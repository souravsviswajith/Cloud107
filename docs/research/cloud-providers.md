# Cloud Provider Documentation References

This document records the official Google Cloud, AWS, and Microsoft Azure documentation relevant to Cloud107's infrastructure abstraction and provider integration model.

## Google Cloud

### Compute Engine
Google Compute Engine documents virtual-machine instances, machine resources, disks, images, networking, instance templates, and managed instance groups.

Reference: https://cloud.google.com/compute/docs/

### IAM
Google Cloud IAM defines access using principals, roles, permissions, and resources. Compute Engine exposes predefined IAM roles and permissions for different resource operations.

References:
- https://cloud.google.com/iam/docs/overview
- https://cloud.google.com/compute/docs/access/iam

### Google Kubernetes Engine (GKE)
GKE provides managed Kubernetes infrastructure and is relevant to Cloud107's Kubernetes provider layer.

Reference: https://cloud.google.com/kubernetes-engine/docs/

### Virtual Private Cloud
Google Cloud VPC documentation covers networks, subnets, routes, firewall rules, connectivity, and related networking resources.

Reference: https://cloud.google.com/vpc/docs

### Cloud Storage
Cloud Storage provides object storage and APIs for application and infrastructure workloads.

Reference: https://cloud.google.com/storage/docs

## Amazon Web Services

### Amazon EC2
EC2 provides virtual compute instances, machine images, instance configuration, storage, networking, and related lifecycle APIs.

Reference: https://docs.aws.amazon.com/ec2/

### Amazon VPC
Amazon VPC provides logically isolated virtual networks with configurable address ranges, subnets, route tables, gateways, and security controls.

Reference: https://docs.aws.amazon.com/vpc/

### Amazon S3
S3 provides object storage and API-based access to objects and buckets.

Reference: https://docs.aws.amazon.com/s3/

### IAM
AWS IAM controls authentication and authorization for AWS resources through identities, roles, policies, and permissions.

References:
- https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-iam.html

### Amazon EKS
EKS provides managed Kubernetes. AWS documentation describes integration with VPC networking, EC2 compute, IAM, storage, and Kubernetes workloads.

References:
- https://docs.aws.amazon.com/eks/latest/userguide/
- https://docs.aws.amazon.com/eks/latest/userguide/creating-a-vpc.html

AWS documents that EKS clusters, nodes, and Kubernetes resources are deployed into a VPC, with subnet and networking requirements. AWS also documents IAM integration for cluster and workload access.

## Microsoft Azure

### Azure Virtual Machines
Azure Virtual Machines provide on-demand virtualized compute for Linux and Windows workloads, with associated storage, networking, images, sizes, and lifecycle configuration.

Reference: https://learn.microsoft.com/azure/virtual-machines/

### Azure Virtual Network
Azure Virtual Network provides private network isolation, subnets, IP addressing, network security, routing, and connectivity to Azure and on-premises resources.

Reference: https://learn.microsoft.com/azure/virtual-network/

### Azure Storage
Azure Storage includes Blob Storage, Azure Files, Disk Storage, Queue Storage, Table Storage, and other storage services.

References:
- https://learn.microsoft.com/azure/storage/common/storage-introduction
- https://learn.microsoft.com/azure/storage/blobs/storage-blobs-overview

### Azure Kubernetes Service (AKS)
AKS provides managed Kubernetes with cluster, node, networking, identity, storage, and lifecycle management. Current Azure documentation describes AKS Automatic and AKS Standard as two cluster modes.

Reference: https://learn.microsoft.com/azure/aks/

### AKS Hybrid and Edge
AKS Hybrid and Edge extends Kubernetes management to infrastructure outside Azure regions, including bare-metal servers, Azure Local, Windows Server, and Windows IoT or PC-class edge devices.

Reference: https://learn.microsoft.com/azure/aks/hybrid/

### Azure identity and permissions
Azure RBAC and managed identities provide identity and authorization mechanisms for Azure resources and workloads.

Reference: https://learn.microsoft.com/azure/role-based-access-control/

## Provider comparison for Cloud107

| Capability | Google Cloud | AWS | Azure |
|---|---|---|---|
| Virtual compute | Compute Engine | EC2 | Azure Virtual Machines |
| Kubernetes | GKE | EKS | AKS |
| Virtual network | VPC | VPC | Virtual Network |
| Object storage | Cloud Storage | S3 | Blob Storage |
| Identity / authorization | IAM | IAM | Azure RBAC / Managed Identities |
| Hybrid / edge Kubernetes | GKE / hybrid capabilities | EKS hybrid capabilities | AKS Hybrid and Edge |

The table is a terminology and capability map, not a ranking.

## Cloud107 integration boundary

Cloud107 should treat these provider APIs and resource models as provider-specific infrastructure adapters rather than making provider terminology the core Cloud107 model.

A provider adapter can map:

- compute instances / VMs
- virtual networks and subnets
- storage
- identities and permissions
- Kubernetes clusters and nodes
- images and artifacts
- resource lifecycle
- health and operational state
- provider billing data where available

into Cloud107's provider-neutral resource and capability model.

Provider-specific features should remain available through explicit provider capabilities instead of being silently flattened into a lowest-common-denominator abstraction.

## Current-source notes

The references above are official vendor documentation. Current documentation confirms, among other things:

- Google Cloud IAM uses principals, roles, permissions, and resources. Google Compute Engine also exposes predefined IAM roles for resource operations.
- AWS VPC provides logically isolated virtual networks with configurable IP ranges, subnets, routing, gateways, and security settings. AWS EKS integrates Kubernetes with VPC networking and IAM.
- Azure Virtual Machines expose Linux and Windows VM workloads with associated storage and networking. Azure Virtual Network provides network isolation and connectivity. AKS provides managed Kubernetes, while AKS Hybrid and Edge extends Kubernetes management to owned infrastructure and supported edge devices.

These are provider capabilities and documented interfaces, not claims that Cloud107 currently integrates all of them.

## Scope boundary

This document is a research reference. It does not claim that Cloud107 currently supports Google Cloud, AWS, or Azure as production providers unless an implementation exists elsewhere in the repository.
