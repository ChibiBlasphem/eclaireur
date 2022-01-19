import type { Entry } from './entries';

export interface GenerateGraphOptions<G, N extends { id: string }, E, S> {
  createGraph: (id: string, label: string) => G;
  createCluster: (parent: G, id: string, label: string) => G;
  createNode: (parent: G, id: string, label: string, style: S) => N;
  createEdge: (parent: G, source: N['id'], target: N['id']) => E;
  styleTransformers: StyleTransformers<S>;
}

export interface ClusterDescription {
  label: string;
  children: Record<string, ClusterDescription>;
}

export interface UnifiedStyles {
  fill?: string;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type StyleTransformers<T> = {
  [K in keyof UnifiedStyles]-?: (value: UnifiedStyles[K]) => Entry<T>;
};
