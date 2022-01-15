import type { EclaireurRendererFunction, StyleTransformers } from 'eclaireur-core';
import type { Node, Edge, Graph } from 'graphviz';
import graphviz from 'graphviz';

interface GraphvizNodeStyle {
  fillcolor?: string;
  fontcolor?: string;
  color?: string;
  penwidth?: number;
}

const styleTransformers: StyleTransformers<GraphvizNodeStyle> = {
  fill: (value) => ['fillcolor', value],
  color: (value) => ['fontcolor', value],
  stroke: (value) => ['color', value],
  strokeWidth: (value) => ['penwidth', value],
};

function applyGraphStyles(graph: Graph) {
  graph.set('bgcolor', '#1d252e');
  graph.set('rankdir', 'LR');
  graph.set('fontname', 'Helvetica-bold');
  graph.set('style', 'filled, rounded');
  graph.set('fillcolor', '#ffffff11');
  graph.set('color', '#ffffff33');
  graph.set('fontcolor', '#ffffff');

  graph.setNodeAttribut('shape', 'box');
  graph.setNodeAttribut('style', 'filled, rounded');
  graph.setNodeAttribut('fontname', 'Helvetica');
  graph.setNodeAttribut('color', '#aaaaaa');
  graph.setNodeAttribut('fillcolor', 'transparent');
  graph.setNodeAttribut('fontcolor', '#aaaaaa');
  graph.setNodeAttribut('height', '0');

  graph.setEdgeAttribut('arrowhead', 'normal');
  graph.setEdgeAttribut('arrowsize', '0.6');
  graph.setEdgeAttribut('penwidth', '2.0');
  graph.setEdgeAttribut('color', '#ffffff55');
}

function setNodeStyle(node: Node, styles: GraphvizNodeStyle) {
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined) {
      node.set(key, value);
    }
  }
}

function render(graph: Graph): string {
  applyGraphStyles(graph);
  return graph.to_dot();
}

export const DotRenderer: EclaireurRendererFunction<Graph, Node, Edge, GraphvizNodeStyle> = () => {
  return {
    createGraph: (id) => graphviz.digraph(JSON.stringify(id)),
    createCluster: (parent, id, label) => {
      const cluster = parent.addCluster(JSON.stringify(id));
      cluster.set('label', label);
      return cluster;
    },
    createNode: (parent, id, label, style) => {
      const node = parent.addNode(id);
      node.set('label', label);
      setNodeStyle(node, style);
      return node;
    },
    createEdge: (parent, id, source, target) => {
      const edge = parent.addEdge(source, target);
      return edge;
    },
    styleTransformers,
    render,
  };
};
