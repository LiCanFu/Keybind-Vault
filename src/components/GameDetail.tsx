import { useState, useMemo, useRef, useEffect } from 'react';
import type { GameConfig, Keybinding, KeyCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_ORDER, KEY_DISPLAY_NAMES } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { ActionIcons } from '../icons';
import { inferCategory } from '../utils/categoryInfer';
import KeyboardLayout from './KeyboardLayout';

interface Props {
  game: GameConfig;
  onBack: () => void;
  onUpdateName: (id: string, name: string) => void;
  onAddKeybinding: (gameId: string, kb: Keybinding) => void;
  onUpdateKeybinding: (gameId: string, index: number, kb: Keybinding) => void;
  onRemoveKeybinding: (gameId: string, index: number) => void;
}

type IndexedKeybinding = Keybinding & { origIdx: number };

const CATEGORY_OPTIONS = CATEGORY_ORDER.map((cat) => ({
  value: cat,
  label: CATEGORY_LABELS[cat],
}));

// ============================================================
// 可编辑单元格 — 显示态直接渲染 value，编辑态用 draft
// ============================================================
function EditableCell({
  value,
  className,
  style,
  onSave,
  type = 'text',
  options,
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
  onSave: (v: string) => void;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // 进入编辑态时，用当前 value 初始化 draft
  const startEditing = () => {
    setDraft(value);
    setEditing(true);
  };

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const commit = () => {
    if (draft !== value) onSave(draft);
    setEditing(false);
  };

  // 显示态 — 直接渲染 value，不依赖 draft
  if (!editing) {
    return (
      <span
        className={className}
        style={{ ...style, cursor: 'text', borderBottom: '1px dashed transparent', transition: 'border-color 0.15s' }}
        onClick={startEditing}
        onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
        title="点击编辑"
      >
        {value}
      </span>
    );
  }

  // 编辑态 — select 模式
  if (type === 'select' && options) {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        className="input"
        value={draft}
        onChange={(e) => {
          const newVal = e.target.value;
          setDraft(newVal);
          onSave(newVal);
          setEditing(false);
        }}
        style={{ ...style, padding: '2px 6px', fontSize: 'inherit' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  // 编辑态 — 文本输入模式
  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      className="input"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      style={{ ...style, padding: '2px 6px', fontSize: 'inherit' }}
    />
  );
}

// ============================================================
// 主组件
// ============================================================
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

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
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

      <KeyboardLayout
        keybindings={game.keybindings}
        highlightKeys={boundKeys}
        onUpdateKeybinding={(index, kb) => onUpdateKeybinding(game.id, index, kb)}
        onRemoveKeybinding={(index) => onRemoveKeybinding(game.id, index)}
        onAddKeybinding={(kb) => onAddKeybinding(game.id, kb)}
      />

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
              {items.map((kb) => (
                <div key={`${kb.key}-${kb.origIdx}`} className="kb-item card">
                  <kbd
                    className="kbd"
                    style={{ cursor: 'text' }}
                    onClick={() => {
                      const newKey = prompt('输入新按键代码（如 KeyQ, Mouse0）：', kb.key);
                      if (newKey && newKey !== kb.key) {
                        onUpdateKeybinding(game.id, kb.origIdx, { ...kb, key: newKey });
                      }
                    }}
                    title="点击修改按键"
                  >
                    {KEY_DISPLAY_NAMES[kb.key] || kb.key}
                  </kbd>

                  <EditableCell
                    value={kb.action}
                    className="kb-action"
                    onSave={(newAction) =>
                      onUpdateKeybinding(game.id, kb.origIdx, { ...kb, action: newAction })
                    }
                  />

                  <EditableCell
                    value={CATEGORY_LABELS[kb.category]}
                    className="badge"
                    style={{ fontSize: 11, cursor: 'pointer' }}
                    type="select"
                    options={CATEGORY_OPTIONS}
                    onSave={(newCat) =>
                      onUpdateKeybinding(game.id, kb.origIdx, { ...kb, category: newCat as KeyCategory })
                    }
                  />

                  <button
                    className="btn btn-sm btn-icon"
                    onClick={() => {
                      if (confirm(`删除 "${kb.action}" 键位？`)) onRemoveKeybinding(game.id, kb.origIdx);
                    }}
                    aria-label={`删除 ${kb.action}`}
                  >
                    <ActionIcons.Trash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && <p className="empty-state">没有匹配的键位</p>}

      <KeyEditorInline onAdd={(kb) => onAddKeybinding(game.id, kb)} />
    </div>
  );
}

// ============================================================
// 底部新增键位
// ============================================================
function KeyEditorInline({ onAdd }: { onAdd: (kb: Keybinding) => void }) {
  const [key, setKey] = useState('');
  const [action, setAction] = useState('');
  const [category, setCategory] = useState<KeyCategory>('other');
  const [expanded, setExpanded] = useState(false);
  const [autoCategory, setAutoCategory] = useState(true);

  const handleSubmit = () => {
    if (!key || !action) return;
    onAdd({ key, action, category });
    setKey('');
    setAction('');
    setCategory('other');
  };

  if (!expanded) {
    return (
      <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => setExpanded(true)}>
        <ActionIcons.Plus size={12} /> 添加键位
      </button>
    );
  }

  return (
    <div className="card editor-container" style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 120px' }}>
          <label className="editor-label">按键代码</label>
          <input className="input input-mono" placeholder="KeyQ, Space..." value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="editor-label">动作描述</label>
          <input
            className="input"
            placeholder="前进, 换弹, 跳跃..."
            value={action}
            onChange={(e) => {
              const v = e.target.value;
              setAction(v);
              if (autoCategory) {
                const inferred = inferCategory(v);
                if (inferred) setCategory(inferred);
              }
            }}
          />
        </div>
        <div style={{ flex: '0 0 100px' }}>
          <label className="editor-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            分类
            <span
              style={{ fontSize: 10, color: autoCategory ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer' }}
              onClick={() => setAutoCategory(!autoCategory)}
              title={autoCategory ? '自动推断已开启' : '自动推断已关闭'}
            >
              {autoCategory ? '🤖 自动' : '手动'}
            </span>
          </label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as KeyCategory)}>
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={!key || !action}>
          <ActionIcons.Plus size={12} /> 添加
        </button>
        <button className="btn btn-sm" onClick={() => setExpanded(false)}>
          <ActionIcons.X size={12} />
        </button>
      </div>
    </div>
  );
}