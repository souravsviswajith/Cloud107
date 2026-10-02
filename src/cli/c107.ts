#!/usr/bin/env node
import { parseArgs } from 'util';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import { resolve } from 'path';

const API_BASE = process.env.C107_API_URL || 'http://127.0.0.1:3000/api/v1';

const ADAPTER_NAMESPACES = [
  'git', 'github', 'gitlab', 'bitbucket',
  'docker', 'podman', 'containerd', 'cri-o',
  'k8s', 'k3s', 'openshift', 'helm', 'kustomize', 'argo',
  'jenkins', 'github-actions', 'gitlab-ci', 'azure-devops', 'tekton', 'argo-cd',
  'terraform', 'opentofu', 'pulumi', 'cloudformation', 'bicep',
  'ansible', 'puppet', 'chef', 'salt',
  'aws', 'azure', 'gcloud',
  'vmware', 'hyperv', 'kvm', 'proxmox', 'openstack', 'opennebula', 'cloudstack',
  'network', 'dns', 'nginx', 'haproxy', 'traefik', 'envoy', 'service-mesh',
  'prometheus', 'grafana', 'opentelemetry', 'jaeger', 'loki', 'elastic',
  'vault', 'sops', 'trivy', 'snyk', 'sonarqube', 'semgrep',
  'harbor', 'artifactory', 'nexus',
  'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'rabbitmq', 'nats', 'mqtt', 'spark', 'flink', 'trino',
  'airflow', 'temporal', 'argo-workflows',
  'npm', 'maven', 'gradle', 'cargo', 'cmake', 'pytest', 'junit', 'k6', 'newman',
  'ssh', 'winrm', 'powershell', 'device-management',
  'jira', 'confluence', 'slack', 'google', 'microsoft'
];

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const subArgs = args.slice(1);

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command === '--version' || command === '-v') {
    console.log('c107 version 1.0.7');
    process.exit(0);
  }

  try {
    if (ADAPTER_NAMESPACES.includes(command)) {
      console.log(`[INFO] Initializing ${command} adapter interface...`);
      console.log(`(Not Implemented: Native tooling or API connector for '${command}' pending configuration)`);
      process.exit(0);
    }

    switch (command) {
      case 'node':
        await handleNodeNamespace(subArgs);
        break;
      case 'artifact':
        await handleArtifactNamespace(subArgs);
        break;
      case 'workload':
        await handleWorkloadNamespace(subArgs);
        break;
      default:
        console.error(`Error: Unknown command namespace '${command}'`);
        printHelp();
        process.exit(1);
    }
  } catch (error: any) {
    console.error(`\n\x1b[31m[ERROR]\x1b[0m ${error.message}`);
    process.exit(1);
  }
}

async function handleNodeNamespace(args: string[]) {
  const subcommand = args[0];
  const { values, positionals } = parseArgs({
    args,
    options: { format: { type: 'string', short: 'f' } },
    strict: false,
  });
  const format = values.format || 'text';
  const targetId = positionals[1];

  switch (subcommand) {
    case 'ls':
      await nodeLs(format);
      break;
    case 'inspect':
      if (!targetId) throw new Error('Missing required argument: <node-id>');
      await nodeInspect(targetId, format);
      break;
    case 'logs':
      if (!targetId) throw new Error('Missing required argument: <node-id>');
      await nodeLogs(targetId);
      break;
    default:
      console.error(`Error: Unknown node command '${subcommand}'`);
      process.exit(1);
  }
}

