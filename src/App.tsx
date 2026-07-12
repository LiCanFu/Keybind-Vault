import { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { GameConfig } from './types';
import { useGameConfigs } from './hooks/useGameConfigs';
import { NavIcons, ActionIcons } from './icons';
import GameDetail from './components/GameDetail';
import CompareView from './components/CompareView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
import './App.css';

type Page = 'dashboard' | 'detail' | 'compare';

export default function App() {
  const {
    games,
    loading,
    addGame,
    updateGameName,
    removeGame,
    addKeybinding,
    updateKeybinding,
    removeKeybinding,
    handleExport,
    handleImport,
    reset,
  } = useGameConfigs();

  const [page, setPage] = useState<Page>('dashboard');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGenre, setNewGenre] = useState<GameConfig['genre']>('FPS');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 删除确认 Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 重置确认 Dialog
  const [resetOpen, setResetOpen] = useState(false);

  // 导入反馈 Dialog
  const [importOpen, setImportOpen] = useState(false);
  const [importOk, setImportOk] = useState(true);
  const [importMsg, setImportMsg] = useState('');

  const openDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteOpen(true);
  };

  const commitDelete = () => {
    if (deleteTarget) removeGame(deleteTarget.id);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // 主题切换
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const selectedGame = selectedGameId ? games.find((g) => g.id === selectedGameId) ?? null : null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  const navigateTo = (p: Page, gameId?: string) => {
    setPage(p);
    setSelectedGameId(gameId ?? null);
  };

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card" role="navigation" aria-label="主导航">
        <div className="p-4">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <NavIcons.Gamepad2 className="size-5" />
            Keybind Vault
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">游戏键盘配置备忘录</p>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 p-3">
          <Button
            variant={page === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => navigateTo('dashboard')}
            aria-current={page === 'dashboard' ? 'page' : undefined}
          >
            <NavIcons.Home className="size-4" /> 游戏列表
          </Button>
          <Button
            variant={page === 'compare' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => navigateTo('compare')}
            aria-current={page === 'compare' ? 'page' : undefined}
          >
            <NavIcons.Compare className="size-4" /> 键位对比
          </Button>
        </nav>

        <div className="space-y-2 p-3">
          <Button className="w-full gap-1.5" onClick={() => setShowNewDialog(true)} aria-label="新建游戏配置">
            <ActionIcons.Plus className="size-4" /> 新建配置
          </Button>
        </div>

        <Separator />

        <div className="flex gap-1.5 p-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleExport} title="导出全部配置">
            <ActionIcons.Download className="size-3.5" /> 导出
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()} title="导入配置">
            <ActionIcons.Upload className="size-3.5" /> 导入
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setResetOpen(true)} title="重置为默认">
            <ActionIcons.Reset className="size-3.5" /> 重置
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  handleImport(reader.result as string);
                  setImportOk(true);
                  setImportMsg('导入成功！');
                  setImportOpen(true);
                } catch (err: unknown) {
                  setImportOk(false);
                  setImportMsg('导入失败：' + (err instanceof Error ? err.message : String(err)));
                  setImportOpen(true);
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </div>

        <Separator />

        <div className="p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => setDark(!dark)}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {dark ? '亮色模式' : '暗色模式'}
          </Button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 overflow-auto" role="main">
        {page === 'dashboard' && (
          <div className="mx-auto max-w-[1000px] space-y-5 p-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <NavIcons.Gamepad2 className="size-5" />
                我的游戏
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                共 {games.length} 个游戏配置，点击进入查看和编辑键位
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="游戏配置列表">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => navigateTo('detail', game.id)}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigateTo('detail', game.id); }}
                  aria-label={`${game.name} - ${game.keybindings.length} 个键位`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{game.name}</CardTitle>
                      <Badge variant="secondary">{game.genre}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {game.keybindings.length} 个键位
                    </div>
                    <div className="text-xs text-muted-foreground">
                      更新于 {new Date(game.updatedAt).toLocaleString('zh-CN')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); navigateTo('detail', game.id); }}
                      >
                        <ActionIcons.Edit className="size-3.5" /> 编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(game.id, game.name);
                        }}
                      >
                        <ActionIcons.Trash className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {games.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">还没有游戏配置，点击左侧「新建配置」开始</p>
            )}
          </div>
        )}

        {page === 'detail' && selectedGame && (
          <GameDetail
            key={selectedGame.id}
            game={selectedGame}
            onBack={() => navigateTo('dashboard')}
            onUpdateName={updateGameName}
            onAddKeybinding={addKeybinding}
            onUpdateKeybinding={updateKeybinding}
            onRemoveKeybinding={removeKeybinding}
          />
        )}

        {page === 'compare' && <CompareView games={games} />}
      </main>

      {/* 新建游戏对话框 */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建游戏配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">游戏名称</label>
              <Input
                placeholder="如 Apex Legends, 英雄联盟..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">游戏类型</label>
              <Select value={newGenre} onValueChange={(v) => setNewGenre(v as GameConfig['genre'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FPS">FPS</SelectItem>
                  <SelectItem value="Tactical FPS">Tactical FPS（战术射击）</SelectItem>
                  <SelectItem value="MOBA">MOBA</SelectItem>
                  <SelectItem value="Other">Other（其他）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button
              disabled={!newName.trim()}
              onClick={() => {
                addGame(newName.trim(), newGenre);
                setNewName('');
                setNewGenre('FPS');
                setShowNewDialog(false);
              }}
            >
              <ActionIcons.Plus className="size-4" /> 创建
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
            确定删除「{deleteTarget?.name}」游戏配置吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button variant="destructive" onClick={commitDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置确认 Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认重置</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要重置为默认配置吗？所有自定义数据将被覆盖。
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button variant="destructive" onClick={() => { reset(); setResetOpen(false); }}>
              重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入反馈 Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{importOk ? '导入完成' : '导入失败'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{importMsg}</p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>确定</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
