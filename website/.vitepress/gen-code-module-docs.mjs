export const meta = {
  name: 'gen-code-module-docs',
  description: '为 Unicorn 的 tests/headers/glib_compat 代码模块批量生成中文文档',
  phases: [
    { title: 'Tests', detail: '12 个测试套件 + 总览' },
    { title: 'Headers', detail: '核心头文件参考' },
    { title: 'Glib', detail: 'glib_compat 子模块' },
  ],
}

const STYLE = [
  '文档风格要求（严格模仿现有 website 文档）：',
  '- 简体中文撰写，第一行是 "# <标题>"，第二段一句话说明本页讲什么、读完能得到什么。',
  '- 大量使用 emoji 图标作为小节前缀（如 📌 概述、💻 用法示例、⚠️ 注意、🔧 实现、📖 参考）。',
  '- 代码块用 ```c / ```bash 等，示例代码要真实可运行或贴近源码。',
  '- 用 mermaid 图（graph LR/TD）画流程/结构关系，配色用 style X fill:#3c8cff,color:#fff,stroke:none。',
  '- 用表格罗列参数/返回值/枚举。',
  '- 文末加 "## 相关页面" 链接到其它文档（用相对路径如 /api/open、/internals/uc-struct）。',
  '- VitePress 容器可用 ::: tip / ::: warning / ::: details 包裹提示。',
  '- 不要写 frontmatter（无 --- yaml）。',
  '- 项目根目录是 /home/cc11001100/github/android-security-engineer/unicorn-skills，可用 Read/Bash 读取源码。',
].join('\n')

const ROOT = '/home/cc11001100/github/android-security-engineer/unicorn-skills'
const WEB = ROOT + '/website'

phase('Tests')

const testSuites = [
  ['test-x86', 'test_x86.c', 'X86 测试套件'],
  ['test-arm', 'test_arm.c', 'ARM 测试套件'],
  ['test-arm64', 'test_arm64.c', 'ARM64 测试套件'],
  ['test-mips', 'test_mips.c', 'MIPS 测试套件'],
  ['test-ppc', 'test_ppc.c', 'PowerPC 测试套件'],
  ['test-riscv', 'test_riscv.c', 'RISC-V 测试套件'],
  ['test-sparc', 'test_sparc.c', 'SPARC 测试套件'],
  ['test-m68k', 'test_m68k.c', 'M68K 测试套件'],
  ['test-s390x', 'test_s390x.c', 'S390X 测试套件'],
  ['test-tricore', 'test_tricore.c', 'TriCore 测试套件'],
  ['test-mem', 'test_mem.c', '内存测试套件'],
  ['test-ctl', 'test_ctl.c', '控制接口测试套件'],
]

const testTasks = []
testTasks.push(() => agent(
  STYLE + '\n\n请为 Unicorn 文档站的 tests 专区撰写【总览页】index.md。\n' +
  '内容：说明 tests/unit/ 下测试套件的组织方式（一个架构一个 test_<arch>.c + 跨切面 test_mem/test_ctl），' +
  '基于 acutest 框架与 unicorn_test.h 封装（OK/uc_assert_err/TEST_CHECK 宏），' +
  '如何用 ctest 运行、如何运行单个二进制、测试与 CMake/CTest 的注册关系。' +
  '配一个 mermaid 图展示测试矩阵。文末用表格列出全部 12 个套件并链接到 /tests/test-x86 等。\n' +
  '写到文件：' + WEB + '/tests/index.md',
  { label: 'tests:index', phase: 'Tests' }
))

for (const [slug, file, title] of testSuites) {
  const archSlug = slug.replace(/^test-/, '')
  testTasks.push(() => agent(
    STYLE + '\n\n请为 Unicorn 文档站撰写 tests/' + slug + '.md，对应源码 tests/unit/' + file + '（' + title + '）。\n' +
    '步骤：\n' +
    '1. 用 Bash 读取该测试文件，grep 出所有 "static void test_" 函数名，统计用例数。\n' +
    '2. 挑 3-5 个有代表性的用例，逐个讲解它验证了什么能力。\n' +
    '3. 给出运行方式：cd build && ctest -R ' + archSlug + ' 或 ./test_<arch>。\n' +
    '4. 配 mermaid 图展示该套件覆盖的能力维度。\n' +
    '若该文件用例很少（如 s390x/sparc/tricore 只有 0-1 个），如实说明现状并解释原因（如该架构刚接入/用例还在 regress 里）。' +
    '文末链接到对应架构专题与 /guide/testing。\n' +
    '写到文件：' + WEB + '/tests/' + slug + '.md',
    { label: 'tests:' + slug, phase: 'Tests' }
  ))
}

