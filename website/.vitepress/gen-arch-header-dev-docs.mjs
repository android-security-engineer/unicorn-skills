export const meta = {
  name: 'gen-arch-header-dev-docs',
  description: '为 Unicorn 生成 10 个架构头文件常量页与 7 个开发基础设施模块页',
  phases: [
    { title: 'ArchHeaders', detail: '10 个架构头文件常量页' },
    { title: 'Dev', detail: 'regress/fuzz/benchmarks/cmake/msvc/symbols 总览+模块' },
  ],
}

const STYLE = [
  '文档风格要求（严格模仿现有 website 文档）：',
  '- 简体中文，第一行 "# <标题>"，第二段一句话说明本页讲什么。',
  '- 大量 emoji 小节前缀（📌 概述、💻 用法、⚠️ 注意、🔧 实现、📖 参考）。',
  '- 代码块 ```c / ```bash，示例贴近真实源码。',
  '- mermaid 图（graph LR/TD），配色 style X fill:#3c8cff,color:#fff,stroke:none。',
  '- 表格罗列枚举/参数。',
  '- 文末 "## 相关页面" 用相对路径链接（如 /arch/x86/、/internals/build-system）。',
  '- VitePress 容器 ::: tip / ::: warning / ::: details。',
  '- 无 frontmatter。',
  '- 项目根 /home/cc11001100/github/android-security-engineer/unicorn-skills，可用 Read/Bash 读源码。',
].join('\n')

const ROOT = '/home/cc11001100/github/android-security-engineer/unicorn-skills'
const WEB = ROOT + '/website'

phase('ArchHeaders')

const archHeaders = [
  ['x86', 'x86.h', 'X86 头文件', 'X86（16/32/64 位）'],
  ['arm', 'arm.h', 'ARM 头文件', 'ARM'],
  ['arm64', 'arm64.h', 'ARM64 头文件', 'ARM64 / AArch64'],
  ['mips', 'mips.h', 'MIPS 头文件', 'MIPS'],
  ['ppc', 'ppc.h', 'PowerPC 头文件', 'PowerPC'],
  ['riscv', 'riscv.h', 'RISC-V 头文件', 'RISC-V'],
  ['sparc', 'sparc.h', 'SPARC 头文件', 'SPARC'],
  ['m68k', 'm68k.h', 'M68K 头文件', 'M68K'],
  ['s390x', 's390x.h', 'S390X 头文件', 'S390X'],
  ['tricore', 'tricore.h', 'TriCore 头文件', 'TriCore'],
]

const archResults = await parallel(archHeaders.map(([slug, file, title, name]) => () => agent(
  STYLE + '\n\n请为 Unicorn 文档站撰写 arch/' + slug + '/header.md，对应源码 include/unicorn/' + file + '（' + title + '）。\n' +
  '这是该架构的头文件常量参考页，是各语言绑定的常量来源（source of truth）。\n' +
  '步骤：\n' +
  '1. 用 Bash/Read 读取 include/unicorn/' + file + ' 全文。\n' +
  '2. 概述该头文件定义了哪些类别：CPU 型号枚举(uc_cpu_<arch>)、寄存器 ID 枚举(uc_<arch>_reg)、模式位(UC_MODE_*)、指令 ID(UC_<arch>_INS_*)、其他宏。\n' +
  '3. 用表格罗列寄存器 ID 枚举（至少列前 15-25 个常用寄存器，注明含义）。\n' +
  '4. 用表格罗列该架构特有的 UC_MODE_* 模式位。\n' +
  '5. 若有指令 ID 枚举（如 x86/arm 的 UC_<arch>_INS_*），列表说明几条代表性指令。\n' +
  '6. ::: tip 提醒：这些常量是绑定生成的来源，改了要跑 const_generator.py 重新生成各绑定常量（链接 /bindings/const-generator） :::\n' +
  '7. 配 mermaid 图展示头文件如何被绑定生成器消费。\n' +
  '文末链接到 /arch/' + slug + '/、/arch/' + slug + '/registers、/arch/' + slug + '/cpu-models、/bindings/const-generator、/headers/unicorn-h。\n' +
  '写到文件：' + WEB + '/arch/' + slug + '/header.md',
  { label: 'archheader:' + slug, phase: 'ArchHeaders' }
)))
log('架构头文件页完成 ' + archResults.filter(Boolean).length + '/' + archHeaders.length)

phase('Dev')

const devMods = [
  ['index', '开发基础设施总览', null],
  ['regress', '回归测试 tests/regress', 'tests/regress'],
  ['fuzz', '模糊测试 tests/fuzz', 'tests/fuzz'],
  ['benchmarks', '性能基准 tests/benchmarks', 'tests/benchmarks'],
  ['cmake-helpers', 'CMake 辅助 cmake/', 'cmake'],
  ['msvc', 'MSVC 工程目录 msvc/', 'msvc'],
  ['symbols', '符号导出 symbols.sh', 'symbols.sh'],
]

const devResults = await parallel(devMods.map(([slug, title, subdir]) => () => {
  let prompt = STYLE + '\n\n请为 Unicorn 文档站撰写 dev/' + slug + '.md（' + title + '）。\n'
  if (slug === 'index') {
    prompt += '这是 dev 专区总览：说明 Unicorn 仓库里围绕"开发与质量"的辅助设施——回归测试、模糊测试、基准、CMake 辅助、MSVC 工程、符号导出脚本。配 mermaid 图展示它们在开发流程中的位置。文末用表格列出全部子页并链接到 /dev/regress 等。\n'
  } else {
    prompt += '步骤：\n' +
      '1. 用 Bash 列出 ' + (subdir === 'symbols.sh' ? 'symbols.sh 的行数与前 20 行' : subdir + '/ 目录内容与文件数') + '。\n' +
      '2. 概述该模块的作用：regress 是从 v1 继承的回归用例集（C+Python 混合，文件名即 bug 描述）；fuzz 是 oss-fuzz 模糊驱动（每个架构一个 fuzz_emu_*.c）；benchmarks 是性能基准（cow 快照场景）；cmake/ 是 bundle_static/mingw-w64/zig 等 CMake 辅助模块；msvc/ 是各架构的 Visual Studio 工程目录；symbols.sh 是导出符号表脚本（13万行，用于控制 ABI）。\n' +
      '3. 用表格或列表罗列关键文件/子目录及其用途。\n' +
      '4. 给出如何运行（如 fuzz: 编译 UNICORN_FUZZ=ON 后用 libFuzzer；regress: cd tests/regress && make）。\n' +
      '5. 配 mermaid 图展示该模块与主构建/测试流程的关系。\n'
  }
  prompt += '文末链接到相关页面（如 /guide/testing、/internals/build-system、/tests/）。\n写到文件：' + WEB + '/dev/' + slug + '.md'
  return agent(prompt, { label: 'dev:' + slug, phase: 'Dev' })
}))
log('dev 专区完成 ' + devResults.filter(Boolean).length + '/' + devMods.length)

return {
  archHeaders: archResults.filter(Boolean).length,
  dev: devResults.filter(Boolean).length,
  totalNew: archResults.filter(Boolean).length + devResults.filter(Boolean).length,
}