async function nodeLs(format: string) {
  try {
    const response = await fetch(`${API_BASE}/nodes`);
    if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (format === 'json') {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    console.log(`ID\t\tPLATFORM\tARCH\t\tSTATUS\t\tNAME`);
    console.log(`--\t\t--------\t----\t\t------\t\t----`);
    data.data.forEach((n: any) => {
      console.log(`${n.id}\t${n.platform}\t\t${n.architecture}\t\t${n.status}\t\t${n.name}`);
    });
  } catch (e: any) {
    throw new Error(`Failed to list nodes: ${e.message}`);
  }
}

async function nodeInspect(id: string, format: string) {
  try {
    const nodeRes = await fetch(`${API_BASE}/nodes/${id}`);
    const capRes = await fetch(`${API_BASE}/nodes/${id}/capabilities`);
    if (!nodeRes.ok) throw new Error(`API returned ${nodeRes.status} for node data.`);
    const nodeData = await nodeRes.json();
    const capData = capRes.ok ? await capRes.json() : { data: { capabilities: [] } };
    const fullData = { ...nodeData.data, capabilities: capData.data.capabilities };
    if (format === 'json') {
      console.log(JSON.stringify(fullData, null, 2));
      return;
    }
    console.log('Node Information:');
    console.log(`  ID:           ${fullData.id}`);
    console.log(`  Name:         ${fullData.name}`);
    console.log(`  Platform:     ${fullData.platform}`);
    console.log(`  Architecture: ${fullData.architecture}`);
    console.log(`  Status:       ${fullData.status}`);
    console.log('\nDiscovered Capabilities:');
    if (fullData.capabilities.length === 0) {
      console.log('  (None discovered or node offline)');
    } else {
      fullData.capabilities.forEach((c: any) => {
        console.log(`  - ${c.id} (v${c.version}) [${c.type}]`);
        console.log(`      ${c.description}`);
      });
    }
  } catch (e: any) {
    throw new Error(`Failed to inspect node: ${e.message}`);
  }
}

async function nodeLogs(id: string) {
  console.log(`[INFO] Attaching to telemetry stream for node: ${id}...`);
  console.log(`\n(Not Implemented: Stream connection to /api/v1/nodes/${id}/logs pending)`);
}

async function handleArtifactNamespace(args: string[]) {
  const subcommand = args[0];
  const { values, positionals } = parseArgs({
    args,
    options: {
      format: { type: 'string', short: 'f' },
      urn: { type: 'string', short: 'u' }
    },
    strict: false,
  });
  const format = values.format || 'text';
  const targetPath = positionals[1];

  switch (subcommand) {
    case 'verify':
      if (!targetPath) throw new Error('Missing required argument: <filepath>');
      if (!values.urn) throw new Error('Missing required flag: --urn <pkg:cloud107/...>');
      const { isVerified, resultData } = await performVerification(targetPath, values.urn as string);
      if (format === 'json') {
        console.log(JSON.stringify(resultData, null, 2));
        process.exit(isVerified ? 0 : 1);
      }
      console.log(`Artifact:\t${resultData.artifact}`);
      console.log(`Platform:\t${resultData.platform}`);
      console.log(`Expected:\t${resultData.expected}`);
      console.log(`Computed:\t${resultData.computed}`);
      const resultColor = isVerified ? '\x1b[32m' : '\x1b[31m';
      console.log(`Result:\t\t${resultColor}${resultData.result}\x1b[0m`);
      process.exit(isVerified ? 0 : 1);
    default:
      console.error(`Error: Unknown artifact command '${subcommand}'`);
      process.exit(1);
  }
}

function parseArtifactUrn(urn: string) {
  try {
    const match = urn.match(/^pkg:cloud107\/([^@]+)@([^?]+)\?(.*)$/);
    if (!match) throw new Error('Invalid URN format');
    const [, namespaceAndName, version, queryStr] = match;
    const params = new URLSearchParams(queryStr);
    return {
      artifact: `pkg:cloud107/${namespaceAndName}@${version}`,
      platform: `${params.get('os') || 'unknown'}/${params.get('arch') || 'unknown'}`,
      expectedHash: params.get('hash') || ''
    };
  } catch {
    throw new Error(`Failed to parse URN: ${urn}. Expected format: pkg:cloud107/<namespace>/<name>@<version>?arch=<arch>&os=<os>&hash=sha256:<hash>`);
  }
}

async function computeFileHash(filePath: string): Promise<string> {
  return new Promise(async (resolveHash, reject) => {
    try {
      await access(filePath);
    } catch {
      return reject(new Error(`File not found: ${filePath}`));
    }
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolveHash(`sha256:${hash.digest('hex')}`));
    stream.on('error', (err) => reject(err));
  });
}

async function performVerification(filePath: string, urn: string) {
  const identity = parseArtifactUrn(urn);
  if (!identity.expectedHash) {
    throw new Error('URN does not contain a hash parameter (e.g., hash=sha256:...)');
  }
  const computedHash = await computeFileHash(filePath);
  const isVerified = computedHash === identity.expectedHash;
  return {
    isVerified,
    resultData: {
      artifact: identity.artifact,
      platform: identity.platform,
      expected: identity.expectedHash,
      computed: computedHash,
      result: isVerified ? 'VERIFIED' : 'FAILED'
    }
  };
}

