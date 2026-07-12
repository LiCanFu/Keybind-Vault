import { useState, useMemo, useRef, useEffect } from 'react';
import type { GameConfig, Keybinding, KeyCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, KEY_DISPLAY_NAMES } from '@/types';
import { CATEGORY_ICONS_MAP, ActionIcons } from '@/icons';
import { inferCategory } from '@/utils/categoryInfer';
import KeyboardLayout from './KeyboardLayout';
import MouseLayout from './MouseLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

interface Props {
  game: GameConfig;
  onBack: () => void;
  onUpdateName: (id: string, name: string) => void;
  onAddKeybinding: (gameId: string, kb: Keybinding) => void;
  onUpdateKeybinding: (gameId: string, index: number, kb: Keybinding) => void;
  onRemoveKeybinding: (gameId: string, index: number) => void;
}

type IndexedKeybinding = Keybinding & { origIdx: number };

// ============================================================
// 可编辑单元格
// ============================================================
function EditableCell({
  value,
  className,
  onSave,
}: {
  value: string;
  className?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => { setDraft(value); setEditing(true); };

  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);

  const commit = () => { if (draft !== value) onSave(draft); setEditing(false); };

  if (!editing) {
    return (
      <span
        className={`cursor-text border-b border-dashed border-transparent transition-colors hover:border-primary ${className ?? ''}`}
        onClick={startEditing}
        title="点击编辑"
      >
        {value}
      </span>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      className="h-7 py-0.5 text-sm"
    />
  );
}

// ============================================================
// 主组件
// ============================================================
export default function GameDetail({
  game,
  onBack,
  onUpdateName,
  onAddKeybinding,
  onUpdateKeybinding,
  onRemoveKeybinding,
}: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<KeyCategory | 'all'>('all');

  // 按键编辑 Dialog
  const [keyEditOpen, setKeyEditOpen] = useState(false);
  const [keyEditOrigIdx, setKeyEditOrigIdx] = useState(-1);
  const [keyEditOrigKey, setKeyEditOrigKey] = useState('');
  const [keyEditNewKey, setKeyEditNewKey] = useState('');

  // 删除确认 Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ idx: number; action: string } | null>(null);

  const openKeyEdit = (origIdx: number, currentKey: string) => {
    setKeyEditOrigIdx(origIdx);
    setKeyEditOrigKey(currentKey);
    setKeyEditNewKey(currentKey);
    setKeyEditOpen(true);
  };

  const commitKeyEdit = () => {
    if (keyEditNewKey && keyEditNewKey !== keyEditOrigKey) {
      const kb = game.keybindings[keyEditOrigIdx];
      if (kb) onUpdateKeybinding(game.id, keyEditOrigIdx, { ...kb, key: keyEditNewKey });
    }
    setKeyEditOpen(false);
  };

  const openDelete = (idx: number, action: string) => {
    setDeleteTarget({ idx, action });
    setDeleteOpen(true);
  };

  const commitDelete = () => {
    if (deleteTarget) onRemoveKeybinding(game.id, deleteTarget.idx);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const filtered: IndexedKeybinding[] = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return game.keybindings
      .map((kb, idx) => ({ ...kb, origIdx: idx }))
      .filter((kb) => {
        const matchSearch =
          !search ||
          kb.action.toLowerCase().includes(lowerSearch) ||
          (KEY_DISPLAY_NAMES[kb.key] || kb.key).toLowerCase().includes(lowerSearch);
        const matchCat = filterCategory === 'all' || kb.category === filterCategory;
        return matchSearch && matchCat;
      });
  }, [game.keybindings, search, filterCategory]);

  const grouped = useMemo(() => {
    const acc: Record<string, IndexedKeybinding[]> = {};
    for (const kb of filtered) (acc[kb.category] ??= []).push(kb);
    return acc;
  }, [filtered]);

  const boundKeys = useMemo(() => new Set(game.keybindings.map((k) => k.key)), [game.keybindings]);

  return (
    <div className="mx-auto max-w-[1000px] space-y-5 p-6">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} aria-label="返回游戏列表">
          <ActionIcons.ArrowLeft className="size-4" /> 返回
        </Button>
        <Input
          value={game.name}
          onChange={(e) => onUpdateName(game.id, e.target.value)}
          className="h-9 max-w-xs text-lg font-semibold"
          aria-label="游戏名称"
        />
        <Badge variant="secondary">{game.genre}</Badge>
        <span className="text-sm text-muted-foreground">{game.keybindings.length} 个键位</span>
      </div>

      <Separator />

      {/* 键盘布局 */}
      <KeyboardLayout
        keybindings={game.keybindings}
        highlightKeys={boundKeys}
        onUpdateKeybinding={(index, kb) => onUpdateKeybinding(game.id, index, kb)}
        onRemoveKeybinding={(index) => onRemoveKeybinding(game.id, index)}
        onAddKeybinding={(kb) => onAddKeybinding(game.id, kb)}
      />

      {/* 鼠标布局 */}
      <MouseLayout
        keybindings={game.keybindings}
        highlightKeys={boundKeys}
        onUpdateKeybinding={(index, kb) => onUpdateKeybinding(game.id, index, kb)}
        onRemoveKeybinding={(index) => onRemoveKeybinding(game.id, index)}
        onAddKeybinding={(kb) => onAddKeybinding(game.id, kb)}
      />

      <Separator />

      {/* 搜索与过滤 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <ActionIcons.Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索动作或按键..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="搜索键位"
          />
        </div>
        <ToggleGroup
          value={[filterCategory]}
          onValueChange={(v) => { const next = v[0]; if (next) setFilterCategory(next as KeyCategory | 'all'); }}
          className="flex-wrap"
        >
          <ToggleGroupItem value="all" size="sm">全部</ToggleGroupItem>
          {CATEGORY_ORDER.map((cat) => {
            const Icon = CATEGORY_ICONS_MAP[cat];
            return (
              <ToggleGroupItem key={cat} value={cat} size="sm">
                <Icon className="size-3.5" /> {CATEGORY_LABELS[cat]}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      {/* 键位列表 — 按分类分组 */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const CatIcon = CATEGORY_ICONS_MAP[cat];
        return (
          <div key={cat}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CatIcon className="size-4" /> {CATEGORY_LABELS[cat]}
            </h3>
            <div className="flex flex-col gap-1.5">
              {items.map((kb) => (
                <Card key={`${kb.key}-${kb.origIdx}`} className="py-2">
                  <CardContent className="flex items-center gap-3 px-4">
                    <Badge
                      variant="outline"
                      className="shrink-0 cursor-pointer font-mono"
                      onClick={() => openKeyEdit(kb.origIdx, kb.key)}
                      title="点击修改按键"
                    >
                      {KEY_DISPLAY_NAMES[kb.key] || kb.key}
                    </Badge>

                    <EditableCell
                      value={kb.action}
                      className="flex-1 text-sm font-medium"
                      onSave={(newAction) => onUpdateKeybinding(game.id, kb.origIdx, { ...kb, action: newAction })}
                    />

                    <Select
                      value={kb.category}
                      onValueChange={(v) => onUpdateKeybinding(game.id, kb.origIdx, { ...kb, category: v as KeyCategory })}
                    >
                      <SelectTrigger className="h-7 w-[90px] text-xs" aria-label={`${kb.action} 的分类`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_ORDER.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">{CATEGORY_LABELS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => openDelete(kb.origIdx, kb.action)}
                      aria-label={`删除 ${kb.action}`}
                    >
                      <ActionIcons.Trash className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">没有匹配的键位</p>
      )}

      {/* 底部新增键位 */}
      <KeyEditorInline onAdd={(kb) => onAddKeybinding(game.id, kb)} />

      {/* 按键编辑 Dialog */}
      <Dialog open={keyEditOpen} onOpenChange={setKeyEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改按键代码</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-sm text-muted-foreground">
              输入新按键代码（如 KeyQ, Mouse0, ControlLeft）
            </label>
            <Input
              value={keyEditNewKey}
              onChange={(e) => setKeyEditNewKey(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') commitKeyEdit(); }}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button onClick={commitKeyEdit} disabled={!keyEditNewKey.trim()}>
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定删除「{deleteTarget?.action}」键位吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button variant="destructive" onClick={commitDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// 底部新增键位
// ============================================================
function KeyEditorInline({ onAdd }: { onAdd: (kb: Keybinding) => void }) {
  const [key, setKey] = useState('');
  const [action, setAction] = useState('');
  const [category, setCategory] = useState<KeyCategory>('other');
  const [expanded, setExpanded] = useState(false);
  const [autoCategory, setAutoCategory] = useState(true);

  const handleSubmit = () => {
    if (!key || !action) return;
    onAdd({ key, action, category });
    setKey('');
    setAction('');
    setCategory('other');
  };

  if (!expanded) {
    return (
      <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
        <ActionIcons.Plus className="size-4" /> 添加键位
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="w-[120px]">
          <label className="mb-1 block text-xs text-muted-foreground">按键代码</label>
          <Input className="font-mono text-sm" placeholder="KeyQ, Space..." value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">动作描述</label>
          <Input
            placeholder="前进, 换弹, 跳跃..."
            value={action}
            onChange={(e) => {
              const v = e.target.value;
              setAction(v);
              if (autoCategory) {
                const inferred = inferCategory(v);
                if (inferred) setCategory(inferred);
              }
            }}
          />
        </div>
        <div className="w-[100px]">
          <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            分类
            <span
              className={`cursor-pointer text-[10px] ${autoCategory ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setAutoCategory(!autoCategory)}
              title={autoCategory ? '自动推断已开启' : '自动推断已关闭'}
            >
              {autoCategory ? '🤖 自动' : '手动'}
            </span>
          </label>
          <Select value={category} onValueChange={(v) => setCategory(v as KeyCategory)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ORDER.map((cat) => (
                <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={!key || !action}>
          <ActionIcons.Plus className="size-4" /> 添加
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
          <ActionIcons.X className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
