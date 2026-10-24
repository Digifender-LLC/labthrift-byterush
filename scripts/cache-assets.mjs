import {readdir,readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const files=(await readdir('out',{recursive:true})).map(p=>p.replaceAll('\\','/')).sort();
const assets=files.filter(p=>p.startsWith('_next/static/')&&/\.(js|css|woff2?)$/.test(p)).map(p=>'/'+p);
const sw=await readFile('public/sw.js','utf8');
// Include pages and route payloads as well as bundles: client navigation must
// never reuse a previous release's cached policy or account screen.
const digest=createHash('sha256').update(sw);
for(const file of files){
 if(file==='sw.js'||!(await stat('out/'+file)).isFile())continue;
 digest.update(file).update('\0').update(await readFile('out/'+file)).update('\0');
}
const version='byterush-'+digest.digest('hex').slice(0,20);
const built=sw.replace(/const CACHE_VERSION = "[^"]+";/,'const CACHE_VERSION = '+JSON.stringify(version)+';')
 .replace('const PRECACHE_URLS = [','const PRECACHE_URLS = [\n'+assets.map(p=>JSON.stringify(p)+',').join('\n'));
await writeFile('out/sw.js',built);
console.log(`Offline shell ${version} includes ${assets.length} bundled assets and all project graphs.`);
