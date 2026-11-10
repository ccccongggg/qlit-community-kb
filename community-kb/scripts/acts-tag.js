"use strict";
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
hexo.extend.tag.register('acts', function () {
 const a=hexo.locals.get('data').activities || {};
 const state=hexo.extend.helper.get('event_state'), date=hexo.extend.helper.get('event_date');
 const events=[...(a.upcoming || []),...(a.past || [])];
 let html=`<div class="hub-intro"><p class="hub-eyebrow">活动与相遇</p><h1>${esc(a.hero.title)}</h1><p>${esc(a.hero.sub)}</p></div>`;
 for(const past of [false,true]) {
  const list=events.filter(e => (['已结束','已取消'].includes(state(e)))===past);
  html+=`<h2>${past?'往期回顾':'活动安排'}</h2><div class="hub-list" data-events-list="${past?'past':'current'}">`;
  html+=list.map(e=>`<article class="hub-row hub-event" data-event-state="${esc(e.status)}" data-event-end="${esc(e.end)}" data-event-deadline="${esc(e.deadline)}"><div class="hub-row__meta"><span data-event-status>${esc(state(e))}</span><span>${esc(date(e.start))}</span></div><h3><a href="/activities/${esc(e.slug)}/">${esc(e.title)}</a></h3><p>${esc(e.desc)}</p><div class="hub-row__foot"><span>${esc(e.place)}</span><a href="/activities/${esc(e.slug)}/">查看详情与参加方式 →</a></div></article>`).join('');
  html+='</div>';
  html+=`<p class="hub-empty" data-events-empty="${past?'past':'current'}"${list.length?' hidden':''}>${past?'还没有经确认的公开回顾。活动结束后，会在这里收录真实照片、资料与成果。':'暂时没有公开排期，可以提交一个活动想法。'}</p>`;
 }
 return html+'<p><a href="/participate/?type=活动投稿">分享活动记录或提议一场活动 →</a></p>';
});
