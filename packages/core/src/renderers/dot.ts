import { DependencyMap } from 'dependency-map';
import type { Node, Edge, Graph } from 'graphviz';
import graphviz from 'graphviz';
import { StyleTransformers, transformStyles, UnifiedStyles } from './shared/graph';
import { generateGraph } from './shared/graph';

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

function setNodeStyle(node: Node, styles: UnifiedStyles) {
  const graphvizStyles = transformStyles(styles, styleTransformers);
  for (const [key, value] of Object.entries(graphvizStyles)) {
    if (value !== undefined) {
      node.set(key, value);
    }
  }
}

export function render(dependencyMap: DependencyMap): string {
  const graph = graphviz.digraph(JSON.stringify('eclaireur-graph'));

  applyGraphStyles(graph);

  generateGraph<Graph, Node, Edge>(dependencyMap, graph, {
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
  });

  return graph.to_dot();
}
