import type { EclaireurRendererFunction, StyleTransformers } from 'eclaireur-core';
import { renderLine, renderLines, renderOptions } from 'utils/string';

const graphOptionsType = ['graph', 'node', 'edge'] as const;

export interface DotNode {
  id: string;
  options: Record<string, unknown>;
}

export interface DotEdge {
  source: DotNode['id'];
  target: DotNode['id'];
}

export interface DotGraph {
  id: string;
  nodes: DotNode[];
  edges: DotEdge[];
  subgraphs: DotGraph[];
  options: {
    [k in typeof graphOptionsType[number]]: Record<string, unknown>;
  };
}

export interface DotStyle {
  fillcolor?: string;
  fontcolor?: string;
  color?: string;
  penwidth?: number;
}

const styleTransformers: StyleTransformers<DotStyle> = {
  fill: (value) => ['fillcolor', value],
  color: (value) => ['fontcolor', value],
  stroke: (value) => ['color', value],
  strokeWidth: (value) => ['penwidth', value],
};

function createNode(id: string, label: string | undefined, style: DotStyle): DotNode {
  return { id, options: { label, ...style } };
}

function createEdge(source: DotNode['id'], target: DotNode['id']): DotEdge {
  return { source, target };
}

function createGraph(id: string, label: string | undefined): DotGraph {
  return {
    id,
    nodes: [],
    edges: [],
    subgraphs: [],
    options: {
      graph: { label },
      node: {},
      edge: {},
    },
  };
}

function addNode(graph: DotGraph, node: DotNode) {
  graph.nodes.push(node);
}

function addEdge(graph: DotGraph, edge: DotEdge) {
  graph.edges.push(edge);
}

function addSubgraph(graph: DotGraph, subgraph: DotGraph) {
  graph.subgraphs.push(subgraph);
}

function renderNode(node: DotNode, indent: number): string {
  const line = renderOptions(JSON.stringify(node.id), node.options);
  return renderLine(line, indent);
}

function renderEdge(edge: DotEdge, indent: number): string {
  return renderLine(`${JSON.stringify(edge.source)} -> ${JSON.stringify(edge.target)}`, indent);
}

function renderGraph(graph: DotGraph, indent: number = 0): string {
  const graphType = indent === 0 ? 'digraph' : 'subgraph';
  const declareLine = renderLine(`${graphType} ${JSON.stringify(graph.id)} {`, indent);
  const endLine = renderLine('}', indent);

  const optionsLines = graphOptionsType.map((k) => {
    const options = graph.options[k];
    return Object.entries(options).length > 0 ? renderLine(renderOptions(k, graph.options[k]), indent + 1) : undefined;
  });
  const subgraphsLines = graph.subgraphs.map((subgraph) => renderGraph(subgraph, indent + 1));
  const nodesLines = graph.nodes.map((node) => renderNode(node, indent + 1));
  const edgesLines = graph.edges.map((edge) => renderEdge(edge, indent + 1));

  return renderLines([
    declareLine,
    ...optionsLines,

    subgraphsLines.length > 0 ? '' : undefined,
    ...subgraphsLines,
    nodesLines.length > 0 ? '' : undefined,
    ...nodesLines,
    edgesLines.length > 0 ? '' : undefined,
    ...edgesLines,

    endLine,
  ]);
}

function setGraphOption(graph: DotGraph, type: typeof graphOptionsType[number], key: string, value: unknown): void {
  graph.options[type][key] = value;
}

function applyGraphStyles(graph: DotGraph) {
  setGraphOption(graph, 'graph', 'bgcolor', '#1d252e');
  setGraphOption(graph, 'graph', 'rankdir', 'LR');
  setGraphOption(graph, 'graph', 'fontname', 'Helvetica-bold');
  setGraphOption(graph, 'graph', 'style', 'filled, rounded');
  setGraphOption(graph, 'graph', 'fillcolor', '#ffffff11');
  setGraphOption(graph, 'graph', 'color', '#ffffff33');
  setGraphOption(graph, 'graph', 'fontcolor', '#ffffff');

  setGraphOption(graph, 'node', 'shape', 'box');
  setGraphOption(graph, 'node', 'style', 'filled, rounded');
  setGraphOption(graph, 'node', 'fontname', 'Helvetica');
  setGraphOption(graph, 'node', 'color', '#aaaaaa');
  setGraphOption(graph, 'node', 'fillcolor', 'transparent');
  setGraphOption(graph, 'node', 'fontcolor', '#aaaaaa');
  setGraphOption(graph, 'node', 'height', 0);

  setGraphOption(graph, 'edge', 'arrowhead', 'normal');
  setGraphOption(graph, 'edge', 'arrowsize', 0.6);
  setGraphOption(graph, 'edge', 'penwidth', 2.0);
  setGraphOption(graph, 'edge', 'color', '#ffffff55');
}

function render(graph: DotGraph): string {
  applyGraphStyles(graph);
  return renderGraph(graph);
}

export const DotRenderer: EclaireurRendererFunction<DotGraph, DotNode, DotEdge, DotStyle> = () => {
  return {
    createGraph: (id, label) => createGraph(id, label),
    createCluster: (parent, id, label) => {
      const cluster = createGraph(id, label);
      addSubgraph(parent, cluster);
      return cluster;
    },
    createNode: (parent, id, label, style) => {
      const node = createNode(id, label, style);
      addNode(parent, node);
      return node;
    },
    createEdge: (parent, source, target) => {
      const edge = createEdge(source, target);
      addEdge(parent, edge);
      return edge;
    },
    styleTransformers,
    render,
  };
};
