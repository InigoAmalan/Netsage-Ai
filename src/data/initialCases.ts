import { TroubleshootingCase } from '../types/network';

export const INITIAL_CASES: TroubleshootingCase[] = [
  {
    case_id: 'CASE001',
    symptom: 'PC1 can ping its gateway but cannot reach PC2.',
    topology_note: 'PC1 and PC2 connect to SW1; PC1 should be VLAN 10 and PC2 VLAN 20.',
    show_output: 'show vlan brief:\n1    default                          active    Fa0/3, Fa0/4\n10   Engineering                      active    Fa0/1, Fa0/2\n20   Finance                          active    \nshow mac address-table:\n  10    0001.423a.1101    DYNAMIC     Fa0/1\n  10    0001.423a.2202    DYNAMIC     Fa0/2',
    expected_fault: 'PC2 is assigned to the wrong VLAN; Fa0/2 should be VLAN 20.',
    osi_layer: 'Layer 2',
    concept: 'VLAN',
    severity: 'medium',
    config_snippet: 'interface FastEthernet0/1\n switchport mode access\n switchport access vlan 10\ninterface FastEthernet0/2\n switchport mode access\n switchport access vlan 10'
  },
  {
    case_id: 'CASE002',
    symptom: 'PC in VLAN 20 cannot communicate with any device in VLAN 20.',
    topology_note: 'PCs connect to SW1; VLAN 20 is required for Sales department.',
    show_output: 'show vlan brief:\n1    default                          active    Fa0/5, Fa0/6\n10   Accounting                       active    Fa0/1, Fa0/2\nshow interfaces Fa0/3 switchport:\nAccess Mode VLAN: 20 ((Inactive))\nOperational Mode: static access',
    expected_fault: 'Required VLAN 20 is missing on the switch database.',
    osi_layer: 'Layer 2',
    concept: 'VLAN',
    severity: 'high',
    config_snippet: 'interface FastEthernet0/3\n switchport mode access\n switchport access vlan 20'
  },
  {
    case_id: 'CASE003',
    symptom: 'Devices in different VLANs cannot communicate through the router.',
    topology_note: 'SW1 connects to R1 on Fa0/24 using a trunk link for Router-on-a-Stick.',
    show_output: 'show interfaces trunk:\n(empty output - no active trunks)\nshow interfaces Fa0/24 switchport:\nAdministrative Mode: dynamic auto\nOperational Mode: static access\nAccess Mode VLAN: 1 (default)',
    expected_fault: 'Switch-to-router link is not configured as a trunk.',
    osi_layer: 'Layer 2',
    concept: 'VLAN/Trunk',
    severity: 'high',
    config_snippet: 'interface FastEthernet0/24\n switchport mode dynamic auto'
  },
  {
    case_id: 'CASE004',
    symptom: 'VLAN 30 clients lose connectivity after a trunk change.',
    topology_note: 'SW1-SW2 trunk carries VLANs 10, 20, 30 across switches.',
    show_output: 'show interfaces trunk:\nPort        Mode         Encapsulation  Status        Native vlan\nGig0/1      on           802.1q         trunking      1\nPort        Vlans allowed on trunk\nGig0/1      10,20\nPort        Vlans in spanning tree forwarding state and not pruned\nGig0/1      10,20',
    expected_fault: 'VLAN 30 is not allowed on the trunk interface allowlist.',
    osi_layer: 'Layer 2',
    concept: 'VLAN/Trunk',
    severity: 'high',
    config_snippet: 'interface GigabitEthernet0/1\n switchport trunk allowed vlan 10,20'
  },
  {
    case_id: 'CASE005',
    symptom: 'PC has an IP address but cannot ping the router gateway.',
    topology_note: 'PC: 192.168.10.20/24; gateway configured on router is 192.168.10.1.',
    show_output: 'C:\\> ipconfig /all\n   IPv4 Address. . . . . . . . . . . : 192.168.10.20\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.20.1\nC:\\> ping 192.168.20.1\nRequest timed out.',
    expected_fault: 'Default gateway is on the wrong subnet (192.168.20.1 instead of 192.168.10.1).',
    osi_layer: 'Layer 3',
    concept: 'Default Gateway',
    severity: 'high'
  },
  {
    case_id: 'CASE006',
    symptom: 'PC cannot leave its local subnet.',
    topology_note: 'PC is connected to the correct VLAN; router interface provides gateway.',
    show_output: 'R1# show ip interface brief\nInterface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     192.168.10.1    YES manual administratively down down\nGigabitEthernet0/1     10.0.0.1        YES manual up                    up',
    expected_fault: 'Gateway interface GigabitEthernet0/0 is administratively down.',
    osi_layer: 'Layer 1/3',
    concept: 'Gateway/Interface',
    severity: 'high'
  },
  {
    case_id: 'CASE007',
    symptom: 'Only one workstation cannot reach remote networks.',
    topology_note: 'Other PCs in LAN work; affected PC uses 192.168.10.30/24.',
    show_output: 'PC-30> ipconfig\n   IP Address. . . . . . . . . . . . : 192.168.10.30\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.10.254\nRouter G0/0 IP: 192.168.10.1/24',
    expected_fault: 'Affected workstation has an incorrect default gateway (192.168.10.254).',
    osi_layer: 'Layer 3',
    concept: 'Default Gateway',
    severity: 'medium'
  },
  {
    case_id: 'CASE008',
    symptom: 'New PCs receive 169.254.x.x addresses.',
    topology_note: 'PCs are on VLAN 10 (192.168.10.0/24); DHCP server runs on R1.',
    show_output: 'R1# show ip dhcp pool\nPool POOL_VLAN20 :\n Total addresses    : 254\n Leased addresses   : 3\n Excluded addresses : 1\n Subnet prefix       : 192.168.20.0/24\n(No pool configured for 192.168.10.0/24)',
    expected_fault: 'DHCP scope/pool for VLAN 10 is missing on the DHCP server.',
    osi_layer: 'Layer 7',
    concept: 'DHCP',
    severity: 'high'
  },
  {
    case_id: 'CASE009',
    symptom: 'PCs in VLAN 20 receive addresses from the wrong subnet.',
    topology_note: 'DHCP server has multiple pools for VLAN 10 and VLAN 20.',
    show_output: 'R1# show run | section dhcp\nip dhcp pool VLAN10_POOL\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\nip dhcp pool VLAN20_POOL\n network 192.168.10.0 255.255.255.0\n default-router 192.168.20.1',
    expected_fault: 'DHCP pool/network mapping is incorrect; VLAN20_POOL has network 192.168.10.0 instead of 192.168.20.0.',
    osi_layer: 'Layer 7',
    concept: 'DHCP',
    severity: 'high'
  },
  {
    case_id: 'CASE010',
    symptom: 'DHCP clients cannot obtain an address from a remote server.',
    topology_note: 'DHCP server is on 10.0.0.10; clients are in 192.168.20.0/24 on G0/1.',
    show_output: 'R1# show run interface G0/1\ninterface GigabitEthernet0/1\n ip address 192.168.20.1 255.255.255.0\n duplex auto\n speed auto',
    expected_fault: 'DHCP relay (ip helper-address 10.0.0.10) is missing on the client gateway interface.',
    osi_layer: 'Layer 3/7',
    concept: 'DHCP Relay',
    severity: 'high'
  },
  {
    case_id: 'CASE011',
    symptom: 'A DHCP client intermittently fails after address exhaustion.',
    topology_note: 'DHCP pool is configured for a small lab subnet (192.168.1.0/29).',
    show_output: 'R1# show ip dhcp pool POOL_LAB\n Total addresses    : 6\n Leased addresses   : 6\n Excluded addresses : 0\n Pending addresses  : 0\nR1# show ip dhcp binding\nIP address       Client-ID/Hardware address\n192.168.1.2      0001.9642.1101\n192.168.1.3      0001.9642.1102\n192.168.1.4      0001.9642.1103\n192.168.1.5      0001.9642.1104\n192.168.1.6      0001.9642.1105\n192.168.1.7      0001.9642.1106',
    expected_fault: 'DHCP pool has no free addresses remaining (exhaustion).',
    osi_layer: 'Layer 7',
    concept: 'DHCP',
    severity: 'medium'
  },
  {
    case_id: 'CASE012',
    symptom: 'PC can ping 8.8.8.8 but cannot open example.com.',
    topology_note: 'Internet connectivity works; DNS server IP is 192.168.50.10.',
    show_output: 'PC1> ipconfig /all\n   IPv4 Address. . . : 192.168.10.50\n   Default Gateway . : 192.168.10.1\n   DNS Servers . . . : 192.168.50.99\nPC1> ping 8.8.8.8\nReply from 8.8.8.8: bytes=32 time=12ms TTL=56\nPC1> ping 192.168.50.99\nDestination host unreachable.',
    expected_fault: 'PC is configured with the wrong DNS server IP (192.168.50.99 instead of 192.168.50.10).',
    osi_layer: 'Layer 7',
    concept: 'DNS',
    severity: 'medium'
  },
  {
    case_id: 'CASE013',
    symptom: 'Clients can reach the DNS server but names do not resolve.',
    topology_note: 'DNS server 192.168.50.10 is reachable via ICMP.',
    show_output: 'PC1> ping 192.168.50.10\nReply from 192.168.50.10: bytes=32 time=2ms TTL=128\nPC1> nslookup cisco.local\n*** Request to DNS-SERVER timed-out.\nServer Services Status Check:\nDNS Service: Disabled / Stopped',
    expected_fault: 'DNS service daemon is disabled on the DNS server.',
    osi_layer: 'Layer 7',
    concept: 'DNS',
    severity: 'high'
  },
  {
    case_id: 'CASE014',
    symptom: 'Only one website hostname fails to resolve.',
    topology_note: 'DNS service is running and other names resolve successfully.',
    show_output: 'PC1> nslookup app.local\nAddress: 192.168.50.20\nPC1> nslookup portal.local\n*** Server can\'t find portal.local: Non-existent domain\nDNS Server Records:\nA record: app.local -> 192.168.50.20\nA record: mail.local -> 192.168.50.30',
    expected_fault: 'Required DNS resource record (A record for portal.local) is missing.',
    osi_layer: 'Layer 7',
    concept: 'DNS',
    severity: 'medium'
  },
  {
    case_id: 'CASE015',
    symptom: 'PC can reach its gateway but cannot reach the server network.',
    topology_note: 'R1 connects to R2; server is behind R2 on 192.168.30.0/24.',
    show_output: 'R1# show ip route\nGateway of last resort is not set\n      10.0.0.0/30 is subnetted, 1 subnets\nC        10.0.12.0 is directly connected, GigabitEthernet0/1\n      192.168.10.0/24 is subnetted, 1 subnets\nC        192.168.10.0 is directly connected, GigabitEthernet0/0',
    expected_fault: 'Static or dynamic route to the server network (192.168.30.0/24) is missing on R1.',
    osi_layer: 'Layer 3',
    concept: 'Routing',
    severity: 'high'
  },
  {
    case_id: 'CASE016',
    symptom: 'Traffic reaches R2 but replies never return to the client.',
    topology_note: 'Two-router topology with static routes; PC is on 192.168.10.0/24.',
    show_output: 'R2# show ip route\nGateway of last resort is not set\n      10.0.0.0/30 is subnetted, 1 subnets\nC        10.0.12.0 is directly connected, GigabitEthernet0/1\n      192.168.30.0/24 is subnetted, 1 subnets\nC        192.168.30.0 is directly connected, GigabitEthernet0/0\n(no entry for 192.168.10.0/24)',
    expected_fault: 'Return route to client network 192.168.10.0/24 is missing on R2.',
    osi_layer: 'Layer 3',
    concept: 'Routing',
    severity: 'high'
  },
  {
    case_id: 'CASE017',
    symptom: 'OSPF neighbors are not forming between R1 and R2.',
    topology_note: 'R1 and R2 are directly connected via GigabitEthernet0/1.',
    show_output: 'R1# show ip ospf neighbor\n(empty)\nR1# show ip interface brief\nGigabitEthernet0/1     10.0.12.1    YES manual up                    up\nR2# show ip interface brief\nGigabitEthernet0/1     10.0.23.2    YES manual up                    up',
    expected_fault: 'OSPF interfaces use mismatched subnet addressing (10.0.12.1/30 vs 10.0.23.2/30).',
    osi_layer: 'Layer 3',
    concept: 'OSPF',
    severity: 'high'
  },
  {
    case_id: 'CASE018',
    symptom: 'A remote LAN is not advertised by OSPF.',
    topology_note: 'R1 has LAN 192.168.10.0/24 and WAN 10.0.12.0/30.',
    show_output: 'R1# show ip protocols\nRouting Protocol is "ospf 1"\n  Outgoing update filter list for all interfaces is not set\n  Incoming update filter list for all interfaces is not set\n  Routing for Networks:\n    10.0.12.0 0.0.0.3 area 0\n  Routing Information Sources:\n    Gateway         Distance      Last Update',
    expected_fault: 'OSPF is not enabled for the LAN interface (missing network 192.168.10.0 0.0.0.255 area 0).',
    osi_layer: 'Layer 3',
    concept: 'OSPF',
    severity: 'medium'
  },
  {
    case_id: 'CASE019',
    symptom: 'Internet-bound traffic fails from all internal PCs.',
    topology_note: 'R1 is the edge router connected to ISP gateway 203.0.113.1 on G0/1.',
    show_output: 'R1# show ip route\nGateway of last resort is not set\n      192.168.10.0/24 is subnetted, 1 subnets\nC        192.168.10.0 is directly connected, GigabitEthernet0/0\n      203.0.113.0/30 is subnetted, 1 subnets\nC        203.0.113.0 is directly connected, GigabitEthernet0/1',
    expected_fault: 'Default route (ip route 0.0.0.0 0.0.0.0 203.0.113.1) is missing on edge router R1.',
    osi_layer: 'Layer 3',
    concept: 'Default Route',
    severity: 'high'
  },
  {
    case_id: 'CASE020',
    symptom: 'PC can reach the gateway but cannot reach the web server on port 80.',
    topology_note: 'R1 connects LAN to server network (192.168.30.10).',
    show_output: 'R1# show access-lists\nExtended IP access list 110\n    10 deny tcp 192.168.10.0 0.0.0.255 host 192.168.30.10 eq www (24 matches)\n    20 permit ip any any (112 matches)\nR1# show ip interface G0/0\n  Inbound access list is 110',
    expected_fault: 'ACL 110 rule 10 explicitly denies HTTP (port 80) traffic to the web server.',
    osi_layer: 'Layer 4',
    concept: 'ACL',
    severity: 'high'
  },
  {
    case_id: 'CASE021',
    symptom: 'SSH to the router is blocked from the management PC.',
    topology_note: 'Management PC is 192.168.10.50; should be allowed to access VTY.',
    show_output: 'R1# show access-lists 10\nStandard IP access list 10\n    10 deny 192.168.10.50 (6 matches)\n    20 permit any (14 matches)\nR1# show run | section line vty\nline vty 0 4\n access-class 10 in\n transport input ssh',
    expected_fault: 'Standard ACL 10 denies the management PC IP address (192.168.10.50).',
    osi_layer: 'Layer 3',
    concept: 'ACL',
    severity: 'high'
  },
  {
    case_id: 'CASE022',
    symptom: 'Only traffic to one server is blocked.',
    topology_note: 'ACL is applied outbound on router interface G0/1 towards server farm.',
    show_output: 'R1# show access-lists 101\nExtended IP access list 101\n    10 deny ip any host 192.168.30.20 (18 matches)\n    20 permit ip any any (450 matches)',
    expected_fault: 'ACL 101 contains a specific deny statement blocking destination host 192.168.30.20.',
    osi_layer: 'Layer 3',
    concept: 'ACL',
    severity: 'medium'
  },
  {
    case_id: 'CASE023',
    symptom: 'A newly created security ACL has no effect.',
    topology_note: 'Security ACL 105 was created on R1 to restrict unauthorized traffic.',
    show_output: 'R1# show access-lists 105\nExtended IP access list 105\n    10 deny ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255\n    20 permit ip any any\nR1# show ip interface G0/0\n  Inbound access list is not set\n  Outbound access list is not set',
    expected_fault: 'ACL 105 is defined in global configuration but not applied to any interface via ip access-group.',
    osi_layer: 'Layer 3/4',
    concept: 'ACL',
    severity: 'medium'
  },
  {
    case_id: 'CASE024',
    symptom: 'Internal PCs cannot access an external server.',
    topology_note: 'R1 connects inside LAN (192.168.10.0/24) to ISP router.',
    show_output: 'R1# show ip nat translations\n(empty)\nR1# show run interface G0/0\ninterface GigabitEthernet0/0\n ip address 192.168.10.1 255.255.255.0\nR1# show run interface G0/1\ninterface GigabitEthernet0/1\n ip address 203.0.113.2 255.255.255.252',
    expected_fault: 'NAT inside and outside roles are missing on router interfaces G0/0 and G0/1.',
    osi_layer: 'Layer 3',
    concept: 'NAT',
    severity: 'high'
  },
  {
    case_id: 'CASE025',
    symptom: 'Only one internal subnet can access the internet.',
    topology_note: 'Two inside subnets exist: LAN1 (192.168.10.0/24) and LAN2 (192.168.20.0/24).',
    show_output: 'R1# show access-lists 1\nStandard IP access list 1\n    10 permit 192.168.10.0 0.0.0.255 (82 matches)\nR1# show run | include ip nat inside source\nip nat inside source list 1 interface GigabitEthernet0/1 overload',
    expected_fault: 'NAT ACL 1 only permits LAN1 and does not match LAN2 (192.168.20.0/24).',
    osi_layer: 'Layer 3',
    concept: 'NAT',
    severity: 'high'
  },
  {
    case_id: 'CASE026',
    symptom: 'NAT overload is configured but translations do not appear.',
    topology_note: 'Inside and outside interfaces are configured on R1.',
    show_output: 'R1# show run | include ip nat\nip nat inside source list 1 interface GigabitEthernet0/1 overload\nR1# show access-lists 1\n(empty / access-list 1 does not exist)',
    expected_fault: 'NAT ACL 1 referenced by NAT overload configuration does not exist or has no permit statements.',
    osi_layer: 'Layer 3',
    concept: 'NAT',
    severity: 'high'
  },
  {
    case_id: 'CASE027',
    symptom: 'Users lose internet access after interface renaming/reconfiguration.',
    topology_note: 'Router connects inside LAN on G0/1 and ISP on G0/0.',
    show_output: 'R1# show run interface GigabitEthernet0/1\ninterface GigabitEthernet0/1\n ip address 192.168.10.1 255.255.255.0\n ip nat inside\nR1# show run interface GigabitEthernet0/0\ninterface GigabitEthernet0/0\n ip address 203.0.113.2 255.255.255.252',
    expected_fault: 'Outside interface GigabitEthernet0/0 is missing the "ip nat outside" command.',
    osi_layer: 'Layer 3',
    concept: 'NAT',
    severity: 'medium'
  },
  {
    case_id: 'CASE028',
    symptom: 'Laptop connects to Guest Wi-Fi and can access internal servers.',
    topology_note: 'AP connects to switch; guest users are on VLAN 40, internal servers on VLAN 10.',
    show_output: 'SW1# show vlan brief\n10   Internal_Servers                 active    Fa0/1, Fa0/2\n40   Guest_WiFi                       active    Fa0/5\nR1# show access-lists\n(no access-lists configured for guest isolation)',
    expected_fault: 'Guest isolation security policy is missing; guests in VLAN 40 can route unrestricted to VLAN 10.',
    osi_layer: 'Layer 2/3',
    concept: 'Wireless',
    severity: 'high'
  },
  {
    case_id: 'CASE029',
    symptom: 'Laptop cannot associate with the wireless network.',
    topology_note: 'Expected SSID is CampusWiFi.',
    show_output: 'AP-1# show dot11 ssid\nSSID: Campus-WiFi\n  VLAN: 10\n  Auth: WPA2-Personal\nLaptop Wireless Profile:\n  SSID: CampusWiFi\n  Auth: WPA2-Personal',
    expected_fault: 'SSID mismatch (Campus-WiFi vs CampusWiFi) prevents wireless 802.11 association.',
    osi_layer: 'Layer 2',
    concept: 'Wireless',
    severity: 'medium'
  },
  {
    case_id: 'CASE030',
    symptom: 'Wireless clients associate to AP but do not receive DHCP addresses.',
    topology_note: 'AP is connected to SW1 port Fa0/10; wireless clients should be in VLAN 30.',
    show_output: 'SW1# show vlan brief\n10   Corporate                        active    Fa0/1, Fa0/2, Fa0/10\n30   Wireless_Clients                 active    Fa0/11\nSW1# show interfaces Fa0/10 switchport\nAccess Mode VLAN: 10 (Corporate)',
    expected_fault: 'AP switchport Fa0/10 is mapped to access VLAN 10 instead of VLAN 30 (or trunk).',
    osi_layer: 'Layer 2/7',
    concept: 'Wireless/DHCP',
    severity: 'high'
  }
];
