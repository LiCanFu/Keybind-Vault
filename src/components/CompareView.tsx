import { useState, useMemo } from 'react';
import type { GameConfig } from '../types';
import { KEY_DISPLAY_NAMES } from '../types';
import { NavIcons } from '../icons';

interface Props {
  games: GameConfig[];
}

const STATUS_LABEL: Record<string, string> = {
  same: '相同',
  conflict: '冲突',
  'only-a': '仅A',
  'only-b': '仅B',
};

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

      rows.push({ key, label, a: ak?.action, b: bk?.action, status });
    }

    rows.sort((a, b) => {
      const order = { conflict: 0, 'only-a': 1, 'only-b': 1, same: 2 };
      return order[a.status] - order[b.status];
    });

    return rows;
  }, [gameA, gameB]);

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
    <div className="compare-header">
      <h2 className="compare-title">
        <NavIcons.Compare size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        键位对比
      </h2>
      <p className="compare-desc">选择两个游戏配置，对比同一按键的不同功能</p>

      <div className="compare-select-bar">
        <select
          className="input compare-select"
          value={aId}
          onChange={(e) => setAId(e.target.value)}
          aria-label="选择游戏 A"
        >
          <option value="">-- 选择游戏 A --</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <span className="compare-vs">VS</span>
        <select
          className="input compare-select"
          value={bId}
          onChange={(e) => setBId(e.target.value)}
          aria-label="选择游戏 B"
        >
          <option value="">-- 选择游戏 B --</option>
          {games.filter((g) => g.id !== aId).map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {comparison && stats && (
        <div>
          <div className="compare-stats">
            <span>🟢 相同 ({stats.same})</span>
            <span>🔴 冲突 ({stats.conflict})</span>
            <span>🅰️ 仅A ({stats.onlyA})</span>
            <span>🅱️ 仅B ({stats.onlyB})</span>
          </div>

          <div className="compare-list" role="table" aria-label="键位对比结果">
            {comparison.map((row) => (
              <div
                key={row.key}
                className={`compare-row card ${row.status === 'same' ? 'compare-row-same' : ''}`}
                role="row"
              >
                <kbd className="kbd kbd-sm">{row.label}</kbd>
                <span
                  className="flex-1"
                  style={{
                    color: row.status === 'conflict'
                      ? 'var(--danger)'
                      : row.status === 'only-a'
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                  }}
                  role="cell"
                >
                  {row.a || '—'}
                </span>
                <span className="text-secondary">vs</span>
                <span
                  className="flex-1"
                  style={{
                    color: row.status === 'conflict'
                      ? 'var(--danger)'
                      : row.status === 'only-b'
                        ? 'var(--warning)'
                        : 'var(--text-secondary)',
                  }}
                  role="cell"
                >
                  {row.b || '—'}
                </span>
                <span className="compare-status">{STATUS_LABEL[row.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!comparison && gameA && gameB && (
        <p className="empty-state">这两个游戏没有可对比的键位</p>
      )}
    </div>
  );
}