import { useState, useRef } from 'react';
import type { GameConfig } from './types';
import { useGameConfigs } from './hooks/useGameConfigs';
import { NavIcons, ActionIcons } from './icons';
import GameDetail from './components/GameDetail';
import CompareView from './components/CompareView';
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
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGenre, setNewGenre] = useState<GameConfig['genre']>('FPS');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="flex items-center" style={{ justifyContent: 'center', height: '100vh' }}>
        <p className="text-secondary">加载中...</p>
      </div>
    );
  }

  const navigateTo = (p: Page) => {
    setPage(p);
    if (p !== 'detail') setSelectedGame(null);
  };

  return (
    <div className="app">
      {/* 侧边栏 */}
      <aside className="sidebar" role="navigation" aria-label="主导航">
        <div className="sidebar-header">
          <h1 className="logo">
            <NavIcons.Gamepad2 size={24} />
            <span>Keybind Vault</span>
          </h1>
          <p className="subtitle">游戏键盘配置备忘录</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('dashboard')}
            aria-current={page === 'dashboard' ? 'page' : undefined}
          >
            <NavIcons.Home size={16} /> 游戏列表
          </button>
          <button
            className={`nav-item ${page === 'compare' ? 'active' : ''}`}
            onClick={() => navigateTo('compare')}
            aria-current={page === 'compare' ? 'page' : undefined}
          >
            <NavIcons.Compare size={16} /> 键位对比
          </button>
        </nav>

        <div className="sidebar-actions">
          <button
            className="btn btn-primary w-full"
            onClick={() => setShowNewDialog(true)}
            aria-label="新建游戏配置"
          >
            <ActionIcons.Plus size={14} /> 新建配置
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-sm" onClick={handleExport} title="导出全部配置" aria-label="导出配置">
            <ActionIcons.Download size={12} /> 导出
          </button>
          <button
            className="btn btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="导入配置"
            aria-label="导入配置"
          >
            <ActionIcons.Upload size={12} /> 导入
          </button>
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
                  alert('导入成功！');
                } catch (err: unknown) {
                  alert('导入失败：' + (err instanceof Error ? err.message : String(err)));
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
          <button
            className="btn btn-sm"
            onClick={() => {
              if (confirm('确定要重置为默认配置吗？所有修改将丢失！')) reset();
            }}
            title="重置为默认"
            aria-label="重置配置"
          >
            <ActionIcons.Reset size={12} /> 重置
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="main" role="main">
        {page === 'dashboard' && (
          <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 8 }}>
              <NavIcons.Gamepad2 size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              我的游戏
            </h2>
            <p className="text-secondary text-sm" style={{ marginBottom: 20 }}>
              共 {games.length} 个游戏配置，点击进入查看和编辑键位
            </p>

            <div className="game-grid" role="list" aria-label="游戏配置列表">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="game-card card"
                  onClick={() => { setSelectedGame(game); setPage('detail'); }}
                  style={{ cursor: 'pointer' }}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedGame(game); setPage('detail'); } }}
                  aria-label={`${game.name} - ${game.keybindings.length} 个键位`}
                >
                  <div className="game-card-header">
                    <h3 className="game-card-name">{game.name}</h3>
                    <span className="badge badge-genre">{game.genre}</span>
                  </div>
                  <p className="game-card-meta">{game.keybindings.length} 个键位</p>
                  <p className="game-card-meta text-xs">
                    更新于 {new Date(game.updatedAt).toLocaleString('zh-CN')}
                  </p>
                  <div className="game-card-actions">
                    <button
                      className="btn btn-sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedGame(game); setPage('detail'); }}
                      aria-label={`编辑 ${game.name}`}
                    >
                      <ActionIcons.Edit size={12} /> 编辑
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除 "${game.name}" 吗？`)) removeGame(game.id);
                      }}
                      aria-label={`删除 ${game.name}`}
                    >
                      <ActionIcons.Trash size={12} /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {games.length === 0 && (
              <p className="empty-state">还没有游戏配置，点击左侧「新建配置」开始</p>
            )}
          </div>
        )}

        {page === 'detail' && selectedGame && (
          <GameDetail
            key={selectedGame.id}
            game={selectedGame}
            allGames={games}
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
      {showNewDialog && (
        <div className="modal-overlay" onClick={() => setShowNewDialog(false)} role="dialog" aria-modal="true" aria-label="新建游戏配置">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>新建游戏配置</h3>
              <button className="btn btn-icon btn-sm" onClick={() => setShowNewDialog(false)} aria-label="关闭">
                <ActionIcons.X size={14} />
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="editor-label">游戏名称</label>
              <input
                type="text"
                className="input"
                placeholder="如 Apex Legends, 英雄联盟..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="editor-label">游戏类型</label>
              <select
                className="input"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value as GameConfig['genre'])}
              >
                <option value="FPS">FPS</option>
                <option value="Tactical FPS">Tactical FPS（战术射击）</option>
                <option value="MOBA">MOBA</option>
                <option value="Other">Other（其他）</option>
              </select>
            </div>
            <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowNewDialog(false)}>取消</button>
              <button
                className="btn btn-primary"
                disabled={!newName.trim()}
                onClick={() => {
                  addGame(newName.trim(), newGenre);
                  setNewName('');
                  setNewGenre('FPS');
                  setShowNewDialog(false);
                }}
              >
                <ActionIcons.Plus size={14} /> 创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}