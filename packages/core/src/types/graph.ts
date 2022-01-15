import type { Entry } from './entries';

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
