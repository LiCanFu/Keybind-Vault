import type { GameConfig } from '../types';

const STORAGE_KEY = 'keybind-vault-games';

export function loadGames(): GameConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveGames(games: GameConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function getGame(id: string): GameConfig | undefined {
  return loadGames().find((g) => g.id === id);
}

export function saveGame(game: GameConfig): void {
  const games = loadGames();
  const idx = games.findIndex((g) => g.id === game.id);
  if (idx >= 0) {
    games[idx] = { ...game, updatedAt: new Date().toISOString() };
  } else {
    games.push(game);
  }
  saveGames(games);
}

export function deleteGame(id: string): void {
  saveGames(loadGames().filter((g) => g.id !== id));
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