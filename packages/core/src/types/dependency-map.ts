export interface DependencyDetail {
  fullpath: string;
  isFolder: boolean;
  dependencies: Set<string>;
}

export type DependencyMap = Map<string, DependencyDetail>;
