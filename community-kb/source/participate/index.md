---
title: 参与社群
layout: page
top_img: false
aside: false
---

<div class="hub-intro"><p class="hub-eyebrow">一个清楚的开始</p><h1>把你的想法带进来</h1><p>提问、投稿、加入意向与活动咨询，使用同一个入口。</p></div>
<p class="hub-notice">公开提交通过 GitHub Issues 接收，需要 GitHub 账号。这里先帮你整理内容；提交完成与否以 GitHub 页面为准。请勿填写私人联系方式或上传未获授权的资料。</p>
<form id="participation-form" class="hub-form">
<label>我想做什么<select name="type"><option>提问</option><option>知识投稿</option><option>加入社群</option><option>活动咨询</option><option>活动投稿</option><option>纠错</option></select></label>
<label>标题<input name="title" required maxlength="100" placeholder="一句话说明你的问题或想法"></label>
<label>方向<select name="direction"><option>待分类</option><option>AIGC</option><option>AI 软件</option><option>AI 硬件</option><option>AI for Science</option><option>运营设计</option></select></label>
<label>具体内容<textarea name="body" required minlength="10" rows="7" placeholder="场景是什么？已经尝试了什么？希望获得什么帮助？投稿请说明来源和署名。"></textarea></label>
<p>草稿只在当前页面处理，不会自动提交或上传。</p>
<div class="hub-actions"><button class="hub-button" type="submit">生成投稿草稿</button></div>
</form>
<section id="participation-draft" hidden class="hub-details"><h2>检查后再提交</h2><pre id="draft-preview"></pre><div class="hub-actions"><a id="issue-link" class="hub-button" target="_blank" rel="noopener">前往 GitHub 检查并提交</a><button type="button" id="copy-draft">复制草稿</button><button type="button" id="download-draft">下载 Markdown</button></div><p id="draft-status" role="status">草稿已生成，尚未提交。没有 GitHub 账号时，可复制或下载后交给已认识的社群组织者。</p></section>
<h2>提交后在哪里看？</h2><p><a href="https://github.com/ccccongggg/qlit-community-kb/issues" target="_blank" rel="noopener">查看公开投稿与处理进展 →</a>。维护者整理后将内容收录到对应板块；未审核内容不会自动出现在知识库。</p>
