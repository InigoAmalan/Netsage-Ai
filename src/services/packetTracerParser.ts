import { DeterministicCheckResult, RuleViolation } from '../types/network';

export interface ParsedInterface {
  name: string;
  ip?: string;
  subnetMask?: string;
  status: 'up' | 'down' | 'admin-down';
  vlan?: number | string;
  mode?: 'access' | 'trunk' | 'routed';
  duplex?: string;
  speed?: string;
  description?: string;
  helperAddress?: string;
}

export interface ParsedDevice {
  name: string;
  type: 'router' | 'switch' | 'pc' | 'server' | 'access_point' | 'generic';
  model?: string;
  interfaces: ParsedInterface[];
  defaultGateway?: string;
  dnsServer?: string;
  vlanDatabase?: Array<{ id: number | string; name: string; status: 'active' | 'inactive' }>;
  routingProtocols?: string[];
  staticRoutes?: string[];
  dhcpPools?: string[];
  acls?: string[];
  rawConfig?: string;
}

export interface PacketTracerAnalysisResult {
  fileName: string;
  fileSize: number;
  fileFormat: 'Packet Tracer (.pkt)' | 'Packet Tracer Activity (.pka)' | 'Cisco IOS Config (.cfg)' | 'Text / Log (.txt)' | 'Lab Export (.xml / .json)';
  parsedDevices: ParsedDevice[];
  inferredTopologyNote: string;
  synthesizedShowOutput: string;
  consolidatedConfigSnippet: string;
  detectedAnomalies: Array<{
    severity: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    device: string;
    suggestedFix: string;
  }>;
  suggestedSymptom: string;
}

// Sample Labs that can be downloaded or loaded in 1-click
export interface SamplePacketTracerLab {
  id: string;
  title: string;
  fileName: string;
  concept: string;
  description: string;
  fileContent: string;
  expectedFault: string;
}

