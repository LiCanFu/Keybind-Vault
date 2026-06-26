import { useState, useRef, useEffect } from 'react';
import type { Keybinding, KeyCategory } from '../types';
import { inferCategory } from '../utils/categoryInfer';

/** 键位编辑器共享状态 */
export interface EditingKey {
  code: string;
  index: number; // -1 = 新增
  action: string;
  category: KeyCategory;
  categoryManual: boolean;
}

interface KbMapEntry {
  binding: Keybinding;
  index: number;
}

interface UseKeybindingEditorOptions {
  keybindings: Keybinding[];
  onUpdateKeybinding?: (index: number, kb: Keybinding) => void;
  onRemoveKeybinding?: (index: number) => void;
  onAddKeybinding?: (kb: Keybinding) => void;
}

export function useKeybindingEditor({
  keybindings,
  onUpdateKeybinding,
  onRemoveKeybinding,
  onAddKeybinding,
}: UseKeybindingEditorOptions) {
  const [editing, setEditing] = useState<EditingKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const kbMap = new Map<string, KbMapEntry>();
  keybindings.forEach((kb, idx) => kbMap.set(kb.key, { binding: kb, index: idx }));

  // 编辑态自动聚焦
  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [editing]);

  /** 点击键帽 → 开始编辑 / 再次点击关闭 */
  const handleClick = (code: string) => {
    if (editing?.code === code) {
      setEditing(null);
      return;
    }
    const entry = kbMap.get(code);
    if (entry) {
      setEditing({
        code,
        index: entry.index,
        action: entry.binding.action,
        category: entry.binding.category,
        categoryManual: false,
      });
    } else if (onAddKeybinding) {
      setEditing({ code, index: -1, action: '', category: 'other', categoryManual: false });
    }
  };

  /** 保存当前编辑 */
  const save = () => {
    if (!editing || !editing.action.trim()) {
      setEditing(null);
      return;
    }
    const kb: Keybinding = { key: editing.code, action: editing.action.trim(), category: editing.category };
    if (editing.index >= 0) {
      onUpdateKeybinding?.(editing.index, kb);
    } else {
      onAddKeybinding?.(kb);
    }
    setEditing(null);
  };

  /** 删除当前编辑的键位 */
  const remove = () => {
    if (!editing || editing.index < 0) return;
    if (confirm('删除这个键位？')) {
      onRemoveKeybinding?.(editing.index);
      setEditing(null);
    }
  };

  /** 更新动作名（自动推断分类） */
  const updateAction = (newAction: string) => {
    if (!editing) return;
    const updates: Partial<EditingKey> = { action: newAction };
    if (!editing.categoryManual) {
      const inferred = inferCategory(newAction);
      if (inferred) updates.category = inferred;
    }
    setEditing({ ...editing, ...updates });
  };

  /** 更新分类（标记为手动） */
  const updateCategory = (category: KeyCategory) => {
    if (!editing) return;
    setEditing({ ...editing, category, categoryManual: true });
  };

  /** 编辑输入框的 blur 处理（焦点转移到底部操作栏时不保存） */
  const handleBlur = (e: React.FocusEvent) => {
    const rt = e.relatedTarget as HTMLElement | null;
    if (rt && bottomBarRef.current?.contains(rt)) return;
    setTimeout(() => {
      if (bottomBarRef.current?.contains(document.activeElement)) return;
      save();
    }, 0);
  };

  /** 编辑输入框的 keyDown 处理 */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(null);
    e.stopPropagation();
  };

  return {
    editing,
    setEditing,
    inputRef,
    bottomBarRef,
    kbMap,
    handleClick,
    save,
    remove,
    updateAction,
    updateCategory,
    handleBlur,
    handleKeyDown,
  };
}
