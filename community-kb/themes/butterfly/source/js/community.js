(function () {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const params = new URLSearchParams(location.search);
  function refreshEvents() {
    $$('.hub-event').forEach(event => {
      let state = event.dataset.eventState || '即将开放';
      if (state !== '已取消') {
        if (event.dataset.eventEnd && Date.parse(event.dataset.eventEnd) < Date.now()) state = '已结束';
        else if (event.dataset.eventDeadline && Date.parse(event.dataset.eventDeadline) < Date.now()) state = '报名截止';
      }
      const status = $('[data-event-status]', event);
      if (status) status.textContent = state;
      $$('.event-registration', event).forEach(a => { a.hidden = state !== '报名中'; });
      if (event.matches('.hub-row')) {
        const group = ['已结束','已取消'].includes(state) ? 'past' : 'current';
        const target = $(`[data-events-list="${group}"]`);
        if (target && event.parentNode !== target) target.append(event);
      }
    });
    $$('[data-events-empty]').forEach(empty => {
      const list = $(`[data-events-list="${empty.dataset.eventsEmpty}"]`);
      if (list) empty.hidden = list.children.length > 0;
    });
  }
  refreshEvents();
  if ($('.hub-event')) {
    setInterval(refreshEvents, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshEvents(); });
  }
  function link(path) {
    const url = new URL(path, location.origin);
    let sc = params.get('sharecode');
    try { sc = sc || sessionStorage.getItem('kb-sc'); } catch (error) {}
    if (sc && url.origin === location.origin) url.searchParams.set('sharecode', sc);
    return url.href;
  }
  $$('.hub-browser').forEach(root => {
    const input = $('.hub-query', root), rows = $$('.hub-row', root);
    let choice = '全部';
    function update() {
      const q = input.value.trim().toLocaleLowerCase();
      let count = 0;
      rows.forEach(row => {
        const match = (choice === '全部' || row.dataset[root.dataset.filterBy] === choice) && row.dataset.search.toLocaleLowerCase().includes(q);
        row.hidden = !match;
        if (match) count++;
      });
      $('.hub-count', root).textContent = `显示 ${count} 条内容`;
      $('.hub-empty', root).hidden = count !== 0;
    }
    input.addEventListener('input', update);
    $$('[data-filter]', root).forEach(button => button.addEventListener('click', () => {
      choice = button.dataset.filter;
      $$('[data-filter]', root).forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update();
    }));
  });

  const search = $('#hub-search');
  if (search) {
    const form = $('form', search), input = $('#search-input'), status = $('#search-status'), results = $('#search-results');
    let index, run = 0;
    async function render(q, save) {
      const id = ++run;
      results.replaceChildren();
      if (!q) { status.textContent = '输入关键词开始查找。'; return; }
      status.textContent = '正在查找…';
      try {
        if (!index) {
          const response = await fetch(link('/search-index.json'));
          if (!response.ok) throw new Error('index');
          index = await response.json();
        }
        if (id !== run) return;
        const words = q.toLocaleLowerCase().split(/\s+/);
        const matches = index.filter(r => words.every(w => [r.title, r.summary, r.body, ...r.tags].join(' ').toLocaleLowerCase().includes(w)));
        status.textContent = matches.length ? `找到 ${matches.length} 条相关内容` : '没有找到相关内容。试试更短的关键词，或到参与入口提出问题。';
        matches.forEach(r => {
          const row = document.createElement('article'); row.className = 'hub-row';
          const meta = document.createElement('div'); meta.className = 'hub-row__meta'; meta.textContent = `${r.example ? '示例内容' : r.kind} · ${r.date}`;
          const title = document.createElement('h3'), a = document.createElement('a'); a.href = link(r.url); a.textContent = r.title; title.append(a);
          const p = document.createElement('p'); p.textContent = r.summary;
          row.append(meta, title, p); results.append(row);
        });
        if (save) {
          const url = new URL(location.href); url.searchParams.set('q', q); history.replaceState(null, '', url);
        }
      } catch (error) {
        if (id === run) {
          status.textContent = '暂时无法加载搜索索引。请再次搜索重试，或先浏览知识库。';
          const a = document.createElement('a'); a.href = link('/kb/'); a.textContent = '浏览知识库 →'; results.append(a);
        }
      }
    }
    form.addEventListener('submit', e => { e.preventDefault(); render(input.value.trim(), true); });
    input.value = params.get('q') || '';
    render(input.value.trim(), false);
  }

  const participation = $('#participation-form');
  if (participation) {
    const select = $('[name=type]', participation);
    if ($$('option', select).some(o => o.value === params.get('type'))) select.value = params.get('type');
    let draft = '';
    participation.addEventListener('submit', e => {
      e.preventDefault();
      if (!participation.reportValidity()) return;
      const data = new FormData(participation), type = data.get('type'), title = data.get('title').trim(), body = data.get('body').trim();
      if (!title || body.length < 10) {
        $('[name=body]', participation).setCustomValidity('请补充至少 10 个字符的具体内容。');
        participation.reportValidity(); return;
      }
      draft = `# [${type}] ${title}\n\n方向：${data.get('direction')}\n\n${body}\n\n---\n提交前请确认：内容可公开，来源与署名已说明，不含私人联系方式或未授权素材。`;
      $('#draft-preview').textContent = draft;
      $('#participation-draft').hidden = false;
      const issue = new URL('https://github.com/ccccongggg/qlit-community-kb/issues/new');
      issue.searchParams.set('title', `[${type}] ${title}`);
      issue.searchParams.set('body', draft);
      const a = $('#issue-link');
      if (issue.href.length > 7500) {
        a.href = 'https://github.com/ccccongggg/qlit-community-kb/issues/new';
        $('#draft-status').textContent = '草稿较长，请先复制或下载，再到 GitHub 粘贴并检查后提交。草稿尚未提交。';
      } else {
        a.href = issue.href;
        $('#draft-status').textContent = '草稿已生成，尚未提交。请在 GitHub 检查后确认发布；公开投稿不要包含私人联系方式。';
      }
      $('#participation-draft').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
    });
    participation.addEventListener('input', () => {
      $('[name=body]', participation).setCustomValidity('');
      $('#participation-draft').hidden = true;
    });
    $('#copy-draft').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(draft); $('#draft-status').textContent = '草稿已复制，尚未提交。'; }
      catch { $('#draft-status').textContent = '浏览器未允许复制，请手动选择草稿，或下载 Markdown。'; }
    });
    $('#download-draft').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([draft], {type:'text/markdown;charset=utf-8'}));
      const a = document.createElement('a'); a.href = url; a.download = 'community-contribution.md'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('#draft-status').textContent = '已生成下载文件，尚未提交。';
    });
  }
})();
