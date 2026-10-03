import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'byterush-test-'));
try {
 await build({entryPoints:['tests/projects.test.ts','tests/accounts.test.ts'],outdir:dir,bundle:true,platform:'node',format:'cjs',logLevel:'warning'});
 await writeFile(join(dir,'storage.cjs'),"const entries=new Map();globalThis.localStorage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,String(v)),removeItem:k=>entries.delete(k)};globalThis.window={localStorage:globalThis.localStorage,addEventListener(){}};");
 const result=spawnSync(process.execPath,['--require',join(dir,'storage.cjs'),'--test',join(dir,'projects.test.js'),join(dir,'accounts.test.js')],{stdio:'inherit'});
 process.exitCode=result.status??1;
} finally {await rm(dir,{recursive:true,force:true});}
