// ============================================================
// Keybind Vault — 游戏键盘配置备忘录
// ============================================================

// --- 游戏类型 ---
export type GameGenre = 'FPS' | 'MOBA' | 'Tactical FPS' | 'Other';

// --- 键位绑定 ---
export interface Keybinding {
  key: string;           // 按键标识，如 "Q", "ShiftLeft", "Mouse1"
  action: string;        // 动作描述，如 "前进", "换弹"
  category: KeyCategory; // 分类
}

export type KeyCategory =
  | 'movement'    // 移动
  | 'combat'      // 战斗
  | 'abilities'   // 技能
  | 'items'       // 物品/装备
  | 'communication' // 通讯
  | 'ui'          // 界面
  | 'other';      // 其他

// --- 游戏配置 ---
export interface GameConfig {
  id: string;
  name: string;           // 游戏名称
  genre: GameGenre;
  keybindings: Keybinding[];
  createdAt: string;      // ISO date
  updatedAt: string;
}

// --- 分类中文映射 ---
export const CATEGORY_LABELS: Record<KeyCategory, string> = {
  movement: '移动',
  combat: '战斗',
  abilities: '技能',
  items: '物品',
  communication: '通讯',
  ui: '界面',
  other: '其他',
};

// --- 分类图标 ---
export const CATEGORY_ICONS: Record<KeyCategory, string> = {
  movement: '🏃',
  combat: '⚔️',
  abilities: '✨',
  items: '🎒',
  communication: '💬',
  ui: '🖥️',
  other: '📌',
};

// --- 导入导出格式 ---
export interface ExportData {
  version: 1;
  exportedAt: string;
  games: GameConfig[];
}

// --- 按键显示名映射（用于键盘可视化） ---
export const KEY_DISPLAY_NAMES: Record<string, string> = {
  Backquote: '`',
  Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
  Minus: '-', Equal: '=',
  KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T',
  KeyY: 'Y', KeyU: 'U', KeyI: 'I', KeyO: 'O', KeyP: 'P',
  BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G',
  KeyH: 'H', KeyJ: 'J', KeyK: 'K', KeyL: 'L',
  Semicolon: ';', Quote: "'",
  KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B',
  KeyN: 'N', KeyM: 'M', Comma: ',', Period: '.', Slash: '/',
  Space: '空格',
  Escape: 'Esc',
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4',
  F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8',
  F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  Tab: 'Tab', CapsLock: 'Caps', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift',
  ControlLeft: 'L-Ctrl', ControlRight: 'R-Ctrl',
  AltLeft: 'L-Alt', AltRight: 'R-Alt',
  MetaLeft: 'Win', Backspace: '←',
  Enter: 'Enter', Delete: 'Del', Insert: 'Ins',
  Home: 'Home', End: 'End', PageUp: 'PgUp', PageDown: 'PgDn',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
  Mouse0: '鼠标左键', Mouse1: '鼠标右键', Mouse2: '鼠标中键',
  Mouse3: '侧键1', Mouse4: '侧键2',
};

// --- 键盘布局定义 ---
// 每个键: { code, label, width (flex), x-offset }
export interface KeyDef {
  code: string;
  label: string;
  w: number;    // width multiplier (1 = standard)
  ox?: number;  // x-offset before this key (in key-width units)
}