const testResults = await parallel(testTasks)
log('tests 专区完成 ' + testResults.filter(Boolean).length + '/' + testTasks.length)

phase('Headers')

const headers = [
  ['unicorn-h', 'include/unicorn/unicorn.h', '公共 C API 头文件'],
  ['platform-h', 'include/unicorn/platform.h', '平台抽象头文件'],
  ['uc-priv-h', 'include/uc_priv.h', '内部私有头文件'],
  ['qemu-h', 'include/qemu.h', 'QEMU 桥接头文件'],
  ['list-h', 'include/list.h', '链表工具头文件'],
]

const headerResults = await parallel(headers.map(([slug, file, title]) => () => agent(
  STYLE + '\n\n请为 Unicorn 文档站撰写 headers/' + slug + '.md，对应源码 ' + file + '（' + title + '）。\n' +
  '步骤：\n' +
  '1. 用 Bash/Read 读取该头文件全文。\n' +
  '2. 概述该头文件的角色（公共/内部）、谁该 include 它、它定义了哪些核心类型/宏/枚举。\n' +
  '3. 用表格罗列它定义的关键类型/枚举/函数原型。\n' +
  '4. 对核心结构体配 mermaid 或文字说明字段含义。\n' +
  '5. 用 ::: warning 提醒：uc_priv.h 与 qemu.h 是内部头，绑定使用者不应直接 include :::\n' +
  '文末链接到 /api/、/internals/uc-struct、/internals/uc-dispatch。\n' +
  '写到文件：' + WEB + '/headers/' + slug + '.md',
  { label: 'headers:' + slug, phase: 'Headers' }
)))
log('headers 专区完成 ' + headerResults.filter(Boolean).length + '/' + headers.length)

phase('Glib')

const glibMods = [
  ['glib-compat-glist', 'glist.c', 'GList 双向链表'],
  ['glib-compat-garray', 'garray.c', 'GArray 动态数组'],
  ['glib-compat-ghash', 'ghash.h', 'GHashTable 哈希表'],
  ['glib-compat-gtree', 'gtree.c', 'GTree 平衡树'],
  ['glib-compat-gmem', 'gmem.c', '内存分配包装'],
  ['glib-compat-grand', 'grand.c', '伪随机数'],
  ['glib-compat-gpattern', 'gpattern.c', '通配符匹配'],
  ['glib-compat-gslice', 'gslice.c', '切片分配器'],
]

const glibResults = await parallel(glibMods.map(([slug, file, title]) => () => agent(
  STYLE + '\n\n请为 Unicorn 文档站撰写 internals/' + slug + '.md，对应源码 glib_compat/' + file + '（' + title + '）。\n' +
  '步骤：\n' +
  '1. 用 Bash/Read 读取该源文件，grep 出导出的函数原型（g_ 开头）。\n' +
  '2. 说明该模块在 Unicorn 中的作用：vendored QEMU fork 不依赖系统 glib，用 glib_compat 提供最小替代。讲清楚替代了 glib 的哪部分能力。\n' +
  '3. 用表格罗列该模块提供的关键函数及其语义。\n' +
  '4. 配一个 mermaid 图说明该数据结构的节点关系。\n' +
  '5. 用 ::: tip 说明为何要自己实现而不直接用系统 glib :::\n' +
  '文末链接到 /internals/glib-compat 与 /internals/qemu-fork。\n' +
  '写到文件：' + WEB + '/internals/' + slug + '.md',
  { label: 'glib:' + slug, phase: 'Glib' }
)))
log('glib 专区完成 ' + glibResults.filter(Boolean).length + '/' + glibMods.length)

return {
  tests: testResults.filter(Boolean).length,
  headers: headerResults.filter(Boolean).length,
  glib: glibResults.filter(Boolean).length,
  totalNew: testResults.filter(Boolean).length + headerResults.filter(Boolean).length + glibResults.filter(Boolean).length,
}
