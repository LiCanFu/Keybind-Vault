import { Fragment } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { KEY_DISPLAY_NAMES, KEYBOARD_ROWS, CATEGORY_LABELS, CATEGORY_ORDER } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { useKeybindingEditor } from '@/hooks/useKeybindingEditor';
import BottomEditBar from './BottomEditBar';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
  onUpdateKeybinding?: (index: number, kb: Keybinding) => void;
  onRemoveKeybinding?: (index: number) => void;
  onAddKeybinding?: (kb: Keybinding) => void;
}

export default function KeyboardLayout({
  keybindings,
  highlightKeys,
  onUpdateKeybinding,
  onRemoveKeybinding,
  onAddKeybinding,
}: Props) {
  const {
    editing,
    setEditing,
    inputRef,
    bottomBarRef,
    kbMap,
    handleClick,
    save,
    remove,
    updateAction,
    updateCategory,
    handleBlur,
    handleKeyDown,
  } = useKeybindingEditor({ keybindings, onUpdateKeybinding, onRemoveKeybinding, onAddKeybinding });

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
                      className="rounded text-foreground outline-none transition-colors focus:border-ring"
                      value={editing.action}
                      onChange={(e) => updateAction(e.target.value)}
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
                      onKeyDown={handleKeyDown as (e: React.KeyboardEvent<HTMLInputElement>) => void}
                      onBlur={handleBlur as (e: React.FocusEvent<HTMLInputElement>) => void}
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
        <BottomEditBar
          code={editing.code}
          displayKey={KEY_DISPLAY_NAMES[editing.code] || editing.code}
          index={editing.index}
          category={editing.category}
          actionTrimmed={!!editing.action.trim()}
          onCategoryChange={updateCategory}
          onSave={save}
          onRemove={remove}
          onCancel={() => setEditing(null)}
          bottomBarRef={bottomBarRef}
        />
      )}
    </div>
  );
}
