export type FileSystemCallback<Result> = (err: Error | null | undefined, result: Result | undefined) => void;

export interface FileSystemStats {
  isDirectory: () => boolean;
  isFile: () => boolean;
}

export type FileSystemDirent = {
  name: Buffer | string;
} & FileSystemStats;

export interface AsyncFileSystem {
  readFile:
    | ((path: string, callback: FileSystemCallback<Buffer>) => void)
    | ((path: string, encoding: 'utf-8' | 'utf8', callback: FileSystemCallback<string>) => void)
    | ((path: string, options: any, callback: FileSystemCallback<Buffer | string>) => void);
  readdir: {
    (path: string, callback: FileSystemCallback<(Buffer | string)[] | FileSystemDirent[]>): void;
  };
  readlink: {
    (path: string, callback: FileSystemCallback<Buffer | string>): void;
  };
  lstat?: {
    (path: string, callback: FileSystemCallback<FileSystemStats>): void;
  };
  stat: {
    (path: string, callback: FileSystemCallback<FileSystemStats>): void;
  };
}

export interface SyncFileSystem {
  readFileSync: {
    (path: string): Buffer;
    (path: string, encoding: 'utf-8' | 'utf8'): string;
    (path: string, options: any): Buffer | string;
  };
  readdirSync: {
    (path: string): (Buffer | string)[] | FileSystemDirent[];
  };
  readlinkSync: {
    (path: string): Buffer | string;
  };
  lstatSync?: {
    (path: string): FileSystemStats;
  };
  statSync: {
    (path: string): FileSystemStats;
  };
}

export type FileSystem = AsyncFileSystem & SyncFileSystem;
