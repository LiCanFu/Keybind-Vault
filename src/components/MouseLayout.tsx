import { useState } from 'react';
import type { Keybinding, KeyCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, KEY_DISPLAY_NAMES } from '@/types';
import { CATEGORY_ICONS_MAP } from '@/icons';
import { useKeybindingEditor } from '@/hooks/useKeybindingEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Mouse } from 'lucide-react';

interface Props {
  keybindings: Keybinding[];
  highlightKeys: Set<string>;
  onUpdateKeybinding?: (index: number, kb: Keybinding) => void;
  onRemoveKeybinding?: (index: number) => void;
  onAddKeybinding?: (kb: Keybinding) => void;
}

interface MouseArea {
  code: string;
  label: string;
  rect: [number, number, number, number];
  tx: number;
  ty: number;
}

const MOUSE_AREAS: MouseArea[] = [
  { code: 'Mouse0', label: '左键',   rect: [30, 20, 60, 50],  tx: 60,  ty: 50 },
  { code: 'Mouse1', label: '右键',   rect: [110, 20, 60, 50], tx: 140, ty: 50 },
  { code: 'Mouse2', label: '滚轮',   rect: [90, 15, 20, 40],  tx: 100, ty: 40 },
  { code: 'Mouse3', label: '侧键上', rect: [15, 40, 18, 22],  tx: 24,  ty: 55 },
  { code: 'Mouse4', label: '侧键下', rect: [15, 65, 18, 22],  tx: 24,  ty: 80 },
];

