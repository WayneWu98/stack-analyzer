import { type SourceMapConsumer } from 'source-map';
import StackTracey from 'stacktracey';

// @ts-ignore
const SourceMap = window.sourceMap

const readAsString = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  })
}

export const getSourceMapConsumer = async (file: File) => {
  const content = JSON.parse(await readAsString(file));
  return new SourceMap.SourceMapConsumer(content);
}

export interface AnalyzeResult extends StackTracey.Entry {
  source: {
    filename?: string | null;
    line?: number | null;
    column?: number | null;
    name?: string | null;
    content?: string | null;
  }
}

export const analyze = async (stack: StackTracey, _files: File[]) => {
  const files = _files.filter(file => file.webkitRelativePath.endsWith('.map'))
  const consumers = new Map<string, SourceMapConsumer>()
  // const consumer = await getSourceMapConsumer(sourceMap);
  const results: AnalyzeResult[] = []
  for (const entry of stack.items) {
    if (!consumers.get(entry.fileShort)) {
      const file = files.find(file => {
        return file.webkitRelativePath.split('/').slice(1).join('/') === entry.fileShort + '.map'
      })
      if (!file) continue;
      consumers.set(entry.fileShort, await getSourceMapConsumer(file))
    }
    const consumer = consumers.get(entry.fileShort)!
    const position = consumer.originalPositionFor({
      line: entry.line!,
      column: entry.column!,
    });
    const source = consumer.sourceContentFor(position.source!);
    results.push({
      source: {
        filename: position.source,
        line: position.line,
        column: position.column,
        name: position.name,
        content: source,
      },
      ...entry
    })
  }
  return results
}