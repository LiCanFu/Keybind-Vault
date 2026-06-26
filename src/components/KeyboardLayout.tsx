import { Fragment, useState, useRef, useEffect } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { KEY_DISPLAY_NAMES, KEYBOARD_ROWS, CATEGORY_LABELS, CATEGORY_ORDER } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { inferCategory } from '../utils/categoryInfer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  categoryManual: boolean; // 用户是否手动改过分类
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
  const bottomBarRef = useRef<HTMLDivElement>(null);

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
        categoryManual: false,
      });
    } else if (onAddKeybinding) {
      setEditing({ code, index: -1, action: '', category: 'other', categoryManual: false });
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
                    height: isBound ? 56 : 48,
                    border: isEditing
                      ? '2px solid var(--accent)'
                      : isBound
                        ? `2px solid ${catColor || 'var(--accent)'}`
                        : '1px solid var(--border)',
                    background: isEditing
                      ? 'color-mix(in oklch, var(--accent) 15%, transparent)'
                      : isBound
                        ? `color-mix(in oklch, ${catColor || 'var(--accent)'} 15%, transparent)`
                        : 'var(--muted)',
                    color: isBound ? catColor || 'var(--accent)' : 'var(--muted-foreground)',
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
                        <>
                          <span className="keycap-action" style={{ color: catColor || 'var(--accent)' }}>
                            {kb.action.length > 6 ? kb.action.slice(0, 6) + '…' : kb.action}
                          </span>
                          {/* 分类 — 原生 select，直接点击切换 */}
                          {onUpdateKeybinding && (
                            <select
                              value={kb.category}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newCat = e.target.value as KeyCategory;
                                onUpdateKeybinding(entry!.index, { ...kb, category: newCat });
                              }}
                              onKeyDown={(e) => e.stopPropagation()}
                              className="keycap-category"
                              style={{
                                fontSize: 8,
                                padding: '0 1px',
                                border: 'none',
                                borderRadius: 3,
                                background: 'transparent',
                                color: catColor || 'var(--accent)',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'center',
                                lineHeight: 1.2,
                              }}
                              aria-label={`${kb.action} 的分类`}
                            >
                              {CATEGORY_ORDER.map((cat) => (
                                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                              ))}
                            </select>
                          )}
                        </>
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
                        const updates: Partial<EditingKey> = { action: newAction };
                        // 仅在用户未手动改过分类时自动推断
                        if (!editing.categoryManual) {
                          const inferred = inferCategory(newAction);
                          if (inferred) updates.category = inferred;
                        }
                        setEditing({ ...editing, ...updates });
                      }}
                      placeholder="输入动作..."
                      style={{
                        width: '100%',
                        fontSize: 10,
                        padding: '2px 3px',
                        textAlign: 'center',
                        background: 'var(--background)',
                        border: '1px solid var(--accent)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') save();
                        if (e.key === 'Escape') setEditing(null);
                        e.stopPropagation();
                      }}
                      onBlur={(e) => {
                        // 如果焦点转移到底部操作栏（分类 select 等），不立即保存
                        const rt = e.relatedTarget as HTMLElement | null;
                        if (rt && bottomBarRef.current?.contains(rt)) return;
                        // relatedTarget 为 null 时用延时兜底（某些浏览器 select 不设 relatedTarget）
                        setTimeout(() => {
                          if (bottomBarRef.current?.contains(document.activeElement)) return;
                          save();
                        }, 0);
                      }}
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
          ref={bottomBarRef}
          className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3"
          style={{ marginTop: 8 }}
        >
          <Badge variant="outline" className="shrink-0 font-mono">
            {KEY_DISPLAY_NAMES[editing.code] || editing.code}
          </Badge>

          <span className="text-xs text-muted-foreground">分类：</span>
          <Select
            value={editing.category}
            onValueChange={(v) => setEditing({ ...editing, category: v as KeyCategory, categoryManual: true })}
          >
            <SelectTrigger className="h-7 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ORDER.map((cat) => {
                const CatItemIcon = CATEGORY_ICONS_MAP[cat];
                return (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-1.5">
                      <CatItemIcon className="size-3" />
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-1.5">
            {editing.index >= 0 && (
              <Button size="sm" variant="destructive" onClick={remove}>
                删除
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
              取消
            </Button>
            <Button size="sm" onClick={save} disabled={!editing.action.trim()}>
              {editing.index >= 0 ? '保存' : '绑定'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}