export const SAMPLE_PKT_LABS: SamplePacketTracerLab[] = [
  {
    id: 'sample-vlan-mismatch',
    title: 'Lab 1: VLAN Access Port Isolation Fault',
    fileName: 'VLAN_Isolation_Troubleshoot.pkt',
    concept: 'VLAN & Switchport',
    description: 'PC2 on Switchport Fa0/2 cannot communicate with PC1 on Fa0/1. Switchport Fa0/2 is accidentally assigned to VLAN 10 instead of VLAN 20.',
    expectedFault: 'Fa0/2 access VLAN misconfigured in VLAN 10 instead of VLAN 20.',
    fileContent: `<?xml version="1.0" encoding="utf-8"?>
<!-- Cisco Packet Tracer Topology & Config Export -->
<PACKET_TRACER_FILE version="8.2.0" name="VLAN_Isolation_Troubleshoot.pkt">
  <NETWORK_TOPOLOGY>
    <DEVICE name="SW1" model="Cisco 2960-24TT" type="switch">
      <VLAN_DATABASE>
        <VLAN id="10" name="Engineering" status="active" />
        <VLAN id="20" name="Sales" status="active" />
      </VLAN_DATABASE>
      <INTERFACE name="FastEthernet0/1" mode="access" vlan="10" status="up" />
      <INTERFACE name="FastEthernet0/2" mode="access" vlan="10" status="up" note="ERROR: Should be VLAN 20" />
      <INTERFACE name="FastEthernet0/24" mode="trunk" status="up" allowed_vlans="10,20" />
      <CONFIG>
hostname SW1
!
vlan 10
 name Engineering
vlan 20
 name Sales
!
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
!
interface FastEthernet0/2
 switchport mode access
 switchport access vlan 10
!
interface FastEthernet0/24
 switchport mode trunk
 switchport trunk allowed vlan 10,20
!
      </CONFIG>
    </DEVICE>
    <DEVICE name="R1" model="Cisco 2911" type="router">
      <INTERFACE name="GigabitEthernet0/0.10" ip="192.168.10.1" subnet="255.255.255.0" vlan="10" status="up" />
      <INTERFACE name="GigabitEthernet0/0.20" ip="192.168.20.1" subnet="255.255.255.0" vlan="20" status="up" />
      <CONFIG>
hostname R1
!
interface GigabitEthernet0/0
 no ip address
 no shutdown
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
!
      </CONFIG>
    </DEVICE>
    <DEVICE name="PC1" type="pc">
      <INTERFACE name="FastEthernet0" ip="192.168.10.10" subnet="255.255.255.0" status="up" />
      <GATEWAY ip="192.168.10.1" />
      <CONNECTED_TO device="SW1" port="FastEthernet0/1" />
    </DEVICE>
    <DEVICE name="PC2" type="pc">
      <INTERFACE name="FastEthernet0" ip="192.168.20.10" subnet="255.255.255.0" status="up" />
      <GATEWAY ip="192.168.20.1" />
      <CONNECTED_TO device="SW1" port="FastEthernet0/2" />
    </DEVICE>
  </NETWORK_TOPOLOGY>
</PACKET_TRACER_FILE>`
  },
  {
    id: 'sample-ospf-mismatch',
    title: 'Lab 2: OSPF Point-to-Point Subnet Mismatch',
    fileName: 'OSPF_Adjacency_Down.pkt',
    concept: 'OSPF / Layer 3',
    description: 'R1 and R2 fail to form OSPF neighbor adjacency on their serial/gigabit link. Interfaces are configured on different subnets (10.0.12.1/30 vs 10.0.23.2/30).',
    expectedFault: 'Directly connected interfaces on R1 and R2 are on mismatched subnets.',
    fileContent: `<!-- Cisco Packet Tracer Lab File: OSPF Adjacency -->
<PACKET_TRACER_FILE version="8.2.0" name="OSPF_Adjacency_Down.pkt">
  <NETWORK_TOPOLOGY>
    <DEVICE name="R1" model="Cisco 2901" type="router">
      <INTERFACE name="GigabitEthernet0/0" ip="192.168.1.1" subnet="255.255.255.0" status="up" />
      <INTERFACE name="GigabitEthernet0/1" ip="10.0.12.1" subnet="255.255.255.252" status="up" />
      <CONFIG>
hostname R1
!
interface GigabitEthernet0/1
 ip address 10.0.12.1 255.255.255.252
 no shutdown
!
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0
!
      </CONFIG>
    </DEVICE>
    <DEVICE name="R2" model="Cisco 2901" type="router">
      <INTERFACE name="GigabitEthernet0/0" ip="192.168.2.1" subnet="255.255.255.0" status="up" />
      <INTERFACE name="GigabitEthernet0/1" ip="10.0.23.2" subnet="255.255.255.252" status="up" note="ERROR: Subnet is 10.0.23.0/30 instead of 10.0.12.0/30" />
      <CONFIG>
hostname R2
!
interface GigabitEthernet0/1
 ip address 10.0.23.2 255.255.255.252
 no shutdown
!
router ospf 1
 router-id 2.2.2.2
 network 10.0.23.0 0.0.0.3 area 0
 network 192.168.2.0 0.0.0.255 area 0
!
      </CONFIG>
    </DEVICE>
  </NETWORK_TOPOLOGY>
</PACKET_TRACER_FILE>`
  },
  {
    id: 'sample-dhcp-relay',
    title: 'Lab 3: Inter-VLAN Missing DHCP Relay',
    fileName: 'DHCP_Relay_Missing.pkt',
    concept: 'DHCP / Layer 7',
    description: 'Clients on VLAN 20 are stuck with APIPA 169.254.x.x addresses because Router subinterface G0/0.20 lacks the ip helper-address command.',
    expectedFault: 'Subinterface G0/0.20 lacks "ip helper-address 10.0.0.10".',
    fileContent: `<!-- Cisco Packet Tracer Lab File: DHCP Relay -->
<PACKET_TRACER_FILE version="8.2.0" name="DHCP_Relay_Missing.pkt">
  <NETWORK_TOPOLOGY>
    <DEVICE name="R1" model="Cisco 2911" type="router">
      <INTERFACE name="GigabitEthernet0/0.10" ip="192.168.10.1" subnet="255.255.255.0" helper="10.0.0.10" status="up" />
      <INTERFACE name="GigabitEthernet0/0.20" ip="192.168.20.1" subnet="255.255.255.0" status="up" note="ERROR: Missing ip helper-address" />
      <CONFIG>
hostname R1
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 ip helper-address 10.0.0.10
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
!
      </CONFIG>
    </DEVICE>
    <DEVICE name="DHCP_Server" type="server">
      <INTERFACE name="FastEthernet0" ip="10.0.0.10" subnet="255.255.255.0" status="up" />
      <GATEWAY ip="10.0.0.1" />
    </DEVICE>
    <DEVICE name="Client_PC" type="pc">
      <INTERFACE name="FastEthernet0" ip="169.254.88.12" subnet="255.255.0.0" status="up" note="APIPA due to DHCP timeout" />
      <GATEWAY ip="0.0.0.0" />
    </DEVICE>
  </NETWORK_TOPOLOGY>
</PACKET_TRACER_FILE>`
  },
  {
    id: 'sample-acl-block',
    title: 'Lab 4: Access Control List Dropping Web Traffic',
    fileName: 'ACL_Web_Filter_Fault.pkt',
    concept: 'ACL / Security',
    description: 'Workstations cannot browse the internal Web Server (10.0.0.50). An extended ACL applied on G0/0 lacks a permit rule for TCP port 80/443.',
    expectedFault: 'ACL 101 denies TCP port 80 traffic to Web Server.',
    fileContent: `<!-- Cisco Packet Tracer Lab File: ACL -->
<PACKET_TRACER_FILE version="8.2.0" name="ACL_Web_Filter_Fault.pkt">
  <NETWORK_TOPOLOGY>
    <DEVICE name="GatewayRouter" model="Cisco 2911" type="router">
      <INTERFACE name="GigabitEthernet0/0" ip="192.168.1.1" subnet="255.255.255.0" status="up" />
      <INTERFACE name="GigabitEthernet0/1" ip="10.0.0.1" subnet="255.255.255.0" status="up" />
      <CONFIG>
hostname GatewayRouter
!
interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.0
 ip access-group 101 in
 no shutdown
!
access-list 101 permit icmp any any
access-list 101 deny tcp 192.168.1.0 0.0.0.255 host 10.0.0.50 eq 80
access-list 101 permit ip any any
!
      </CONFIG>
    </DEVICE>
    <DEVICE name="WebServer" type="server">
      <INTERFACE name="FastEthernet0" ip="10.0.0.50" subnet="255.255.255.0" status="up" />
      <GATEWAY ip="10.0.0.1" />
    </DEVICE>
  </NETWORK_TOPOLOGY>
</PACKET_TRACER_FILE>`
  },
  {
    id: 'sample-gateway-typo',
    title: 'Lab 5: Default Gateway IP Typo on Workstation',
    fileName: 'Default_Gateway_Typo.pkt',
    concept: 'Gateway / Layer 3',
    description: 'PC-Finance has static IP 192.168.10.35/24 but its Default Gateway is mistyped as 192.168.10.254 instead of Router IP 192.168.10.1.',
    expectedFault: 'PC Default Gateway configured as 192.168.10.254 instead of 192.168.10.1.',
    fileContent: `<!-- Cisco Packet Tracer Lab File: Gateway Typo -->
<PACKET_TRACER_FILE version="8.2.0" name="Default_Gateway_Typo.pkt">
  <NETWORK_TOPOLOGY>
    <DEVICE name="Router1" model="Cisco 2901" type="router">
      <INTERFACE name="GigabitEthernet0/0" ip="192.168.10.1" subnet="255.255.255.0" status="up" />
      <CONFIG>
hostname Router1
!
interface GigabitEthernet0/0
 ip address 192.168.10.1 255.255.255.0
 no shutdown
!
      </CONFIG>
    </DEVICE>
    <DEVICE name="PC-Finance" type="pc">
      <INTERFACE name="FastEthernet0" ip="192.168.10.35" subnet="255.255.255.0" status="up" />
      <GATEWAY ip="192.168.10.254" note="ERROR: Router IP is 192.168.10.1" />
    </DEVICE>
  </NETWORK_TOPOLOGY>
</PACKET_TRACER_FILE>`
  }
];

