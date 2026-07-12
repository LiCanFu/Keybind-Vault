import type { KeyCategory } from '../types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types';
import { CATEGORY_ICONS_MAP } from '../icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** 底部编辑操作栏（供 KeyboardLayout / MouseLayout 共用） */
interface BottomEditBarProps {
  code: string;
  displayKey: string;
  index: number; // -1 = 新增
  category: KeyCategory;
  actionTrimmed: boolean;
  onCategoryChange: (cat: KeyCategory) => void;
  onSave: () => void;
  onRemove: () => void;
  onCancel: () => void;
  bottomBarRef: React.RefObject<HTMLDivElement | null>;
}

export default function BottomEditBar({
  code,
  displayKey,
  index,
  category,
  actionTrimmed,
  onCategoryChange,
  onSave,
  onRemove,
  onCancel,
  bottomBarRef,
}: BottomEditBarProps) {
  return (
    <div
      ref={bottomBarRef}
      className="flex w-full flex-wrap items-center gap-2 rounded-lg border bg-card p-3"
    >
      <Badge variant="outline" className="shrink-0 font-mono">
        {displayKey || code}
      </Badge>

      <span className="text-xs text-muted-foreground">分类：</span>
      <Select value={category} onValueChange={(v) => onCategoryChange(v as KeyCategory)}>
        <SelectTrigger className="h-7 w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_ORDER.map((cat) => {
            const CatItemIcon = CATEGORY_ICONS_MAP[cat];
            return (
              <SelectItem key={cat} value={cat}>
                <span className="flex items-center gap-1.5">
                  <CatItemIcon className="size-3" />
                  {CATEGORY_LABELS[cat]}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <div className="ml-auto flex gap-1.5">
        {index >= 0 && (
          <Button size="sm" variant="destructive" onClick={onRemove}>
            删除
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button size="sm" onClick={onSave} disabled={!actionTrimmed}>
          {index >= 0 ? '保存' : '绑定'}
        </Button>
      </div>
    </div>
  );
}