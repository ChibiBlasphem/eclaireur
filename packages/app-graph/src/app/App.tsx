import { useEffect, useState } from 'react';
import { Graph } from './Graph';

export function App() {
  const [dependencyMap, setDependencyMap] = useState(null);

  useEffect(() => {
    if (dependencyMap) return;
    fetch('/api/dependencies')
      .then((response) => response.json())
      .then((data) => setDependencyMap(data));
  }, []);

  return dependencyMap ? (
    <Graph dependencyMap={dependencyMap} />
  ) : (
    <div className="text-red-600">Eclaireur Dependency Graph</div>
  );
}
