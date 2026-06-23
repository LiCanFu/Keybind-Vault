import { useState, useRef } from 'react';
import type { GameConfig } from './types';
import { useGameConfigs } from './hooks/useGameConfigs';
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">
            <span style={{ fontSize: 24 }}>🎮</span>
            <span>Keybind Vault</span>
          </h1>
          <p className="subtitle">游戏键盘配置备忘录</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setPage('dashboard'); setSelectedGame(null); }}
          >
            <span>🏠</span> 游戏列表
          </button>
          <button
            className={`nav-item ${page === 'compare' ? 'active' : ''}`}
            onClick={() => { setPage('compare'); setSelectedGame(null); }}
          >
            <span>🔍</span> 键位对比
          </button>
        </nav>

        <div className="sidebar-actions">
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => setShowNewDialog(true)}
          >
            ➕ 新建配置
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-sm" onClick={handleExport} title="导出全部配置">
            📤 导出
          </button>
          <button
            className="btn btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="导入配置"
          >
            📥 导入
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  handleImport(reader.result as string);
                  alert('导入成功！');
                } catch (err: any) {
                  alert('导入失败：' + err.message);
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
          >
            🔄 重置
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="main">
        {page === 'dashboard' && (
          <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 8 }}>🎮 我的游戏</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 13 }}>
              共 {games.length} 个游戏配置，点击进入查看和编辑键位
            </p>

            <div className="game-grid">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="game-card card"
                  onClick={() => {
                    setSelectedGame(game);
                    setPage('detail');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="game-card-header">
                    <h3 className="game-card-name">{game.name}</h3>
                    <span className="badge badge-genre">{game.genre}</span>
                  </div>
                  <p className="game-card-meta">
                    {game.keybindings.length} 个键位
                  </p>
                  <p className="game-card-meta" style={{ fontSize: 11 }}>
                    更新于 {new Date(game.updatedAt).toLocaleString('zh-CN')}
                  </p>
                  <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGame(game);
                        setPage('detail');
                      }}
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除 "${game.name}" 吗？`)) removeGame(game.id);
                      }}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {games.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>
                还没有游戏配置，点击左侧「新建配置」开始
              </p>
            )}
          </div>
        )}

        {page === 'detail' && selectedGame && (
          <GameDetail
            key={selectedGame.id}
            game={selectedGame}
            allGames={games}
            onBack={() => { setPage('dashboard'); setSelectedGame(null); }}
            onUpdateName={updateGameName}
            onAddKeybinding={addKeybinding}
            onUpdateKeybinding={updateKeybinding}
            onRemoveKeybinding={removeKeybinding}
          />
        )}

        {page === 'compare' && (
          <CompareView games={games} />
        )}
      </main>

      {/* 新建游戏对话框 */}
      {showNewDialog && (
        <div className="modal-overlay" onClick={() => setShowNewDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>新建游戏配置</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                游戏名称
              </label>
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
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                游戏类型
              </label>
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
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowNewDialog(false)}>
                取消
              </button>
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
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}