export default function MouseLayout({
  keybindings,
  highlightKeys,
  onUpdateKeybinding,
  onRemoveKeybinding,
  onAddKeybinding,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const {
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
  } = useKeybindingEditor({ keybindings, onUpdateKeybinding, onRemoveKeybinding, onAddKeybinding });

  const editingCatIcon = editing ? CATEGORY_ICONS_MAP[editing.category] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mouse className="size-4" />
          鼠标配置
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* SVG 鼠标 */}
        <svg viewBox="0 0 200 160" width={260} height={208} className="drop-shadow-lg" role="img" aria-label="鼠标布局可视化">
          <defs>
            <linearGradient id="mouseBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--muted)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
            <filter id="innerShadow">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite operator="out" in="SourceGraphic" />
              <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
              <feBlend in="SourceGraphic" />
            </filter>
          </defs>

          {/* 鼠标主体 */}
          <path
            d="M 50 5 Q 50 0 65 0 L 135 0 Q 150 0 150 15 L 150 95 Q 150 125 125 140 L 108 150 Q 105 155 100 155 Q 95 155 92 150 L 75 140 Q 50 125 50 95 Z"
            fill="url(#mouseBody)"
            stroke="var(--border)"
            strokeWidth="1.5"
            filter="url(#innerShadow)"
          />

          {/* 中间分割线（左键/右键） */}
          <line x1="100" y1="8" x2="100" y2="72" stroke="var(--border)" strokeWidth="1" />

          {/* 滚轮凹槽 */}
          <rect x="94" y="18" width="12" height="30" rx="6" fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" />

          {/* 滚轮纹理 */}
          {[22, 26, 30, 34, 42].map((y) => (
            <line key={y} x1="96" y1={y} x2="104" y2={y} stroke="var(--border)" strokeWidth="0.6" />
          ))}

          {/* 侧键区域 */}
          <rect x="44" y="38" width="8" height="20" rx="2" fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" />
          <rect x="44" y="62" width="8" height="20" rx="2" fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" />

          {/* 可点击区域 */}
          {MOUSE_AREAS.map((area) => {
            const entry = kbMap.get(area.code);
            const kb = entry?.binding;
            const isBound = !!kb;
            const isEditing = editing?.code === area.code;
            const isHovered = hovered === area.code;
            const [rx, ry, rw, rh] = area.rect;
            const catColor = kb ? `var(--cat-${kb.category})` : undefined;

            return (
              <g
                key={area.code}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={kb ? `${area.label}: ${kb.action}（点击编辑）` : `${area.label}（点击绑定）`}
                onClick={() => handleClick(area.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(area.code);
                  }
                }}
                onMouseEnter={() => setHovered(area.code)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* 高亮背景 */}
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  rx={4}
                  fill={
                    isEditing
                      ? 'var(--accent)'
                      : isBound
                        ? 'var(--accent)'
                        : isHovered
                          ? 'var(--muted-foreground)'
                          : 'transparent'
                  }
                  fillOpacity={isEditing ? 0.25 : isBound ? 0.12 : isHovered ? 0.08 : 0}
                  stroke={
                    isEditing
                      ? 'var(--accent)'
                      : isBound
                        ? 'var(--accent)'
                        : isHovered
                          ? 'var(--muted-foreground)'
                          : 'transparent'
                  }
                  strokeOpacity={isEditing ? 1 : isBound ? 0.6 : isHovered ? 0.3 : 0}
                  strokeWidth={isEditing ? 2 : 1.5}
                  className="transition-all duration-150"
                />

                {/* 文字标签（非编辑态） */}
                {!isEditing && (
                  <>
                    <text
                      x={area.tx}
                      y={isBound ? area.ty - 5 : area.ty + 1}
                      textAnchor="middle"
                      fill={
                        isBound
                          ? 'var(--accent)'
                          : 'var(--muted-foreground)'
                      }
                      fontSize={isBound ? 9 : 10}
                      fontWeight={isBound ? 700 : 500}
                      opacity={isBound ? 1 : isHovered ? 0.8 : 0.5}
                      className="pointer-events-none select-none"
                    >
                      {area.label}
                    </text>
                    {isBound && kb && (
                      <>
                        <text
                          x={area.tx}
                          y={area.ty + 6}
                          textAnchor="middle"
                          fill="var(--foreground)"
                          fontSize={9}
                          fontWeight={600}
                          className="pointer-events-none select-none"
                        >
                          {kb.action.length > 5 ? kb.action.slice(0, 5) + '…' : kb.action}
                        </text>
                        <circle
                          cx={area.tx}
                          cy={area.ty + 14}
                          r={2.5}
                          fill={catColor || 'var(--accent)'}
                          className="pointer-events-none"
                        />
                      </>
                    )}
                    {!isBound && onAddKeybinding && isHovered && (
                      <text
                        x={area.tx}
                        y={area.ty + 10}
                        textAnchor="middle"
                        fill="var(--accent)"
                        fontSize={16}
                        fontWeight={300}
                        className="pointer-events-none"
                      >
                        +
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* 编辑态输入框 */}
          {editing && (() => {
            const area = MOUSE_AREAS.find((a) => a.code === editing.code)!;
            const [rx, ry, rw, rh] = area.rect;
            return (
              <foreignObject x={rx + 2} y={ry + 2} width={rw - 4} height={rh - 4}>
                <Input
                  ref={inputRef}
                  value={editing.action}
                  onChange={(e) => updateAction(e.target.value)}
                  placeholder="动作..."
                  className="h-full w-full rounded-sm px-1 text-center text-[10px]"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={handleKeyDown as (e: React.KeyboardEvent<HTMLInputElement>) => void}
                  onBlur={handleBlur as (e: React.FocusEvent<HTMLInputElement>) => void}
                />
              </foreignObject>
            );
          })()}

          {/* 底部光泽 */}
          <ellipse cx="100" cy="152" rx="30" ry="3" fill="var(--muted-foreground)" fillOpacity="0.05" />
        </svg>

        {/* 已绑定键位标签 */}
        <div className="flex flex-wrap justify-center gap-2">
          {MOUSE_AREAS.map((area) => {
            const entry = kbMap.get(area.code);
            if (!entry) return null;
            const kb = entry.binding;
            const Icon = CATEGORY_ICONS_MAP[kb.category];
            const isEditing = editing?.code === area.code;
            return (
              <Badge
                key={area.code}
                variant={isEditing ? 'default' : 'secondary'}
                className="cursor-pointer gap-1.5 transition-colors"
                onClick={() => handleClick(area.code)}
              >
                <Icon className="size-3" />
                <span className="text-muted-foreground">{area.label}</span>
                <span className="font-medium">{kb.action}</span>
              </Badge>
            );
          })}
        </div>

        {/* 底部操作栏 */}
        {editing && (
          <div
            ref={bottomBarRef}
            className="flex w-full items-center gap-3 rounded-lg border bg-muted/50 p-3"
          >
            <Badge variant="outline" className="shrink-0 font-mono">
              {KEY_DISPLAY_NAMES[editing.code] || editing.code}
            </Badge>

            <div className="flex items-center gap-2">
              {editingCatIcon && <editingCatIcon className="size-4 text-muted-foreground" />}
              <Select
                value={editing.category}
                onValueChange={(v) => updateCategory(v as KeyCategory)}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ORDER.map((cat) => {
                    const CatItemIcon = CATEGORY_ICONS_MAP[cat];
                    return (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-1.5">
                          <CatItemIcon className="size-3.5" />
                          {CATEGORY_LABELS[cat]}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex gap-2">
              {editing.index >= 0 && (
                <Button size="sm" variant="destructive" onClick={remove}>
                  删除
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                取消
              </Button>
              <Button size="sm" onClick={save} disabled={!editing.action.trim()}>
                {editing.index >= 0 ? '保存' : '绑定'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
