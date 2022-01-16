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

export interface EclaireurExtractor {
  name: string;
  extractImports: (
    fileInformations: FileInformations,
    forward: (filename: string, contents: string) => ReturnType<EclaireurExtractor['extractImports']>,
    options: ExtractImportOptions
  ) => Promise<Set<string>>;
}

export interface EclaireurExtractorConfig {
  test?: RegExp;
  extractor: EclaireurExtractor;
}
