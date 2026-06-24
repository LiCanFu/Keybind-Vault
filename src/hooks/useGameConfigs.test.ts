import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameConfigs } from './useGameConfigs';

// mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  },
});

beforeEach(() => {
  localStorage.clear();
});

describe('useGameConfigs', () => {
  it('首次加载注入预设数据', async () => {
    const { result } = renderHook(() => useGameConfigs());
    // 初始 loading
    expect(result.current.loading).toBe(true);

    // 等待 effect 执行
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.games.length).toBeGreaterThan(0);
    expect(result.current.games.some((g) => g.name.includes('CS2'))).toBe(true);
    expect(result.current.games.some((g) => g.name.includes('英雄联盟'))).toBe(true);
  });

  it('addGame 添加新游戏', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    let newGame: any;
    act(() => {
      newGame = result.current.addGame('Apex Legends', 'FPS');
    });

    expect(newGame.name).toBe('Apex Legends');
    expect(result.current.games.some((g) => g.name === 'Apex Legends')).toBe(true);
  });

  it('updateGameName 修改游戏名', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    const targetId = result.current.games[0].id;
    act(() => {
      result.current.updateGameName(targetId, '新名字');
    });

    expect(result.current.games[0].name).toBe('新名字');
  });

  it('removeGame 删除游戏', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    const initialCount = result.current.games.length;
    const targetId = result.current.games[0].id;

    act(() => {
      result.current.removeGame(targetId);
    });

    expect(result.current.games).toHaveLength(initialCount - 1);
    expect(result.current.games.find((g) => g.id === targetId)).toBeUndefined();
  });

  it('addKeybinding 添加键位', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    const gameId = result.current.games[0].id;
    const initialKbCount = result.current.games[0].keybindings.length;

    act(() => {
      result.current.addKeybinding(gameId, { key: 'KeyZ', action: '测试动作', category: 'other' });
    });

    expect(result.current.games[0].keybindings).toHaveLength(initialKbCount + 1);
    expect(result.current.games[0].keybindings.at(-1)?.action).toBe('测试动作');
  });

  it('updateKeybinding 修改键位', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    const gameId = result.current.games[0].id;

    act(() => {
      result.current.updateKeybinding(gameId, 0, { key: 'KeyW', action: '修改后的动作', category: 'combat' });
    });

    expect(result.current.games[0].keybindings[0].action).toBe('修改后的动作');
    expect(result.current.games[0].keybindings[0].category).toBe('combat');
  });

  it('removeKeybinding 删除键位', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    const gameId = result.current.games[0].id;
    const initialKbCount = result.current.games[0].keybindings.length;

    act(() => {
      result.current.removeKeybinding(gameId, 0);
    });

    expect(result.current.games[0].keybindings).toHaveLength(initialKbCount - 1);
  });

  it('reset 恢复预设数据', async () => {
    const { result } = renderHook(() => useGameConfigs());
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    // 先删除一个
    act(() => {
      result.current.removeGame(result.current.games[0].id);
    });
    const afterDelete = result.current.games.length;

    // 重置
    act(() => {
      result.current.reset();
    });

    expect(result.current.games.length).toBeGreaterThan(afterDelete);
  });
});
