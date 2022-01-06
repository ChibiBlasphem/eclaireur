import nodePath from 'node:path';
import { generateDependencyMap } from 'eclaireur-core';

/** @type { import('polka').Middleware } */
export const handler = async (req, res, next) => {
  if (req.path === '/api/dependencies') {
    /** @type { import('eclaireur-core').UserConfig } */
    const { root, entry, plugins } = req.eclaireurConfig;
    const dependencyMap = await generateDependencyMap(entry, root, { plugins });

    let dependencyRecord = {};
    for (let [file, dependencies] of dependencyMap) {
      dependencyRecord[file] = [...dependencies];
    }
    return res.end(JSON.stringify(dependencyRecord));
  }
  next();
};
