import type { FileSystem, FileSystemCallback, AsyncFileSystem } from './types/filesystem';

type Promisify<FileSystemFunction> = FileSystemFunction extends (
  path: string,
  callback: FileSystemCallback<infer Result>
) => void
  ? (path: string) => Promise<Result>
  : FileSystemFunction extends (path: string, param: infer Param, callback: FileSystemCallback<infer Result>) => void
  ? (path: string, param: Param) => Promise<Result>
  : never;

export type PromisifiedFileSystem = {
  [Key in keyof FileSystem]: Key extends `${string}Sync` ? FileSystem[Key] : Promisify<FileSystem[Key]>;
};

function promisify<T extends AsyncFileSystem[keyof AsyncFileSystem]>(fileSystemFunction: T): Promisify<T> {
  if (typeof fileSystemFunction !== 'function') {
    throw new Error('filesystem property must be a function');
  }

  return function (...args: Parameters<Promisify<T>>) {
    return new Promise((resolve, reject) => {
      fileSystemFunction(args[0], args[1], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  } as Promisify<T>;
}

export function promisifyFilesystem(fileSystem: FileSystem): PromisifiedFileSystem {
  return {
    readFile: promisify<FileSystem['readFile']>(fileSystem.readFile),
    readFileSync: fileSystem.readFileSync,
    readdir: promisify<FileSystem['readdir']>(fileSystem.readdir),
    readdirSync: fileSystem.readdirSync,
    readlink: promisify<FileSystem['readlink']>(fileSystem.readlink),
    readlinkSync: fileSystem.readlinkSync,
    lstat: fileSystem.lstat ? promisify<FileSystem['lstat']>(fileSystem.lstat) : undefined,
    lstatSync: fileSystem.lstatSync,
    stat: promisify<FileSystem['stat']>(fileSystem.stat),
    statSync: fileSystem.statSync,
  };
}
