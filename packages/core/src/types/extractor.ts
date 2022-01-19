import type { FileSystem } from './filesystem';

export interface ExtractImportOptions {
  fileSystem: FileSystem;
}

export interface FileInformations {
  path: string;
  filename: string;
  dirname: string;
  extension: string;
  contents: string;
}

export type ExtractorForwardFunction = (fileInformations: FileInformations) => Promise<Set<string>>;

export interface EclaireurExtractor {
  name: string;
  extractImports: (
    fileInformations: FileInformations,
    forward: ExtractorForwardFunction,
    options: ExtractImportOptions
  ) => Promise<Set<string>>;
}

export interface EclaireurExtractorConfig {
  test?: RegExp;
  extractor: EclaireurExtractor;
}
