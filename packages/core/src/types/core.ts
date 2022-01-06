import type { FileSystem } from './filesystem';
import type { EclaireurPlugin } from './plugin';

export type FilepathPattern = string | RegExp;

export interface UserConfig {
  root?: string;
  entry: string;
  fileSystem?: FileSystem;
  plugins?: EclaireurPlugin[];
  scope?: {
    maxDepth?: number | null;
    include?: FilepathPattern[] | null;
    exclude?: FilepathPattern[];
  };
  abstractFolders?: string[];
}
