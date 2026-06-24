# Keybind Vault — 游戏键盘配置备忘录

一个纯前端 Web 应用，用于管理和记录各款游戏的键盘配置，支持可视化键盘布局、分类管理、搜索过滤和多游戏键位对比。

## 功能特性

- **游戏管理**：创建、删除游戏配置，支持 FPS / MOBA / 其他类型
- **可视化键盘**：标准 QWERTY 布局，已绑定键位高亮显示，键帽内直接编辑
- **键位管理**：添加、编辑、删除键位，动作名支持行内点击编辑
- **自动分类**：输入动作名时自动识别分类（移动、战斗、技能、物品、通讯、界面）
- **分类切换**：列表视图和键盘视图均可直接切换键位分类
- **搜索过滤**：按动作名或按键名搜索，按分类筛选
- **多游戏对比**：选择两款游戏，对比键位差异（相同 / 冲突 / 仅存在一方）
- **导入导出**：JSON 格式导出 / 导入，支持合并多份配置
- **预设配置**：内置 CS2、英雄联盟、无畏契约三套预设键位
- **暗色主题**：全局暗色 UI，支持响应式布局

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 图标 | Lucide React |
| 动画 | Framer Motion |
| 测试 | Vitest + React Testing Library |
| E2E | Playwright |
| 存储 | localStorage |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 测试

```bash
# 运行单元测试
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

## 项目结构

```
src/
├── components/
│   ├── App.tsx             # 主应用布局（侧边栏 + 路由）
│   ├── GameDetail.tsx      # 游戏详情页（列表视图 + 行内编辑）
│   ├── KeyboardLayout.tsx  # 键盘可视化组件（键帽编辑 + 底部操作栏）
│   └── CompareView.tsx     # 键位对比视图
├── hooks/
│   └── useGameConfigs.ts   # 核心状态管理 Hook（CRUD + localStorage 持久化）
├── utils/
│   ├── categoryInfer.ts    # 动作名关键词自动推断分类
│   ├── presets.ts           # 预设游戏配置（CS2 / LOL / Valorant）
│   └── storage.ts          # localStorage 读写 + 缓存 + JSON 导入导出
├── types.ts                # 类型定义 + 键盘布局常量
├── icons.ts                # Lucide 图标映射
├── App.css                 # 全局样式（CSS 变量 + 暗色主题）
├── index.css               # 基础样式重置
└── main.tsx                # 应用入口
e2e/
└── category-edit.spec.ts   # Playwright E2E 测试（7 个用例）
```

## 键位分类

| 分类 | 标识 | 示例动作 |
|------|------|----------|
| 移动 | movement | 前进、后退、左移、跳跃 |
| 战斗 | combat | 射击、换弹、瞄准 |
| 技能 | abilities | 技能 1-4、召唤师技能 |
| 物品 | items | 使用物品、购买菜单 |
| 通讯 | communication | 语音、聊天、标记 |
| 界面 | ui | 计分板、地图、菜单 |
| 其他 | other | 未归类 |

## License

MIT
