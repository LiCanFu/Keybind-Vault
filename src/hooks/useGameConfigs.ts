import { useState, useEffect, useCallback } from 'react';
import type { GameConfig, Keybinding } from '../types';
import { loadGames, saveGames, generateId, exportJSON, importJSON } from '../utils/storage';
import { ALL_PRESETS } from '../utils/presets';

export function useGameConfigs() {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化加载，首次使用时注入预设（深拷贝防止引用污染）
  useEffect(() => {
    let data = loadGames();
    if (data.length === 0) {
      data = structuredClone(ALL_PRESETS);
    }
    setGames(data);
    // loading 在下一帧设为 false，确保首次持久化 effect 先执行
    requestAnimationFrame(() => setLoading(false));
  }, []);

  // 状态变更时自动持久化（避免在每个 setter 内部手动写 localStorage）
  useEffect(() => {
    if (!loading) {
      saveGames(games);
    }
  }, [games, loading]);

  const addGame = useCallback((name: string, genre: GameConfig['genre']) => {
    const now = new Date().toISOString();
    const game: GameConfig = {
      id: generateId(),
      name,
      genre,
      keybindings: [],
      createdAt: now,
      updatedAt: now,
    };
    setGames((prev) => [...prev, game]);
    return game;
  }, []);

  const updateGameName = useCallback((id: string, name: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name, updatedAt: new Date().toISOString() } : g)),
    );
  }, []);

  const removeGame = useCallback((id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addKeybinding = useCallback((gameId: string, kb: Keybinding) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId
          ? { ...g, keybindings: [...g.keybindings, kb], updatedAt: new Date().toISOString() }
          : g,
      ),
    );
  }, []);

  const updateKeybinding = useCallback((gameId: string, index: number, kb: Keybinding) => {
    if (index < 0) return;
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        if (index >= g.keybindings.length) return g; // 越界忽略
        const kbs = [...g.keybindings];
        kbs[index] = kb;
        return { ...g, keybindings: kbs, updatedAt: new Date().toISOString() };
      }),
    );
  }, []);

  const removeKeybinding = useCallback((gameId: string, index: number) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId
          ? { ...g, keybindings: g.keybindings.filter((_, i) => i !== index), updatedAt: new Date().toISOString() }
          : g,
      ),
    );
  }, []);

  const handleExport = useCallback(() => {
    const json = exportJSON(games);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keybind-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [games]);

  const handleImport = useCallback((json: string) => {
    const merged = importJSON(json);
    setGames(merged);
  }, []);

  const reset = useCallback(() => {
    setGames(structuredClone(ALL_PRESETS));
  }, []);

  return {
    games,
    loading,
    addGame,
    updateGameName,
    removeGame,
    addKeybinding,
    updateKeybinding,
    removeKeybinding,
    handleExport,
    handleImport,
    reset,
  };
}