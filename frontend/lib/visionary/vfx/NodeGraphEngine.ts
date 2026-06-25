import type { NodeConnection, NodeGroup, NodeType, VFXNode } from "./types";

let nodeCounter = 100;

export class NodeGraphEngine {
  addNode(
    nodes: VFXNode[],
    type: NodeType,
    label: string,
    x: number,
    y: number,
  ): VFXNode[] {
    nodeCounter += 1;
    const node: VFXNode = {
      id: `node-${nodeCounter}`,
      type,
      label,
      x,
      y,
      inputs: type === "input" ? [] : ["in"],
      outputs: type === "output" ? [] : ["out"],
      params: {},
      groupId: null,
      comment: null,
    };
    return [...nodes, node];
  }

  moveNode(nodes: VFXNode[], nodeId: string, x: number, y: number): VFXNode[] {
    return nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n));
  }

  connect(
    connections: NodeConnection[],
    fromNodeId: string,
    fromPort: string,
    toNodeId: string,
    toPort: string,
  ): NodeConnection[] {
    const id = `conn-${Date.now()}`;
    return [
      ...connections.filter((c) => !(c.toNodeId === toNodeId && c.toPort === toPort)),
      { id, fromNodeId, fromPort, toNodeId, toPort },
    ];
  }

  disconnect(connections: NodeConnection[], connectionId: string): NodeConnection[] {
    return connections.filter((c) => c.id !== connectionId);
  }

  createGroup(groups: NodeGroup[], label: string, nodeIds: string[]): NodeGroup[] {
    return [...groups, { id: `grp-${Date.now()}`, label, nodeIds, collapsed: false }];
  }

  serialize(nodes: VFXNode[], connections: NodeConnection[], groups: NodeGroup[]) {
    return JSON.stringify({ nodes, connections, groups });
  }

  deserialize(json: string) {
    return JSON.parse(json) as {
      nodes: VFXNode[];
      connections: NodeConnection[];
      groups: NodeGroup[];
    };
  }
}

export const nodeGraphEngine = new NodeGraphEngine();
