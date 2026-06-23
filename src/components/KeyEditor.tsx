import { useState, useEffect } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { CATEGORY_LABELS, KEY_DISPLAY_NAMES } from '../types';

interface Props {
  onSave: (kb: Keybinding) => void;
  onCancel?: () => void;
  initial?: Keybinding;
}

const QUICK_KEYS = [
  'KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP',
  'KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL',
  'KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM',
  'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0',
  'ShiftLeft','ShiftRight','ControlLeft','ControlRight','AltLeft','AltRight',
  'Tab','CapsLock','Space','Enter','Escape','Backspace','Delete',
  'Insert','Home','End','PageUp','PageDown',
  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'Mouse0','Mouse1','Mouse2','Mouse3','Mouse4',
  'Backquote','Minus','Equal','BracketLeft','BracketRight','Backslash',
  'Semicolon','Quote','Comma','Period','Slash','MetaLeft',
];

const CATEGORIES: KeyCategory[] = [
  'movement','combat','abilities','items','communication','ui','other',
];

export default function KeyEditor({ onSave, onCancel, initial }: Props) {
  const [key, setKey] = useState(initial?.key || '');
  const [action, setAction] = useState(initial?.action || '');
  const [category, setCategory] = useState<KeyCategory>(initial?.category || 'other');
  const [showQuick, setShowQuick] = useState(false);

  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setKey(initial.key);
      setAction(initial.action);
      setCategory(initial.category);
    }
  }, [initial]);

  const handleSave = () => {
    if (!key || !action) return;
    onSave({ key, action, category });
    if (!isEdit) {
      setKey('');
      setAction('');
      setCategory('other');
      setShowQuick(false);
    }
  };

  const containerStyle = isEdit
    ? {
        padding: '8px 12px',
        display: 'flex' as const,
        alignItems: 'center' as const,
        gap: 8,
        flexWrap: 'wrap' as const,
      }
    : {
        marginTop: 16,
        padding: 16,
      };

  return (
    <div className="card" style={containerStyle}>
      {!isEdit && (
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>➕ 添加新键位</h3>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', flex: 1 }}>
        {/* 按键 */}
        <div style={{ flex: isEdit ? '0 0 120px' : '0 0 auto', minWidth: 120 }}>
          {!isEdit && (
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              按键
            </label>
          )}
          <input
            type="text"
            className="input"
            placeholder="如 KeyQ, Mouse0..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onFocus={() => setShowQuick(true)}
            style={{ fontFamily: 'monospace', fontSize: isEdit ? 12 : 13 }}
          />
        </div>

        {/* 动作 */}
        <div style={{ flex: isEdit ? 1 : 2, minWidth: 140 }}>
          {!isEdit && (
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              动作描述
            </label>
          )}
          <input
            type="text"
            className="input"
            placeholder="如 前进, 换弹, 技能Q..."
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={{ fontSize: isEdit ? 12 : 13 }}
          />
        </div>

        {/* 分类 */}
        <div style={{ flex: '0 0 auto', minWidth: 90 }}>
          {!isEdit && (
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              分类
            </label>
          )}
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as KeyCategory)}
            style={{ fontSize: isEdit ? 12 : 13 }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!key || !action}>
          {isEdit ? '💾 保存' : '添加'}
        </button>

        {isEdit && onCancel && (
          <button className="btn btn-sm" onClick={onCancel}>
            取消
          </button>
        )}
      </div>

      {/* 快速选键面板 */}
      {showQuick && (
        <div style={{ marginTop: 12, width: '100%' }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
            快速选择按键（点击填入）：
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {QUICK_KEYS.map((k) => (
              <button
                key={k}
                className={`btn btn-sm ${key === k ? 'btn-primary' : ''}`}
                onClick={() => {
                  setKey(k);
                  setShowQuick(false);
                }}
                style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 6px' }}
                title={KEY_DISPLAY_NAMES[k] || k}
              >
                {KEY_DISPLAY_NAMES[k] || k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}