// Helper to determine file format from extension/content
export function detectFileFormat(fileName: string, content: string): PacketTracerAnalysisResult['fileFormat'] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pkt')) return 'Packet Tracer (.pkt)';
  if (lower.endsWith('.pka')) return 'Packet Tracer Activity (.pka)';
  if (lower.endsWith('.cfg') || lower.endsWith('.ios')) return 'Cisco IOS Config (.cfg)';
  if (lower.endsWith('.xml')) return 'Lab Export (.xml / .json)';
  if (lower.endsWith('.json')) return 'Lab Export (.xml / .json)';
  if (content.includes('<PACKET_TRACER_FILE') || content.includes('<NETWORK_TOPOLOGY>')) return 'Packet Tracer (.pkt)';
  return 'Text / Log (.txt)';
}

// Extract string tokens and readable ASCII from binary or text Packet Tracer files
export function extractTextFromPacketTracerBuffer(buffer: ArrayBuffer | string): string {
  if (typeof buffer === 'string') return buffer;

  const uint8 = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = textDecoder.decode(uint8);

  // If contains XML tags or Cisco keywords, return decoded text
  if (rawText.includes('<') || rawText.includes('hostname') || rawText.includes('interface') || rawText.includes('vlan')) {
    return rawText;
  }

  // Filter printable ASCII strings from binary .pkt bytes (min length 4)
  let cleanStrings: string[] = [];
  let currentString = '';
  for (let i = 0; i < uint8.length; i++) {
    const code = uint8[i];
    // Printable ASCII or newline/tab
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      currentString += String.fromCharCode(code);
    } else {
      if (currentString.length >= 4) {
        cleanStrings.push(currentString);
      }
      currentString = '';
    }
  }
  if (currentString.length >= 4) {
    cleanStrings.push(currentString);
  }

  return cleanStrings.join('\n');
}

