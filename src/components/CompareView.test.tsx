import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { GameConfig } from '@/types';
import CompareView from './CompareView';

function makeGame(id: string, name: string, keybindings: GameConfig['keybindings']): GameConfig {
  const now = '2026-01-01T00:00:00.000Z';
  return { id, name, genre: 'FPS', keybindings, createdAt: now, updatedAt: now };
}

describe('CompareView', () => {
  it('渲染标题与两个游戏选择器', () => {
    const games = [
      makeGame('a', '游戏A', [{ key: 'KeyW', action: '前进', category: 'movement' }]),
      makeGame('b', '游戏B', [{ key: 'KeyW', action: '射击', category: 'combat' }]),
    ];
    render(<CompareView games={games} />);
    expect(screen.getByRole('heading', { name: /键位对比/ })).toBeInTheDocument();
    expect(screen.getByLabelText('选择游戏 A')).toBeInTheDocument();
    expect(screen.getByLabelText('选择游戏 B')).toBeInTheDocument();
  });

  it('未选择游戏时不显示对比结果表格', () => {
    render(<CompareView games={[]} />);
    // 对比结果用 role="grid"，未选择两个游戏时不应渲染
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
