import nodeFs from 'node:fs';
import nodePath from 'node:path';
import type { UserConfig } from './types/core';
import type { DependencyMap, DependencyDetail } from './types/dependency-map';
import type { EclaireurExtractorConfig, ExtractorForwardFunction } from './types/extractor';
import type { FileSystem } from './types/filesystem';
import { ErrorMessages, EclaireurError } from './utils/error';
import { createPatternToRegexp, matchPattern, matchPatternInHashmap } from './utils/match-pattern';

export interface GenerateDependencyMapOptions {
  fileSystem?: UserConfig['fileSystem'];
  scope?: UserConfig['scope'];
  extractors?: UserConfig['extractors'];
  abstractFolders?: UserConfig['abstractFolders'];
}

function shouldIncludeFile(filepath: string, include: RegExp[] | null, exclude: RegExp[]) {
  return (!include || matchPattern(filepath, include)) && !matchPattern(filepath, exclude);
}

function createForwardFunction(
  extractorsConfigs: EclaireurExtractorConfig[],
  { fileSystem }: { fileSystem: FileSystem }
): ExtractorForwardFunction {
  const forwardExtractor: ExtractorForwardFunction = async (fileInformations): Promise<Set<string>> => {
    const extractorConfig = extractorsConfigs.find(({ test }) => !test || test.test(fileInformations.path));
    if (!extractorConfig) {
      // TODO: Warn user no extractor was found when forwarding
      return new Set();
    }

    const { extractor } = extractorConfig;
    return extractor.extractImports(fileInformations, forwardExtractor, { fileSystem });
  };

  return forwardExtractor;
}

export async function generateDependencyMap(
  entryPoint: string,
  root: string,
  {
    fileSystem = nodeFs,
    extractors = [],
    scope: { maxDepth = null, include = null, exclude = [] } = {},
    abstractFolders = [],
  }: GenerateDependencyMapOptions = {}
): Promise<DependencyMap> {
  const patternToRegexp = createPatternToRegexp(root);
  const includedFoldersRegexp = include?.map(patternToRegexp) ?? null;
  const excludedFoldersRegexp = exclude.map(patternToRegexp);
  const abstractedFoldersRegexpHashmap = Object.fromEntries(
    abstractFolders.map((folder) => {
      return [nodePath.resolve(root, folder), patternToRegexp(nodePath.join(folder, '**'))];
    })
  );
  const forwardExtractor = createForwardFunction(extractors, { fileSystem });

  if (!shouldIncludeFile(entryPoint, includedFoldersRegexp, excludedFoldersRegexp)) {
    throw new EclaireurError(ErrorMessages.ENTRYPOINT_NOT_INCLUDED);
  }

  async function _buildDependencyMap(
    filepath: string,
    dependencyMap: DependencyMap,
    recursionState: { depth: number; matched: Set<string> }
  ): Promise<void> {
    const matchedPattern = matchPatternInHashmap(filepath, abstractedFoldersRegexpHashmap);
    const filepathKey = matchedPattern ?? filepath;
    const relativeFilepathKey = nodePath.relative(root, filepathKey);

    // The file can be imported mutliple times but we only want to check its dependencies only once
    if (recursionState.matched.has(filepath)) {
      return;
    }

    const dependencyDetails = dependencyMap.get(relativeFilepathKey) ?? {
      fullpath: filepathKey,
      isFolder: !!matchedPattern,
      dependencies: new Set<string>(),
    };
    recursionState.matched.add(filepath);
    dependencyMap.set(relativeFilepathKey, dependencyDetails);

    // If we reached the maxDepth limit then bail out here
    if (maxDepth && recursionState.depth >= maxDepth) {
      return;
    }

    const fileInformations = {
      path: filepath,
      filename: nodePath.basename(filepath),
      dirname: nodePath.dirname(filepath),
      extension: nodePath.extname(filepath),
      contents: fileSystem.readFileSync(filepath, 'utf8'),
    };

    const extractorConfig = extractors.find(({ test }) => !test || test.test(filepath));
    if (!extractorConfig) {
      // TODO: Warn user that we bailed out because no plugin was found for this file
      return;
    }

    const { extractor } = extractorConfig;
    const imports = await extractor.extractImports(fileInformations, forwardExtractor, { fileSystem });

    let promises: Promise<void>[] = [];
    for (const importPath of imports) {
      if (shouldIncludeFile(importPath, includedFoldersRegexp, excludedFoldersRegexp)) {
        const importPathKey = matchPatternInHashmap(importPath, abstractedFoldersRegexpHashmap) ?? importPath;
        if (filepathKey !== importPathKey) {
          dependencyDetails.dependencies.add(nodePath.relative(root, importPathKey));
        }

        promises.push(
          _buildDependencyMap(importPath, dependencyMap, {
            depth: recursionState.depth + 1,
            matched: recursionState.matched,
          })
        );
      }
    }

    await Promise.all(promises);
  }

  const dependencyMap = new Map<string, DependencyDetail>();
  await _buildDependencyMap(entryPoint, dependencyMap, { depth: 0, matched: new Set() });
  return dependencyMap;
}
