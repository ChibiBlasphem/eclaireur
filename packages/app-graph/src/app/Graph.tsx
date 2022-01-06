import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import type { DependencyMap } from 'eclaireur-core';

type GraphProps = {
  dependencyMap: Record<string, string[]>;
};

cytoscape.use(dagre);

export function Graph({ dependencyMap }: GraphProps) {
  const container = useRef<HTMLDivElement>(null);
  const dependencyNodes = useMemo(() => {
    const nodes = Object.keys(dependencyMap).map((file) => ({ data: { id: file, label: file } }));
    const edges = nodes.flatMap((node) => {
      const deps = dependencyMap[node.data.id];
      return deps.map((dep) => {
        return { data: { id: `${node.data.id}_${dep}`, source: node.data.id, target: dep } };
      });
    });

    return [...nodes, ...edges];
  }, [dependencyMap]);

  useEffect(() => {
    const config = {
      container: container.current,

      layout: {
        name: 'dagre',
      },

      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
          },
        },
      ],

      elements: dependencyNodes,
    };

    cytoscape(config);
  }, []);

  return <div className="h-screen" ref={container} />;
}
