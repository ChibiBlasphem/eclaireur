export function renderLine(content: string, indent: number) {
  const indentText = '  '.repeat(indent);
  return `${indentText}${content}`;
}

export function renderLines(lines: (string | undefined)[]): string {
  return lines.filter((line) => line !== undefined).join('\n');
}
