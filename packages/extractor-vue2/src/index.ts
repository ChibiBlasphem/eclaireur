import type { EclaireurExtractor } from 'eclaireur-core';
import { parseComponent } from 'vue-template-compiler';

export const Vue2Extractor = (): EclaireurExtractor => {
  return {
    name: 'vue2-extractor',
    extractImports: async (fileInformations, forward) => {
      const { script } = parseComponent(fileInformations.contents);
      const imports = new Set<string>();

      if (script) {
        const { content: contents, ...scriptMetadata } = script;
        const lang = `.${script.lang ?? 'js'}`;
        const scriptImports = await forward({
          path: `${fileInformations.path}${lang}`,
          filename: `${fileInformations.filename}${lang}`,
          dirname: fileInformations.dirname,
          extension: '${lang}',
          contents,
        });

        for (const scriptImport of scriptImports) {
          imports.add(scriptImport);
        }
      }

      return imports;
    },
  };
};