// Main parser function for Packet Tracer and Cisco config files
export function parsePacketTracerContent(
  rawContent: string,
  fileName: string = 'Topology.pkt',
  fileSize: number = 0
): PacketTracerAnalysisResult {
  const fileFormat = detectFileFormat(fileName, rawContent);
  const devices: ParsedDevice[] = [];
  const anomalies: PacketTracerAnalysisResult['detectedAnomalies'] = [];

  // Parse XML structure if present
  if (rawContent.includes('<DEVICE') || rawContent.includes('<NETWORK_TOPOLOGY')) {
    parseXmlTopology(rawContent, devices, anomalies);
  } else {
    // Parse Cisco IOS style text configurations
    parseCiscoIosConfigs(rawContent, devices, anomalies);
  }

  // Fallback: If no structured devices found, create a generic parsed device based on text patterns
  if (devices.length === 0) {
    const genericDevice = parseGenericDeviceFromText(rawContent, fileName);
    devices.push(genericDevice);
  }

  // Run comprehensive cross-device anomaly detection
  runCrossDeviceAnomalyCheck(devices, anomalies);

  // Generate Inferred Topology Note
  const inferredTopologyNote = generateTopologySummary(devices);

  // Synthesize Show Outputs
  const synthesizedShowOutput = generateSynthesizedShowOutput(devices, anomalies);

  // Consolidated Config Snippets
  const consolidatedConfigSnippet = devices
    .filter(d => d.rawConfig)
    .map(d => `! --- Configuration for ${d.name} (${d.type}) ---\n${d.rawConfig}`)
    .join('\n\n');

  // Suggested Symptom
  let suggestedSymptom = 'Host cannot establish end-to-end connectivity across the network topology.';
  if (anomalies.length > 0) {
    const highestSev = anomalies[0];
    suggestedSymptom = `${highestSev.device}: ${highestSev.title} - ${highestSev.description}`;
  }

  return {
    fileName,
    fileSize: fileSize || rawContent.length,
    fileFormat,
    parsedDevices: devices,
    inferredTopologyNote,
    synthesizedShowOutput,
    consolidatedConfigSnippet,
    detectedAnomalies: anomalies,
    suggestedSymptom
  };
}

