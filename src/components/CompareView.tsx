import { useState, useMemo } from 'react';
import type { GameConfig } from '../types';
import { KEY_DISPLAY_NAMES } from '../types';

interface Props {
  games: GameConfig[];
}

export default function CompareView({ games }: Props) {
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');

  const gameA = games.find((g) => g.id === aId);
  const gameB = games.find((g) => g.id === bId);

  const comparison = useMemo(() => {
    if (!gameA || !gameB) return null;
    const aKeys = new Map(gameA.keybindings.map((k) => [k.key, k]));
    const bKeys = new Map(gameB.keybindings.map((k) => [k.key, k]));

    const allKeys = new Set([...aKeys.keys(), ...bKeys.keys()]);

    const rows: {
      key: string;
      label: string;
      a?: string;
      b?: string;
      status: 'same' | 'conflict' | 'only-a' | 'only-b';
    }[] = [];

    for (const key of allKeys) {
      const ak = aKeys.get(key);
      const bk = bKeys.get(key);
      const label = KEY_DISPLAY_NAMES[key] || key;

      let status: 'same' | 'conflict' | 'only-a' | 'only-b';
      if (ak && bk && ak.action === bk.action) status = 'same';
      else if (ak && bk) status = 'conflict';
      else if (ak) status = 'only-a';
      else status = 'only-b';

      rows.push({
        key,
        label,
        a: ak?.action,
        b: bk?.action,
        status,
      });
    }

    // 按冲突优先排序
    rows.sort((a, b) => {
      const order = { conflict: 0, 'only-a': 1, 'only-b': 1, same: 2 };
      return order[a.status] - order[b.status];
    });

    return rows;
  }, [gameA, gameB]);

  // 统计各状态数量（memo 避免每次渲染重新 filter）
  const stats = useMemo(() => {
    if (!comparison) return null;
    return {
      same: comparison.filter((r) => r.status === 'same').length,
      conflict: comparison.filter((r) => r.status === 'conflict').length,
      onlyA: comparison.filter((r) => r.status === 'only-a').length,
      onlyB: comparison.filter((r) => r.status === 'only-b').length,
    };
  }, [comparison]);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>🔍 键位对比</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 13 }}>
        选择两个游戏配置，对比同一按键的不同功能
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <select
          className="input"
          value={aId}
          onChange={(e) => setAId(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">-- 选择游戏 A --</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>VS</span>
        <select
          className="input"
          value={bId}
          onChange={(e) => setBId(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">-- 选择游戏 B --</option>
          {games.filter((g) => g.id !== aId).map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {comparison && stats && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, fontSize: 12 }}>
            <span>🟢 相同 ({stats.same})</span>
            <span>🔴 冲突 ({stats.conflict})</span>
            <span>🅰️ 仅A ({stats.onlyA})</span>
            <span>🅱️ 仅B ({stats.onlyB})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {comparison.map((row) => (
              <div
                key={row.key}
                className="card"
                style={{
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  opacity: row.status === 'same' ? 0.5 : 1,
                }}
              >
                <kbd
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '1px 8px',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: 60,
                    textAlign: 'center',
                  }}
                >
                  {row.label}
                </kbd>
                <span
                  style={{
                    flex: 1,
                    color:
                      row.status === 'conflict'
                        ? 'var(--danger)'
                        : row.status === 'only-a'
                          ? 'var(--accent)'
                          : 'var(--text-secondary)',
                  }}
                >
                  {row.a || '—'}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>vs</span>
                <span
                  style={{
                    flex: 1,
                    color:
                      row.status === 'conflict'
                        ? 'var(--danger)'
                        : row.status === 'only-b'
                          ? 'var(--warning)'
                          : 'var(--text-secondary)',
                  }}
                >
                  {row.b || '—'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 50, textAlign: 'right' }}>
                  {row.status === 'same'
                    ? '相同'
                    : row.status === 'conflict'
                      ? '冲突'
                      : row.status === 'only-a'
                        ? '仅A'
                        : '仅B'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!comparison && gameA && gameB && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>
          这两个游戏没有可对比的键位
        </p>
      )}
    </div>
  );
}