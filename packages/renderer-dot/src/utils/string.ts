export function renderLine(content: string, indent: number) {
  const indentText = '  '.repeat(indent);
  return `${indentText}${content}`;
}

export function renderLines(lines: (string | undefined)[]): string {
  return lines.filter((line) => line !== undefined).join('\n');
}

export function renderOption([key, value]: [string, unknown]): string {
  return `${key}=${JSON.stringify(value)}`;
}

export function renderOptions(id: string, options: Record<string, unknown>): string {
  const entries = Object.entries(options);
  if (entries.length === 0) return id;

  const optionsStr = entries.map(renderOption).join(', ');
  return `${id} [${optionsStr}]`;
}
