import { Fragment } from 'react';
import type { Keybinding } from '../types';
import { KEY_DISPLAY_NAMES, KEYBOARD_ROWS, CATEGORY_ICONS } from '../types';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
}

export default function KeyboardLayout({ keybindings, highlightKeys }: Props) {
  const kbMap = new Map<string, Keybinding>();
  keybindings.forEach((kb) => kbMap.set(kb.key, kb));

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: '16px 12px',
        marginBottom: 20,
        overflowX: 'auto',
      }}
    >
      {KEYBOARD_ROWS.map((row, ri) => (
        <div
          key={ri}
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 4,
            justifyContent: 'flex-start',
          }}
        >
          {row.map((key) => {
            const kb = kbMap.get(key.code);
            const isBound = highlightKeys.has(key.code);
            const catColor = kb
              ? `var(--cat-${kb.category})`
              : undefined;

            return (
              <Fragment key={key.code}>
                {key.ox ? (
                  <div style={{ width: key.ox * 48 }} />
                ) : null}
                <div
                  title={kb ? `${KEY_DISPLAY_NAMES[kb.key] || kb.key}: ${kb.action}` : key.label}
                  style={{
                    width: key.w * 48 - 4,
                    height: 48,
                    borderRadius: 6,
                    border: isBound ? `2px solid ${catColor || 'var(--accent)'}` : '1px solid var(--border)',
                    background: isBound ? `${catColor || 'var(--accent)'}22` : 'var(--bg-tertiary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: isBound ? 600 : 400,
                    color: isBound ? catColor || 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'default',
                    flexShrink: 0,
                    overflow: 'hidden',
                    transition: 'all 0.15s',
                  }}
                >
                  {isBound && kb && (
                    <span style={{ fontSize: 12, marginBottom: -2 }}>
                      {CATEGORY_ICONS[kb.category]}
                    </span>
                  )}
                  <span style={{ lineHeight: 1.2, textAlign: 'center' }}>
                    {key.label}
                  </span>
                  {isBound && kb && (
                    <span
                      style={{
                        fontSize: 9,
                        color: catColor || 'var(--accent)',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.1,
                      }}
                    >
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