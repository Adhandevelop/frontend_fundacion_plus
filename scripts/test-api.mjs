import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=new URL('../.angular/api-integration-check.mjs',import.meta.url);
await mkdir(new URL('../.angular/',import.meta.url),{recursive:true});
try {
  await build({entryPoints:[fileURLToPath(new URL('../tests/api-integration.spec.ts',import.meta.url))],outfile:fileURLToPath(output),bundle:true,platform:'node',format:'esm',target:'node20',packages:'external',tsconfig:fileURLToPath(new URL('../tsconfig.json',import.meta.url))});
  // Load the compiler before evaluating partially compiled Angular libraries in the bundle.
  await import('@angular/compiler');
  await import(output.href);
} finally {await rm(output,{force:true});}
