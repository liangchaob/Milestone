# 测试运行环境与报告

## 运行脚本
- 单元测试（含覆盖率）：`npm run test:unit`
- 端到端测试：`npm run test:e2e`
- 全量测试：`npm run test:all`
- 自动测试（监听代码变更）：`npm run test:auto`

## 覆盖率
- 报告生成于 `coverage/` 目录，支持 `text` 与 `html` 两种形式
- 当前核心页面 `Milestones.vue` 行覆盖率 ≥ 81%

## 报错定位
- 失败时控制台将输出详细堆栈与源文件位置
- 端到端失败时输出上下文：`test-results/**/error-context.md`

## 约束
- 仅在全部测试通过时再进行提交
- 每轮改动需保持覆盖率不下降
