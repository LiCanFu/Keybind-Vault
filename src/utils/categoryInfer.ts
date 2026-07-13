/**
 * 动作关键词 → 分类自动识别
 * 输入动作名时匹配关键词，自动切换分类
 */
import type { KeyCategory } from '../types';

// 关键词 → 分类映射（优先级从上到下，先匹配先生效，均为包含匹配）
const KEYWORD_RULES: [string[], KeyCategory][] = [
  // 移动
  [['前进', '后退', '左移', '右移', '走', '跑', '冲刺', '闪避', '翻滚', '跳跃', '蹲', '站立', '静步', '行走', '趴', '爬', '游泳', '飞行', '加速', '减速', 'move', 'walk', 'run', 'sprint', 'dodge', 'jump', 'crouch'], 'movement'],
  // 战斗
  [['射击', '攻击', '开火', '瞄准', '开镜', '换弹', '装填', '近战', '格挡', '防御', '投掷', '扔', '丢', '切枪', '武器', '主武器', '副武器', '开枪', 'shoot', 'fire', 'aim', 'reload', 'melee', 'block', 'throw'], 'combat'],
  // 技能
  [['技能Q', '技能W', '技能E', '技能R', '技能1', '技能2', '技能3', '大招', '必杀', '天赋', '召唤师', '闪现', '点燃', '治疗', '屏障', '虚弱', '净化', '惩戒', '传送', 'ghost', 'flash', 'ignite', 'heal', 'barrier', 'exhaust', 'cleanse', 'smite', 'teleport', 'ultimate', 'ability'], 'abilities'],
  // 物品
  [['物品', '装备', '道具', '背包', '使用', '拾取', '购买', '商店', '回城', '补给', '弹药', '手雷', '烟雾', '闪光', '燃烧瓶', '炸药', '陷阱', '地雷', '饰品', 'item', 'equipment', 'inventory', 'use', 'pickup', 'buy', 'shop'], 'items'],
  // 通讯
  [['聊天', '语音', '通讯', '信号', '标记', '撤退', '进攻', '集合', '请求', '回复', '表情', '轮盘', 'ping', 'chat', 'voice', 'signal', 'mark', 'retreat', 'attack', 'gather'], 'communication'],
  // 界面
  [['计分板', '地图', '菜单', '设置', '截图', '录制', '视角', '镜头', '队友', '社交', '好友', '商店', 'tab', 'scoreboard', 'map', 'menu', 'settings', 'screenshot', 'record', 'camera'], 'ui'],
];

// 预降小写：关键词是静态的，在模块加载时处理一次，避免每次推断重复 toLowerCase
const LOWER_RULES: [string[], KeyCategory][] = KEYWORD_RULES.map(
  ([keywords, category]): [string[], KeyCategory] => [keywords.map((k) => k.toLowerCase()), category],
);

/**
 * 根据动作名自动推断分类
 * @param action 动作描述文字
 * @returns 推断的分类，无法推断时返回 null
 */
export function inferCategory(action: string): KeyCategory | null {
  const lower = action.trim().toLowerCase();
  if (!lower) return null;

  for (const [keywords, category] of LOWER_RULES) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return category;
    }
  }
  return null;
}
