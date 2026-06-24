import { describe, it, expect } from 'vitest';
import { inferCategory } from '../utils/categoryInfer';

describe('inferCategory', () => {
  it('空字符串返回 null', () => {
    expect(inferCategory('')).toBeNull();
    expect(inferCategory('   ')).toBeNull();
  });

  it('无匹配关键词返回 null', () => {
    expect(inferCategory('自定义操作')).toBeNull();
    expect(inferCategory('abcxyz')).toBeNull();
  });

  it('移动类关键词', () => {
    expect(inferCategory('前进')).toBe('movement');
    expect(inferCategory('后退')).toBe('movement');
    expect(inferCategory('跳跃')).toBe('movement');
    expect(inferCategory('蹲下')).toBe('movement');
    expect(inferCategory('冲刺')).toBe('movement');
    expect(inferCategory('walk')).toBe('movement');
    expect(inferCategory('sprint')).toBe('movement');
  });

  it('战斗类关键词', () => {
    expect(inferCategory('射击')).toBe('combat');
    expect(inferCategory('换弹')).toBe('combat');
    expect(inferCategory('瞄准')).toBe('combat');
    expect(inferCategory('开镜')).toBe('combat');
    expect(inferCategory('reload')).toBe('combat');
  });

  it('技能类关键词', () => {
    expect(inferCategory('大招')).toBe('abilities');
    expect(inferCategory('闪现')).toBe('abilities');
    expect(inferCategory('技能Q')).toBe('abilities');
    expect(inferCategory('治疗')).toBe('abilities');
  });

  it('物品类关键词', () => {
    expect(inferCategory('购买装备')).toBe('items');
    expect(inferCategory('回城')).toBe('items');
    expect(inferCategory('手雷')).toBe('items');
  });

  it('通讯类关键词', () => {
    expect(inferCategory('聊天')).toBe('communication');
    expect(inferCategory('语音按键')).toBe('communication');
    expect(inferCategory('发送信号')).toBe('communication');
  });

  it('界面类关键词', () => {
    expect(inferCategory('计分板')).toBe('ui');
    expect(inferCategory('菜单')).toBe('ui');
    expect(inferCategory('地图设置')).toBe('ui');
  });

  it('英文大小写不敏感', () => {
    expect(inferCategory('RELOAD')).toBe('combat');
    expect(inferCategory('Jump')).toBe('movement');
    expect(inferCategory('FLASH')).toBe('abilities');
  });

  it('单字母不会误判', () => {
    // W 是 FPS 前进键，不应被归为技能
    expect(inferCategory('W')).toBeNull();
    expect(inferCategory('Q')).toBeNull();
    expect(inferCategory('E')).toBeNull();
    expect(inferCategory('R')).toBeNull();
  });

  it('混合文本中包含关键词也能匹配', () => {
    expect(inferCategory('向前走')).toBe('movement');   // 包含「走」
    expect(inferCategory('快速换弹')).toBe('combat');   // 包含「换弹」
  });
});
