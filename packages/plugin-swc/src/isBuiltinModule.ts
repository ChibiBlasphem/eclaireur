import { builtinModules } from 'node:module';

const builtinSet = new Set(builtinModules);
const NODE_PROTOCOL = 'node:';

export function isBuiltinModule(identifier: string): boolean {
  if (identifier.startsWith(NODE_PROTOCOL)) {
    return builtinSet.has(identifier.slice(NODE_PROTOCOL.length));
  }
  return builtinSet.has(identifier);
}
