import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import {
  apiGroups,
  ctlItems,
  hookItems,
  errorItems,
  memoryItems,
  bindingItems,
  internalItems,
  targetItems,
  archs,
  archPages,
  sampleItems,
  featureItems,
  guideItems,
  guidePractice,
  testItems,
  headerItems,
  devItems,
  toItems,
  toGroups,
} from './data.mjs'

// 仓库名为 unicorn-skills，GitHub Pages 部署在 https://<user>.github.io/unicorn-skills/
const base = '/unicorn-skills/'

// 架构专题侧边栏：每个架构一组，展开其 4 个子页面
const archSidebar = archs.map(([slug, name, icon]) => ({
  text: `${icon} ${name}`,
  collapsed: true,
  items: archPages.map(([p, t]) => ({
    text: t,
    link: p === 'index' ? `/arch/${slug}/` : `/arch/${slug}/${p}`,
  })),
}))

export default withMermaid(
  defineConfig({
    lang: 'zh-CN',
    title: 'Unicorn Engine',
    description: '轻量级多架构 CPU 模拟器框架 · 中文教学文档',
    base,
    cleanUrls: true,
    lastUpdated: true,
    ignoreDeadLinks: false,

    head: [
      ['meta', { name: 'theme-color', content: '#3c8cff' }],
      ['link', { rel: 'icon', href: `${base}logo.svg` }],
      ['meta', { name: 'og:type', content: 'website' }],
      ['meta', { name: 'og:title', content: 'Unicorn Engine 中文教学文档' }],
    ],

    themeConfig: {
      logo: '/logo.svg',

      nav: [
        { text: '首页', link: '/' },
        {
          text: '入门',
          items: [
            { text: '项目介绍', link: '/guide/intro' },
            { text: '它能解决什么问题', link: '/guide/problems' },
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '核心概念', link: '/guide/concepts' },
            { text: '学习路径', link: '/guide/learning-path' },
            { text: '第一个模拟程序', link: '/guide/first-program' },
          ],
        },
        {
          text: '功能详解',
          items: [
            { text: '多架构支持', link: '/features/architectures' },
            { text: 'JIT 编译（TCG）', link: '/features/jit' },
            { text: 'Hook 插桩体系', link: '/features/hooks' },
            { text: '内存映射与管理', link: '/features/memory' },
            { text: 'MMU 与虚拟内存', link: '/features/mmu' },
            { text: '上下文控制', link: '/features/context' },
          ],
        },
        {
          text: '参考手册',
          items: [
            { text: 'API 函数参考', link: '/api/' },
            { text: 'uc_ctl 控制接口', link: '/ctl/' },
            { text: 'Hook 类型', link: '/hooks/' },
            { text: '错误码', link: '/errors/' },
            { text: '内存模型', link: '/memory/overview' },
            { text: '示例源码走读', link: '/samples/overview' },
            { text: '测试套件', link: '/tests/' },
            { text: '头文件参考', link: '/headers/unicorn-h' },
            { text: '开发基础设施', link: '/dev/' },
          ],
        },
        {
          text: '架构',
          items: archs.map(([slug, name, icon]) => ({
            text: `${icon} ${name}`,
            link: `/arch/${slug}/`,
          })),
        },
        {
          text: '进阶',
          items: [
            { text: '内部实现原理', link: '/internals/overview' },
            { text: '语言绑定', link: '/bindings/overview' },
            { text: '编译与安装', link: '/guide/compile' },
            { text: '常见问题 FAQ', link: '/guide/faq' },
          ],
        },
        { text: 'GitHub', link: 'https://github.com/unicorn-engine/unicorn' },
      ],

      sidebar: {
        '/guide/': [
          { text: '入门', items: toItems('/guide/', guideItems) },
          { text: '实践', items: toItems('/guide/', guidePractice) },
        ],
        '/features/': [
          { text: '功能详解', items: toItems('/features/', featureItems) },
        ],
        '/api/': [
          { text: 'API 参考', items: [{ text: '总览', link: '/api/' }] },
          ...toGroups('/api/', apiGroups),
        ],
        '/ctl/': [
          {
            text: 'uc_ctl 控制接口',
            items: [
              { text: '总览', link: '/ctl/' },
              ...toItems('/ctl/', ctlItems),
            ],
          },
        ],
        '/hooks/': [
          {
            text: 'Hook 类型参考',
            items: [
              { text: '总览', link: '/hooks/' },
              ...toItems('/hooks/', hookItems),
            ],
          },
        ],
        '/errors/': [
          {
            text: '错误码参考',
            items: [
              { text: '总览', link: '/errors/' },
              ...toItems('/errors/', errorItems),
            ],
          },
        ],
        '/memory/': [
          { text: '内存模型', items: toItems('/memory/', memoryItems) },
        ],
        '/samples/': [
          { text: '示例源码走读', items: toItems('/samples/', sampleItems) },
        ],
        '/tests/': [
          {
            text: '测试套件',
            items: [
              { text: '测试总览', link: '/tests/' },
              ...toItems('/tests/', testItems.slice(1)),
            ],
          },
        ],
        '/headers/': [
          { text: '头文件参考', items: toItems('/headers/', headerItems) },
        ],
        '/dev/': [
          {
            text: '开发基础设施',
            items: [
              { text: '总览', link: '/dev/' },
              ...toItems('/dev/', devItems.slice(1)),
            ],
          },
        ],
        '/arch/': [
          { text: '架构专题', items: [{ text: '架构总览', link: '/arch/' }] },
          ...archSidebar,
        ],
        '/internals/': [
          { text: '内部实现', items: toItems('/internals/', internalItems) },
          { text: '各架构后端', items: toItems('/internals/target-', targetItems) },
        ],
        '/bindings/': [
          { text: '语言绑定', items: toItems('/bindings/', bindingItems) },
        ],
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/unicorn-engine/unicorn' },
      ],

      footer: {
        message: '基于 GPLv2 协议发布 · 本站为社区教学文档',
        copyright: 'Copyright © 2015-present Unicorn Engine Contributors',
      },

      outline: { level: [2, 3], label: '本页导航' },
      docFooter: { prev: '上一页', next: '下一页' },
      lastUpdatedText: '最后更新',
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',

      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
            modal: {
              noResultsText: '无法找到相关结果',
              resetButtonTitle: '清除查询条件',
              footer: { selectText: '选择', navigateText: '切换' },
            },
          },
        },
      },
    },
  })
)
