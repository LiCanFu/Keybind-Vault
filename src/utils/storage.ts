import type { GameConfig } from '../types';

const STORAGE_KEY = 'keybind-vault-games';

// 缓存 localStorage 读取，避免重复解析 JSON（js-cache-storage 规则）
let cachedGames: GameConfig[] | null = null;

export function loadGames(): GameConfig[] {
  if (cachedGames !== null) return cachedGames;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cachedGames = raw ? JSON.parse(raw) : [];
  } catch {
    cachedGames = [];
  }
  return cachedGames!;
}

export function saveGames(games: GameConfig[]): boolean {
  cachedGames = games;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    return true;
  } catch (err) {
    // localStorage 满时（QuotaExceededError）降级处理，返回 false 供上层提示用户
    console.error('保存失败，localStorage 可能已满：', err);
    return false;
  }
}

export function clearCache(): void {
  cachedGames = null;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function exportJSON(games: GameConfig[]): string {
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), games },
    null,
    2,
  );
}

export function importJSON(json: string): GameConfig[] {
  const data = JSON.parse(json);
  if (!data.games || !Array.isArray(data.games)) {
    throw new Error('无效的导入文件：缺少 games 字段');
  }
  // merge: 同名游戏覆盖，不存在的追加
  const existing = loadGames();
  const importMap = new Map(data.games.map((g: GameConfig) => [g.name, g]));
  const merged = existing.map((g) => importMap.get(g.name) || g);
  const newGames = data.games.filter(
    (g: GameConfig) => !existing.find((e) => e.name === g.name),
  );
  return [...merged, ...newGames];
}