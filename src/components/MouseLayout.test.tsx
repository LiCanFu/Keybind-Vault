import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Keybinding } from '@/types';
import MouseLayout from './MouseLayout';

const noop = () => {};

describe('MouseLayout', () => {
  it('渲染五个鼠标可点击区域', () => {
    render(<MouseLayout keybindings={[]} onAddKeybinding={noop} />);
    for (const label of ['左键', '右键', '滚轮', '侧键上', '侧键下']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
    }
  });

  it('已绑定的鼠标键显示其动作名', () => {
    const kbs: Keybinding[] = [{ key: 'Mouse0', action: '射击', category: 'combat' }];
    render(<MouseLayout keybindings={kbs} onAddKeybinding={noop} />);
    // 底部标签与 SVG 文本均展示动作名
    expect(screen.getAllByText('射击').length).toBeGreaterThan(0);
  });

  it('点击未绑定区域进入编辑态（出现输入框）', async () => {
    const user = userEvent.setup();
    render(<MouseLayout keybindings={[]} onAddKeybinding={noop} />);
    await user.click(screen.getByRole('button', { name: /左键（点击绑定）/ }));
    expect(screen.getByPlaceholderText('动作...')).toBeInTheDocument();
  });
});
