import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Graph } from '../src/index.js';

describe('Basic operations', () => {
  it('should add nodes and edges', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('B', 'C');
    assert.equal(g.nodeCount, 3);
    assert.equal(g.edgeCount, 2);
  });
  it('should check node/edge existence', () => {
    const g = new Graph();
    g.addEdge('A', 'B');
    assert.equal(g.hasNode('A'), true);
    assert.equal(g.hasEdge('A', 'B'), true);
    assert.equal(g.hasEdge('A', 'C'), false);
  });
  it('should list neighbors', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('A', 'C');
    assert.deepEqual(g.neighbors('A').sort(), ['B', 'C']);
  });
  it('should remove edges', () => {
    const g = new Graph();
    g.addEdge('A', 'B');
    g.removeEdge('A', 'B');
    assert.equal(g.hasEdge('A', 'B'), false);
  });
  it('should remove nodes', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('B', 'C');
    g.removeNode('B');
    assert.equal(g.hasNode('B'), false);
  });
});

describe('Undirected', () => {
  it('should create bidirectional edges', () => {
    const g = new Graph();
    g.addEdge('A', 'B');
    assert.equal(g.hasEdge('B', 'A'), true);
  });
});

describe('Directed', () => {
  it('should create one-way edges', () => {
    const g = new Graph({ directed: true });
    g.addEdge('A', 'B');
    assert.equal(g.hasEdge('A', 'B'), true);
    assert.equal(g.hasEdge('B', 'A'), false);
  });
});

describe('BFS', () => {
  it('should traverse breadth-first', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('A', 'C').addEdge('B', 'D').addEdge('C', 'D');
    const order = g.bfs('A');
    assert.equal(order[0], 'A');
    assert.ok(order.indexOf('B') < order.indexOf('D'));
    assert.ok(order.indexOf('C') < order.indexOf('D'));
  });
});

describe('DFS', () => {
  it('should traverse depth-first', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('B', 'C').addEdge('A', 'D');
    const order = g.dfs('A');
    assert.equal(order[0], 'A');
    assert.equal(order.length, 4);
  });
});

describe('Dijkstra', () => {
  it('should find shortest path', () => {
    const g = new Graph();
    g.addEdge('A', 'B', 1).addEdge('B', 'C', 2).addEdge('A', 'C', 10);
    const result = g.dijkstra('A');
    assert.equal(result.distances.C, 3);
    assert.deepEqual(result.path('C'), ['A', 'B', 'C']);
  });
  it('should handle disconnected nodes', () => {
    const g = new Graph();
    g.addEdge('A', 'B', 1);
    g.addNode('C');
    const result = g.dijkstra('A');
    assert.equal(result.distances.C, Infinity);
    assert.deepEqual(result.path('C'), []);
  });
});

describe('Topological sort', () => {
  it('should sort DAG', () => {
    const g = new Graph({ directed: true });
    g.addEdge('shirt', 'tie').addEdge('tie', 'jacket').addEdge('shirt', 'jacket');
    const order = g.topologicalSort();
    assert.ok(order.indexOf('shirt') < order.indexOf('tie'));
    assert.ok(order.indexOf('tie') < order.indexOf('jacket'));
  });
  it('should return null for cycles', () => {
    const g = new Graph({ directed: true });
    g.addEdge('A', 'B').addEdge('B', 'C').addEdge('C', 'A');
    assert.equal(g.topologicalSort(), null);
  });
});

describe('Cycle detection', () => {
  it('should detect cycle in undirected', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('B', 'C').addEdge('C', 'A');
    assert.equal(g.hasCycle(), true);
  });
  it('should detect no cycle', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('B', 'C');
    assert.equal(g.hasCycle(), false);
  });
});

describe('Connected components', () => {
  it('should find components', () => {
    const g = new Graph();
    g.addEdge('A', 'B').addEdge('C', 'D');
    const comps = g.connectedComponents();
    assert.equal(comps.length, 2);
  });
});
