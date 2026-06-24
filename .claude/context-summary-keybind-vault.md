## 项目上下文摘要（Keybind Vault 游戏键盘配置备忘录）
生成时间：2026-06-24

### 1. 相似实现分析
- **实现1**: src/App.tsx:10-250 — 主布局，侧边栏 + 游戏卡片网格 + 新建对话框
  - 模式：状态驱动路由（useState 管理 page 状态）
  - 可复用：`useGameConfigs` hook 提供全部 CRUD 操作
  - 需注意：所有状态持久化到 localStorage

- **实现2**: src/components/GameDetail.tsx:1-230 — 游戏详情页
  - 模式：EditableCell 行内编辑组件 + useMemo 缓存过滤/分组
  - 可复用：`EditableCell` 组件（点击即编辑）
  - 需注意：`IndexedKeybinding` 类型解决 indexOf 重复键位 bug

- **实现3**: src/components/KeyboardLayout.tsx:1-190 — 键盘可视化
  - 模式：键帽内直接行内编辑 + 底部操作栏
  - 可复用：`KEYBOARD_ROWS` 键盘布局定义
  - 需注意：`position: relative` 容器 + `editing` 单一状态管理

### 2. 项目约定
- **命名约定**: 组件 PascalCase，hooks useXxx，工具函数 camelCase
- **文件组织**: src/components/ 组件，src/hooks/ 钩子，src/utils/ 工具
- **导入顺序**: React → 类型 → 工具 → 组件 → CSS
- **代码风格**: 单引号，尾逗号，2 空格缩进，无分号

### 3. 可复用组件清单
- `src/hooks/useGameConfigs.ts`: 全部游戏/键位 CRUD + localStorage 持久化
- `src/utils/storage.ts`: localStorage 读写 + 缓存 + 导入导出
- `src/types.ts`: 全部类型定义 + 键盘布局常量 + KEY_DISPLAY_NAMES
- `src/icons.ts`: Lucide 图标映射（分类/导航/操作）
- `EditableCell`: 点击即编辑组件（GameDetail.tsx 内）

### 4. 测试策略
- **测试框架**: 未配置（项目无测试）
- **验证方式**: npm run build（TypeScript 类型检查 + Vite 构建）
- **覆盖需求**: 需补测 — 见验证报告

### 5. 依赖和集成点
- **外部依赖**: react, react-dom, lucide-react, framer-motion
- **内部依赖**: 所有组件通过 useGameConfigs hook 共享状态
- **集成方式**: Props 传递 + 回调函数
- **配置来源**: localStorage（key: keybind-vault-games）

### 6. 技术选型理由
- **Vite + React + TS**: 项目初始化模板，构建速度快
- **LocalStorage**: 纯前端应用，无需后端
- **Lucide React**: 替代 emoji，矢量图标一致性好
- **CSS 变量 + 类名**: 暗色主题，避免内联 style

### 7. 关键风险点
- **并发问题**: 无（单用户本地应用）
- **边界条件**: localStorage 满时 saveGames 会抛异常（未捕获）
- **性能瓶颈**: 游戏数量 >100 时列表渲染可能卡顿（未做虚拟化）
- **测试缺口**: 无任何自动化测试