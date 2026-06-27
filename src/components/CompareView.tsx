import { useState, useMemo } from 'react';
import type { GameConfig } from '@/types';
import { KEY_DISPLAY_NAMES } from '@/types';
import { NavIcons } from '@/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Props {
  games: GameConfig[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; color: string }> = {
  same:      { label: '相同', variant: 'secondary',   color: 'text-muted-foreground' },
  conflict:  { label: '冲突', variant: 'destructive', color: 'text-destructive' },
  'only-a':  { label: '仅A', variant: 'outline',      color: 'text-primary' },
  'only-b':  { label: '仅B', variant: 'outline',      color: 'text-accent-foreground' },
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
    <div className="mx-auto max-w-[900px] space-y-5 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <NavIcons.Compare className="size-5" />
          键位对比
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">选择两个游戏配置，对比同一按键的不同功能</p>
      </div>

      {/* 选择游戏 */}
      <div className="flex items-center gap-3">
        <Select value={aId} onValueChange={setAId}>
          <SelectTrigger className="w-[200px]" aria-label="选择游戏 A">
            <SelectValue placeholder="选择游戏 A" />
          </SelectTrigger>
          <SelectContent>
            {games.filter((g) => g.id !== bId).map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="outline" className="px-3 py-1 text-xs font-bold">VS</Badge>

        <Select value={bId} onValueChange={setBId}>
          <SelectTrigger className="w-[200px]" aria-label="选择游戏 B">
            <SelectValue placeholder="选择游戏 B" />
          </SelectTrigger>
          <SelectContent>
            {games.filter((g) => g.id !== aId).map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 统计 */}
      {comparison && stats && (
        <>
          <div className="flex gap-4">
            <Badge variant="secondary" className="gap-1.5">
              🟢 相同 <span className="font-mono">{stats.same}</span>
            </Badge>
            <Badge variant="destructive" className="gap-1.5">
              🔴 冲突 <span className="font-mono">{stats.conflict}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              A 仅A <span className="font-mono">{stats.onlyA}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-accent-foreground">
              B 仅B <span className="font-mono">{stats.onlyB}</span>
            </Badge>
          </div>

          <Separator />

          {/* 对比列表 */}
          <div className="flex flex-col gap-1.5" role="grid" aria-label="键位对比结果">
            {/* 表头 */}
            <div role="row" className="flex items-center gap-3 px-4 py-1">
              <div role="columnheader" className="shrink-0 w-16 text-xs font-medium text-muted-foreground">按键</div>
              <div role="columnheader" className="flex-1 text-xs font-medium text-muted-foreground">{gameA.name}</div>
              <div role="columnheader" className="shrink-0 w-8" />
              <div role="columnheader" className="flex-1 text-xs font-medium text-muted-foreground">{gameB.name}</div>
              <div role="columnheader" className="shrink-0 w-10 text-xs font-medium text-muted-foreground">状态</div>
            </div>
            {comparison.map((row) => {
              const cfg = STATUS_CONFIG[row.status];
              return (
                <Card key={row.key} className={`py-2 ${row.status === 'same' ? 'opacity-60' : ''}`} role="row">
                  <CardContent className="flex items-center gap-3 px-4">
                    <Badge variant="outline" className="shrink-0 font-mono" role="cell">{row.label}</Badge>
                    <span className={`flex-1 text-sm ${row.status === 'conflict' ? 'text-destructive' : row.status === 'only-a' ? 'text-primary' : 'text-muted-foreground'}`} role="cell">
                      {row.a || '—'}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">vs</span>
                    <span className={`flex-1 text-sm ${row.status === 'conflict' ? 'text-destructive' : row.status === 'only-b' ? 'text-accent-foreground' : 'text-muted-foreground'}`} role="cell">
                      {row.b || '—'}
                    </span>
                    <Badge variant={cfg.variant} className="shrink-0 text-xs" role="cell">{cfg.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {!comparison && gameA && gameB && (
        <p className="py-8 text-center text-sm text-muted-foreground">这两个游戏没有可对比的键位</p>
      )}

      {comparison && comparison.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">这两个游戏没有可对比的键位</p>
      )}
    </div>
  );
}
