// Nexorium Core Type Definitions

// Project Status
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'PLANNING';

// Existing Enums
export type EnvironmentType = 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD' | 'PROD_RO';
export type NodeType = 'APPLICATION' | 'SERVICE' | 'DATABASE' | 'GATEWAY' | 'EXTERNAL' | 'RUNTIME' | 'MESSAGE_QUEUE' | 'LOAD_BALANCER';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Protocol = 'REST' | 'GRPC' | 'MQ' | 'JDBC' | 'SFTP' | 'EVENT' | 'WEBSOCKET' | 'SOAP' | 'GRAPHQL';
export type SourceType = 'PROD_CLONE' | 'MASKED' | 'SYNTHETIC' | 'STATIC';
export type RefreshMethod = 'MANUAL' | 'PIPELINE' | 'SCRIPT' | 'AUTOMATED';
export type EntityType = 'NODE' | 'EDGE' | 'DATABASE' | 'TESTDATA';

// New Enterprise Enums
export type NetworkZoneType = 'PROD' | 'NON_PROD' | 'DMZ' | 'PARTNER' | 'INTERNET' | 'SECURE_CORE' | 'LAB';
export type ConnectivityPolicy = 'RESTRICTED' | 'ALLOWED_VIA_GATEWAY' | 'NO_DIRECT_ACCESS';
export type BridgeMechanism = 'API_GATEWAY' | 'PROXY' | 'BASTION' | 'FILE_TRANSFER' | 'ESB' | 'DIRECT';
export type VirtualizationType = 'VM' | 'CONTAINER' | 'CNF' | 'VNF' | 'BARE_METAL';
export type DataClassification = 'PII' | 'PCI' | 'CONFIDENTIAL' | 'NON_SENSITIVE';
export type MaskingMethod = 'TOKENIZATION' | 'STATIC_MASK' | 'DYNAMIC_MASK' | 'SYNTHETIC' | 'NONE';
export type ComplianceFlag = 'GDPR' | 'PCI_DSS' | 'HIPAA' | 'SOX' | 'INTERNAL_POLICY' | 'CCPA';
export type ActivityActionType =
  | 'CONNECTOR_RUN'
  | 'SNAPSHOT_CREATED'
  | 'MANUAL_EDIT'
  | 'ENRICHMENT_ADDED'
  | 'ENRICHMENT_REVERTED'
  | 'POLICY_VIOLATION_DETECTED'
  | 'POLICY_VIOLATION_RESOLVED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REVOKED'
  | 'DATA_REFRESH'
  | 'OWNERSHIP_CHANGED';
export type TelcoLayer = 'BSS' | 'OSS' | 'NETWORK' | 'SHARED' | 'EXTERNAL';
export type TelcoSubsystem =
  | 'CRM' | 'CPQ' | 'BILLING' | 'ORDER_MANAGEMENT' | 'REVENUE_ASSURANCE'
  | 'DUNNING' | 'COLLECTIONS' | 'PRODUCT_CATALOG' | 'MEDIATION' | 'RATING'
  | 'PROVISIONING' | 'ACTIVATION' | 'INVENTORY' | 'FAULT_MANAGEMENT'
  | 'PERFORMANCE_MANAGEMENT' | 'SERVICE_ASSURANCE' | 'NETWORK_MONITORING'
  | 'AAA' | 'HSS' | 'PCRF' | 'SMSC' | 'MMSC' | 'IMS' | 'VAS'
  | 'CHANNEL' | 'API_GATEWAY' | 'INTEGRATION' | 'DATA_WAREHOUSE' | 'ANALYTICS' | 'OTHER';
export type HostingType = 'CLOUD' | 'ON_PREM' | 'HYBRID' | 'THIRD_PARTY' | 'EDGE';
export type CloudProvider = 'AWS' | 'AZURE' | 'GCP' | 'ORACLE_CLOUD' | 'IBM_CLOUD' | 'ALIBABA_CLOUD' | 'PRIVATE_CLOUD' | 'NONE';
export type EnrichmentStatus = 'ACTIVE' | 'REVERTED' | 'SUPERSEDED';
export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ViolationStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
export type ViewMode = 'default' | 'network-zone' | 'telco-layer' | 'runtime-layer' | 'hosting-domain';

