import type { DependencyMap } from 'dependency-map';
import { StyleTransformers, transformStyles } from './shared/graph';
import { generateGraph } from './shared/graph';
import { renderLine, renderLines } from './shared/string';

export interface MermaidNode {
  id: string;
  label: string | undefined;
  style: MermaidStyle;
}

export interface MermaidEdge {
  id: string;
  label: string | undefined;
  source: MermaidNode['id'];
  target: MermaidNode['id'];
}

export interface MermaidGraph {
  id: string;
  label: string | undefined;
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  subgraphs: MermaidGraph[];
}

export interface MermaidStyle {
  fill?: string;
  color?: string;
  stroke?: string;
  'stroke-width'?: string;
}

const styleTransformers: StyleTransformers<MermaidStyle> = {
  fill: (value) => ['color', value],
  color: (value) => ['color', value],
  stroke: (value) => ['stroke', value],
  strokeWidth: (value) => ['stroke-width', value !== undefined ? `${value}px` : undefined],
};

function createNode(id: string, label: string = id, style: MermaidStyle = {}): MermaidNode {
  return { id, label, style: transformStyles(style, styleTransformers) };
}

function createEdge(id: string, source: MermaidNode['id'], target: MermaidNode['id'], label: string = id): MermaidEdge {
  return { id, label, source, target };
}

function createGraph(id: string, label?: string): MermaidGraph {
  return { id, label, nodes: [], edges: [], subgraphs: [] };
}

function addNode(graph: MermaidGraph, node: MermaidNode) {
  graph.nodes.push(node);
}
function addEdge(graph: MermaidGraph, edge: MermaidEdge) {
  graph.edges.push(edge);
}
function addSubgraph(graph: MermaidGraph, subgraph: MermaidGraph) {
  graph.subgraphs.push(subgraph);
}

function renderNode(node: MermaidNode, indent: number): string {
  const label = node.label !== node.id ? `{{${JSON.stringify(node.label)}}}` : '';
  const style = Object.entries(node.style)
    .map(([rule, value]) => `${rule}:${value}`)
    .join(',');

  return renderLines([
    renderLine(`${node.id}${label}`, indent),
    style !== '' ? renderLine(`style ${node.id} ${style}`, indent) : undefined,
  ]);
}

function renderEdge(edge: MermaidEdge, indent: number): string {
  return renderLine(`${edge.source} --> ${edge.target}`, indent);
}

function renderGraph(graph: MermaidGraph, depth: number = 0): string {
  const isRoot = depth === 0;

  const declareLine = isRoot
    ? renderLine(`flowchart LR`, depth)
    : renderLines([renderLine(`subgraph ${graph.label ?? ''}`, depth), renderLine(`direction LR`, depth + 1)]);

  const subgraphesLines = graph.subgraphs.map((subGraph) => renderGraph(subGraph, depth + 1));
  const nodesLines = graph.nodes.map((node) => renderNode(node, depth + 1));
  const edgesLines = graph.edges.map((edge) => renderEdge(edge, depth + 1));

  return renderLines([
    declareLine,
    !isRoot && subgraphesLines.length > 0 ? '' : undefined,
    ...subgraphesLines,
    nodesLines.length > 0 ? '' : undefined,
    ...nodesLines,
    edgesLines.length > 0 ? '' : undefined,
    ...edgesLines,
    isRoot ? undefined : renderLine('end', depth),
  ]);
}

export function render(dependencyMap: DependencyMap): string {
  const graph = createGraph('eclaireur-graph');

  generateGraph<MermaidGraph, MermaidNode, MermaidEdge>(dependencyMap, graph, {
    createCluster: (parent, id, label) => {
      const newCluster = createGraph(id, label);
      addSubgraph(parent, newCluster);
      return newCluster;
    },
    createNode: (parent, id, label, style) => {
      const node = createNode(id, label, style);
      addNode(parent, node);
      return node;
    },
    createEdge: (parent, id, source, target) => {
      const edge = createEdge(id, source, target);
      addEdge(parent, edge);
      return edge;
    },
  });

  return renderLines(['```mermaid', renderGraph(graph), '```']);
}