export const KEYBOARD_ROWS: KeyDef[][] = [
  // F 键排
  [
    { code: 'Escape', label: 'Esc', w: 1 },
    { code: 'F1', label: 'F1', w: 1, ox: 1 },
    { code: 'F2', label: 'F2', w: 1 },
    { code: 'F3', label: 'F3', w: 1 },
    { code: 'F4', label: 'F4', w: 1 },
    { code: 'F5', label: 'F5', w: 1, ox: 0.5 },
    { code: 'F6', label: 'F6', w: 1 },
    { code: 'F7', label: 'F7', w: 1 },
    { code: 'F8', label: 'F8', w: 1 },
    { code: 'F9', label: 'F9', w: 1, ox: 0.5 },
    { code: 'F10', label: 'F10', w: 1 },
    { code: 'F11', label: 'F11', w: 1 },
    { code: 'F12', label: 'F12', w: 1 },
  ],
  // 数字排
  [
    { code: 'Backquote', label: '`', w: 1 },
    { code: 'Digit1', label: '1', w: 1 },
    { code: 'Digit2', label: '2', w: 1 },
    { code: 'Digit3', label: '3', w: 1 },
    { code: 'Digit4', label: '4', w: 1 },
    { code: 'Digit5', label: '5', w: 1 },
    { code: 'Digit6', label: '6', w: 1 },
    { code: 'Digit7', label: '7', w: 1 },
    { code: 'Digit8', label: '8', w: 1 },
    { code: 'Digit9', label: '9', w: 1 },
    { code: 'Digit0', label: '0', w: 1 },
    { code: 'Minus', label: '-', w: 1 },
    { code: 'Equal', label: '=', w: 1 },
    { code: 'Backspace', label: '⌫', w: 2 },
    { code: 'Delete', label: 'Del', w: 1, ox: 0.5 },
  ],
  // QWERTY 排
  [
    { code: 'Tab', label: 'Tab', w: 1.5 },
    { code: 'KeyQ', label: 'Q', w: 1 },
    { code: 'KeyW', label: 'W', w: 1 },
    { code: 'KeyE', label: 'E', w: 1 },
    { code: 'KeyR', label: 'R', w: 1 },
    { code: 'KeyT', label: 'T', w: 1 },
    { code: 'KeyY', label: 'Y', w: 1 },
    { code: 'KeyU', label: 'U', w: 1 },
    { code: 'KeyI', label: 'I', w: 1 },
    { code: 'KeyO', label: 'O', w: 1 },
    { code: 'KeyP', label: 'P', w: 1 },
    { code: 'BracketLeft', label: '[', w: 1 },
    { code: 'BracketRight', label: ']', w: 1 },
    { code: 'Backslash', label: '\\', w: 1.5 },
    { code: 'Insert', label: 'Ins', w: 1, ox: 0.5 },
    { code: 'Home', label: 'Home', w: 1 },
    { code: 'PageUp', label: 'PgUp', w: 1 },
  ],
  // ASDF 排
  [
    { code: 'CapsLock', label: 'Caps', w: 1.75 },
    { code: 'KeyA', label: 'A', w: 1 },
    { code: 'KeyS', label: 'S', w: 1 },
    { code: 'KeyD', label: 'D', w: 1 },
    { code: 'KeyF', label: 'F', w: 1 },
    { code: 'KeyG', label: 'G', w: 1 },
    { code: 'KeyH', label: 'H', w: 1 },
    { code: 'KeyJ', label: 'J', w: 1 },
    { code: 'KeyK', label: 'K', w: 1 },
    { code: 'KeyL', label: 'L', w: 1 },
    { code: 'Semicolon', label: ';', w: 1 },
    { code: 'Quote', label: "'", w: 1 },
    { code: 'Enter', label: 'Enter', w: 2.25 },
    { code: 'Delete', label: 'Del', w: 1, ox: 0.5 },
    { code: 'End', label: 'End', w: 1 },
    { code: 'PageDown', label: 'PgDn', w: 1 },
  ],
  // ZXCV 排
  [
    { code: 'ShiftLeft', label: 'Shift', w: 2.25 },
    { code: 'KeyZ', label: 'Z', w: 1 },
    { code: 'KeyX', label: 'X', w: 1 },
    { code: 'KeyC', label: 'C', w: 1 },
    { code: 'KeyV', label: 'V', w: 1 },
    { code: 'KeyB', label: 'B', w: 1 },
    { code: 'KeyN', label: 'N', w: 1 },
    { code: 'KeyM', label: 'M', w: 1 },
    { code: 'Comma', label: ',', w: 1 },
    { code: 'Period', label: '.', w: 1 },
    { code: 'Slash', label: '/', w: 1 },
    { code: 'ShiftRight', label: 'Shift', w: 2.75 },
    { code: 'ArrowUp', label: '↑', w: 1, ox: 1 },
  ],
  // 空格排
  [
    { code: 'ControlLeft', label: 'Ctrl', w: 1.5 },
    { code: 'MetaLeft', label: 'Win', w: 1.25 },
    { code: 'AltLeft', label: 'Alt', w: 1.25 },
    { code: 'Space', label: 'Space', w: 6 },
    { code: 'AltRight', label: 'Alt', w: 1.25 },
    { code: 'ControlRight', label: 'Ctrl', w: 1.5 },
    { code: 'ArrowLeft', label: '←', w: 1, ox: 1 },
    { code: 'ArrowDown', label: '↓', w: 1 },
    { code: 'ArrowRight', label: '→', w: 1 },
  ],
];

// --- 鼠标按键 ---
export const MOUSE_BUTTONS: KeyDef[] = [
  { code: 'Mouse0', label: '左键', w: 2 },
  { code: 'Mouse2', label: '中键', w: 2 },
  { code: 'Mouse1', label: '右键', w: 2 },
  { code: 'Mouse3', label: '侧键1', w: 2 },
  { code: 'Mouse4', label: '侧键2', w: 2 },
];