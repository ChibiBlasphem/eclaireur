import type { FileSystem } from './filesystem';
import type { EclaireurPlugin } from './plugin';
import type { EclaireurRendererDescription } from './renderer';

export type FilepathPattern = string | RegExp;

export interface UserConfig {
  root?: string;
  entry: string;
  fileSystem?: FileSystem;
  plugins?: EclaireurPlugin[];
  renderers?: EclaireurRendererDescription[];
  scope?: {
    maxDepth?: number | null;
    include?: FilepathPattern[] | null;
    exclude?: FilepathPattern[];
  };
  abstractFolders?: string[];
}