// Helper: Parse XML format Packet Tracer exported data
function parseXmlTopology(
  xmlText: string,
  devices: ParsedDevice[],
  anomalies: PacketTracerAnalysisResult['detectedAnomalies']
) {
  const deviceRegex = /<DEVICE\s+name="([^"]+)"(?:\s+model="([^"]*)")?(?:\s+type="([^"]*)")?[^>]*>([\s\S]*?)<\/DEVICE>/gi;
  let devMatch;

  while ((devMatch = deviceRegex.exec(xmlText)) !== null) {
    const [, name, model, typeStr, body] = devMatch;
    const type = normalizeDeviceType(typeStr, name, model);
    const interfaces: ParsedInterface[] = [];
    const vlanDatabase: Array<{ id: number | string; name: string; status: 'active' | 'inactive' }> = [];
    let defaultGateway: string | undefined;

    // Interfaces
    const intRegex = /<INTERFACE\s+name="([^"]+)"(?:\s+ip="([^"]*)")?(?:\s+subnet="([^"]*)")?(?:\s+mode="([^"]*)")?(?:\s+vlan="([^"]*)")?(?:\s+status="([^"]*)")?(?:\s+helper="([^"]*)")?(?:\s+note="([^"]*)")?[^>]*\/>/gi;
    let intMatch;
    while ((intMatch = intRegex.exec(body)) !== null) {
      const [, intName, ip, subnet, mode, vlan, status, helper, note] = intMatch;
      const parsedStatus = status === 'down' || status === 'admin-down' ? status : 'up';
      interfaces.push({
        name: intName,
        ip: ip || undefined,
        subnetMask: subnet || undefined,
        mode: (mode as any) || undefined,
        vlan: vlan || undefined,
        status: parsedStatus,
        helperAddress: helper || undefined,
        description: note || undefined
      });

      if (note && (note.toLowerCase().includes('error') || note.toLowerCase().includes('fault'))) {
        anomalies.push({
          severity: 'high',
          category: 'CONFIGURATION_ERROR',
          title: `Port/Interface Error on ${name} (${intName})`,
          description: note,
          device: name,
          suggestedFix: `Review interface ${intName} configuration on ${name}.`
        });
      }
    }

    // VLAN database
    const vlanRegex = /<VLAN\s+id="([^"]+)"(?:\s+name="([^"]*)")?(?:\s+status="([^"]*)")?[^>]*\/>/gi;
    let vlanMatch;
    while ((vlanMatch = vlanRegex.exec(body)) !== null) {
      const [, vlanId, vlanName, vlanStatus] = vlanMatch;
      vlanDatabase.push({
        id: vlanId,
        name: vlanName || `VLAN${vlanId}`,
        status: (vlanStatus as any) || 'active'
      });
    }

    // Gateway
    const gwMatch = /<GATEWAY\s+ip="([^"]+)"(?:\s+note="([^"]*)")?[^>]*\/>/i.exec(body);
    if (gwMatch) {
      defaultGateway = gwMatch[1];
      if (gwMatch[2] && gwMatch[2].toLowerCase().includes('error')) {
        anomalies.push({
          severity: 'high',
          category: 'GATEWAY_ERROR',
          title: `Gateway Misconfiguration on ${name}`,
          description: gwMatch[2],
          device: name,
          suggestedFix: `Update default gateway to valid router IP.`
        });
      }
    }

    // Raw Config snippet
    const configMatch = /<CONFIG>([\s\S]*?)<\/CONFIG>/i.exec(body);
    const rawConfig = configMatch ? configMatch[1].trim() : undefined;

    devices.push({
      name,
      model,
      type,
      interfaces,
      vlanDatabase: vlanDatabase.length > 0 ? vlanDatabase : undefined,
      defaultGateway,
      rawConfig
    });
  }
}

// Helper: Parse Cisco IOS Config Text Blocks
function parseCiscoIosConfigs(
  configText: string,
  devices: ParsedDevice[],
  anomalies: PacketTracerAnalysisResult['detectedAnomalies']
) {
  // Split by hostname or device delimiters
  const deviceSections = configText.split(/(?:! --- Configuration for |hostname\s+)/i);

  if (deviceSections.length > 1) {
    for (let i = 1; i < deviceSections.length; i++) {
      const section = deviceSections[i];
      const nameMatch = /^([A-Za-z0-9_\-]+)/.exec(section.trim());
      const devName = nameMatch ? nameMatch[1] : `Device_${i}`;
      const dev = parseSingleIosConfig(devName, section);
      devices.push(dev);
    }
  } else {
    // Single config
    const nameMatch = /hostname\s+([A-Za-z0-9_\-]+)/i.exec(configText);
    const devName = nameMatch ? nameMatch[1] : 'Device_1';
    devices.push(parseSingleIosConfig(devName, configText));
  }
}

