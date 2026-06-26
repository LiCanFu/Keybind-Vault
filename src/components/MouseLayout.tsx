import { useState, useRef, useEffect } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_ORDER, KEY_DISPLAY_NAMES } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { inferCategory } from '../utils/categoryInfer';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
  onUpdateKeybinding?: (index: number, kb: Keybinding) => void;
  onRemoveKeybinding?: (index: number) => void;
  onAddKeybinding?: (kb: Keybinding) => void;
}

// 鼠标按钮区域定义
interface MouseArea {
  code: string;
  label: string;
  d: string;       // SVG path
  textX: number;
  textY: number;
}

const MOUSE_AREAS: MouseArea[] = [
  // 左键
  { code: 'Mouse0', label: '左键', d: 'M 40 30 Q 40 10 75 10 L 95 10 L 95 65 L 40 65 Z', textX: 62, textY: 40 },
  // 右键
  { code: 'Mouse1', label: '右键', d: 'M 105 10 L 140 10 Q 160 10 160 30 L 160 65 L 105 65 Z', textX: 130, textY: 40 },
  // 中键/滚轮
  { code: 'Mouse2', label: '中键', d: 'M 95 14 L 105 14 L 105 55 L 95 55 Z', textX: 100, textY: 38 },
  // 侧键1
  { code: 'Mouse3', label: '侧键1', d: 'M 28 35 L 38 35 L 38 52 L 28 52 Z', textX: 33, textY: 46 },
  // 侧键2
  { code: 'Mouse4', label: '侧键2', d: 'M 28 55 L 38 55 L 38 72 L 28 72 Z', textX: 33, textY: 66 },
];

// 鼠标外壳轮廓
const MOUSE_OUTLINE = 'M 35 5 Q 35 0 50 0 L 150 0 Q 165 0 165 15 L 165 90 Q 165 120 140 130 L 100 150 Q 100 155 90 155 Q 80 155 80 150 L 40 130 Q 15 120 15 90 L 15 15 Q 15 0 35 0 Z';

interface EditingKey {
  code: string;
  index: number;
  action: string;
  category: KeyCategory;
  categoryManual: boolean;
}

export default function MouseLayout({
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

  useEffect(() => {
    if (editing) {
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 30);
    }
  }, [editing]);

  const handleClick = (code: string) => {
    if (editing?.code === code) { setEditing(null); return; }
    const entry = kbMap.get(code);
    if (entry) {
      setEditing({ code, index: entry.index, action: entry.binding.action, category: entry.binding.category, categoryManual: false });
    } else if (onAddKeybinding) {
      setEditing({ code, index: -1, action: '', category: 'combat', categoryManual: false });
    }
  };

  const save = () => {
    if (!editing || !editing.action.trim()) { setEditing(null); return; }
    const kb: Keybinding = { key: editing.code, action: editing.action.trim(), category: editing.category };
    if (editing.index >= 0) onUpdateKeybinding?.(editing.index, kb);
    else onAddKeybinding?.(kb);
    setEditing(null);
  };

  const remove = () => {
    if (!editing || editing.index < 0) return;
    if (confirm('删除这个键位？')) { onRemoveKeybinding?.(editing.index); setEditing(null); }
  };

  return (
    <div className="mouse-container" role="img" aria-label="鼠标布局可视化（点击按钮可直接编辑）">
      <svg viewBox="0 0 180 165" width={180} height={165} style={{ display: 'block', margin: '0 auto' }}>
        {/* 鼠标外壳 */}
        <path d={MOUSE_OUTLINE} fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="2" />

        {/* 按钮区域 */}
        {MOUSE_AREAS.map((area) => {
          const entry = kbMap.get(area.code);
          const kb = entry?.binding;
          const isBound = highlightKeys.has(area.code);
          const catColor = kb ? `var(--cat-${kb.category})` : undefined;
          const isEditing = editing?.code === area.code;

          return (
            <g
              key={area.code}
              style={{ cursor: isBound || onAddKeybinding ? 'pointer' : 'default' }}
              onClick={() => handleClick(area.code)}
            >
              <path
                d={area.d}
                fill={
                  isEditing
                    ? 'var(--accent)33'
                    : isBound
                      ? `${catColor || 'var(--accent)'}33`
                      : 'var(--bg-secondary)'
                }
                stroke={
                  isEditing
                    ? 'var(--accent-hover)'
                    : isBound
                      ? catColor || 'var(--accent)'
                      : 'var(--border)'
                }
                strokeWidth={isEditing || isBound ? 2 : 1}
                rx={3}
              />
              {!isEditing ? (
                <>
                  <text
                    x={area.textX}
                    y={area.textY - 4}
                    textAnchor="middle"
                    fill={isBound ? catColor || 'var(--accent)' : 'var(--text-secondary)'}
                    fontSize={9}
                    fontWeight="bold"
                  >
                    {area.label}
                  </text>
                  {isBound && kb && (
                    <text
                      x={area.textX}
                      y={area.textY + 8}
                      textAnchor="middle"
                      fill={catColor || 'var(--accent)'}
                      fontSize={8}
                    >
                      {kb.action.length > 4 ? kb.action.slice(0, 4) + '…' : kb.action}
                    </text>
                  )}
                  {!isBound && onAddKeybinding && (
                    <text x={area.textX} y={area.textY + 8} textAnchor="middle" fill="var(--text-secondary)" fontSize={10} opacity={0.3}>+</text>
                  )}
                </>
              ) : (
                <foreignObject x={area.textX - 30} y={area.textY - 10} width={60} height={20}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={editing.action}
                    onChange={(e) => {
                      const v = e.target.value;
                      const updates: Partial<EditingKey> = { action: v };
                      if (!editing.categoryManual) {
                        const inferred = inferCategory(v);
                        if (inferred) updates.category = inferred;
                      }
                      setEditing({ ...editing, ...updates });
                    }}
                    placeholder="动作..."
                    style={{ width: '100%', fontSize: 9, padding: '1px 2px', textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--accent)', borderRadius: 2, color: 'var(--text-primary)' }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') save();
                      if (e.key === 'Escape') setEditing(null);
                      e.stopPropagation();
                    }}
                    onBlur={(e) => {
                      const rt = e.relatedTarget as HTMLElement | null;
                      if (rt && bottomBarRef.current?.contains(rt)) return;
                      setTimeout(() => {
                        if (bottomBarRef.current?.contains(document.activeElement)) return;
                        save();
                      }, 0);
                    }}
                  />
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* 滚轮装饰线 */}
        <line x1={100} y1={20} x2={100} y2={48} stroke="var(--border)" strokeWidth={1} strokeDasharray="2,2" />
      </svg>

      {/* 底部操作栏 */}
      {editing && (
        <div
          ref={bottomBarRef}
          className="card"
          style={{ marginTop: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
        >
          <kbd className="kbd kbd-sm" style={{ minWidth: 40, fontSize: 11 }}>
            {KEY_DISPLAY_NAMES[editing.code] || editing.code}
          </kbd>

          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>分类：</span>
          <select
            className="input"
            value={editing.category}
            onChange={(e) => setEditing({ ...editing, category: e.target.value as KeyCategory, categoryManual: true })}
            style={{ width: 'auto', fontSize: 12, padding: '2px 6px' }}
          >
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {editing.index >= 0 && (
              <button className="btn btn-sm btn-danger" onClick={remove}>删除</button>
            )}
            <button className="btn btn-sm" onClick={() => setEditing(null)}>取消</button>
            <button className="btn btn-sm btn-primary" onClick={save} disabled={!editing.action.trim()}>
              {editing.index >= 0 ? '保存' : '绑定'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
