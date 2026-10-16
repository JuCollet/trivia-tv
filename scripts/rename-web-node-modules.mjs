// Cloudflare Pages never uploads folders named node_modules, but `expo export` puts the assets of dependencies
// (fonts, icons) in dist/assets/node_modules. This moves them to dist/assets/vendor and rewrites their URLs.
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const from = join(dist, 'assets', 'node_modules');

if (existsSync(from)) {
  renameSync(from, join(dist, 'assets', 'vendor'));
}

const textFile = /\.(js|html|css|json|map)$/;

function rewrite(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      rewrite(path);
    } else if (textFile.test(name)) {
      const content = readFileSync(path, 'utf8');
      if (content.includes('assets/node_modules/')) {
        writeFileSync(path, content.replaceAll('assets/node_modules/', 'assets/vendor/'));
      }
    }
  }
}

rewrite(dist);
