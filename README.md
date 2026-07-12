# Keybind Vault — 游戏键位配置备忘录

一个纯前端 Web 应用，用于管理和记录各款游戏的**键盘 + 鼠标**键位配置，支持可视化布局、自动分类、搜索过滤和多游戏键位对比。所有数据保存在浏览器 localStorage，无需后端。

## 功能特性

- **游戏管理**：创建、重命名、删除游戏配置，支持 FPS / Tactical FPS / MOBA / Other 四种类型
- **可视化键盘**：标准 QWERTY 布局，已绑定键位高亮显示，键帽内直接编辑
- **可视化鼠标**：SVG 鼠标图，支持左键 / 右键 / 滚轮 / 侧键的点击绑定
- **键位管理**：添加、编辑、删除键位，动作名支持行内点击编辑
- **自动分类**：输入动作名时自动识别分类（移动、战斗、技能、物品、通讯、界面）
- **分类切换**：列表、键盘、鼠标三种视图均可直接切换键位分类
- **搜索过滤**：按动作名或按键名搜索，按分类筛选
- **多游戏对比**：选择两款游戏，对比同一按键的差异（相同 / 冲突 / 仅存在一方）
- **导入导出**：JSON 格式导出 / 导入，导入时按游戏名合并（同名覆盖、新增追加）
- **预设配置**：内置 CS2 / 通用 FPS、英雄联盟、Valorant 无畏契约三套预设键位
- **亮 / 暗主题**：一键切换亮色与暗色 UI，响应式布局
- **无障碍**：导航、列表、可视化组件均带 ARIA 语义，支持键盘操作

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| UI 组件 | shadcn/ui（基于 Base UI `@base-ui/react`） |
| 图标 | Lucide React |
| 动画 | Framer Motion |
| 字体 | Geist（`@fontsource-variable/geist`） |
| 静态检查 | oxlint |
| 单元测试 | Vitest + React Testing Library |
| E2E | Playwright |
| 存储 | 浏览器 localStorage |

## 快速开始

### 环境要求

- Node.js 20.19+ 或 22.12+（Vite 8 要求）
- npm（随 Node.js 一同安装）

### 启动步骤

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5174）
npm run dev

# 3. 构建生产版本（输出到 dist/）
npm run build

# 4. 本地预览生产构建
npm run preview
```

> 开发服务器端口固定为 **5174**（`strictPort`），与 E2E 测试保持一致；若端口被占用会直接报错，请先释放端口。

## 测试

```bash
# 单元测试（一次性运行）
npm test

# 单元测试监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage

# 静态检查（oxlint）
npm run lint

# 端到端测试（Playwright，会自动启动 5174 端口的 dev 服务器）
npm run test:e2e
```

## 项目结构

```
src/
├── App.tsx                    # 主布局：侧边栏导航 + 页面切换 + 全局对话框
├── main.tsx                   # 应用入口
├── types.ts                   # 类型定义 + 键盘布局常量 + 分类定义
├── icons.ts                   # Lucide 图标映射
├── App.css / index.css        # 全局样式 + 主题变量（亮 / 暗）
├── components/
│   ├── GameDetail.tsx         # 游戏详情：键盘 + 鼠标 + 分类分组列表（行内编辑）
│   ├── KeyboardLayout.tsx     # 键盘可视化（QWERTY，键帽内编辑）
│   ├── MouseLayout.tsx        # 鼠标可视化（SVG，按键 / 滚轮 / 侧键绑定）
│   ├── BottomEditBar.tsx      # 共享底部编辑操作栏（键盘 / 鼠标复用）
│   ├── CompareView.tsx        # 多游戏键位对比
│   └── ui/                    # shadcn/ui 组件（badge / button / card / dialog / select 等）
├── hooks/
│   ├── useGameConfigs.ts      # 游戏配置状态（CRUD + localStorage 持久化）
│   └── useKeybindingEditor.ts # 键位编辑器共享状态（键盘 / 鼠标复用）
├── lib/
│   └── utils.ts               # cn() 样式类名合并工具
├── utils/
│   ├── categoryInfer.ts       # 动作名关键词 → 分类推断
│   ├── presets.ts             # 预设配置（CS2 / 英雄联盟 / Valorant）
│   └── storage.ts             # localStorage 读写 + 缓存 + JSON 导入导出
└── test/setup.ts              # 测试环境初始化（jest-dom）
e2e/
└── category-edit.spec.ts      # Playwright E2E（7 个用例）
```

## 键位分类

| 分类 | 标识 | 示例动作 |
|------|------|----------|
| 移动 | movement | 前进、后退、左移、跳跃 |
| 战斗 | combat | 射击、换弹、瞄准 |
| 技能 | abilities | 技能 Q/W/E/R、召唤师技能 |
| 物品 | items | 使用物品、购买菜单 |
| 通讯 | communication | 语音、聊天、标记 |
| 界面 | ui | 计分板、地图、菜单 |
| 其他 | other | 未归类 |

## License

MIT
