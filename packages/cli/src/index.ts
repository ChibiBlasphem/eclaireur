import nodePath from 'node:path';
import type { UserConfig } from 'eclaireur-core';
import { generateDependencyMap, renderers } from 'eclaireur-core';

export async function start() {
  const configPath = nodePath.resolve(process.cwd(), 'eclaireur.config.js');
  const { root = process.cwd(), entry, plugins, scope, abstractFolders }: UserConfig = require(configPath);
  const entryPoint = nodePath.resolve(root, entry);

  const dependencyMap = await generateDependencyMap(entryPoint, root, {
    plugins,
    scope,
    abstractFolders,
  });

  console.log(renderers.dot(dependencyMap));
}
