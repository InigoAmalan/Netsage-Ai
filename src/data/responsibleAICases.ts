import { ResponsibleAICase } from '../types/network';

export const INITIAL_RESPONSIBLE_AI_CASES: ResponsibleAICase[] = [
  {
    id: 'RAI-001',
    case_id: 'CASE007',
    title: 'Workstation Default Gateway Override vs. Router ARP Issue',
    scenario: 'Single workstation 192.168.10.30 cannot reach internet. Gateway configured as 192.168.10.254 while router is 192.168.10.1.',
    initial_ai_diagnosis: {
      root_cause: 'Router GigabitEthernet0/0 ARP table corruption or upstream ISP routing failure.',
      confidence: 'high',
      flaw_type: 'Premature Certainty',
      ai_output_summary: 'AI claimed high confidence that the router ARP table had corrupted the IP binding without inspecting the client ipconfig gateway address.'
    },
    human_correction: {
      actual_root_cause: 'Static default gateway misconfiguration on PC-30 (192.168.10.254 instead of .1).',
      decision: 'Edited',
      why_ai_failed: 'The AI overcomplicated the failure by assuming an upstream router fault instead of inspecting the local client configuration showing an invalid gateway IP.',
      correct_remediation: 'Update PC-30 static configuration: change default gateway to 192.168.10.1.',
      lesson_learned: 'Always verify Layer 3 local station configuration (ipconfig/ifconfig) before assuming router-level faults.'
    }
  },
  {
    id: 'RAI-002',
    case_id: 'CASE010',
    title: 'DHCP Discovery Dropped at Gateway vs. DHCP Scope Exhaustion',
    scenario: 'Remote DHCP clients in 192.168.20.0/24 fail to receive IP from server at 10.0.0.10.',
    initial_ai_diagnosis: {
      root_cause: 'DHCP Server at 10.0.0.10 is completely exhausted or DHCP service crashed.',
      confidence: 'high',
      flaw_type: 'Hallucination',
      ai_output_summary: 'AI asserted with high confidence that the central DHCP pool was exhausted, even though no show ip dhcp pool output was provided in the evidence.'
    },
    human_correction: {
      actual_root_cause: 'Missing ip helper-address (DHCP Relay) on client-facing router interface G0/1.',
      decision: 'Edited',
      why_ai_failed: 'AI hallucinated that the DHCP server was exhausted when the broadcast packet never left the local broadcast domain due to missing relay agent.',
      correct_remediation: 'Configure interface GigabitEthernet0/1 -> ip helper-address 10.0.0.10.',
      lesson_learned: 'DHCP broadcasts do not cross routers without an explicit IP helper-address configured on the incoming gateway interface.'
    }
  },
  {
    id: 'RAI-003',
    case_id: 'CASE017',
    title: 'OSPF Neighbor Failure: MTU Mismatch vs. Subnet Mismatch',
    scenario: 'OSPF neighbors R1 and R2 fail to form adjacency across directly connected link.',
    initial_ai_diagnosis: {
      root_cause: 'OSPF MTU mismatch between R1 and R2 causing adjacency to stall in EXSTART state.',
      confidence: 'medium',
      flaw_type: 'Missing Evidence',
      ai_output_summary: 'AI hypothesized MTU mismatch without checking the interface IP addresses in the show ip interface brief output.'
    },
    human_correction: {
      actual_root_cause: 'Directly connected interfaces are on completely different subnets (10.0.12.1/30 vs 10.0.23.2/30).',
      decision: 'Edited',
      why_ai_failed: 'AI missed the obvious Layer 3 IP mismatch visible in show ip interface brief (10.0.12.x vs 10.0.23.x).',
      correct_remediation: 'Reconfigure R2 G0/1 to 10.0.12.2 255.255.255.252.',
      lesson_learned: 'OSPF neighbors on broadcast/point-to-point networks require primary IP addresses to reside on the identical subnet.'
    }
  },
  {
    id: 'RAI-004',
    case_id: 'CASE023',
    title: 'Access List Ineffectiveness: Wildcard Mask Error vs. Missing access-group',
    scenario: 'Newly created ACL 105 is not blocking traffic between subnets.',
    initial_ai_diagnosis: {
      root_cause: 'Wildcard mask in ACL 105 is improperly calculated or inverted.',
      confidence: 'medium',
      flaw_type: 'Overlooked Syntax',
      ai_output_summary: 'AI attempted to rewrite the ACL syntax instead of verifying whether the ACL was applied to an interface.'
    },
    human_correction: {
      actual_root_cause: 'ACL 105 exists in global configuration but is not bound to any interface with ip access-group.',
      decision: 'Edited',
      why_ai_failed: 'AI ignored the show ip interface output showing "Inbound access list is not set".',
      correct_remediation: 'Apply ACL: interface GigabitEthernet0/0 -> ip access-group 105 in.',
      lesson_learned: 'An Access Control List has no operational effect until bound to an interface via ip access-group or a line via access-class.'
    }
  },
  {
    id: 'RAI-005',
    case_id: 'CASE028',
    title: 'Guest Wi-Fi Security Breach: Wireless Controller Tagging vs. Missing Inter-VLAN ACL',
    scenario: 'Guest Wi-Fi users in VLAN 40 can ping and access production servers in VLAN 10.',
    initial_ai_diagnosis: {
      root_cause: 'Wireless Access Point is leaking frames due to native VLAN tagging collision.',
      confidence: 'low',
      flaw_type: 'Wrong Layer',
      ai_output_summary: 'AI blamed Layer 2 native VLAN framing rather than Layer 3 inter-VLAN routing policy.'
    },
    human_correction: {
      actual_root_cause: 'The default router routes between all connected VLAN subnets automatically; no ACL is configured to enforce guest isolation.',
      decision: 'Edited',
      why_ai_failed: 'Routers route between all connected subnets by design. Without an explicit access-list denying guest-to-internal traffic, inter-VLAN communication is expected behavior.',
      correct_remediation: 'Create and apply an ACL on VLAN 40 subinterface/gateway denying 192.168.40.0/24 to 192.168.10.0/24 while permitting internet access.',
      lesson_learned: 'VLAN segmentation provides Layer 2 broadcast separation, but Layer 3 routing connects them unless explicitly restricted by firewall or ACL policies.'
    }
  }
];
