import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('?raw')) {
    const url = new URL(specifier.slice(0, -'?raw'.length), context.parentURL);
    return {
      url: `${url.href}?raw`,
      shortCircuit: true
    };
  }

  if (specifier.endsWith('.scss') || specifier.endsWith('.css')) {
    return {
      url: new URL(specifier, context.parentURL).href,
      shortCircuit: true
    };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const parsedUrl = new URL(url);

  if (parsedUrl.search === '?raw') {
    parsedUrl.search = '';
    const source = await readFile(fileURLToPath(parsedUrl), 'utf8');

    return {
      format: 'module',
      source: `export default ${JSON.stringify(source)};`,
      shortCircuit: true
    };
  }

  if (url.endsWith('.scss') || url.endsWith('.css')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true
    };
  }

  return nextLoad(url, context);
}
