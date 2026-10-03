import {readdir,readFile,writeFile} from 'node:fs/promises';
const assets=(await readdir('out/_next/static',{recursive:true})).filter(p=>/\.(js|css|woff2?)$/.test(p)).map(p=>'/_next/static/'+p);
const sw=await readFile('public/sw.js','utf8');
await writeFile('out/sw.js',sw.replace('const PRECACHE_URLS = [','const PRECACHE_URLS = [\n'+assets.map(p=>JSON.stringify(p)+',').join('\n')));
console.log(`Offline shell includes ${assets.length} bundled assets and all project graphs.`);