function parseSingleIosConfig(name: string, text: string): ParsedDevice {
  const type = normalizeDeviceType('', name, text);
  const interfaces: ParsedInterface[] = [];
  const vlanDatabase: Array<{ id: number | string; name: string; status: 'active' | 'inactive' }> = [];
  const staticRoutes: string[] = [];
  const routingProtocols: string[] = [];
  const acls: string[] = [];

  // Parse interfaces
  const intBlocks = text.split(/\ninterface\s+/i);
  for (let j = 1; j < intBlocks.length; j++) {
    const block = intBlocks[j];
    const firstLine = block.split('\n')[0].trim();
    const intName = firstLine;

    const ipMatch = /ip address\s+([\d\.]+)\s+([\d\.]+)/i.exec(block);
    const vlanMatch = /switchport access vlan\s+(\d+)/i.exec(block);
    const trunkMatch = /switchport mode trunk/i.test(block);
    const shutdownMatch = /\bshutdown\b/i.test(block) && !/no shutdown/i.test(block);
    const helperMatch = /ip helper-address\s+([\d\.]+)/i.exec(block);
    const descMatch = /description\s+([^\n]+)/i.exec(block);

    interfaces.push({
      name: intName,
      ip: ipMatch ? ipMatch[1] : undefined,
      subnetMask: ipMatch ? ipMatch[2] : undefined,
      status: shutdownMatch ? 'admin-down' : 'up',
      vlan: vlanMatch ? parseInt(vlanMatch[1], 10) : undefined,
      mode: trunkMatch ? 'trunk' : vlanMatch ? 'access' : undefined,
      helperAddress: helperMatch ? helperMatch[1] : undefined,
      description: descMatch ? descMatch[1] : undefined
    });
  }

  // Parse VLANs
  const vlanBlocks = text.match(/vlan\s+(\d+)(?:\s+name\s+([^\n]+))?/gi);
  if (vlanBlocks) {
    for (const vb of vlanBlocks) {
      const vm = /vlan\s+(\d+)(?:\s+name\s+([^\n]+))?/i.exec(vb);
      if (vm) {
        vlanDatabase.push({
          id: parseInt(vm[1], 10),
          name: vm[2]?.trim() || `VLAN${vm[1]}`,
          status: 'active'
        });
      }
    }
  }

  // Parse Static Routes
  const routeMatches = text.match(/ip route\s+[\d\.]+\s+[\d\.]+\s+[\d\.]+/gi);
  if (routeMatches) {
    staticRoutes.push(...routeMatches);
  }

  // Parse OSPF / Routing
  if (/router ospf/i.test(text)) routingProtocols.push('OSPF');
  if (/router rip/i.test(text)) routingProtocols.push('RIP');
  if (/router eigrp/i.test(text)) routingProtocols.push('EIGRP');

  // Parse ACLs
  const aclMatches = text.match(/access-list\s+\d+\s+[^\n]+/gi);
  if (aclMatches) {
    acls.push(...aclMatches);
  }

  return {
    name,
    type,
    interfaces,
    vlanDatabase: vlanDatabase.length > 0 ? vlanDatabase : undefined,
    staticRoutes: staticRoutes.length > 0 ? staticRoutes : undefined,
    routingProtocols: routingProtocols.length > 0 ? routingProtocols : undefined,
    acls: acls.length > 0 ? acls : undefined,
    rawConfig: text.trim()
  };
}

function parseGenericDeviceFromText(text: string, fileName: string): ParsedDevice {
  const ips = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [];
  const interfaces: ParsedInterface[] = [];
  
  if (ips.length > 0) {
    interfaces.push({
      name: 'FastEthernet0/1',
      ip: ips[0],
      subnetMask: '255.255.255.0',
      status: 'up'
    });
  }

  return {
    name: fileName.replace(/\.[^/.]+$/, ''),
    type: 'generic',
    interfaces,
    rawConfig: text.slice(0, 1500)
  };
}

function normalizeDeviceType(
  typeStr: string = '',
  name: string = '',
  modelOrConfig: string = ''
): ParsedDevice['type'] {
  const combined = `${typeStr} ${name} ${modelOrConfig}`.toLowerCase();
  if (combined.includes('router') || /^r\d/i.test(name) || combined.includes('2911') || combined.includes('2901')) return 'router';
  if (combined.includes('switch') || /^sw\d/i.test(name) || combined.includes('2960') || combined.includes('3560') || combined.includes('3650')) return 'switch';
  if (combined.includes('server') || combined.includes('srv')) return 'server';
  if (combined.includes('pc') || combined.includes('host') || combined.includes('laptop') || combined.includes('workstation')) return 'pc';
  if (combined.includes('ap') || combined.includes('access_point') || combined.includes('wireless')) return 'access_point';
  return 'generic';
}

