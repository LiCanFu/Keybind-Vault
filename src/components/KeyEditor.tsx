import { useState, useEffect } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { CATEGORY_LABELS, KEY_DISPLAY_NAMES, CATEGORY_ORDER } from '../types';
import { ActionIcons } from '../icons';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && key && action) handleSave();
    if (e.key === 'Escape' && onCancel) onCancel();
  };

  return (
    <div
      className={`card ${isEdit ? 'editor-inline' : 'editor-container'}`}
      onKeyDown={handleKeyDown}
    >
      {!isEdit && (
        <h3 className="editor-title"><ActionIcons.Plus size={16} /> 添加新键位</h3>
      )}

      <div className="editor-fields">
        {/* 按键 */}
        <div style={{ flex: isEdit ? '0 0 120px' : '0 0 auto' }}>
          {!isEdit && <label className="editor-label">按键</label>}
          <input
            type="text"
            className={`input input-mono ${isEdit ? '' : ''}`}
            placeholder="如 KeyQ, Mouse0..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onFocus={() => setShowQuick(true)}
            style={{ fontSize: isEdit ? 12 : 13 }}
          />
        </div>

        {/* 动作 */}
        <div style={{ flex: isEdit ? 1 : 2, minWidth: 140 }}>
          {!isEdit && <label className="editor-label">动作描述</label>}
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
          {!isEdit && <label className="editor-label">分类</label>}
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as KeyCategory)}
            style={{ fontSize: isEdit ? 12 : 13 }}
          >
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!key || !action}>
          {isEdit ? <><ActionIcons.Save size={12} /> 保存</> : <><ActionIcons.Plus size={12} /> 添加</>}
        </button>

        {isEdit && onCancel && (
          <button className="btn btn-sm" onClick={onCancel}>
            <ActionIcons.X size={12} /> 取消
          </button>
        )}
      </div>

      {/* 快速选键面板 */}
      {showQuick && (
        <div className="quick-keys-bar">
          <p className="quick-keys-hint">快速选择按键（点击填入）：</p>
          <div className="quick-keys-grid">
            {QUICK_KEYS.map((k) => (
              <button
                key={k}
                className={`btn btn-sm quick-key ${key === k ? 'btn-primary' : ''}`}
                onClick={() => { setKey(k); setShowQuick(false); }}
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