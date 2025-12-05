# Milestone UI 样式指南

## 设计 Token
- 颜色：`--bg-color #0b0e14`、`--card-bg #0f131a`、`--text-main #e6edf3`、`--text-sub #8892b0`、`--border #1a1f2b`
- 主色：`--primary #B7FF3C`（亮绿色）；辅助：`--primary-color #00eaff`（赛博蓝）、`--accent-red #ff5a3c`
- 字体：`sans` 为系统无衬线，`mono` 为 JetBrains Mono
- 字号：11/12/13/14/16/20/28/40
- 间距：4/8/12/16/20/24
- 圆角：10

## 通用类
- `grid-bg`：暗色网格背景
- `nav`、`brand`、`nav-links`：顶部导航
- `container`：居中内容容器
- `card`：通用卡片容器
- `btn`、`btn-primary`、`btn-secondary`：按钮
- `input`：输入框

## 里程碑视图
- `sidebar`：左侧列表容器
- `milestone-item`：里程碑条目（`active` 状态）
- `progress-bar`、`progress-fill`：进度条
- `gauge`、`gauge-inner`：总体进度仪表

## 对话视图
- `chat-box`：消息容器
- `bubble`、`bubble-ai`、`bubble-user`：消息气泡

## 响应式
- 组件与排版遵循移动/桌面自适应，使用流式字体与网格背景。

## 使用说明
- 在 `src/main.js` 中已全局引入 `styles/main.scss`。
- 组件中尽量复用上述通用类，保持 HTML 语义不变。