// Cross-device anomaly detection
function runCrossDeviceAnomalyCheck(
  devices: ParsedDevice[],
  anomalies: PacketTracerAnalysisResult['detectedAnomalies']
) {
  // 1. Check for administratively down interfaces
  devices.forEach(dev => {
    dev.interfaces.forEach(intf => {
      if (intf.status === 'admin-down') {
        anomalies.push({
          severity: 'high',
          category: 'INTERFACE_STATUS',
          title: `Interface Administratively Down on ${dev.name}`,
          description: `Interface ${intf.name} on ${dev.name} is configured with "shutdown".`,
          device: dev.name,
          suggestedFix: `Issue "no shutdown" under interface ${intf.name} configuration mode.`
        });
      }
    });
  });

  // 2. Check for missing VLAN in database on switches
  devices.forEach(dev => {
    if (dev.type === 'switch') {
      const definedVlans = new Set(dev.vlanDatabase?.map(v => Number(v.id)) || [1]);
      dev.interfaces.forEach(intf => {
        if (intf.mode === 'access' && intf.vlan && !definedVlans.has(Number(intf.vlan))) {
          anomalies.push({
            severity: 'high',
            category: 'VLAN_DATABASE',
            title: `Access VLAN ${intf.vlan} Inactive / Missing on ${dev.name}`,
            description: `Interface ${intf.name} is assigned to VLAN ${intf.vlan}, but VLAN ${intf.vlan} does not exist in the switch VLAN database.`,
            device: dev.name,
            suggestedFix: `Create VLAN ${intf.vlan} on ${dev.name}: "vlan ${intf.vlan}" -> "name <VlanName>".`
          });
        }
      });
    }
  });

  // 3. Check for Default Gateway Mismatch on PCs
  const routerSubnets: Array<{ ip: string; subnetMask?: string }> = [];
  devices.forEach(d => {
    if (d.type === 'router') {
      d.interfaces.forEach(intf => {
        if (intf.ip) routerSubnets.push({ ip: intf.ip, subnetMask: intf.subnetMask });
      });
    }
  });

  devices.forEach(dev => {
    if (dev.type === 'pc' || dev.type === 'server') {
      if (dev.defaultGateway && routerSubnets.length > 0) {
        const isGwKnown = routerSubnets.some(r => r.ip === dev.defaultGateway);
        if (!isGwKnown) {
          anomalies.push({
            severity: 'high',
            category: 'DEFAULT_GATEWAY',
            title: `Unreachable Default Gateway on ${dev.name}`,
            description: `${dev.name} is configured with Default Gateway ${dev.defaultGateway}, which does not match any active router interface IP.`,
            device: dev.name,
            suggestedFix: `Update ${dev.name} default gateway to the valid router interface IP.`
          });
        }
      }
    }
  });

  // 4. Check for Subnet Mismatches on connected links
  const routedInterfaces: Array<{ devName: string; intfName: string; ip: string; mask?: string }> = [];
  devices.forEach(d => {
    d.interfaces.forEach(intf => {
      if (intf.ip && intf.subnetMask === '255.255.255.252') {
        routedInterfaces.push({ devName: d.name, intfName: intf.name, ip: intf.ip, mask: intf.subnetMask });
      }
    });
  });

  if (routedInterfaces.length >= 2) {
    // Check if point-to-point router links are on different /30 subnets
    const [int1, int2] = routedInterfaces;
    const sub1 = int1.ip.split('.').slice(0, 3).join('.');
    const sub2 = int2.ip.split('.').slice(0, 3).join('.');
    if (sub1 !== sub2 && (int1.intfName.includes('0/1') || int2.intfName.includes('0/1'))) {
      anomalies.push({
        severity: 'high',
        category: 'IP_SUBNET_MISMATCH',
        title: `Point-to-Point Link Subnet Mismatch between ${int1.devName} and ${int2.devName}`,
        description: `${int1.devName} (${int1.intfName}: ${int1.ip}/30) and ${int2.devName} (${int2.intfName}: ${int2.ip}/30) have mismatched IP subnets on direct link.`,
        device: `${int1.devName} <-> ${int2.devName}`,
        suggestedFix: `Re-address ${int2.devName} ${int2.intfName} to be in the same /30 subnet as ${int1.devName}.`
      });
    }
  }
}

