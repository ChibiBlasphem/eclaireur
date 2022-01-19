import type { GenerateGraphOptions } from './graph';

export interface RendererOptions {}

export type EclaireurRenderer<G, N extends { id: string }, E, S> = GenerateGraphOptions<G, N, E, S> & {
  render: (graph: G) => string;
};

export type EclaireurRendererFunction<G, N extends { id: string }, E, S> = (
  options: RendererOptions
) => EclaireurRenderer<G, N, E, S>;

export interface EclaireurRendererConfig {
  renderer: EclaireurRendererFunction<any, any, any, any>;
  output: string;
}
