import { useState, useMemo, useCallback } from 'react';
import type { GameConfig, Keybinding, KeyCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_ORDER, KEY_DISPLAY_NAMES } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { ActionIcons } from '../icons';
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

  const grouped = useMemo(() => {
    const acc: Record<string, IndexedKeybinding[]> = {};
    for (const kb of filtered) {
      (acc[kb.category] ??= []).push(kb);
    }
    return acc;
  }, [filtered]);

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

  // 键盘点击 → 编辑对应键位
  const handleKeyClick = useCallback(
    (keyCode: string) => {
      const idx = game.keybindings.findIndex((kb) => kb.key === keyCode);
      if (idx >= 0) setEditingIndex(editingIndex === idx ? null : idx);
    },
    [game.keybindings, editingIndex],
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* 顶部导航 */}
      <div className="detail-header">
        <button onClick={onBack} className="btn btn-sm" aria-label="返回游戏列表">
          <ActionIcons.ArrowLeft size={14} /> 返回
        </button>
        <input
          type="text"
          className="input input-title"
          value={game.name}
          onChange={(e) => onUpdateName(game.id, e.target.value)}
          aria-label="游戏名称"
        />
        <span className="badge">{game.genre}</span>
        <span className="detail-count">{game.keybindings.length} 个键位</span>
      </div>

      {/* 键盘可视化 */}
      <KeyboardLayout
        keybindings={game.keybindings}
        highlightKeys={boundKeys}
        onKeyClick={handleKeyClick}
      />

      {/* 搜索 & 过滤 */}
      <div className="search-filter-bar">
        <input
          type="text"
          className="input search-input"
          placeholder="搜索动作或按键..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="搜索键位"
        />
        {(['all', ...CATEGORY_ORDER] as const).map((cat) => {
          const Icon = cat !== 'all' ? CATEGORY_ICONS_MAP[cat] : null;
          return (
            <button
              key={cat}
              className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? '全部' : (
                <>{Icon && <Icon size={12} />} {CATEGORY_LABELS[cat]}</>
              )}
            </button>
          );
        })}
      </div>

      {/* 键位列表 */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const CatIcon = CATEGORY_ICONS_MAP[cat];
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <h3 className="category-header">
              <CatIcon size={16} /> {CATEGORY_LABELS[cat]}
            </h3>
            <div className="kb-list">
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
                  <div key={`${kb.key}-${kb.origIdx}`} className="kb-item card">
                    <kbd className="kbd">{KEY_DISPLAY_NAMES[kb.key] || kb.key}</kbd>
                    <span className="kb-action">{kb.action}</span>
                    <div className="kb-actions">
                      <button
                        className="btn btn-sm btn-icon"
                        onClick={() => handleEditToggle(kb.origIdx)}
                        aria-label={`编辑 ${kb.action}`}
                      >
                        <ActionIcons.Edit size={12} />
                      </button>
                      <button
                        className="btn btn-sm btn-icon"
                        onClick={() => {
                          if (confirm('删除这个键位？')) onRemoveKeybinding(game.id, kb.origIdx);
                        }}
                        aria-label={`删除 ${kb.action}`}
                      >
                        <ActionIcons.Trash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && <p className="empty-state">没有匹配的键位</p>}

      {/* 新增键位 */}
      <KeyEditor onSave={(kb) => onAddKeybinding(game.id, kb)} />
    </div>
  );
}