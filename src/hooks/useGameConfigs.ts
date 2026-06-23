import { useState, useEffect, useCallback } from 'react';
import type { GameConfig, Keybinding } from '../types';
import { loadGames, saveGames, saveGame, deleteGame, generateId, exportJSON, importJSON } from '../utils/storage';
import { ALL_PRESETS } from '../utils/presets';

export function useGameConfigs() {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化加载，首次使用时注入预设
  useEffect(() => {
    let data = loadGames();
    if (data.length === 0) {
      data = ALL_PRESETS;
      saveGames(data);
    }
    setGames(data);
    setLoading(false);
  }, []);

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
    saveGame(game);
    setGames((prev) => [...prev, game]);
    return game;
  }, []);

  const updateGame = useCallback((game: GameConfig) => {
    saveGame(game);
    setGames((prev) => prev.map((g) => (g.id === game.id ? game : g)));
  }, []);

  const updateGameName = useCallback((id: string, name: string) => {
    setGames((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, name, updatedAt: new Date().toISOString() } : g));
      saveGames(next);
      return next;
    });
  }, []);

  const removeGame = useCallback((id: string) => {
    deleteGame(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addKeybinding = useCallback((gameId: string, kb: Keybinding) => {
    setGames((prev) => {
      const next = prev.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          keybindings: [...g.keybindings, kb],
          updatedAt: new Date().toISOString(),
        };
      });
      saveGames(next);
      return next;
    });
  }, []);

  const updateKeybinding = useCallback((gameId: string, index: number, kb: Keybinding) => {
    setGames((prev) => {
      const next = prev.map((g) => {
        if (g.id !== gameId) return g;
        const kbs = [...g.keybindings];
        kbs[index] = kb;
        return { ...g, keybindings: kbs, updatedAt: new Date().toISOString() };
      });
      saveGames(next);
      return next;
    });
  }, []);

  const removeKeybinding = useCallback((gameId: string, index: number) => {
    setGames((prev) => {
      const next = prev.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          keybindings: g.keybindings.filter((_, i) => i !== index),
          updatedAt: new Date().toISOString(),
        };
      });
      saveGames(next);
      return next;
    });
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
    saveGames(merged);
    setGames(merged);
  }, []);

  const reset = useCallback(() => {
    saveGames(ALL_PRESETS);
    setGames(ALL_PRESETS);
  }, []);

  return {
    games,
    loading,
    addGame,
    updateGame,
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