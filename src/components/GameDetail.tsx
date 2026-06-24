import { useState, useMemo, useCallback } from 'react';
import type { GameConfig, Keybinding, KeyCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_ORDER, KEY_DISPLAY_NAMES } from '../types';
import KeyboardLayout from './KeyboardLayout';
import KeyEditor from './KeyEditor';

interface Props {
  game: GameConfig;
  allGames: GameConfig[];
  onBack: () => void;
  onUpdateName: (id: string, name: string) => void;
  onAddKeybinding: (gameId: string, kb: Keybinding) => void;
  onUpdateKeybinding: (gameId: string, index: number, kb: Keybinding) => void;
  onRemoveKeybinding: (gameId: string, index: number) => void;
}

// 带原始索引的键位类型
type IndexedKeybinding = Keybinding & { origIdx: number };

export default function GameDetail({
  game,
  onBack,
  onUpdateName,
  onAddKeybinding,
  onUpdateKeybinding,
  onRemoveKeybinding,
}: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<KeyCategory | 'all'>('all');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 按搜索和分类过滤，保留原始索引（避免 indexOf 重复键位 bug）
  const filtered: IndexedKeybinding[] = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return game.keybindings
      .map((kb, idx) => ({ ...kb, origIdx: idx }))
      .filter((kb) => {
        const matchSearch =
          !search ||
          kb.action.toLowerCase().includes(lowerSearch) ||
          (KEY_DISPLAY_NAMES[kb.key] || kb.key).toLowerCase().includes(lowerSearch);
        const matchCat = filterCategory === 'all' || kb.category === filterCategory;
        return matchSearch && matchCat;
      });
  }, [game.keybindings, search, filterCategory]);

  // 按分类分组
  const grouped = useMemo(() => {
    const acc: Record<string, IndexedKeybinding[]> = {};
    for (const kb of filtered) {
      (acc[kb.category] ??= []).push(kb);
    }
    return acc;
  }, [filtered]);

  // 被绑定的键集合 — memo 避免 KeyboardLayout 每次重建 Map
  const boundKeys = useMemo(
    () => new Set(game.keybindings.map((k) => k.key)),
    [game.keybindings],
  );

  const handleEditToggle = useCallback(
    (origIdx: number) => {
      setEditingIndex(editingIndex === origIdx ? null : origIdx);
    },
    [editingIndex],
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} className="btn btn-sm">
          ← 返回
        </button>
        <input
          type="text"
          className="input"
          value={game.name}
          onChange={(e) => onUpdateName(game.id, e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, border: 'none', background: 'transparent', padding: 0, width: 'auto', minWidth: 200 }}
        />
        <span className="badge">{game.genre}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {game.keybindings.length} 个键位
        </span>
      </div>

      {/* 键盘可视化 */}
      <KeyboardLayout
        keybindings={game.keybindings}
        highlightKeys={boundKeys}
      />

      {/* 搜索 & 过滤 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input"
          placeholder="搜索动作或按键..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        {(['all', ...CATEGORY_ORDER] as const).map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat === 'all' ? '全部' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
          </button>
        ))}
      </div>

      {/* 键位列表 */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--text-secondary)' }}>
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map((kb) => {
                if (editingIndex === kb.origIdx) {
                  return (
                    <KeyEditor
                      key={`edit-${kb.origIdx}`}
                      initial={kb}
                      onSave={(updated) => {
                        onUpdateKeybinding(game.id, kb.origIdx, updated);
                        setEditingIndex(null);
                      }}
                      onCancel={() => setEditingIndex(null)}
                    />
                  );
                }

                return (
                  <div
                    key={`${kb.key}-${kb.origIdx}`}
                    className="card"
                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <kbd
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: 600,
                        minWidth: 70,
                        textAlign: 'center',
                        color: 'var(--accent)',
                      }}
                    >
                      {KEY_DISPLAY_NAMES[kb.key] || kb.key}
                    </kbd>
                    <span style={{ flex: 1 }}>{kb.action}</span>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleEditToggle(kb.origIdx)}
                      style={{ fontSize: 12 }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        if (confirm('删除这个键位？')) onRemoveKeybinding(game.id, kb.origIdx);
                      }}
                      style={{ fontSize: 12 }}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>
          没有匹配的键位
        </p>
      )}

      {/* 新增键位 */}
      <KeyEditor
        onSave={(kb) => {
          onAddKeybinding(game.id, kb);
        }}
      />
    </div>
  );
}