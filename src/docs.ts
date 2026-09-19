import PRD from '../docs/PRD.md?raw';
import SystemDesign from '../docs/System_Design.md?raw';
import ArchitectureBlueprint from '../docs/03_Architecture_Blueprint.md?raw';
import BackendDesign from '../docs/04_Backend_Design.md?raw';
import SecurityPerformance from '../docs/05_Security_Performance.md?raw';
import DevOpsPlanning from '../docs/06_DevOps_Planning.md?raw';
import MultiExperience from '../docs/07_Multi_Experience_Architecture.md?raw';

export const documents = [
  { id: 'prd', title: 'Product Requirements Document', content: PRD },
  { id: 'system-design', title: 'System Design', content: SystemDesign },
  { id: 'architecture', title: 'Architecture Blueprint', content: ArchitectureBlueprint },
  { id: 'backend', title: 'Backend Design', content: BackendDesign },
  { id: 'security', title: 'Security & Performance', content: SecurityPerformance },
  { id: 'devops', title: 'DevOps & Planning', content: DevOpsPlanning },
  { id: 'multi-experience', title: 'Multi-Experience System', content: MultiExperience },
];
