import nodeFs from 'node:fs';
import nodePath from 'node:path';
import type { UserConfig } from 'eclaireur-core';
import { generateDependencyMap, generateGraph } from 'eclaireur-core';

export async function start() {
  const configPath = nodePath.resolve(process.cwd(), 'eclaireur.config.js');
  const {
    root = process.cwd(),
    entry,
    plugins,
    renderers = [],
    scope,
    abstractFolders,
  }: UserConfig = require(configPath);
  const entryPoint = nodePath.resolve(root, entry);

  // Generating dependency Map
  const dependencyMap = await generateDependencyMap(entryPoint, root, {
    plugins,
    scope,
    abstractFolders,
  });

  for (const { renderer: rendererFunction, output } of renderers) {
    const { render, ...generateGraphOptions } = rendererFunction({});
    const renderedGraph = render(generateGraph(dependencyMap, generateGraphOptions));
    const outputPath = nodePath.resolve(root, output);
    nodeFs.writeFileSync(outputPath, renderedGraph);
  }
}
