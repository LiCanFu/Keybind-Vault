import { Fragment } from 'react';
import type { Keybinding } from '../types';
import { KEY_DISPLAY_NAMES, KEYBOARD_ROWS } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
  onKeyClick?: (key: string) => void;
}

export default function KeyboardLayout({ keybindings, highlightKeys, onKeyClick }: Props) {
  const kbMap = new Map<string, Keybinding>();
  keybindings.forEach((kb) => kbMap.set(kb.key, kb));

  return (
    <div className="keyboard-container" role="img" aria-label="键盘布局可视化">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((key) => {
            const kb = kbMap.get(key.code);
            const isBound = highlightKeys.has(key.code);
            const catColor = kb ? `var(--cat-${kb.category})` : undefined;
            const CatIcon = kb ? CATEGORY_ICONS_MAP[kb.category] : null;

            return (
              <Fragment key={key.code}>
                {key.ox ? (
                  <div className="keycap-spacer" style={{ width: key.ox * 48 }} />
                ) : null}
                <div
                  className={`keycap ${isBound ? 'keycap-bound' : ''}`}
                  title={kb ? `${KEY_DISPLAY_NAMES[kb.key] || kb.key}: ${kb.action}` : key.label}
                  style={{
                    width: key.w * 48 - 4,
                    height: 48,
                    border: isBound ? `2px solid ${catColor || 'var(--accent)'}` : '1px solid var(--border)',
                    background: isBound ? `${catColor || 'var(--accent)'}22` : 'var(--bg-tertiary)',
                    color: isBound ? catColor || 'var(--accent)' : 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                  role={isBound ? 'button' : undefined}
                  tabIndex={isBound ? 0 : undefined}
                  aria-label={kb ? `${key.label}: ${kb.action}` : key.label}
                  onClick={() => isBound && onKeyClick?.(key.code)}
                  onKeyDown={(e) => {
                    if (isBound && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onKeyClick?.(key.code);
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
    </div>
  );
}