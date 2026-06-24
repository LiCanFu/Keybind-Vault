import { Fragment, useState, useRef, useEffect, useCallback } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { KEY_DISPLAY_NAMES, KEYBOARD_ROWS, CATEGORY_LABELS, CATEGORY_ORDER } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { ActionIcons } from '../icons';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
  onUpdateKeybinding?: (index: number, kb: Keybinding) => void;
  onRemoveKeybinding?: (index: number) => void;
  onAddKeybinding?: (kb: Keybinding) => void;
}

// 弹出编辑框的位置
interface PopoverState {
  keyCode: string;
  x: number;
  y: number;
  bindingIndex: number; // -1 表示新增
}

export default function KeyboardLayout({
  keybindings,
  highlightKeys,
  onUpdateKeybinding,
  onRemoveKeybinding,
  onAddKeybinding,
}: Props) {
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [editAction, setEditAction] = useState('');
  const [editCategory, setEditCategory] = useState<KeyCategory>('other');
  const popoverRef = useRef<HTMLDivElement>(null);
  const actionInputRef = useRef<HTMLInputElement>(null);

  const kbMap = new Map<string, { binding: Keybinding; index: number }>();
  keybindings.forEach((kb, idx) => kbMap.set(kb.key, { binding: kb, index: idx }));

  // 点击外部关闭弹框
  useEffect(() => {
    if (!popover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popover]);

  // 弹框打开时聚焦输入框
  useEffect(() => {
    if (popover) {
      setTimeout(() => actionInputRef.current?.focus(), 50);
    }
  }, [popover]);

  const handleKeyClick = useCallback(
    (keyCode: string, e: React.MouseEvent) => {
      const entry = kbMap.get(keyCode);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const container = (e.currentTarget as HTMLElement).closest('.keyboard-container')?.getBoundingClientRect();

      if (!container) return;

      // 如果点击的是已打开的同一个键，关闭
      if (popover?.keyCode === keyCode) {
        setPopover(null);
        return;
      }

      if (entry) {
        // 已绑定 → 编辑
        setPopover({
          keyCode,
          x: rect.left - container.left + rect.width / 2,
          y: rect.top - container.top,
          bindingIndex: entry.index,
        });
        setEditAction(entry.binding.action);
        setEditCategory(entry.binding.category);
      } else if (onAddKeybinding) {
        // 未绑定 → 新增
        setPopover({
          keyCode,
          x: rect.left - container.left + rect.width / 2,
          y: rect.top - container.top,
          bindingIndex: -1,
        });
        setEditAction('');
        setEditCategory('other');
      }
    },
    [kbMap, popover, onAddKeybinding],
  );

  const handleSave = () => {
    if (!popover || !editAction.trim()) return;
    const kb: Keybinding = { key: popover.keyCode, action: editAction.trim(), category: editCategory };
    if (popover.bindingIndex >= 0) {
      onUpdateKeybinding?.(popover.bindingIndex, kb);
    } else {
      onAddKeybinding?.(kb);
    }
    setPopover(null);
  };

  const handleDelete = () => {
    if (!popover || popover.bindingIndex < 0) return;
    if (confirm('删除这个键位？')) {
      onRemoveKeybinding?.(popover.bindingIndex);
      setPopover(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setPopover(null);
  };

  return (
    <div className="keyboard-container" role="img" aria-label="键盘布局可视化（点击键位可直接编辑）">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((key) => {
            const entry = kbMap.get(key.code);
            const kb = entry?.binding;
            const isBound = highlightKeys.has(key.code);
            const catColor = kb ? `var(--cat-${kb.category})` : undefined;
            const CatIcon = kb ? CATEGORY_ICONS_MAP[kb.category] : null;
            const isPopoverOpen = popover?.keyCode === key.code;

            return (
              <Fragment key={key.code}>
                {key.ox ? (
                  <div className="keycap-spacer" style={{ width: key.ox * 48 }} />
                ) : null}
                <div
                  className={`keycap ${isBound ? 'keycap-bound' : ''}`}
                  style={{
                    width: key.w * 48 - 4,
                    height: 48,
                    border: isPopoverOpen
                      ? '2px solid var(--accent-hover)'
                      : isBound
                        ? `2px solid ${catColor || 'var(--accent)'}`
                        : '1px solid var(--border)',
                    background: isPopoverOpen
                      ? 'var(--bg-tertiary)'
                      : isBound
                        ? `${catColor || 'var(--accent)'}22`
                        : 'var(--bg-tertiary)',
                    color: isBound ? catColor || 'var(--accent)' : 'var(--text-secondary)',
                    flexShrink: 0,
                    position: 'relative',
                    cursor: isBound || onAddKeybinding ? 'pointer' : 'default',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={kb ? `${key.label}: ${kb.action}（点击编辑）` : `${key.label}（点击绑定）`}
                  onClick={(e) => handleKeyClick(key.code, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleKeyClick(key.code, e as unknown as React.MouseEvent);
                    }
                  }}
                >
                  {isBound && CatIcon && (
                    <span className="keycap-icon">
                      <CatIcon size={12} />
                    </span>
                  )}
                  <span className="keycap-label">{key.label}</span>
                  {isBound && kb && (
                    <span className="keycap-action" style={{ color: catColor || 'var(--accent)' }}>
                      {kb.action.length > 6 ? kb.action.slice(0, 6) + '…' : kb.action}
                    </span>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      ))}

      {/* 弹出编辑框 */}
      {popover && (
        <div
          ref={popoverRef}
          className="card"
          style={{
            position: 'absolute',
            left: popover.x,
            top: popover.y - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 50,
            padding: 12,
            minWidth: 260,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <kbd className="kbd kbd-sm">{KEY_DISPLAY_NAMES[popover.keyCode] || popover.keyCode}</kbd>
            {popover.bindingIndex >= 0 ? ' — 编辑键位' : ' — 绑定新键位'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label className="editor-label">动作描述</label>
              <input
                ref={actionInputRef}
                type="text"
                className="input"
                placeholder="如 前进, 换弹, 技能Q..."
                value={editAction}
                onChange={(e) => setEditAction(e.target.value)}
              />
            </div>

            <div>
              <label className="editor-label">分类</label>
              <select
                className="input"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as KeyCategory)}
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {popover.bindingIndex >= 0 && (
                <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                  <ActionIcons.Trash size={12} /> 删除
                </button>
              )}
              <button className="btn btn-sm" onClick={() => setPopover(null)}>
                <ActionIcons.X size={12} /> 取消
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={!editAction.trim()}>
                <ActionIcons.Save size={12} /> {popover.bindingIndex >= 0 ? '保存' : '绑定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}