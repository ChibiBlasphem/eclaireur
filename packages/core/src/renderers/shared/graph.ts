import nodePath from 'node:path';
import type { DependencyMap } from 'dependency-map';
import type { Entry, Entries } from '../../types/entries';

export interface UnifiedStyles {
  fill?: string;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type StyleTransformers<T> = {
  [K in keyof UnifiedStyles]-?: (value: UnifiedStyles[K]) => Entry<T>;
};

export interface ClusterDescription {
  label: string;
  children: Record<string, ClusterDescription>;
}

export interface GenerateGraphOptions<G, N, E> {
  createCluster: (parent: G, id: string, label: string) => G;
  createNode: (parent: G, id: string, label: string, style: UnifiedStyles) => N;
  createEdge: (parent: G, id: string, source: string, target: string) => E;
}

const NODE_COLORS: Record<string, string> = {
  js: '#f0db4f',
  ts: '#007acc',
  scss: '#cd6799',
  vue: '#41b883',
  jsx: '#61dbfb',
  tsx: '#61dbfb',
};

function findNearestCluster(
  clusters: Record<string, ClusterDescription>,
  clusterPath: string
): { cluster: ClusterDescription; path: string; parent: boolean } | null {
  for (const [name, cluster] of Object.entries(clusters)) {
    if (name === clusterPath) {
      return { cluster, path: name, parent: false };
    }
    if (clusterPath.startsWith(name)) {
      const nearest = findNearestCluster(cluster.children, clusterPath);
      if (!nearest) {
        return { cluster, path: name, parent: true };
      }
      return nearest;
    }
  }
  return null;
}

export function transformStyles<T>(styles: UnifiedStyles, styleTransformers: StyleTransformers<T>) {
  const stylesEntries = Object.entries(styles) as Entries<UnifiedStyles>;
  return Object.fromEntries(
    stylesEntries.map(([key, value]) => {
      return styleTransformers[key](value as any);
    })
  );
}

function generateClusterTree(dependencyMap: Map<string, unknown>) {
  const clusters: Record<string, ClusterDescription> = {};

  for (const [relativeFilepath] of dependencyMap) {
    const dirname = nodePath.dirname(relativeFilepath) + '/';
    const foundCluster = findNearestCluster(clusters, dirname);

    let parent = clusters;
    let parentPath = '';
    if (foundCluster) {
      if (foundCluster.parent === false) {
        continue;
      }
      parent = foundCluster.cluster.children;
      parentPath = foundCluster.path;
    }

    const children: Record<string, ClusterDescription> = {};
    for (const [key, cluster] of Object.entries(parent)) {
      if (key.startsWith(dirname)) {
        children[key] = cluster;
        delete parent[key];
      }
    }
    const cluster = {
      label: '',
      children,
    };

    // Reorganizing cluster if we find a sibling with same base path
    const clusterSections = dirname.slice(parentPath.length).split('/');
    const siblings = Object.entries(parent);

    if (siblings.length > 0) {
      for (let i = clusterSections.length - 1; i >= 1; --i) {
        const commonPath = clusterSections.slice(0, i).join('/') + '/';
        const sibling = siblings.find(([siblingPath]) => {
          const siblingCutPath = siblingPath.slice(parentPath.length).split('/').slice(0, i).join('/') + '/';
          return siblingCutPath === commonPath;
        });

        if (sibling) {
          const [siblingName, siblingCluster] = sibling;
          const cluster = {
            label: '',
            children: {
              [siblingName]: siblingCluster,
            },
          };

          delete parent[siblingName];
          parent[parentPath + commonPath] = cluster;
          parent = cluster.children;
          break;
        }
      }
    }

    parent[dirname] = cluster;
  }

  return clusters;
}

function flattenClusterTree<G>(
  graph: G,
  clusterTree: Record<string, ClusterDescription>,
  createCluster: (parent: G, id: string, label: string) => G
): Record<string, G> {
  function _flatten(
    clusters: Record<string, G>,
    tree: Record<string, ClusterDescription>,
    { parent, depth }: { parent?: string; depth: number }
  ) {
    for (const [name, cluster] of Object.entries(tree)) {
      if (name !== './') {
        const newCluster = createCluster(
          parent ? clusters[parent] : graph,
          `cluster_${name}`,
          nodePath.relative(parent || '', name)
        );

        clusters[name] = newCluster;
      } else {
        clusters[name] = graph;
      }

      _flatten(clusters, cluster.children, { parent: name, depth: depth + 1 });
    }
  }

  const clusters = {};
  _flatten(clusters, clusterTree, { depth: 1 });
  return clusters;
}

export function generateGraph<G, N, E>(
  dependencyMap: DependencyMap,
  rootGraph: G,
  { createCluster, createNode, createEdge }: GenerateGraphOptions<G, N, E>
): void {
  const clusterTree = generateClusterTree(dependencyMap);
  const clusters = flattenClusterTree(rootGraph, clusterTree, createCluster);

  for (const [filepath, { isFolder, dependencies }] of dependencyMap) {
    const relativeDirname = nodePath.dirname(filepath) + '/';
    const nodeLabel = nodePath.basename(filepath);
    const color = NODE_COLORS[nodePath.extname(filepath).slice(1)];
    const nodeGraph = clusters[relativeDirname];

    createNode(nodeGraph, filepath, nodeLabel, {
      fill: isFolder ? '#ffffff11' : 'transparent',
      stroke: isFolder ? '#ffffff33' : color,
      color: isFolder ? '#ffffff' : color,
      strokeWidth: 2,
    });

    for (const dependency of dependencies) {
      createEdge(rootGraph, `${filepath}_${dependency}`, filepath, dependency);
    }
  }
}
