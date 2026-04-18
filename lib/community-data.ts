/**
 * Mock data for the Community Constellation visualization.
 * Represents users and their interactions as nodes and links.
 */

export interface CommunityNode {
  id: string;
  name: string;
  role: 'member' | 'contributor' | 'moderator' | 'owner';
  avatar?: string;
  topicsCount: number;
  connections: number;
}

export interface CommunityLink {
  source: string;
  target: string;
  strength: number; // 0 to 1, representing interaction frequency
}

export const communityConstellation = {
  nodes: [
    { 
      id: "u1", 
      name: "QuanimOwner", 
      role: "owner", 
      topicsCount: 15, 
      connections: 20 
    },
    { 
      id: "u2", 
      name: "QuantumAlice", 
      role: "moderator", 
      topicsCount: 8, 
      connections: 14 
    },
    { 
      id: "u3", 
      name: "BobTheBuilder", 
      role: "contributor", 
      topicsCount: 4, 
      connections: 10 
    },
    { 
      id: "u4", 
      name: "PhySciGuy", 
      role: "member", 
      topicsCount: 1, 
      connections: 5 
    },
    { 
      id: "u5", 
      name: "StarGazer", 
      role: "contributor", 
      topicsCount: 6, 
      connections: 8 
    },
    { 
      id: "u6", 
      name: "NeutronNed", 
      role: "member", 
      topicsCount: 0, 
      connections: 3 
    },
    { 
      id: "u7", 
      name: "ElectronEmily", 
      role: "member", 
      topicsCount: 2, 
      connections: 6 
    },
    { 
      id: "u8", 
      name: "GravityGuru", 
      role: "contributor", 
      topicsCount: 5, 
      connections: 9 
    },
    { 
      id: "u9", 
      name: "WaveRider", 
      role: "member", 
      topicsCount: 1, 
      connections: 4 
    },
    { 
      id: "u10", 
      name: "CosmicCharlie", 
      role: "member", 
      topicsCount: 0, 
      connections: 2 
    }
  ] as CommunityNode[],
  
  links: [
    { source: "u1", target: "u2", strength: 0.95 },
    { source: "u1", target: "u3", strength: 0.70 },
    { source: "u1", target: "u8", strength: 0.85 },
    { source: "u2", target: "u4", strength: 0.40 },
    { source: "u2", target: "u5", strength: 0.60 },
    { source: "u2", target: "u7", strength: 0.50 },
    { source: "u3", target: "u4", strength: 0.30 },
    { source: "u3", target: "u5", strength: 0.45 },
    { source: "u5", target: "u6", strength: 0.20 },
    { source: "u8", target: "u9", strength: 0.55 },
    { source: "u8", target: "u10", strength: 0.35 },
    { source: "u1", target: "u5", strength: 0.50 },
    { source: "u2", target: "u8", strength: 0.75 },
    { source: "u4", target: "u7", strength: 0.25 },
    { source: "u9", target: "u10", strength: 0.40 }
  ] as CommunityLink[]
};
