// Review inventory only: no HTTP client, database connection, downloads or publication.
import { build } from 'esbuild';
import { parseTemplate } from '@angular/compiler';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'docs/contenido-inicial');
const check=process.argv.includes('--check');
assert.ok(process.argv.slice(2).every(arg=>arg==='--check'),'Only --check is supported.');
const digest=value=>createHash('sha256').update(value).digest('hex');
const sourceHash=value=>digest(String(value).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n'));
const relative=value=>path.relative(root,value).split(path.sep).join('/');
const newsFile='src/app/features/news/data/news.demo.ts';
const initiativesFile='src/app/features/initiatives/data/initiatives.demo.ts';
const bundle=await build({stdin:{contents:`export {NEWS_DEMO} from './${newsFile}';export {INITIATIVES_DEMO} from './${initiativesFile}';`,resolveDir:root,loader:'ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node20',logLevel:'silent'});
const fixtures=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const blocked={approval:'pending',publication_allowed:false};
const news=fixtures.NEWS_DEMO.map(item=>({
  review_key:`news:${item.id}`,source:newsFile,source_id:item.id,...blocked,
  title:item.title,summary:item.summary,category_label:item.category,date_label:item.date,
  featured_in_design:item.featured,display_order:item.order,image_url:item.image,
  missing:['approved_full_article','confirmed_publication_datetime','approved_category_mapping','authorized_media'],
}));
const initiatives=fixtures.INITIATIVES_DEMO.map(item=>({
  review_key:`initiative:${item.id}`,source:initiativesFile,source_id:item.id,...blocked,
  title:item.title,summary:item.summary,category_label:item.category,period_label:item.period,
  year_label:item.year,impact_label:item.impact,coverage_label:item.coverage,
  featured_in_design:item.featured,image_url:item.image,
  missing:['approved_program_description','approved_edition_data','confirmed_metrics_and_coverage','authorized_media'],
}));

async function templates(directory){
  const result=[];
  for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
    const filename=path.join(directory,entry.name);
    if(entry.isDirectory())result.push(...await templates(filename));
    else if(entry.name.endsWith('.html'))result.push(filename);
  }
  return result;
}
const files=[];
for(const directory of ['src/app/features/news','src/app/features/initiatives','src/app/features/home/components/news','src/app/features/home/components/initiatives'])files.push(...await templates(path.join(root,directory)));
const sourceSnapshots=[],homeNews=[],homeInitiatives=[],assets=new Map();
function addAsset(url,reference,alt=null){
  assert.equal(new URL(url).protocol,'https:','Unexpected non-HTTPS image.');
  if(!assets.has(url))assets.set(url,{review_key:'image:'+digest(url).slice(0,16),url,...blocked,rights:'unverified',references:[]});
  assets.get(url).references.push({source:reference,alt});
}
for(const item of [...news,...initiatives])addAsset(item.image_url,item.review_key);
function attr(node,name){return node.attributes?.find(attribute=>attribute.name===name)?.value;}
function walk(nodes,visit){for(const node of nodes??[]){visit(node);walk(node.children,visit);}}
function text(node){
  if(node.name && (['button','input','select','option'].includes(node.name) || (attr(node,'class')??'').includes('material-symbols-outlined')))return '';
  if(typeof node.value==='string')return node.value;
  return (node.children??[]).map(text).join(' ').replace(/\s+/g,' ').trim();
}
function collect(nodes,predicate){const result=[];walk(nodes,node=>{if(predicate(node))result.push(node);});return result;}
for(const filename of files){
  const source=relative(filename),html=(await readFile(filename,'utf8')).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const parsed=parseTemplate(html,source,{preserveWhitespaces:false});
  assert.ok(!parsed.errors?.length,`Template parse error in ${source}`);
  const images=collect(parsed.nodes,node=>node.name==='img' && attr(node,'src')).map(node=>({url:attr(node,'src'),alt:attr(node,'alt')??null}));
  for(const image of images)addAsset(image.url,source,image.alt);
  const fragments=collect(parsed.nodes,node=>typeof node.value==='string' && node.value.trim()).map(node=>node.value.trim());
  sourceSnapshots.push({source,sha256:sourceHash(html),static_text_fragments:fragments,images});
  if(source==='src/app/features/home/components/news/news.component.html'){
    const cards=collect(parsed.nodes,node=>node.name==='article');
    cards.forEach((node,index)=>{const title=text(collect([node],item=>item.name==='h4')[0]??{});if(!title)return;homeNews.push({review_key:`home-news:${index}`,source,...blocked,title,
      summary:text(collect([node],item=>item.name==='p')[0]??{}),
      source_text:text(node),images:collect([node],item=>item.name==='img' && attr(item,'src')).map(item=>({url:attr(item,'src'),alt:attr(item,'alt')??null})),
      merge_into:null,
    });});
  }
  if(source==='src/app/features/home/components/initiatives/initiatives.component.html'){
    const panels=collect(parsed.nodes,node=>/^initiative-panel-\d+$/.test(attr(node,'id')??''));
    panels.forEach(node=>{const title=text(collect([node],item=>item.name==='h3')[0]??{});if(!title)return;homeInitiatives.push({review_key:'home-'+attr(node,'id'),source,...blocked,title,source_text:text(node),
      images:collect([node],item=>item.name==='img' && attr(item,'src')).map(item=>({url:attr(item,'src'),alt:attr(item,'alt')??null})),merge_into:null,
    });});
  }
}
const records=[...news,...initiatives,...homeNews,...homeInitiatives];
assert.equal(new Set(records.map(item=>item.review_key)).size,records.length,'Duplicate review keys.');
assert.ok(records.every(item=>item.title && item.approval==='pending' && item.publication_allowed===false));
const manifest={
  format:'plus-public-content-review',version:1,purpose:'Editorial inventory; not an API payload or executable database seed.',
  publication_allowed:false,
  totals:{news_catalog:news.length,initiative_catalog:initiatives.length,home_news:homeNews.length,home_initiative_panels:homeInitiatives.length,unique_image_urls:assets.size,template_sources:sourceSnapshots.length},
  source_data:[{source:newsFile,sha256:sourceHash(await readFile(path.join(root,newsFile)))},{source:initiativesFile,sha256:sourceHash(await readFile(path.join(root,initiativesFile)))}],
  news_catalog:news,initiative_catalog:initiatives,home_news:homeNews,home_initiative_panels:homeInitiatives,
  media:[...assets.values()],source_snapshots:sourceSnapshots,
};
const escape=value=>value.replace(/\|/g,'\\|').replace(/\s+/g,' ');
const report=`# Inventario extraído del frontend\n\nGenerado por \`npm run content:inventory\`. No constituye aprobación editorial ni payload REST. Todos los elementos están pendientes y con publicación bloqueada en este inventario.\n\n${Object.entries(manifest.totals).map(([label,total])=>`- ${label}: ${total}`).join('\n')}\n\n## Textos para revisar\n\n| Clave de revisión | Título original | Fuente |\n|---|---|---|\n${records.map(item=>`| ${item.review_key} | ${escape(item.title)} | ${item.source} |`).join('\n')}\n\nLas claves son referencias locales, no UUID de base de datos. Las apariciones del inicio no se fusionan automáticamente con los catálogos. Los textos, fechas, cifras y fotos conservan su procedencia de diseño y requieren validación. Los detalles, imágenes únicas y hashes de las fuentes están en [inventario.json](inventario.json).\n\nConsultar [preparacion.md](preparacion.md) antes de diseñar la carga del backend.\n`;
const artifacts=[['inventario.json',JSON.stringify(manifest,null,2)+'\n'],['revision.md',report]];
if(check){
  for(const [name,content] of artifacts)assert.equal(await readFile(path.join(output,name),'utf8'),content,`Inventory is out of date: ${name}. Run npm run content:inventory.`);
  console.log('Public content review inventory is current; all entries remain pending and blocked from publication.');
}else{
  await mkdir(output,{recursive:true});
  for(const [name,content] of artifacts)await writeFile(path.join(output,name),content,'utf8');
  console.log(JSON.stringify(manifest.totals));
  console.log('Review artifacts generated locally. No API calls, downloads or database changes.');
}
