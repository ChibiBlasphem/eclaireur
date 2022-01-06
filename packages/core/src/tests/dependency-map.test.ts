import nodePath from 'node:path';
import MemoryFs from 'memory-fs';
import { generateDependencyMap } from '../dependency-map';
import type { EclaireurPlugin } from '../types';
import { EclaireurError, ErrorMessages } from '../utils/error';

type Tree = { [k: string]: string | Tree };

const scaffold = (tree: Tree) => {
  let fsData: Record<string, any> = { '': true };
  for (let [name, item] of Object.entries(tree)) {
    fsData[name] = typeof item === 'string' ? Buffer.from(item, 'utf-8') : scaffold(item);
  }
  return fsData;
};

const mockPlugin: EclaireurPlugin = {
  name: 'mock-plugin',
  checkValidity: () => true,
  extractImports: async ({ dirname, contents }) => {
    const imports = JSON.parse(contents);
    if (!Array.isArray(imports)) {
      throw new Error('Import must be an array of relative paths');
    }
    return new Set(imports.map((i) => nodePath.resolve(dirname, i)));
  },
};

const mockFileSystem = new MemoryFs(
  scaffold({
    src: {
      'main.js': '["./app/foo.js", "./app/bar.js"]',
      app: {
        'foo.js': '["./baz.js"]',
        'bar.js': '["./baz.js"]',
        'baz.js': '["../external/file.js"]',
      },
      external: {
        'file.js': '[]',
      },
    },
  })
);

describe('generateDependencyMap', () => {
  it('Should follow dependency and build a hashmap from the entrypoint', async () => {
    await expect(
      generateDependencyMap('/src/main.js', '/', { fileSystem: mockFileSystem, plugins: [mockPlugin] })
    ).resolves.toEqual(
      new Map([
        ['/src/main.js', new Set(['/src/app/foo.js', '/src/app/bar.js'])],
        ['/src/app/foo.js', new Set(['/src/app/baz.js'])],
        ['/src/app/bar.js', new Set(['/src/app/baz.js'])],
        ['/src/app/baz.js', new Set(['/src/external/file.js'])],
        ['/src/external/file.js', new Set()],
      ])
    );

    await expect(
      generateDependencyMap('/src/app/foo.js', '/', { fileSystem: mockFileSystem, plugins: [mockPlugin] })
    ).resolves.toEqual(
      new Map([
        ['/src/app/foo.js', new Set(['/src/app/baz.js'])],
        ['/src/app/baz.js', new Set(['/src/external/file.js'])],
        ['/src/external/file.js', new Set()],
      ])
    );
  });

  it('Should not follow dependencies after maxDepth options is reached', async () => {
    await expect(
      generateDependencyMap('/src/main.js', '/', {
        fileSystem: mockFileSystem,
        plugins: [mockPlugin],
        scope: { maxDepth: 1 },
      })
    ).resolves.toEqual(
      new Map([
        ['/src/main.js', new Set(['/src/app/foo.js', '/src/app/bar.js'])],
        ['/src/app/foo.js', new Set([])],
        ['/src/app/bar.js', new Set([])],
      ])
    );
  });

  it('Should ignore all files not in include path', async () => {
    await expect(
      generateDependencyMap('/src/app/foo.js', '/', {
        fileSystem: mockFileSystem,
        plugins: [mockPlugin],
        scope: {
          include: ['./src/app/**'],
        },
      })
    ).resolves.toEqual(
      new Map([
        ['/src/app/foo.js', new Set(['/src/app/baz.js'])],
        ['/src/app/baz.js', new Set()],
      ])
    );
  });

  it('Should ignore all files in exclude path', async () => {
    await expect(
      generateDependencyMap('/src/main.js', '/', {
        fileSystem: mockFileSystem,
        plugins: [mockPlugin],
        scope: {
          include: ['./src/**'],
          exclude: [/external/],
        },
      })
    ).resolves.toEqual(
      new Map([
        ['/src/main.js', new Set(['/src/app/foo.js', '/src/app/bar.js'])],
        ['/src/app/foo.js', new Set(['/src/app/baz.js'])],
        ['/src/app/bar.js', new Set(['/src/app/baz.js'])],
        ['/src/app/baz.js', new Set()],
      ])
    );

    await expect(
      generateDependencyMap('/src/main.js', '/', {
        fileSystem: mockFileSystem,
        plugins: [mockPlugin],
        scope: {
          include: ['./src/**'],
          exclude: [/app/],
        },
      })
    ).resolves.toEqual(new Map([['/src/main.js', new Set()]]));
  });

  it('Should throw an error if the entry point is not in the include', async () => {
    await expect(
      generateDependencyMap('/src/main.js', '/', {
        fileSystem: mockFileSystem,
        plugins: [mockPlugin],
        scope: {
          include: ['./src/app/**'],
        },
      })
    ).rejects.toEqual(new EclaireurError(ErrorMessages.ENTRYPOINT_NOT_INCLUDED));
  });

  it('Should abstract', async () => {
    await expect(
      generateDependencyMap('/src/main.js', '/', {
        fileSystem: mockFileSystem,
        plugins: [mockPlugin],
        abstractFolders: ['./src/app'],
      })
    ).resolves.toEqual(
      new Map([
        ['/src/main.js', new Set(['/src/app'])],
        ['/src/app', new Set(['/src/external/file.js'])],
        ['/src/external/file.js', new Set()],
      ])
    );
  });
});