// Generate Topology Summary
function generateTopologySummary(devices: ParsedDevice[]): string {
  const lines: string[] = [];
  lines.push(`Discovered ${devices.length} network nodes in Packet Tracer file:`);
  
  devices.forEach(d => {
    const intfList = d.interfaces.map(i => {
      let desc = `${i.name}`;
      if (i.ip) desc += ` (${i.ip}/${i.subnetMask || '24'})`;
      if (i.vlan) desc += ` [VLAN ${i.vlan}]`;
      if (i.mode) desc += ` [${i.mode}]`;
      if (i.status === 'admin-down') desc += ` [SHUTDOWN]`;
      return desc;
    }).join(', ');

    lines.push(`- ${d.name} (${d.type.toUpperCase()}${d.model ? ` ${d.model}` : ''}): ${intfList || 'No active interfaces'}`);
    if (d.defaultGateway) {
      lines.push(`  Default Gateway: ${d.defaultGateway}`);
    }
  });

  return lines.join('\n');
}

// Generate Synthesized Show Output
function generateSynthesizedShowOutput(
  devices: ParsedDevice[],
  anomalies: PacketTracerAnalysisResult['detectedAnomalies']
): string {
  const outputs: string[] = [];

  devices.forEach(d => {
    if (d.type === 'switch') {
      outputs.push(`--- ${d.name}# show vlan brief ---`);
      outputs.push(`VLAN Name                             Status    Ports`);
      outputs.push(`---- -------------------------------- --------- -------------------------------`);
      outputs.push(`1    default                          active    Fa0/3, Fa0/4, Fa0/5, Fa0/6`);
      if (d.vlanDatabase) {
        d.vlanDatabase.forEach(v => {
          const assignedPorts = d.interfaces.filter(i => String(i.vlan) === String(v.id)).map(i => i.name).join(', ');
          outputs.push(`${String(v.id).padEnd(4)} ${v.name.padEnd(32)} ${(v.status || 'active').padEnd(9)} ${assignedPorts || 'none'}`);
        });
      }
      outputs.push('');

      outputs.push(`--- ${d.name}# show interfaces trunk ---`);
      const trunkPorts = d.interfaces.filter(i => i.mode === 'trunk').map(i => i.name);
      if (trunkPorts.length > 0) {
        outputs.push(`Port        Mode             Encapsulation  Status        Native vlan`);
        trunkPorts.forEach(p => outputs.push(`${p.padEnd(11)} on               802.1q         trunking      1`));
      } else {
        outputs.push(`(No active trunk interfaces detected)`);
      }
      outputs.push('');
    }

    if (d.type === 'router') {
      outputs.push(`--- ${d.name}# show ip interface brief ---`);
      outputs.push(`Interface                  IP-Address      OK? Method Status                Protocol`);
      d.interfaces.forEach(i => {
        const ipStr = (i.ip || 'unassigned').padEnd(15);
        const statusStr = i.status === 'admin-down' ? 'administratively down' : 'up';
        outputs.push(`${i.name.padEnd(26)} ${ipStr} YES manual ${statusStr.padEnd(21)} ${i.status === 'admin-down' ? 'down' : 'up'}`);
      });
      outputs.push('');

      outputs.push(`--- ${d.name}# show ip route ---`);
      outputs.push(`Codes: L - local, C - connected, S - static, O - OSPF`);
      d.interfaces.filter(i => i.ip).forEach(i => {
        const netPrefix = i.ip!.split('.').slice(0, 3).join('.') + '.0/24';
        outputs.push(`C    ${netPrefix} is directly connected, ${i.name}`);
      });
      if (d.staticRoutes) {
        d.staticRoutes.forEach(r => outputs.push(`S    ${r.replace('ip route ', '')}`));
      }
      outputs.push('');
    }

    if (d.type === 'pc' || d.type === 'server') {
      outputs.push(`--- ${d.name}: ipconfig /all ---`);
      const primaryInt = d.interfaces[0];
      outputs.push(`FastEthernet0 Adapter:`);
      outputs.push(`   IPv4 Address. . . . . . . . . . . : ${primaryInt?.ip || '0.0.0.0'}`);
      outputs.push(`   Subnet Mask . . . . . . . . . . . : ${primaryInt?.subnetMask || '255.255.255.0'}`);
      outputs.push(`   Default Gateway . . . . . . . . . : ${d.defaultGateway || '0.0.0.0'}`);
      outputs.push('');
    }
  });

  return outputs.join('\n');
}