async function handleWorkloadNamespace(args: string[]) {
  const subcommand = args[0];
  const { values, positionals } = parseArgs({
    args,
    options: {
      format: { type: 'string', short: 'f' },
      urn: { type: 'string', short: 'u' },
      node: { type: 'string', short: 'n' }
    },
    strict: false,
  });
  const format = values.format as string || 'text';
  const targetArg = positionals[1];

  switch (subcommand) {
    case 'deploy':
      if (!targetArg) throw new Error('Missing required argument: <filepath>');
      if (!values.urn) throw new Error('Missing required flag: --urn <pkg:cloud107/...>');
      if (!values.node) throw new Error('Missing required flag: --node <node-id>');
      await workloadDeploy(targetArg, values.urn as string, values.node as string, format);
      break;
    case 'ls':
      console.log('[INFO] (Not Implemented: /api/v1/workloads endpoint pending)');
      break;
    case 'inspect':
      if (!targetArg) throw new Error('Missing required argument: <workload-id>');
      if (!values.node) throw new Error('Missing required flag: --node <node-id>');
      await workloadInspect(targetArg, values.node as string, format);
      break;
    case 'logs':
      if (!targetArg) throw new Error('Missing required argument: <workload-id>');
      if (!values.node) throw new Error('Missing required flag: --node <node-id>');
      await workloadLogs(targetArg, values.node as string);
      break;
    default:
      console.error(`Error: Unknown workload command '${subcommand}'`);
      process.exit(1);
  }
}

async function workloadDeploy(filePath: string, urn: string, nodeId: string, format: string) {
  if (format !== 'json') console.log('[1/3] Verifying artifact hash locally...');
  const { isVerified } = await performVerification(filePath, urn);
  if (!isVerified) {
    throw new Error('Verification failed. The artifact hash does not match the requested URN. Deployment aborted.');
  }
  const absoluteFilePath = resolve(filePath);
  if (format !== 'json') console.log('[2/3] Dispatching to control plane API...');
  const response = await fetch(`${API_BASE}/workloads/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeId, urn, filePath: absoluteFilePath })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Deployment failed: ${data.message || response.statusText}`);
  if (format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  console.log('[3/3] Deployment successful.\n');
  console.log(`Workload ID:  ${data.data.id}`);
  console.log(`Node:         ${data.data.nodeId}`);
  console.log(`Status:       \x1b[36m${data.data.status}\x1b[0m`);
  console.log(`Staging Path: ${data.data.stagingPath}`);
  console.log(`\nTo view logs, run:\n  c107 workload logs ${data.data.id} --node ${nodeId}`);
}

async function workloadInspect(workloadId: string, nodeId: string, format: string) {
  try {
    const response = await fetch(`${API_BASE}/workloads/${nodeId}/${workloadId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || response.statusText);
    if (format === 'json') {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    console.log('Workload Information:');
    console.log(`  ID:      ${data.data.id}`);
    console.log(`  URN:     ${data.data.urn}`);
    console.log(`  Node:    ${data.data.nodeId}`);
    const c = data.data.status;
    const sColor = c === 'running' ? '\x1b[32m' : c === 'failed' ? '\x1b[31m' : '\x1b[36m';
    console.log(`  Status:  ${sColor}${c.toUpperCase()}\x1b[0m`);
    if (data.data.pid) console.log(`  PID:     ${data.data.pid}`);
    console.log(`  Updated: ${data.data.updatedAt}`);
  } catch (e: any) {
    throw new Error(`Failed to inspect workload: ${e.message}`);
  }
}

async function workloadLogs(workloadId: string, nodeId: string) {
  try {
    const response = await fetch(`${API_BASE}/workloads/${nodeId}/${workloadId}/logs`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || response.statusText);
    console.log(`--- Logs for Workload ${workloadId} ---`);
    data.data.logs.forEach((line: string) => console.log(line));
  } catch (e: any) {
    throw new Error(`Failed to fetch logs: ${e.message}`);
  }
}

function printHelp() {
  console.log(`
Cloud107 Command Line Interface (c107)

Usage: c107 [namespace] [command]

Lifecycle Commands (Active):
  status        Check control plane and standard network connectivity

Resource Commands (Active):
  node          Manage physical/virtual infrastructure and capabilities
    ls          List all connected nodes
    inspect     View node details and capabilities

  artifact      Manage and verify Cloud107 payloads
    verify      SHA-256 hash verification of a local file against a Cloud107 URN

  workload      Deploy and inspect workloads natively on Nodes
    deploy      Stage and start a workload (e.g., c107 workload deploy ./binary --urn <urn> --node <id>)
    inspect     View workload state (e.g., c107 workload inspect <id> --node <id>)
    logs        View workload output (e.g., c107 workload logs <id> --node <id>)
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