// Architecture Intelligence Enums
export type ArchitectureLayer = 'BSS' | 'OSS' | 'INFRA' | 'EXTERNAL' | 'UNKNOWN';
export type CapabilityType = 'CPQ' | 'CRM' | 'BILLING' | 'SOM' | 'INVENTORY' | 'ORCHESTRATOR' | 'DB' | 'MQ' | 'API_GW' | 'IDENTITY' | 'ITSM' | 'OTHER' | 'UNKNOWN';
export type ConnectionOrigin = 'INGESTED' | 'MANUAL';
export type ConnectionConfidence = 'HIGH' | 'MED' | 'LOW';

// Project Type
export interface Project {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: ProjectStatus;
  ownerTeam?: string | null;
  ownerEmail?: string | null;
  businessUnit?: string | null;
  costCenter?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  environments?: Environment[];
}

// Domain Types
export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string | null;
  project?: Project | null;
  nodes?: Node[];
  edges?: Edge[];
  ownership?: EnvironmentOwnership | null;
  activityLogs?: EnvironmentActivityLog[];
}

export interface Node {
  id: string;
  environmentId: string;
  type: NodeType;
  name: string;
  owner?: string | null;
  criticality: Criticality;
  lastSeenAt: Date;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  // New fields
  telcoLayer?: TelcoLayer | null;
  telcoSubsystem?: TelcoSubsystem | null;
  networkZoneId?: string | null;
  // Relations
  databaseMetadata?: DatabaseMetadata | null;
  networkZone?: NetworkZone | null;
  runtimeLayer?: RuntimeLayer | null;
  hostingDomains?: NodeHostingDomain[];
  enrichments?: EnrichmentEdit[];
}

