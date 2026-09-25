# Kubernetes

Phase 2 adds Kubernetes as a deployment and workload target for Cloud107.

The first target is a small, explicit deployment that keeps the existing application topology:

```text
PostgreSQL
    ↓
migration Job
    ↓
Cloud107 Deployment
    ↓
Cloud107 Service
```

## Requirements

- Kubernetes cluster
- `kubectl`
- Cloud107 container image available to the cluster

The initial manifests use:

```text
cloud107:1.0.7
```

For a local cluster, build and load the image using the mechanism provided by the selected cluster.

## Configure secrets

Create the required secret before applying the workload:

```bash
kubectl create namespace cloud107
kubectl -n cloud107 create secret generic cloud107-secrets \
  --from-literal=SQL_ADMIN_PASSWORD='change-this' \
  --from-literal=SQL_PASSWORD='change-this' \
  --from-literal=C107_AUTH_SECRET='change-this'
```

The values above are examples. Do not commit real credentials.

## Deploy

Apply the resources:

```bash
kubectl apply -k infra/kubernetes
```

Check the resources:

```bash
kubectl -n cloud107 get pods
kubectl -n cloud107 get services
kubectl -n cloud107 get jobs
```

Check migration output:

```bash
kubectl -n cloud107 logs job/cloud107-migrate
```

Check application output:

```bash
kubectl -n cloud107 logs deployment/cloud107
```

## Architecture boundary

Kubernetes is a deployment/runtime target for Cloud107. It is not the definition of the Cloud107 architecture.

Cloud107 keeps its own concepts for projects, nodes, operations, workloads, environments, and updates. Kubernetes provides a supported execution substrate for the parts mapped to Kubernetes resources.

The first implementation intentionally does not introduce custom operators, CRDs, or a Kubernetes-specific control model.

## Next Kubernetes work

Later Phase 2 work can add:

- node discovery and capability reporting
- workload resources
- resource requests and limits
- GPU/device integration
- health and readiness reporting
- controlled rollout/update integration
- Gateway API integration where required
- Cloud107-to-Kubernetes reconciliation

Each capability should be implemented and verified before it is documented as supported.
