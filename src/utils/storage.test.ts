import { describe, it, expect, beforeEach } from 'vitest';
import { loadGames, saveGames, clearCache, generateId, exportJSON, importJSON } from './storage';
import type { GameConfig } from '../types';

// mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const makeGame = (name: string, id = `id-${name}`): GameConfig => ({
  id,
  name,
  genre: 'FPS',
  keybindings: [{ key: 'KeyW', action: '前进', category: 'movement' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

beforeEach(() => {
  localStorageMock.clear();
  clearCache();
});

describe('loadGames', () => {
  it('空存储返回空数组', () => {
    expect(loadGames()).toEqual([]);
  });

  it('读取已存储的数据', () => {
    const games = [makeGame('Test')];
    saveGames(games);
    expect(loadGames()).toEqual(games);
  });

  it('缓存命中时不重新解析', () => {
    const games = [makeGame('Test')];
    saveGames(games);
    const first = loadGames();
    const second = loadGames();
    expect(first).toBe(second); // 同一引用
  });

  it('无效 JSON 返回空数组', () => {
    store['keybind-vault-games'] = 'invalid json{{{';
    clearCache();
    expect(loadGames()).toEqual([]);
  });
});

describe('saveGames', () => {
  it('保存后 localStorage 可读', () => {
    const games = [makeGame('A'), makeGame('B')];
    saveGames(games);
    const raw = localStorage.getItem('keybind-vault-games');
    expect(JSON.parse(raw!)).toHaveLength(2);
  });

  it('更新缓存引用', () => {
    const games1 = [makeGame('A')];
    saveGames(games1);
    expect(loadGames()).toBe(games1);
  });
});

describe('clearCache', () => {
  it('清除后重新从 localStorage 读取', () => {
    const games = [makeGame('Test')];
    saveGames(games);
    const ref1 = loadGames();
    clearCache();
    const ref2 = loadGames();
    expect(ref1).not.toBe(ref2); // 不同引用
    expect(ref1).toEqual(ref2);   // 但内容相同
  });
});

describe('generateId', () => {
  it('返回非空字符串', () => {
    expect(generateId()).toBeTruthy();
  });

  it('多次调用返回不同值', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('exportJSON', () => {
  it('输出合法 JSON', () => {
    const games = [makeGame('Test')];
    const json = exportJSON(games);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.games).toHaveLength(1);
    expect(parsed.exportedAt).toBeTruthy();
  });
});

describe('importJSON', () => {
  it('导入新游戏追加到现有列表', () => {
    saveGames([makeGame('Existing')]);
    const importData = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01',
      games: [makeGame('NewGame', 'id-new')],
    });
    const result = importJSON(importData);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Existing');
    expect(result[1].name).toBe('NewGame');
  });

  it('同名游戏覆盖', () => {
    saveGames([makeGame('CS2', 'id-old')]);
    const importData = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01',
      games: [makeGame('CS2', 'id-new')],
    });
    const result = importJSON(importData);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id-new');
  });

  it('无效格式抛异常', () => {
    expect(() => importJSON('{}')).toThrow('无效的导入文件');
    expect(() => importJSON('{"games": "not-array"}')).toThrow();
  });
});