export interface Edge {
  id: string;
  environmentId: string;
  sourceNodeId: string;
  targetNodeId: string;
  protocol: Protocol;
  port?: number | null;
  pathOrTopic?: string | null;
  confidenceScore: number;
  lastObservedAt: Date;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseMetadata {
  id: string;
  nodeId: string;
  engine: string;
  version?: string | null;
  sizeGB?: number | null;
  host?: string | null;
  port?: number | null;
  testDataSet?: TestDataSet | null;
}

export interface TestDataSet {
  id: string;
  databaseId: string;
  sourceType: SourceType;
  lastRefreshDate?: Date | null;
  refreshMethod: RefreshMethod;
  maskingPolicyVersion?: string | null;
  changeReference?: string | null;
  owner?: string | null;
  downstreamConsumers: string[];
  createdAt: Date;
  updatedAt: Date;
  // New governance fields
  dataClassification?: DataClassification | null;
  maskingMethod?: MaskingMethod | null;
  complianceFlags?: ComplianceFlag[];
  derivedFromProdClone?: boolean;
  approvedBy?: string | null;
  approvalDate?: Date | null;
  // Relations
  refreshHistory?: RefreshRecord[];
  complianceAudits?: ComplianceAudit[];
}

export interface RefreshRecord {
  id: string;
  testDataSetId: string;
  refreshDate: Date;
  refreshedBy?: string | null;
  method: RefreshMethod;
  notes?: string | null;
  changeReference?: string | null;
  createdAt: Date;
}

export interface Evidence {
  id: string;
  entityType: EntityType;
  entityId: string;
  source: string;
  timestamp: Date;
  confidence: number;
  payload: Record<string, unknown>;
}

export interface EnvironmentSnapshot {
  id: string;
  environmentId: string;
  snapshotHash: string;
  snapshotData: SnapshotData;
  createdAt: Date;
}

export interface SnapshotData {
  nodes: Node[];
  edges: Edge[];
  databases: DatabaseMetadata[];
  testDataSets: TestDataSet[];
}

// Network Zone Types
export interface NetworkZone {
  id: string;
  name: string;
  type: NetworkZoneType;
  description?: string | null;
  vlanRange?: string | null;
  cidrBlocks?: string[];
  createdAt: Date;
  updatedAt: Date;
  nodes?: Node[];
  outgoingConnections?: NetworkZoneConnection[];
  incomingConnections?: NetworkZoneConnection[];
}

export interface NetworkZoneConnection {
  id: string;
  sourceZoneId: string;
  targetZoneId: string;
  policy: ConnectivityPolicy;
  bridgeMechanism?: BridgeMechanism | null;
  bridgeNodeName?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  sourceZone?: NetworkZone;
  targetZone?: NetworkZone;
}

// Runtime Layer Types
export interface RuntimeLayer {
  id: string;
  nodeId: string;
  virtualizationType: VirtualizationType;
  runtimeName?: string | null;
  runtimeVersion?: string | null;
  orchestrator?: string | null;
  clusterName?: string | null;
  namespace?: string | null;
  resourceLimits?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  node?: Node;
}

// Hosting Domain Types
export interface HostingDomain {
  id: string;
  name: string;
  hostingType: HostingType;
  cloudProvider?: CloudProvider | null;
  region?: string | null;
  accountId?: string | null;
  dataCenter?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  nodes?: NodeHostingDomain[];
}

export interface NodeHostingDomain {
  id: string;
  nodeId: string;
  hostingDomainId: string;
  isPrimary: boolean;
  notes?: string | null;
  createdAt: Date;
  node?: Node;
  hostingDomain?: HostingDomain;
}

// Environment Ownership Types
export interface EnvironmentOwnership {
  id: string;
  environmentId: string;
  projectName: string;
  projectCode?: string | null;
  ownerTeam: string;
  ownerEmail?: string | null;
  technicalLead?: string | null;
  technicalLeadEmail?: string | null;
  businessUnit?: string | null;
  costCenter?: string | null;
  expiryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  environment?: Environment;
}

// Activity Log Types (Immutable Audit Trail)
export interface EnvironmentActivityLog {
  id: string;
  environmentId: string;
  action: ActivityActionType;
  actorId?: string | null;
  actorName?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  details?: Record<string, unknown> | null;
  checksum: string;
  previousLogId?: string | null;
  createdAt: Date;
  environment?: Environment;
}

// Enrichment Types
export interface EnrichmentEdit {
  id: string;
  nodeId: string;
  fieldName: string;
  previousValue?: unknown | null;
  newValue: unknown;
  reason?: string | null;
  editedBy: string;
  status: EnrichmentStatus;
  supersededById?: string | null;
  createdAt: Date;
  node?: Node;
}

// Compliance Types
export interface ComplianceAudit {
  id: string;
  testDataSetId: string;
  complianceFlag: ComplianceFlag;
  status: string;
  auditorId?: string | null;
  auditorName?: string | null;
  findings?: string | null;
  evidence?: Record<string, unknown> | null;
  auditDate: Date;
  nextAuditDate?: Date | null;
  createdAt: Date;
  testDataSet?: TestDataSet;
}

export interface PolicyViolation {
  id: string;
  environmentId?: string | null;
  nodeId?: string | null;
  edgeId?: string | null;
  testDataSetId?: string | null;
  policyName: string;
  policyRule: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  description: string;
  remediationHint?: string | null;
  detectedAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Connector Credential Types
export interface ConnectorCredential {
  id: string;
  name: string;
  connectorType: string;
  encryptedConfig: string;
  encryptionIv: string;
  lastTestedAt?: Date | null;
  lastTestSuccess?: boolean | null;
  lastRotatedAt?: Date | null;
  rotationReminder?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Drift Detection Types
export interface DriftReport {
  snapshotA: string;
  snapshotB: string;
  addedNodes: Node[];
  removedNodes: Node[];
  modifiedNodes: NodeDiff[];
  addedEdges: Edge[];
  removedEdges: Edge[];
  modifiedEdges: EdgeDiff[];
  staleDatasets: TestDataSet[];
}

export interface NodeDiff {
  nodeId: string;
  nodeName: string;
  changes: PropertyChange[];
}

export interface EdgeDiff {
  edgeId: string;
  sourceName: string;
  targetName: string;
  changes: PropertyChange[];
}

export interface PropertyChange {
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

// Connector Types
export interface ConnectorResult {
  success: boolean;
  nodesDiscovered: number;
  edgesDiscovered: number;
  errors: string[];
  evidence: Evidence[];
}

export interface KubernetesConfig {
  namespace?: string;
  labelSelector?: string;
  includeServices?: boolean;
  includeIngress?: boolean;
}

export interface GitOpsConfig {
  repositoryUrl: string;
  branch?: string;
  manifestPath?: string;
}

export interface ManualImportConfig {
  format: 'yaml' | 'json';
  content: string;
}

// Graph Visualization Types
export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: NodeType;
    owner?: string | null;
    criticality: Criticality;
    lastSeenAt: Date;
    databaseMetadata?: DatabaseMetadata | null;
    isStale?: boolean;
    // New enterprise fields
    telcoLayer?: TelcoLayer | null;
    telcoSubsystem?: TelcoSubsystem | null;
    networkZone?: NetworkZone | null;
    runtimeLayer?: RuntimeLayer | null;
    hostingDomains?: NodeHostingDomain[];
    hasEnrichments?: boolean;
    hasPolicyViolations?: boolean;
    dataClassification?: DataClassification | null;
    derivedFromProdClone?: boolean;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  data: {
    protocol: Protocol;
    port?: number | null;
    pathOrTopic?: string | null;
    confidenceScore: number;
    isStale?: boolean;
  };
}

// Filter Types
export interface GraphFilters {
  owner?: string;
  protocol?: Protocol;
  nodeType?: NodeType;
  showStale?: boolean;
  minConfidence?: number;
  stalenessThreshold?: number;
  // New enterprise filters
  networkZoneId?: string;
  telcoLayer?: TelcoLayer;
  telcoSubsystem?: TelcoSubsystem;
  virtualizationType?: VirtualizationType;
  hostingDomainId?: string;
  hostingType?: HostingType;
  dataClassification?: DataClassification;
  showPolicyViolations?: boolean;
  projectName?: string;
  showMyEnvironments?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Dashboard Stats
export interface EnvironmentStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<NodeType, number>;
  edgesByProtocol: Record<Protocol, number>;
  staleNodes: number;
  staleEdges: number;
  criticalNodes: number;
  databaseCount: number;
  datasetsNeedingRefresh: number;
  // New enterprise stats
  nodesByTelcoLayer?: Partial<Record<TelcoLayer, number>>;
  nodesByNetworkZone?: Record<string, number>;
  nodesByVirtualizationType?: Partial<Record<VirtualizationType, number>>;
  nodesByHostingType?: Partial<Record<HostingType, number>>;
  policyViolationsCount?: number;
  openViolations?: number;
  enrichedNodesCount?: number;
  datasetsWithPII?: number;
  datasetsWithPCI?: number;
  unapprovedProdClones?: number;
}

// Governance Summary Types
export interface GovernanceSummary {
  totalViolations: number;
  openViolations: number;
  criticalViolations: number;
  violationsByPolicy: Record<string, number>;
  datasetsRequiringApproval: number;
  datasetsWithoutMasking: number;
  piiDatasets: number;
  pciDatasets: number;
  complianceScore: number;
}

// Swimlane Layout Types
export interface SwimLane {
  id: string;
  label: string;
  color: string;
  yStart: number;
  yEnd: number;
}

export interface SwimLaneConfig {
  mode: ViewMode;
  lanes: SwimLane[];
  nodeAssignment: Record<string, string>; // nodeId -> laneId
}

// Telco Classification Inference
export interface TelcoClassificationSuggestion {
  nodeId: string;
  suggestedLayer: TelcoLayer;
  suggestedSubsystem: TelcoSubsystem;
  confidence: number;
  reason: string;
}

// ============================================
// 5-LAYER MODEL TYPES
// ============================================

export interface Component {
  id: string;
  name: string;
  category?: string | null;
  vendor?: string | null;
  description?: string | null;
  layer: ArchitectureLayer;
  capabilityType: CapabilityType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Host {
  id: string;
  environmentId: string;
  networkContextId?: string | null;
  hostname: string;
  ip?: string | null;
  natIp?: string | null;
  os?: string | null;
  notes?: string | null;
  sourceSystem?: string | null;
  sourceRecordId?: string | null;
  ingestedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentInstance {
  id: string;
  environmentId: string;
  hostId?: string | null;
  componentId: string;
  displayName?: string | null;
  notes?: string | null;
  sourceSystem?: string | null;
  sourceRecordId?: string | null;
  ingestedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  component?: Component;
  host?: Host;
  endpoints?: Endpoint[];
  deployedVersions?: DeployedVersion[];
}

export interface Endpoint {
  id: string;
  componentInstanceId: string;
  kind: 'HOSTNAME' | 'IP' | 'NAT' | 'VIP' | 'URL';
  value: string;
  port?: number | null;
  scheme?: 'TCP' | 'HTTP' | 'HTTPS' | 'GRPC' | 'JDBC' | 'AMQP' | null;
  basePath?: string | null;
  notes?: string | null;
  sourceSystem?: string | null;
  sourceRecordId?: string | null;
  ingestedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeployedVersion {
  id: string;
  componentInstanceId: string;
  projectVersion: string;
  vendorVersion?: string | null;
  buildRef?: string | null;
  capturedAt: Date;
  sourceSystem?: string | null;
  sourceRecordId?: string | null;
  ingestedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection5Layer {
  id: string;
  environmentId: string;
  fromComponentInstanceId: string;
  toComponentInstanceId: string;
  protocolType: 'REST' | 'SOAP' | 'TCP' | 'SFTP' | 'GRPC' | 'MQ' | 'JDBC' | 'OTHER';
  protocolDetail?: string | null;
  port?: number | null;
  notes?: string | null;
  origin: ConnectionOrigin;
  confidence: ConnectionConfidence;
  sourceSystem?: string | null;
  sourceRecordId?: string | null;
  ingestedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  fromComponentInstance?: ComponentInstance;
  toComponentInstance?: ComponentInstance;
}

// Graph types for 5-layer model
export interface Graph5LayerNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    displayName?: string | null;
    componentName: string;
    layer: ArchitectureLayer;
    capabilityType: CapabilityType;
    hostname?: string | null;
    primaryEndpoint?: { port?: number | null; scheme?: string | null } | null;
    projectVersion?: string | null;
    isEntry: boolean;
    isExit: boolean;
    sourceSystem?: string | null;
    ingestedAt?: Date | null;
  };
}

export interface Graph5LayerEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  data: {
    protocolType: string;
    protocolDetail?: string | null;
    port?: number | null;
    origin: ConnectionOrigin;
    confidence: ConnectionConfidence;
    sourceSystem?: string | null;
  };
}

export interface GraphAnalysisResult {
  entryCandidates: string[];
  exitCandidates: string[];
  overriddenEntry?: string | null;
  overriddenExit?: string | null;
}

// Note node data for diagram annotations
export interface NoteNodeData {
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  width?: number;
  height?: number;
}

// ============================================
// 6-PILLAR MODEL TYPES
// ============================================

// Flow Model Enums
export type StageKey = 'DEV' | 'SIT' | 'UAT' | 'NFT' | 'PREPROD' | 'PROD_RO';
export type FlowTemplateStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
export type EnvironmentLinkType = 'PROMOTION' | 'DATA_SYNC' | 'REFERENCE';

// Governance Enums
export type BlueprintStatus = 'DRAFT' | 'APPROVED' | 'DEPRECATED';
export type ReleaseStatus = 'PLANNING' | 'IN_PROGRESS' | 'READY' | 'DEPLOYED' | 'CANCELLED';
export type AlignmentStatus = 'ALIGNED' | 'DRIFTED' | 'PARTIAL' | 'UNKNOWN';
export type ComparisonType = 'BLUEPRINT_VS_SNAPSHOT' | 'SNAPSHOT_VS_RELEASE' | 'CROSS_ENVIRONMENT' | 'NONPROD_VS_PROD';
export type GovernanceRuleType = 'VERSION_CHECK' | 'COMPONENT_PRESENCE' | 'CONNECTION_REQUIRED' | 'DATA_CLASSIFICATION' | 'CUSTOM';
export type GovernanceRuleSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'BLOCKER';

// Organisation Enums
export type RACIRole = 'RESPONSIBLE' | 'ACCOUNTABLE' | 'CONSULTED' | 'INFORMED';
export type PersonStatus = 'ACTIVE' | 'INACTIVE' | 'EXTERNAL';
export type AssetEntityType = 'ENVIRONMENT' | 'COMPONENT' | 'COMPONENT_INSTANCE' | 'HOST' | 'CONNECTION';

// Configuration Enums
export type ConnectorStatus = 'ACTIVE' | 'DISABLED' | 'ERROR' | 'PENDING_CONFIG';
export type ConnectorType = 'KUBERNETES' | 'GITOPS' | 'CMDB' | 'APM' | 'MANUAL' | 'CUSTOM';
export type IntegrationRuleAction = 'MAP_FIELD' | 'TRANSFORM' | 'FILTER' | 'MERGE' | 'SKIP';
export type SettingScope = 'GLOBAL' | 'ENVIRONMENT' | 'STAGE' | 'USER';

// Stage - Pipeline stages
export interface Stage {
  id: string;
  key: StageKey;
  name: string;
  description?: string | null;
  sortOrder: number;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  environments?: Environment[];
}

// EnvironmentLink - Upstream/downstream relationships
export interface EnvironmentLink {
  id: string;
  upstreamEnvironmentId: string;
  downstreamEnvironmentId: string;
  linkType: EnvironmentLinkType;
  isActive: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  upstreamEnvironment?: Environment;
  downstreamEnvironment?: Environment;
}

// FlowTemplate - Allowed transition patterns
export interface FlowTemplate {
  id: string;
  name: string;
  description?: string | null;
  status: FlowTemplateStatus;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  stages?: FlowTemplateStage[];
}

// FlowTemplateStage - Stages within templates
export interface FlowTemplateStage {
  id: string;
  flowTemplateId: string;
  stageId: string;
  sortOrder: number;
  isRequired: boolean;
  notes?: string | null;
  createdAt: Date;
  stage?: Stage;
  flowTemplate?: FlowTemplate;
}

// Blueprint - Expected state definitions
export interface Blueprint {
  id: string;
  name: string;
  description?: string | null;
  status: BlueprintStatus;
  targetStageId?: string | null;
  specJson: BlueprintSpec;
  createdBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlueprintSpec {
  components: BlueprintComponent[];
  connections?: BlueprintConnection[];
  constraints?: BlueprintConstraint[];
}

export interface BlueprintComponent {
  componentId?: string;
  componentName: string;
  requiredVersion?: string;
  versionPattern?: string;
  isRequired: boolean;
}

export interface BlueprintConnection {
  fromComponent: string;
  toComponent: string;
  protocolType?: string;
  isRequired: boolean;
}

export interface BlueprintConstraint {
  type: string;
  value: string;
  message?: string;
}

// Release - Target groupings
export interface Release {
  id: string;
  name: string;
  version: string;
  description?: string | null;
  status: ReleaseStatus;
  targetDate?: Date | null;
  deployedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: ReleaseItem[];
}

// ReleaseItem - Components in a release
export interface ReleaseItem {
  id: string;
  releaseId: string;
  blueprintId?: string | null;
  componentId?: string | null;
  targetVersion: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  release?: Release;
  blueprint?: Blueprint;
  component?: Component;
}

// GovernanceRule - Promotion readiness rules
export interface GovernanceRule {
  id: string;
  name: string;
  description?: string | null;
  ruleType: GovernanceRuleType;
  severity: GovernanceRuleSeverity;
  isActive: boolean;
  configJson: GovernanceRuleConfig;
  targetStages: StageKey[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernanceRuleConfig {
  pattern?: string;
  minVersion?: string;
  componentName?: string;
  connectionRequired?: { from: string; to: string };
  customExpression?: string;
}

// RuleEvaluation - Rule evaluation results
export interface RuleEvaluation {
  id: string;
  ruleId: string;
  environmentId: string;
  snapshotId?: string | null;
  passed: boolean;
  severity: GovernanceRuleSeverity;
  message?: string | null;
  detailsJson?: Record<string, unknown> | null;
  evaluatedAt: Date;
  rule?: GovernanceRule;
  environment?: Environment;
}

// AlignmentComparison - Comparison results
export interface AlignmentComparison {
  id: string;
  comparisonType: ComparisonType;
  environmentId?: string | null;
  snapshotId?: string | null;
  blueprintId?: string | null;
  releaseId?: string | null;
  targetEnvironmentId?: string | null;
  status: AlignmentStatus;
  alignedCount: number;
  driftedCount: number;
  missingCount: number;
  extraCount: number;
  detailsJson?: AlignmentDetail[] | null;
  comparedAt: Date;
}

export interface AlignmentDetail {
  componentName: string;
  status: 'aligned' | 'drifted' | 'missing' | 'extra';
  expectedVersion?: string;
  actualVersion?: string;
  message?: string;
}

// Person - People registry
export interface Person {
  id: string;
  email: string;
  displayName: string;
  department?: string | null;
  team?: string | null;
  role?: string | null;
  phone?: string | null;
  status: PersonStatus;
  externalId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  raciMappings?: RACIMapping[];
}

// RACIMapping - R/A/C/I assignments
export interface RACIMapping {
  id: string;
  personId: string;
  entityType: AssetEntityType;
  entityId: string;
  raciRole: RACIRole;
  notes?: string | null;
  assignedBy?: string | null;
  assignedAt: Date;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  person?: Person;
}

// OrphanedAsset - Assets without ownership
export interface OrphanedAsset {
  id: string;
  entityType: AssetEntityType;
  entityId: string;
  entityName: string;
  detectedAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  notes?: string | null;
}

// Connector - Connector definitions
export interface Connector {
  id: string;
  name: string;
  connectorType: ConnectorType;
  description?: string | null;
  status: ConnectorStatus;
  credentialId?: string | null;
  configJson?: Record<string, unknown> | null;
  scheduleJson?: ConnectorSchedule | null;
  lastRunAt?: Date | null;
  lastRunStatus?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  integrationRules?: IntegrationRule[];
}

export interface ConnectorSchedule {
  enabled: boolean;
  cronExpression?: string;
  intervalMinutes?: number;
}

// IntegrationRule - Field mapping rules
export interface IntegrationRule {
  id: string;
  connectorId: string;
  name: string;
  description?: string | null;
  action: IntegrationRuleAction;
  sourceField: string;
  targetField?: string | null;
  transformExpr?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// PlatformSetting - Global/scoped settings
export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  valueType: string;
  scope: SettingScope;
  scopeId?: string | null;
  description?: string | null;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Flow Map Types
export interface FlowMapData {
  stages: Stage[];
  environments: (Environment & { stage?: Stage })[];
  links: EnvironmentLink[];
}

export interface FlowMapNode {
  id: string;
  type: 'environment' | 'stage';
  data: {
    environment?: Environment;
    stage?: Stage;
  };
  position: { x: number; y: number };
}

export interface FlowMapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: {
    linkType: EnvironmentLinkType;
    isActive: boolean;
  };
}

// Readiness Types
export interface EnvironmentReadiness {
  environmentId: string;
  environmentName: string;
  stage?: StageKey;
  overallScore: number;
  structuralCompleteness: ReadinessScore;
  versionValidity: ReadinessScore;
  snapshotIntegrity: ReadinessScore;
  topologyHealth: ReadinessScore;
  governanceAlignment: ReadinessScore;
  ruleEvaluations: RuleEvaluation[];
  lastEvaluatedAt: Date;
}

export interface ReadinessScore {
  score: number;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  details?: string[];
}

// Cost & Budget Types (re-export from dedicated file)
export * from './cost';

// ============================================
// GOVERNANCE ALIGNMENT MODULE TYPES
// ============================================

// Policy Control Enums
export type PolicyControlCategory =
  | 'DATA_GOVERNANCE'
  | 'VERSION_COMPLIANCE'
  | 'TOPOLOGY_RULES'
  | 'SECURITY'
  | 'CHANGE_MANAGEMENT'
  | 'OWNERSHIP'
  | 'FRESHNESS'
  | 'CUSTOM';

export type PolicyControlScope = 'GLOBAL' | 'STAGE' | 'ENVIRONMENT' | 'COMPONENT';

export type ComplianceResultStatus = 'PASS' | 'WARN' | 'FAIL' | 'NOT_APPLICABLE' | 'PENDING';

export type ApprovalType =
  | 'PROMOTION'
  | 'EXCEPTION_REQUEST'
  | 'DATA_ACCESS'
  | 'CONFIGURATION_CHANGE'
  | 'COUPLING_REVIEW'
  | 'RELEASE_GATE';

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export type ExceptionStatus = 'REQUESTED' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type CouplingStatus = 'UNREVIEWED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'MITIGATION_REQUIRED';

// PolicyControl - Configurable governance controls
export interface PolicyControl {
  id: string;
  name: string;
  description?: string | null;
  category: PolicyControlCategory;
  scope: PolicyControlScope;
  scopeId?: string | null;
  severity: GovernanceRuleSeverity;
  isActive: boolean;
  configJson: PolicyControlConfig;
  evaluatorType: string;
  remediation?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyControlConfig {
  threshold?: number;
  pattern?: string;
  requiredFields?: string[];
  maxAge?: number; // in days
  minVersion?: string;
  customExpression?: string;
  [key: string]: unknown;
}

// ComplianceResult - Evaluation results per environment/control
export interface ComplianceResult {
  id: string;
  policyControlId: string;
  environmentId: string;
  snapshotId?: string | null;
  status: ComplianceResultStatus;
  score?: number | null;
  message?: string | null;
  detailsJson?: ComplianceResultDetails | null;
  evidenceJson?: Record<string, unknown> | null;
  evaluatedAt: Date;
  evaluatedBy?: string | null;
  expiresAt?: Date | null;
  policyControl?: PolicyControl;
}

export interface ComplianceResultDetails {
  violations?: ComplianceViolation[];
  findings?: ComplianceFinding[];
  affectedEntities?: string[];
  [key: string]: unknown;
}

export interface ComplianceViolation {
  entityType: string;
  entityId: string;
  entityName: string;
  message: string;
  severity: GovernanceRuleSeverity;
}

export interface ComplianceFinding {
  type: string;
  description: string;
  evidence?: string;
}

// ApprovalItem - Lightweight approval workflow
export interface ApprovalItem {
  id: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  title: string;
  description?: string | null;
  requesterId?: string | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  environmentId?: string | null;
  componentId?: string | null;
  releaseId?: string | null;
  contextJson?: ApprovalContext | null;
  decisionReason?: string | null;
  decisionBy?: string | null;
  decisionAt?: Date | null;
  expiresAt?: Date | null;
  dueDate?: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalContext {
  sourceEnvironment?: string;
  targetEnvironment?: string;
  components?: string[];
  changes?: string[];
  impactSummary?: string;
  [key: string]: unknown;
}

// ExceptionItem - Approved policy deviations with expiry
export interface ExceptionItem {
  id: string;
  policyControlId: string;
  environmentId?: string | null;
  componentId?: string | null;
  status: ExceptionStatus;
  reason: string;
  justification?: string | null;
  riskAssessment?: string | null;
  mitigationPlan?: string | null;
  requestedBy?: string | null;
  requestedByName?: string | null;
  requestedAt: Date;
  approvedBy?: string | null;
  approvedByName?: string | null;
  approvedAt?: Date | null;
  expiresAt?: Date | null;
  revokedBy?: string | null;
  revokedAt?: Date | null;
  revocationReason?: string | null;
  reviewReminder?: Date | null;
  attachmentsJson?: ExceptionAttachment[] | null;
  createdAt: Date;
  updatedAt: Date;
  policyControl?: PolicyControl;
}

export interface ExceptionAttachment {
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

// CouplingLink - Project/environment coupling detection
export interface CouplingLink {
  id: string;
  sourceEnvironmentId: string;
  targetEnvironmentId: string;
  sourceProjectName?: string | null;
  targetProjectName?: string | null;
  couplingType: string;
  status: CouplingStatus;
  riskLevel: number;
  description?: string | null;
  detectedAt: Date;
  detectedBy?: string | null;
  evidenceJson?: CouplingEvidence | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  mitigationRequired: boolean;
  mitigationPlan?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouplingEvidence {
  sharedComponents?: string[];
  sharedInterfaces?: string[];
  dataFlows?: { source: string; target: string; type: string }[];
  dependencies?: { type: string; description: string }[];
  [key: string]: unknown;
}

// Governance Overview Types
export interface GovernanceOverview {
  complianceScore: number;
  controlsTotal: number;
  controlsActive: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  pendingApprovalsCount: number;
  activeExceptionsCount: number;
  expiringExceptionsCount: number;
  unreviewedCouplingsCount: number;
  criticalRisksCount: number;
  lastEvaluatedAt?: Date | null;
}

// Compliance Matrix Types
export interface ComplianceMatrixRow {
  environmentId: string;
  environmentName: string;
  environmentType: EnvironmentType;
  stage?: StageKey | null;
  overallScore: number;
  overallStatus: ComplianceResultStatus;
  results: ComplianceMatrixCell[];
}

export interface ComplianceMatrixCell {
  controlId: string;
  controlName: string;
  status: ComplianceResultStatus;
  score?: number | null;
  message?: string | null;
  evaluatedAt?: Date | null;
}

// Approval Inbox Types
export interface ApprovalInboxStats {
  pending: number;
  overdue: number;
  dueSoon: number;
  byType: Partial<Record<ApprovalType, number>>;
}

// Exception Timeline Types
export interface ExceptionTimelineItem {
  id: string;
  type: 'requested' | 'approved' | 'expired' | 'revoked';
  date: Date;
  exception: ExceptionItem;
  actor?: string | null;
  notes?: string | null;
}

// Coupling Analysis Types
export interface CouplingAnalysis {
  totalLinks: number;
  unreviewedCount: number;
  highRiskCount: number;
  byType: Record<string, number>;
  byEnvironment: Record<string, number>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}
