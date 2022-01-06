import type { FileSystem } from './filesystem';

export interface ExtractImportOptions {
  fileSystem: FileSystem;
}

export interface FileInformations {
  filename: string;
  dirname: string;
  extension: string;
  contents: string;
}

export interface EclaireurPlugin {
  name: string;
  checkValidity: (fileInformations: FileInformations) => boolean;
  extractImports: (
    fileInformations: FileInformations,
    forward: (filename: string, contents: string) => ReturnType<EclaireurPlugin['extractImports']>,
    options: ExtractImportOptions
  ) => Promise<Set<string>>;
}
