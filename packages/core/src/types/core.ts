import type { FileSystem } from './filesystem';
import type { EclaireurExtractorConfig } from './extractor';
import type { EclaireurRendererConfig } from './renderer';

export type FilepathPattern = string | RegExp;

export interface UserConfig {
  root?: string;
  entry: string;
  fileSystem?: FileSystem;
  extractors?: EclaireurExtractorConfig[];
  renderers?: EclaireurRendererConfig[];
  scope?: {
    maxDepth?: number | null;
    include?: FilepathPattern[] | null;
    exclude?: FilepathPattern[];
  };
  abstractFolders?: string[];
}
