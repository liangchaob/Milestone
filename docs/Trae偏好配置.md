# Trae 一次性偏好配置指南

## 位置
- 配置文件：`.trae/preferences.json`

## 可配项目
- 语言：`language.primary` 与 `language.alternate`
- 前端：`frontend.framework`、`state`、`styling.method`、`bundler`
- 后端：`backend.framework`、`runtime.node`、`packageManager`
- 测试：`testing.frontend`、`testing.backend`
- 库策略：`libraries.allowList`、`libraries.blockList`
- 数据库：`database.type`
- 代码风格：`codeStyle.*`（函数行数、嵌套、命名、纯函数）
- 生成约束：`aiGeneration.*`（可维护性、复杂度、依赖限制、说明与微调清单）

## 示例：React + TypeScript + Vitest
```json
{
  "profile": "react-ts",
  "language": { "primary": "TypeScript", "alternate": ["JavaScript"] },
  "frontend": {
    "framework": "react",
    "state": "zustand",
    "styling": { "method": "css", "variables": true },
    "bundler": "vite"
  },
  "backend": { "framework": "none", "runtime": { "node": ">=20" }, "packageManager": "pnpm" },
  "testing": { "frontend": "vitest", "backend": "vitest" },
  "libraries": { "allowList": ["axios@1"], "blockList": ["lodash"] },
  "database": { "type": "none" },
  "codeStyle": { "naming": "descriptive", "maxFunctionLines": 50, "maxNesting": 3, "preferPureFunctions": true },
  "aiGeneration": { "enforceMaintainability": true, "limitComplexity": 10, "requireExplanation": true, "requireTweakPoints": true, "noExtraDeps": true }
}
```

## 使用方式
- 你在此文件中设定偏好后，我将默认遵循这些约束选择语言、框架、库与风格，并在生成时执行可维护性检查与说明输出。
- 需要切换技术栈时，修改该文件即可，无需重复告知。

## 版本与复现
- 建议为 `allowList` 中的库写入主版本或精确版本，确保生成与依赖一致性。
- 我将在PR说明中记录实现解释与可微调清单，以提升复现与维护性。

