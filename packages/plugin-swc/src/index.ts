import type { EclaireurPlugin } from 'eclaireur-core';
import { CallExpression, DEFAULT_EXTENSIONS, ImportDeclaration, TsType } from '@swc/core';
import { parse } from '@swc/core';
import { Visitor } from '@swc/core/Visitor';
import type { Resolver } from 'enhanced-resolve';
import { CachedInputFileSystem, ResolverFactory } from 'enhanced-resolve';
import { isBuiltinModule } from './isBuiltinModule';

export interface SWCPluginOptions {
  extensions?: string[];
  aliases?: Record<string, string>;
}

class ImportVisitor extends Visitor {
  constructor(protected imports: Set<string>) {
    super();
  }

  visitCallExpression(n: CallExpression): CallExpression {
    const isImportFunction = n.callee.type === 'Identifier' && n.callee.value === 'import';
    if (isImportFunction && n.arguments[0].expression.type === 'StringLiteral') {
      this.imports.add(n.arguments[0].expression.value);
    }
    return n;
  }

  visitTsType(n: TsType) {
    return n;
  }

  visitImportDeclaration(n: ImportDeclaration): ImportDeclaration {
    if (!n.typeOnly) {
      this.imports.add(n.source.value);
    }
    return n;
  }
}

function resolveImport(resolver: Resolver, context: any, from: string, request: string): Promise<string | false> {
  if (isBuiltinModule(request)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    resolver.resolve(context, from, request, {}, (err, resolved) => {
      if (err || resolved === undefined) reject(err);
      else resolve(resolved);
    });
  });
}

export function swcPlugin({
  extensions = DEFAULT_EXTENSIONS as string[],
  aliases: aliasesHashmap = {},
}: SWCPluginOptions = {}): EclaireurPlugin {
  const aliasesArray = Object.entries(aliasesHashmap).map(([name, alias]) => ({ name, alias }));

  return {
    name: 'swc-plugin',
    checkValidity: (fileInformations) => ['.js', '.jsx', '.ts', '.tsx'].includes(fileInformations.extension),
    extractImports: async ({ dirname, contents }, _forward, { fileSystem }) => {
      const ast = await parse(contents, { syntax: 'typescript', tsx: true, decorators: true });
      const resolver = ResolverFactory.createResolver({
        fileSystem: new CachedInputFileSystem(fileSystem, 4000),
        preferAbsolute: true,
        extensions,
        conditionNames: ['node', 'import'],
        alias: aliasesArray,
      });

      const imports = new Set<string>();
      new ImportVisitor(imports).visitModule(ast);

      const promises = [];
      for (let importPath of imports) {
        promises.push(resolveImport(resolver, {}, dirname, importPath));
      }

      const resolvedImports = (await Promise.all(promises)).filter(Boolean) as string[];
      return new Set(resolvedImports);
    },
  };
}
