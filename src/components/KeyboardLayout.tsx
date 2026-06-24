import { Fragment, useState, useRef, useEffect } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { KEY_DISPLAY_NAMES, KEYBOARD_ROWS, CATEGORY_LABELS, CATEGORY_ORDER } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { inferCategory } from '../utils/categoryInfer';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
  onUpdateKeybinding?: (index: number, kb: Keybinding) => void;
  onRemoveKeybinding?: (index: number) => void;
  onAddKeybinding?: (kb: Keybinding) => void;
}

// 当前正在编辑的键位
interface EditingKey {
  code: string;
  index: number; // -1 = 新增
  action: string;
  category: KeyCategory;
}

export default function KeyboardLayout({
  keybindings,
  highlightKeys,
  onUpdateKeybinding,
  onRemoveKeybinding,
  onAddKeybinding,
}: Props) {
  const [editing, setEditing] = useState<EditingKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const kbMap = new Map<string, { binding: Keybinding; index: number }>();
  keybindings.forEach((kb, idx) => kbMap.set(kb.key, { binding: kb, index: idx }));

  // 编辑态自动聚焦
  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [editing]);

  // 点击键帽 → 开始编辑
  const handleClick = (code: string) => {
    // 再次点击同一个键 → 关闭
    if (editing?.code === code) {
      setEditing(null);
      return;
    }

    const entry = kbMap.get(code);
    if (entry) {
      setEditing({
        code,
        index: entry.index,
        action: entry.binding.action,
        category: entry.binding.category,
      });
    } else if (onAddKeybinding) {
      setEditing({ code, index: -1, action: '', category: 'other' });
    }
  };

  // 保存
  const save = () => {
    if (!editing || !editing.action.trim()) {
      setEditing(null);
      return;
    }
    const kb: Keybinding = { key: editing.code, action: editing.action.trim(), category: editing.category };
    if (editing.index >= 0) {
      onUpdateKeybinding?.(editing.index, kb);
    } else {
      onAddKeybinding?.(kb);
    }
    setEditing(null);
  };

  // 删除
  const remove = () => {
    if (!editing || editing.index < 0) return;
    if (confirm('删除这个键位？')) {
      onRemoveKeybinding?.(editing.index);
      setEditing(null);
    }
  };

  return (
    <div className="keyboard-container" role="img" aria-label="键盘布局可视化（点击键帽可直接编辑）">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((key) => {
            const entry = kbMap.get(key.code);
            const kb = entry?.binding;
            const isBound = highlightKeys.has(key.code);
            const catColor = kb ? `var(--cat-${kb.category})` : undefined;
            const CatIcon = kb ? CATEGORY_ICONS_MAP[kb.category] : null;
            const isEditing = editing?.code === key.code;

            return (
              <Fragment key={key.code}>
                {key.ox ? (
                  <div className="keycap-spacer" style={{ width: key.ox * 48 }} />
                ) : null}

                {/* 键帽 */}
                <div
                  className={`keycap ${isBound ? 'keycap-bound' : ''}`}
                  style={{
                    width: key.w * 48 - 4,
                    height: 48,
                    border: isEditing
                      ? '2px solid var(--accent-hover)'
                      : isBound
                        ? `2px solid ${catColor || 'var(--accent)'}`
                        : '1px solid var(--border)',
                    background: isEditing
                      ? 'var(--accent)22'
                      : isBound
                        ? `${catColor || 'var(--accent)'}22`
                        : 'var(--bg-tertiary)',
                    color: isBound ? catColor || 'var(--accent)' : 'var(--text-secondary)',
                    flexShrink: 0,
                    cursor: isBound || onAddKeybinding ? 'pointer' : 'default',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={kb ? `${key.label}: ${kb.action}（点击编辑）` : `${key.label}（点击绑定）`}
                  onClick={() => handleClick(key.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick(key.code);
                    }
                  }}
                >
                  {/* 未编辑状态 */}
                  {!isEditing && (
                    <>
                      {isBound && CatIcon && (
                        <span className="keycap-icon"><CatIcon size={12} /></span>
                      )}
                      <span className="keycap-label">{key.label}</span>
                      {isBound && kb && (
                        <span className="keycap-action" style={{ color: catColor || 'var(--accent)' }}>
                          {kb.action.length > 6 ? kb.action.slice(0, 6) + '…' : kb.action}
                        </span>
                      )}
                      {/* 未绑定但可添加的键，显示 + */}
                      {!isBound && onAddKeybinding && (
                        <span className="keycap-action" style={{ opacity: 0.3 }}>+</span>
                      )}
                    </>
                  )}

                  {/* 编辑状态 — 键帽内直接变成输入框 */}
                  {isEditing && (
                    <input
                      ref={inputRef}
                      type="text"
                      className="input"
                      value={editing.action}
                      onChange={(e) => {
                        const newAction = e.target.value;
                        const inferred = inferCategory(newAction);
                        setEditing({
                          ...editing,
                          action: newAction,
                          ...(inferred ? { category: inferred } : {}),
                        });
                      }}
                      placeholder="输入动作..."
                      style={{
                        width: '100%',
                        fontSize: 10,
                        padding: '2px 3px',
                        textAlign: 'center',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--accent)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') save();
                        if (e.key === 'Escape') setEditing(null);
                        e.stopPropagation();
                      }}
                      onBlur={save}
                    />
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      ))}

      {/* 底部操作栏 — 编辑态时显示分类切换和保存/删除 */}
      {editing && (
        <div
          className="card"
          style={{
            marginTop: 8,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <kbd className="kbd kbd-sm" style={{ minWidth: 40, fontSize: 11 }}>
            {KEY_DISPLAY_NAMES[editing.code] || editing.code}
          </kbd>

          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>分类：</span>
          <select
            className="input"
            value={editing.category}
            onChange={(e) => setEditing({ ...editing, category: e.target.value as KeyCategory })}
            style={{ width: 'auto', fontSize: 12, padding: '2px 6px' }}
          >
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {editing.index >= 0 && (
              <button className="btn btn-sm btn-danger" onClick={remove}>
                删除
              </button>
            )}
            <button className="btn btn-sm" onClick={() => setEditing(null)}>
              取消
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={save}
              disabled={!editing.action.trim()}
            >
              {editing.index >= 0 ? '保存' : '绑定'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}