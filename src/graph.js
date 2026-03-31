// graph.js — Graph data structure with algorithms

export class Graph {
  constructor({ directed = false } = {}) {
    this.directed = directed;
    this._adj = new Map(); // node → [{node, weight}]
  }

  addNode(node) {
    if (!this._adj.has(node)) this._adj.set(node, []);
    return this;
  }

  addEdge(from, to, weight = 1) {
    this.addNode(from).addNode(to);
    this._adj.get(from).push({ node: to, weight });
    if (!this.directed) this._adj.get(to).push({ node: from, weight });
    return this;
  }

  removeNode(node) {
    this._adj.delete(node);
    for (const [, edges] of this._adj) {
      const idx = edges.findIndex(e => e.node === node);
      if (idx !== -1) edges.splice(idx, 1);
    }
    return this;
  }

  removeEdge(from, to) {
    const edges = this._adj.get(from);
    if (edges) {
      const idx = edges.findIndex(e => e.node === to);
      if (idx !== -1) edges.splice(idx, 1);
    }
    if (!this.directed) {
      const edges2 = this._adj.get(to);
      if (edges2) {
        const idx = edges2.findIndex(e => e.node === from);
        if (idx !== -1) edges2.splice(idx, 1);
      }
    }
    return this;
  }

  neighbors(node) {
    return (this._adj.get(node) || []).map(e => e.node);
  }

  hasNode(node) { return this._adj.has(node); }
  hasEdge(from, to) { return (this._adj.get(from) || []).some(e => e.node === to); }
  get nodes() { return [...this._adj.keys()]; }
  get nodeCount() { return this._adj.size; }
  get edgeCount() {
    let count = 0;
    for (const [, edges] of this._adj) count += edges.length;
    return this.directed ? count : count / 2;
  }

  // BFS: returns nodes in breadth-first order
  bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      for (const { node: neighbor } of this._adj.get(node) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return order;
  }

  // DFS: returns nodes in depth-first order
  dfs(start) {
    const visited = new Set();
    const order = [];
    const visit = (node) => {
      if (visited.has(node)) return;
      visited.add(node);
      order.push(node);
      for (const { node: neighbor } of this._adj.get(node) || []) {
        visit(neighbor);
      }
    };
    visit(start);
    return order;
  }

  // Dijkstra's shortest path
  dijkstra(start) {
    const dist = new Map();
    const prev = new Map();
    const visited = new Set();

    for (const node of this._adj.keys()) dist.set(node, Infinity);
    dist.set(start, 0);

    while (true) {
      // Find unvisited node with smallest distance
      let minNode = null, minDist = Infinity;
      for (const [node, d] of dist) {
        if (!visited.has(node) && d < minDist) { minNode = node; minDist = d; }
      }
      if (minNode === null) break;

      visited.add(minNode);
      for (const { node: neighbor, weight } of this._adj.get(minNode) || []) {
        const alt = dist.get(minNode) + weight;
        if (alt < dist.get(neighbor)) {
          dist.set(neighbor, alt);
          prev.set(neighbor, minNode);
        }
      }
    }

    return {
      distances: Object.fromEntries(dist),
      path(to) {
        const p = [];
        let node = to;
        while (node !== undefined) { p.unshift(node); node = prev.get(node); }
        return p[0] === start ? p : [];
      },
    };
  }

  // Topological sort (directed graphs only)
  topologicalSort() {
    if (!this.directed) throw new Error('Topological sort requires directed graph');
    const visited = new Set();
    const temp = new Set();
    const order = [];
    let hasCycle = false;

    const visit = (node) => {
      if (temp.has(node)) { hasCycle = true; return; }
      if (visited.has(node)) return;
      temp.add(node);
      for (const { node: neighbor } of this._adj.get(node) || []) visit(neighbor);
      temp.delete(node);
      visited.add(node);
      order.unshift(node);
    };

    for (const node of this._adj.keys()) visit(node);
    if (hasCycle) return null;
    return order;
  }

  // Cycle detection
  hasCycle() {
    if (this.directed) return this.topologicalSort() === null;
    const visited = new Set();
    const check = (node, parent) => {
      visited.add(node);
      for (const { node: neighbor } of this._adj.get(node) || []) {
        if (!visited.has(neighbor)) {
          if (check(neighbor, node)) return true;
        } else if (neighbor !== parent) return true;
      }
      return false;
    };
    for (const node of this._adj.keys()) {
      if (!visited.has(node) && check(node, null)) return true;
    }
    return false;
  }

  // Connected components (undirected)
  connectedComponents() {
    const visited = new Set();
    const components = [];
    for (const node of this._adj.keys()) {
      if (!visited.has(node)) {
        const component = this.bfs(node);
        for (const n of component) visited.add(n);
        components.push(component);
      }
    }
    return components;
  }
}
