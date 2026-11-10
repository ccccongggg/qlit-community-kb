'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = value => /^(\/(?!\/)|https:\/\/)/.test(String(value || '')) ? String(value) : '';
const text = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function posts() { return hexo.locals.get('posts').sort('-date').toArray(); }
function isProblem(p) { return p.categories.toArray().some(c => c.name === '问题库'); }
function state(p) { return p.content_status === 'example' ? '示例' : p.problem_status || '待讨论'; }
function record(p) {
  return { title:p.title, url:'/' + p.path, summary:p.summary || text(p.excerpt || p.content).slice(0,110),
    tags:p.tags.toArray().map(t=>t.name), kind:isProblem(p)?'问题':'知识', type:p.content_status==='example'?'示例':p.content_type || '经验',
    status:state(p), example:p.content_status === 'example', author:p.author || '社群编辑组', date:(p.updated || p.date).format('YYYY-MM-DD') };
}
function row(p) {
  const r=record(p);
  const progress=isProblem(p)&&!r.example?`<p class="hub-progress">负责人：${esc(p.owner || '待认领')} · ${esc(p.progress || '等待补充进展')}</p>`:'';
  return `<article class="hub-row" data-kind="${esc(r.type)}" data-tags="${esc(r.tags.join(' '))}" data-status="${esc(r.status)}" data-search="${esc(r.title+' '+r.summary+' '+r.tags.join(' '))}"><div class="hub-row__meta"><span>${esc(r.example?'示例内容':r.kind==='问题'?r.status:r.type)}</span><time datetime="${r.date}">${r.date}</time></div><h3><a href="${esc(r.url)}">${esc(r.title)}</a></h3><p>${esc(r.summary)}</p>${progress}<div class="hub-row__foot"><span>${esc(r.author)}</span><span>${esc(r.tags.join(' · '))}</span></div></article>`;
}
function filters(type) {
  const options=type==='problems'?['全部','待讨论','招募中','处理中','已解决','暂缓','示例']:['全部','教程','经验','项目复盘','资源清单','示例'];
  return `<div class="hub-filters" role="group" aria-label="${type==='problems'?'问题状态':'内容类型'}">${options.map((o,i)=>`<button type="button" data-filter="${esc(o)}" aria-pressed="${i===0}">${o}</button>`).join('')}</div>`;
}
hexo.extend.tag.register('hub', args => {
  const type=args[0] || 'knowledge';
  const selected=posts().filter(p=>isProblem(p)===(type==='problems'));
  return `<section class="hub-browser" data-filter-by="${type==='problems'?'status':'kind'}"><label class="hub-label">在${type==='problems'?'问题':'知识'}中查找<input type="search" class="hub-query" placeholder="输入关键词、方向或标题" aria-label="筛选当前内容"></label>${filters(type)}<p class="hub-count" aria-live="polite">共 ${selected.length} 条内容</p><div class="hub-list">${selected.map(row).join('')}</div><p class="hub-empty" hidden>没有匹配的内容。试试更短的关键词，或选择「全部」。</p></section>`;
});
hexo.extend.tag.register('featured', () => posts().filter(p=>!isProblem(p)&&p.content_status!=='example').slice(0,4).map(row).join(''));
hexo.extend.helper.register('community_posts', () => posts().filter(p=>p.content_status!=='example'));
hexo.extend.helper.register('community_problems', () => posts().filter(p=>isProblem(p)&&p.content_status!=='example'));
hexo.extend.helper.register('asset_url', p => {
  const file=path.join(hexo.theme_dir,'source',String(p).replace(/^\//,''));
  const digest=fs.existsSync(file)?crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12):'1';
  return p+'?v='+digest;
});
hexo.extend.helper.register('event_date', v => {
  const m=String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}))?/);
  if(!m) return String(v || '时间待定');
  const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
  return `${m[1]}-${m[2]}-${m[3]}（周${'日一二三四五六'[d.getUTCDay()]}）${m[4] || ''}`;
});
hexo.extend.helper.register('safe_link', safe);
hexo.extend.generator.register('community-search', () => ({path:'search-index.json',data:JSON.stringify(posts().map(p=>({...record(p),body:text(p.content)})))}));
hexo.extend.generator.register('activity-details', () => {
  const a=hexo.locals.get('data').activities || {};
  return [...(a.upcoming || []),...(a.past || [])].filter(e=>e.slug).map(e=>({path:`activities/${e.slug}/index.html`,layout:'activity-detail',data:{...e,title:e.title,layout:'activity-detail',top_img:false,aside:false}}));
});
hexo.extend.helper.register('event_state', e => {
  if(e.status==='已取消') return '已取消';
  const now=Date.now();
  if(e.end && new Date(e.end).getTime()<now) return '已结束';
  if(e.deadline && new Date(e.deadline).getTime()<now) return '报名截止';
  return e.status || '即将开放';
});
