import type { GameConfig } from '../types';

// ================================================================
// 预设键位 — 提供初始数据，用户可在此基础上编辑
// ================================================================

const now = new Date().toISOString();

export const FPS_PRESET: GameConfig = {
  id: 'preset-fps',
  name: 'CS2 / 通用 FPS',
  genre: 'FPS',
  createdAt: now,
  updatedAt: now,
  keybindings: [
    // 移动
    { key: 'KeyW', action: '前进', category: 'movement' },
    { key: 'KeyS', action: '后退', category: 'movement' },
    { key: 'KeyA', action: '左移', category: 'movement' },
    { key: 'KeyD', action: '右移', category: 'movement' },
    { key: 'ShiftLeft', action: '静步/行走', category: 'movement' },
    { key: 'ControlLeft', action: '蹲下', category: 'movement' },
    { key: 'Space', action: '跳跃', category: 'movement' },
    // 战斗
    { key: 'Mouse0', action: '射击/攻击', category: 'combat' },
    { key: 'Mouse1', action: '瞄准/开镜', category: 'combat' },
    { key: 'KeyR', action: '换弹', category: 'combat' },
    { key: 'Digit1', action: '主武器', category: 'combat' },
    { key: 'Digit2', action: '副武器/手枪', category: 'combat' },
    { key: 'Digit3', action: '近战武器', category: 'combat' },
    { key: 'KeyQ', action: '切换上次武器', category: 'combat' },
    { key: 'KeyG', action: '扔武器/丢枪', category: 'combat' },
    { key: 'KeyF', action: '检视武器', category: 'combat' },
    // 物品
    { key: 'Digit4', action: '手雷/投掷物1', category: 'items' },
    { key: 'Digit5', action: '投掷物2', category: 'items' },
    { key: 'KeyX', action: '投掷物3', category: 'items' },
    { key: 'KeyE', action: '使用/拾取', category: 'items' },
    { key: 'KeyB', action: '购买菜单', category: 'items' },
    // 通讯
    { key: 'KeyY', action: '全体聊天', category: 'communication' },
    { key: 'KeyU', action: '队伍聊天', category: 'communication' },
    { key: 'KeyK', action: '语音按键', category: 'communication' },
    // 界面
    { key: 'Tab', action: '计分板', category: 'ui' },
    { key: 'Escape', action: '菜单', category: 'ui' },
    { key: 'F5', action: '截图', category: 'ui' },
  ],
};

export const LOL_PRESET: GameConfig = {
  id: 'preset-lol',
  name: '英雄联盟',
  genre: 'MOBA',
  createdAt: now,
  updatedAt: now,
  keybindings: [
    // 技能
    { key: 'KeyQ', action: '技能 Q', category: 'abilities' },
    { key: 'KeyW', action: '技能 W', category: 'abilities' },
    { key: 'KeyE', action: '技能 E', category: 'abilities' },
    { key: 'KeyR', action: '大招 R', category: 'abilities' },
    { key: 'KeyD', action: '召唤师技能1', category: 'abilities' },
    { key: 'KeyF', action: '召唤师技能2', category: 'abilities' },
    // 移动
    { key: 'Mouse1', action: '移动/攻击移动', category: 'movement' },
    { key: 'Mouse0', action: '选择目标', category: 'movement' },
    { key: 'KeyS', action: '停止', category: 'movement' },
    { key: 'KeyA', action: '攻击移动（A键）', category: 'movement' },
    // 物品
    { key: 'Digit1', action: '物品栏1', category: 'items' },
    { key: 'Digit2', action: '物品栏2', category: 'items' },
    { key: 'Digit3', action: '物品栏3', category: 'items' },
    { key: 'Digit4', action: '饰品', category: 'items' },
    { key: 'Digit5', action: '物品栏5', category: 'items' },
    { key: 'Digit6', action: '物品栏6', category: 'items' },
    { key: 'Digit7', action: '物品栏7', category: 'items' },
    { key: 'KeyB', action: '回城', category: 'items' },
    { key: 'KeyP', action: '商店', category: 'items' },
    // 界面
    { key: 'Tab', action: '计分板', category: 'ui' },
    { key: 'Escape', action: '菜单', category: 'ui' },
    { key: 'KeyY', action: '锁定/解锁视角', category: 'ui' },
    { key: 'Space', action: '镜头居中', category: 'ui' },
    { key: 'F1', action: '队友1视角', category: 'ui' },
    { key: 'F2', action: '队友2视角', category: 'ui' },
    { key: 'F3', action: '队友3视角', category: 'ui' },
    { key: 'F4', action: '队友4视角', category: 'ui' },
    { key: 'F5', action: '队友5视角', category: 'ui' },
    { key: 'KeyG', action: '发送信号', category: 'communication' },
    { key: 'KeyV', action: '撤退信号', category: 'communication' },
    { key: 'Enter', action: '聊天', category: 'communication' },
  ],
};

export const VALORANT_PRESET: GameConfig = {
  id: 'preset-valorant',
  name: 'Valorant 无畏契约',
  genre: 'Tactical FPS',
  createdAt: now,
  updatedAt: now,
  keybindings: [
    // 移动
    { key: 'KeyW', action: '前进', category: 'movement' },
    { key: 'KeyS', action: '后退', category: 'movement' },
    { key: 'KeyA', action: '左移', category: 'movement' },
    { key: 'KeyD', action: '右移', category: 'movement' },
    { key: 'ShiftLeft', action: '静步', category: 'movement' },
    { key: 'ControlLeft', action: '蹲下', category: 'movement' },
    { key: 'Space', action: '跳跃', category: 'movement' },
    // 战斗
    { key: 'Mouse0', action: '射击', category: 'combat' },
    { key: 'Mouse1', action: '瞄准/开镜', category: 'combat' },
    { key: 'KeyR', action: '换弹', category: 'combat' },
    { key: 'Digit1', action: '主武器', category: 'combat' },
    { key: 'Digit2', action: '副武器', category: 'combat' },
    { key: 'Digit3', action: '近战武器', category: 'combat' },
    // 技能
    { key: 'KeyQ', action: '技能1', category: 'abilities' },
    { key: 'KeyE', action: '技能2', category: 'abilities' },
    { key: 'KeyC', action: '技能3', category: 'abilities' },
    { key: 'KeyX', action: '大招', category: 'abilities' },
    // 物品
    { key: 'KeyF', action: '使用/安装/拆除', category: 'items' },
    { key: 'Digit4', action: '技能物品1', category: 'items' },
    // 通讯
    { key: 'KeyV', action: '语音按键', category: 'communication' },
    { key: 'KeyU', action: '队伍聊天', category: 'communication' },
    { key: 'Enter', action: '全体聊天', category: 'communication' },
    { key: 'KeyZ', action: '发送信号', category: 'communication' },
    // 界面
    { key: 'Tab', action: '计分板', category: 'ui' },
    { key: 'Escape', action: '菜单', category: 'ui' },
    { key: 'KeyM', action: '地图设置', category: 'ui' },
    { key: 'KeyB', action: '购买菜单', category: 'ui' },
  ],
};

export const ALL_PRESETS = [FPS_PRESET, LOL_PRESET, VALORANT_PRESET];