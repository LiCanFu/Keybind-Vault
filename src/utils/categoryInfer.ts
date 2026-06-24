/**
 * 动作关键词 → 分类自动识别
 * 输入动作名时匹配关键词，自动切换分类
 */
import type { KeyCategory } from '../types';

// 关键词 → 分类映射（优先级从上到下，先匹配先生效）
// 注意：单字母关键词（如 Q/W/E/R）只做精确匹配，不做 includes 避免误判
const KEYWORD_RULES: [string[], KeyCategory, 'includes' | 'exact'][] = [
  // 移动
  [['前进', '后退', '左移', '右移', '走', '跑', '冲刺', '闪避', '翻滚', '跳跃', '蹲', '站立', '静步', '行走', '趴', '爬', '游泳', '飞行', '加速', '减速', 'move', 'walk', 'run', 'sprint', 'dodge', 'jump', 'crouch'], 'movement', 'includes'],
  // 战斗
  [['射击', '攻击', '开火', '瞄准', '开镜', '换弹', '装填', '近战', '格挡', '防御', '投掷', '扔', '丢', '切枪', '武器', '主武器', '副武器', '射击', '开枪', 'shoot', 'fire', 'aim', 'reload', 'melee', 'block', 'throw'], 'combat', 'includes'],
  // 技能
  [['技能Q', '技能W', '技能E', '技能R', '技能1', '技能2', '技能3', '大招', '必杀', '天赋', '召唤师', '闪现', '点燃', '治疗', '屏障', '虚弱', '净化', '惩戒', '传送', 'ghost', 'flash', 'ignite', 'heal', 'barrier', 'exhaust', 'cleanse', 'smite', 'teleport', 'ultimate', 'ability'], 'abilities', 'includes'],
  // 物品
  [['物品', '装备', '道具', '背包', '使用', '拾取', '购买', '商店', '回城', '补给', '弹药', '手雷', '烟雾', '闪光', '燃烧瓶', '炸药', '陷阱', '地雷', '饰品', 'item', 'equipment', 'inventory', 'use', 'pickup', 'buy', 'shop'], 'items', 'includes'],
  // 通讯
  [['聊天', '语音', '通讯', '信号', '标记', '撤退', '进攻', '集合', '请求', '回复', '表情', '轮盘', 'ping', 'chat', 'voice', 'signal', 'mark', 'retreat', 'attack', 'gather'], 'communication', 'includes'],
  // 界面
  [['计分板', '地图', '菜单', '设置', '截图', '录制', '视角', '镜头', '队友', '社交', '好友', '商店', 'tab', 'scoreboard', 'map', 'menu', 'settings', 'screenshot', 'record', 'camera'], 'ui', 'includes'],
];

/**
 * 根据动作名自动推断分类
 * @param action 动作描述文字
 * @returns 推断的分类，无法推断时返回 null
 */
export function inferCategory(action: string): KeyCategory | null {
  const trimmed = action.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  for (const [keywords, category, matchMode] of KEYWORD_RULES) {
    for (const kw of keywords) {
      if (matchMode === 'exact') {
        // 精确匹配：整个动作名就是这个关键词
        if (lower === kw.toLowerCase()) return category;
      } else {
        // 包含匹配
        if (lower.includes(kw.toLowerCase())) return category;
      }
    }
  }
  return null;
}