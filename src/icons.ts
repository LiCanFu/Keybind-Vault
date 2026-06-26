/**
 * Lucide 图标映射 — 替代 emoji，统一视觉风格
 */
import {
  Gamepad2,
  Footprints,
  Swords,
  Sparkles,
  Package,
  MessageCircle,
  Monitor,
  Pin,
  Home,
  GitCompareArrows,
  Plus,
  Edit3,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  ArrowLeft,
  X,
  Search,
  type LucideIcon,
} from 'lucide-react';
import type { KeyCategory } from './types';

// 分类图标
export const CATEGORY_ICONS_MAP: Record<KeyCategory, LucideIcon> = {
  movement: Footprints,
  combat: Swords,
  abilities: Sparkles,
  items: Package,
  communication: MessageCircle,
  ui: Monitor,
  other: Pin,
};

// 导航图标
export const NavIcons = {
  Home,
  Compare: GitCompareArrows,
  Gamepad2,
};

// 操作图标
export const ActionIcons = {
  Plus,
  Edit: Edit3,
  Trash: Trash2,
  Download,
  Upload,
  Reset: RotateCcw,
  ArrowLeft,
  X,
  Search,
};
