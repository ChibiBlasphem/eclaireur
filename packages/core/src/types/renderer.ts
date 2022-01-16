import type { StyleTransformers } from './graph';

export interface RendererOptions {}

export type EclaireurRenderer<G, N, E, S> = {
  createGraph: (id: string) => G;
  createCluster: (parent: G, id: string, label: string) => G;
  createNode: (parent: G, id: string, label: string, styles: S) => N;
  createEdge: (parent: G, id: string, source: string, target: string) => E;
  styleTransformers: StyleTransformers<S>;
  render: (graph: G) => string;
};

export type EclaireurRendererFunction<G, N, E, S> = (options: RendererOptions) => EclaireurRenderer<G, N, E, S>;

export interface EclaireurRendererConfig {
  renderer: EclaireurRendererFunction<any, any, any, any>;
  output: string;
}
