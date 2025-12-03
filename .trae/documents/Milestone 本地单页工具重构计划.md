## 目标
- 在本地直接双击 `index.html` 可运行，无需服务端。
- 左侧：总体圆形进度 + 里程碑列表（支持增删改查）。
- 右侧：当前里程碑的 TODO 清单（支持增删改查与勾选完成）+ 进度轴。
- 所有写入持久化，下次打开仍在；采用前端数据库（IndexedDB），并兼容现有 `localStorage`。
- 风格：极客风格（深色主题、霓虹强调色、等宽字体、简约硬朗）。

## 现状评估
- 已有基础 UI 与交互：
  - 左侧圆形总进度、里程碑列表与选中逻辑：`d:\denv\quickview\index.html:230-252`。
  - 右侧进度条与任务渲染：`d:\denv\quickview\index.html:255-295`。
  - 勾选任务与保存到 `localStorage`：`d:\denv\quickview\index.html:278-317`。
- 存在不足：缺少里程碑与任务的增删改接口；数据模型无 `id` 级别操作、无前端数据库；样式非极客风格。

## 数据模型
- `Milestone`: `{ id: string, title: string, desc: string, createdAt: number }`
- `Task`: `{ id: string, milestoneId: string, text: string, done: boolean, createdAt: number }`
- 进度计算：以 `milestoneId` 分组统计 `done/total`，总进度为所有任务加权平均。

## 存储方案
- 优先 IndexedDB（库自写最小封装，避免外部依赖），对象仓库：
  - `milestones`（keyPath: `id`）
  - `tasks`（keyPath: `id`, 索引：`milestoneId`）
- 迁移与回退：
  - 首次运行：检测旧数据 `localStorage['myProjectData']`（`d:\denv\quickview\index.html:209`），迁移入 IndexedDB。
  - 若 IndexedDB 不可用，自动回退为 `localStorage`（透明封装相同 API）。
- 封装统一 API：`storage.milestones.getAll() / create() / update() / delete()`；`storage.tasks.queryByMilestone(id)` 等。

## 交互与功能
- 左侧（里程碑）：
  - 列表项展示：标题 + 小型百分比标签；悬停显示操作图标（`编辑`、`删除`）。
  - 顶部 `+ 新建里程碑` 按钮，弹出对话框或内联表单（标题/描述）。
  - 点击列表项切换当前里程碑；删除含任务的里程碑时提示确认是否同时清除其任务。
- 右侧（任务）：
  - TODO 列表项：复选框、文本；操作图标（`编辑`、`删除`）。
  - 底部输入框 + `+ 添加任务` 按钮；支持 Enter 快速添加。
  - 文本内联编辑（双击或点击编辑图标）；勾选后立即持久化并刷新进度。
- 进度轴：
  - 保留现有横向进度条（`#progressBar`），按当前里程碑 `done/total` 动态更新。
  - 左侧圆环总进度保留（`stroke-dasharray` 更新，`d:\denv\quickview\index.html:296-312`）。
- 附加：导入/导出 JSON（设置按钮），用于备份与迁移。

## 样式（极客风格）
- 主题：深色背景（近黑）、霓虹强调色（如 `#00FF95` 或青色）、等宽字体（`JetBrains Mono`/`Fira Code` fallback）。
- 布局：硬朗卡片、细描边、微小发光阴影；交互反馈使用轻微霓虹光效。
- 可选主题切换：浅色/深色，默认深色。

## 代码重构
- 结构化单文件（保持双击可用）：
  - `<style>`：主题变量、基础组件样式、暗色方案。
  - `<script type="module">`：按模块划分在同一块内组织：`storage`、`state`、`ui`、`actions`。
- 模块职责：
  - `storage`：IndexedDB 封装 + localStorage 回退 + 数据迁移。
  - `state`：当前选中里程碑、内存缓存、进度计算。
  - `ui`：渲染左侧列表、右侧详情、弹窗/表单、进度更新。
  - `actions`：里程碑/任务的增删改查、事件委托、持久化调用。
- 事件模型：使用事件委托绑定到父容器，减少多次绑定与重渲染。
- ID 生成：使用时间戳 + 随机片段，保序且唯一。

## 具体实施步骤
1. 抽取并替换现有 `localStorage` 读写（`d:\denv\quickview\index.html:314-317`）为统一 `storage` 层，加入迁移逻辑。
2. 为里程碑创建 CRUD：渲染操作图标、添加 modal/内联表单、实现 `create/update/delete` 与状态刷新。
3. 为任务创建 CRUD：添加输入框与编辑/删除功能，勾选时更新持久化与进度。
4. 统一进度计算：总圆环与当前进度条在 CRUD 后自动更新。
5. 极客风格主题：切换深色、调整字体与色彩变量、细化 hover/active 效果。
6. 导入/导出 JSON：按钮与实现（`storage.export()`/`storage.import(json)`）。
7. 代码整理与小型测试：创建三套默认数据场景验证渲染与持久化；确保无刷新丢失。

## 验证
- 本地直接双击打开，进行：新建里程碑、添加/编辑/删除任务、勾选任务，刷新页面后数据仍在。
- 检查 IndexedDB 表结构与记录写入；在不支持环境下确认回退到 `localStorage` 正常。

## 交付与说明文档
- 保持单文件 `index.html`，但内部为模块化组织；无外部依赖。
- 代码遵循现有命名习惯与 DOM 结构，逐步替换渲染与保存逻辑以保证最小风险。
- 使用与导入/导出、AI 生成里程碑的 Prompt 详见项目根目录 `README.md`。
