import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
const tests=['projects','accounts','learning','worker-api'];
// Worker route tests replace session lookup and passkey routes with test doubles.
const stubs={name:'worker-stubs',setup(b){b.onResolve({filter:/^\.\/(session|auth)$/},a=>a.importer.includes(sep+'worker'+sep)?{path:resolve('tests/stubs/worker-'+a.path.slice(2)+'.ts')}:undefined);}};
const dir=await mkdtemp(join(tmpdir(),'byterush-test-'));
try {
 await build({entryPoints:tests.map(t=>`tests/${t}.test.ts`),outdir:dir,bundle:true,platform:'node',format:'cjs',logLevel:'warning',plugins:[stubs]});
 await writeFile(join(dir,'storage.cjs'),"const entries=new Map();globalThis.localStorage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,String(v)),removeItem:k=>entries.delete(k)};globalThis.window={localStorage:globalThis.localStorage,addEventListener(){}};");
 const result=spawnSync(process.execPath,['--require',join(dir,'storage.cjs'),'--test',...tests.map(t=>join(dir,`${t}.test.js`)),'tests/service-worker.test.mjs'],{stdio:'inherit'});
 process.exitCode=result.status??1;
} finally {await rm(dir,{recursive:true,force:true});}
