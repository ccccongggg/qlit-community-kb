'use strict';
// Validate the generated site, not a second rendering implementation.
const fs=require('fs'), path=require('path'), yaml=require('js-yaml');
const root=path.resolve(__dirname,'..'), out=path.join(root,'public');
let checked=0; const failures=[];
function walk(dir) {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk(out).filter(f=>f.endsWith('.html')&&!f.includes(path.sep+'admin'+path.sep))) {
  const html=fs.readFileSync(file,'utf8');
  for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    let href=match[1].replace(/&amp;/g,'&');
    if(!href.startsWith('/')||href.startsWith('//'))continue;
    try{href=decodeURIComponent(href.split(/[?#]/)[0]);}catch{failures.push(`${file}: malformed URL ${href}`);continue;}
    let target=path.resolve(out,'.'+href);
    if(!target.startsWith(out+path.sep)&&target!==out){failures.push(`URL outside output: ${href}`);continue;}
    if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    checked++;if(!fs.existsSync(target))failures.push(`${path.relative(out,file)} -> ${href}`);
  }
  if(/<script[^>]+src="\/js\/custom.js/g.test(html) && [...html.matchAll(/<script[^>]+src="\/js\/custom.js/g)].length!==1)failures.push(`Duplicate custom JS: ${file}`);
}
const load=p=>yaml.load(fs.readFileSync(path.join(root,p),'utf8'));
const a=load('source/_data/activities.yml');const slugs=new Set();
for(const e of [...(a.upcoming||[]),...(a.past||[])]){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug||'')||slugs.has(e.slug))failures.push(`Invalid/duplicate activity slug: ${e.slug}`);
  slugs.add(e.slug);
  if(!e.title||!e.place||!Number.isFinite(Date.parse(e.start))||!Number.isFinite(Date.parse(e.end)))failures.push(`Missing activity fields: ${e.slug}`);
  if(Date.parse(e.end)<Date.parse(e.start))failures.push(`End before start: ${e.slug}`);
  if(e.deadline&&(!Number.isFinite(Date.parse(e.deadline))||Date.parse(e.deadline)>Date.parse(e.start)))failures.push(`Invalid deadline: ${e.slug}`);
  if(e.status==='报名中'&&!/^https:\/\//.test(e.registration_url||''))failures.push(`Registration URL missing: ${e.slug}`);
}
const people=load('source/_data/people.yml').list, ps=new Set();
for(const p of people){if(ps.has(p.slug))failures.push(`Duplicate member: ${p.slug}`);ps.add(p.slug);}
for(const f of walk(path.join(root,'source/_posts')).filter(f=>f.endsWith('.md'))){
  const text=fs.readFileSync(f,'utf8'), match=text.match(/^---\r?\n([\s\S]*?)\r?\n---/), meta=match&&yaml.load(match[1]);
  if(!meta||!meta.title||!meta.categories?.length||!meta.author||!meta.content_status)failures.push(`Missing post metadata: ${path.basename(f)}`);
  if(meta?.content_status==='published'&&!meta.summary)failures.push(`Missing summary: ${path.basename(f)}`);
}
const cms=load('source/admin/config.yml');for(const c of cms.collections)for(const f of c.files||[]){if(!fs.existsSync(path.join(root,f.file)))failures.push(`Missing CMS source: ${f.file}`);}
const demoSource=fs.readFileSync(path.join(root,'source/demos/timetable.html'));
const demoOutput=fs.readFileSync(path.join(out,'demos/timetable.html'));
if(!demoSource.equals(demoOutput))failures.push('The standalone timetable demo was wrapped by Hexo; clean and rebuild with demos/** in skip_render.');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`PASS: ${checked} internal links/assets, activity dates, post metadata, CMS sources, and member identifiers.`);
