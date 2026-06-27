import { test, expect } from '@playwright/test';

test.describe('分类编辑', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 });
  });

  test('列表视图：shadcn Select 切换分类', async ({ page }) => {
    await page.click('[role="listitem"] >> nth=0');
    await page.waitForSelector('text=个键位');

    // 找到第一张键位卡片中的分类 Select
    const firstCard = page.locator('[data-slot="card"]').filter({ has: page.locator('select, [data-slot="select-trigger"]') }).first();
    // 优先尝试 shadcn Select（列表视图使用 shadcn Select）
    const shadcnTrigger = firstCard.locator('[data-slot="select-trigger"]');
    const nativeSelect = firstCard.locator('select');

    if (await shadcnTrigger.count() > 0) {
      // shadcn Select 流程
      await shadcnTrigger.click();
      await page.locator('[data-slot="select-item"]:has-text("其他")').click();
    } else {
      // 原生 select 流程（键盘视图键帽内）
      await nativeSelect.selectOption({ label: '其他' });
    }

    // 验证 localStorage 已更新
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('keybind-vault-games');
      const games = JSON.parse(raw!);
      const firstGame = games[0];
      const firstKb = firstGame.keybindings[0];
      return firstKb?.category;
    });
    expect(stored).toBe('other');
  });

  test('键盘视图：底部操作栏切换分类后保存生效', async ({ page }) => {
    await page.click('[role="listitem"] >> nth=0');
    await page.waitForSelector('text=个键位');

    const boundKey = page.locator('.keycap-bound').first();
    await boundKey.click();

    // 底部操作栏出现（shadcn Select）
    const bottomBar = page.locator('.keyboard-container .flex.rounded-lg').first();
    await expect(bottomBar).toBeVisible();

    // 点击分类 select trigger
    const categoryTrigger = bottomBar.locator('[data-slot="select-trigger"]').first();
    await categoryTrigger.click();

    // 选择一个选项
    const option = page.locator('[data-slot="select-item"]').nth(1);
    await option.click();

    // 点击保存
    const saveBtn = bottomBar.locator('button:has-text("保存")');
    await saveBtn.click();

    // 重新点击验证
    await expect(bottomBar).not.toBeVisible();
    await boundKey.click();
    await expect(bottomBar).toBeVisible();
  });
});

test.describe('游戏管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 });
  });

  test('新建游戏配置', async ({ page }) => {
    const initialCount = await page.locator('[role="listitem"]').count();

    await page.click('button:has-text("新建配置")');
    await expect(page.locator('[data-slot="dialog-content"]')).toBeVisible();

    // 使用 placeholder 定位（避免 Select 组件的 hidden input）
    await page.getByPlaceholder('如 Apex Legends').fill('Apex Legends');

    // shadcn Select: 点击 trigger 然后选 item
    const genreTrigger = page.locator('[data-slot="dialog-content"] [data-slot="select-trigger"]');
    await genreTrigger.click();
    await page.getByRole('option', { name: 'FPS', exact: true }).click();

    await page.locator('[data-slot="dialog-content"] button:has-text("创建")').click();

    await expect(page.locator('[data-slot="dialog-content"]')).not.toBeVisible();
    expect(await page.locator('[role="listitem"]').count()).toBe(initialCount + 1);
    await expect(page.locator('[role="listitem"]:has-text("Apex Legends")')).toBeVisible();
  });

  test('删除游戏配置', async ({ page }) => {
    const initialCount = await page.locator('[role="listitem"]').count();
    // 游戏删除仍用原生 confirm（非 keybinding 删除 Dialog）
    page.on('dialog', (dialog) => dialog.accept());

    // 删除按钮是 icon-only，通过 hover 颜色 class 定位
    await page.locator('[role="listitem"]').first().locator('button.text-destructive, button.hover\\:bg-destructive\\/10').click();
    await expect(page.locator('[role="listitem"]')).toHaveCount(initialCount - 1);
  });
});

test.describe('键位操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 });
    await page.click('[role="listitem"] >> nth=0');
    await page.waitForSelector('text=个键位');
  });

  test('键盘视图：点击键帽编辑动作名', async ({ page }) => {
    const boundKey = page.locator('.keycap-bound').first();

    await boundKey.click();

    const input = boundKey.locator('input');
    await expect(input).toBeVisible();
    await input.fill('测试动作');
    await input.press('Enter');

    // 重新点击同一个键帽验证保存
    await boundKey.click();
    const input2 = boundKey.locator('input');
    await expect(input2).toBeVisible();
    expect(await input2.inputValue()).toBe('测试动作');
  });

  test('键位列表：点击动作名直接编辑', async ({ page }) => {
    // 等待键位列表渲染（EditCell span 元素）
    const actionSpan = page.locator('span.cursor-text').first();
    await expect(actionSpan).toBeVisible();
    const originalText = await actionSpan.textContent();

    await actionSpan.click();

    // EditableCell 点击后自动聚焦到新 input
    const input = page.locator(':focus');
    await expect(input).toBeVisible();
    await input.fill('新动作名');
    await input.press('Enter');

    // 验证保存（span 重新出现）
    const updatedSpan = page.locator('span.cursor-text').first();
    await expect(updatedSpan).toHaveText('新动作名');
  });

  test('搜索键位', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('前进');

    const items = page.locator('[data-slot="card"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20);
  });
});
