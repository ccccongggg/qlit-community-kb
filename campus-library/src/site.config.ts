// 站点级配置：校名、简介、六大核心模块。
// 改这里即可调整导航，无需动页面逻辑。

export const SITE = {
  name: '齐鲁理工学院 · 校园资料库',
  shortName: '校园资料库',
  school: '齐鲁理工学院',
  description:
    '把散落在群聊、朋友圈、口口相传的校园信息，变成随时可查、可核对的公开内容。一站式校园信息集散 + 经验沉淀平台。',
  // 投稿 / 侵权下架入口（先指向邮箱占位，后续可换表单或 Issue 模板）
  contributeUrl: 'https://github.com/your-org/campus-library/issues/new',
  takedownEmail: 'campus-library@example.com',
};

export type ModuleStatus = 'ready' | 'seed' | 'soon';

export interface ModuleDef {
  slug: string; // 对应 src/content/docs 下的文件夹名（目录即导航）
  title: string;
  desc: string;
  icon: string;
  status: ModuleStatus; // ready=内容充足 / seed=已填种子 / soon=待建设
}

export const MODULES: ModuleDef[] = [
  {
    slug: '选课与培养方案',
    title: '选课与培养方案',
    desc: '培养方案解读 / 选课攻略 / 课程评价（匿名）',
    icon: '📚',
    status: 'seed',
  },
  {
    slug: '校园办事指南',
    title: '校园办事指南',
    desc: '流程图文 / 部门联系方式 / 常用表单模板',
    icon: '🗂️',
    status: 'seed',
  },
  {
    slug: '社团与活动日历',
    title: '社团与活动日历',
    desc: '社团黄页 / 月度活动日历 / 招新',
    icon: '🎉',
    status: 'soon',
  },
  {
    slug: '升学与就业经验',
    title: '升学与就业经验',
    desc: '保研 / 考研 / 实习 / 就业（时间线 + 材料清单）',
    icon: '🚀',
    status: 'soon',
  },
  {
    slug: '二手与失物',
    title: '二手与失物',
    desc: '二手发布 / 失物招领（动态层上线后开放）',
    icon: '♻️',
    status: 'soon',
  },
  {
    slug: '校园周边生活',
    title: '校园周边生活',
    desc: '美食 / 交通 / 租房 / 新生生存指南',
    icon: '🍜',
    status: 'seed',
  },
];

// 根据文件夹名反查模块定义
export function getModule(slug: string): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}
