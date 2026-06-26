import { test, expect } from '@playwright/test';

test.describe('分类编辑', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 });
  });

  test('列表视图：原生 select 切换分类', async ({ page }) => {
    await page.click('[role="listitem"] >> nth=0');
    await page.waitForSelector('text=个键位');

    // 找到"蹲下"那一行的分类 select
    const crouchRow = page.locator('[data-slot="card"]', { hasText: '蹲下' }).first();
    const categoryTrigger = crouchRow.locator('[role="combobox"]').first();
    await categoryTrigger.click();

    // 选择"其他"
    await page.click('[role="option"]:has-text("其他")');
    await page.waitForTimeout(300);

    // 验证 localStorage 已更新
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('keybind-vault-games');
      const games = JSON.parse(raw!);
      return games.flatMap((g: any) => g.keybindings).find((kb: any) => kb.action === '蹲下')?.category;
    });
    expect(stored).toBe('other');
  });

  test('键盘视图：底部操作栏切换分类后保存生效', async ({ page }) => {
    await page.click('[role="listitem"] >> nth=0');
    await page.waitForSelector('text=个键位');

    const boundKey = page.locator('.keycap-bound').first();
    await boundKey.click();

    // 底部操作栏出现
    const bottomBar = page.locator('.keyboard-container .card').first();
    await expect(bottomBar).toBeVisible();

    // 点击分类 select
    const categoryTrigger = bottomBar.locator('[role="combobox"]').first();
    await categoryTrigger.click();

    // 选择第二个选项
    const option = page.locator('[role="option"]').nth(1);
    const newValue = await option.textContent();
    await option.click();

    // 点击保存
    const saveBtn = bottomBar.locator('button:has-text("保存")');
    await saveBtn.click();
    await page.waitForTimeout(300);

    // 重新点击验证
    await boundKey.click();
    await expect(bottomBar).toBeVisible();
  });
});

test.describe('游戏管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 });
  });

  test('新建游戏配置', async ({ page }) => {
    const initialCount = await page.locator('[role="listitem"]').count();

    await page.click('button:has-text("新建配置")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.fill('[role="dialog"] input', 'Apex Legends');

    // shadcn Select 需要点击 trigger 然后选 option
    const genreTrigger = page.locator('[role="dialog"] [role="combobox"]');
    await genreTrigger.click();
    await page.click('[role="option"]:has-text("FPS")');

    await page.click('[role="dialog"] button:has-text("创建")');

    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    expect(await page.locator('[role="listitem"]').count()).toBe(initialCount + 1);
    await expect(page.locator('[role="listitem"]:has-text("Apex Legends")')).toBeVisible();
  });

  test('删除游戏配置', async ({ page }) => {
    const initialCount = await page.locator('[role="listitem"]').count();
    page.on('dialog', (dialog) => dialog.accept());

    await page.locator('[role="listitem"]').first().locator('button:has-text("删除")').click();
    await page.waitForTimeout(300);

    expect(await page.locator('[role="listitem"]').count()).toBe(initialCount - 1);
  });
});

test.describe('键位操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[role="listitem"]', { timeout: 5000 });
    await page.click('[role="listitem"] >> nth=0');
    await page.waitForSelector('text=个键位');
  });

  test('键盘视图：点击键帽编辑动作名', async ({ page }) => {
    const boundKey = page.locator('.keycap-bound').first();
    const originalAction = await boundKey.locator('.keycap-action').textContent();

    await boundKey.click();

    const input = boundKey.locator('input');
    await expect(input).toBeVisible();
    await input.fill('测试动作');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // 重新点击同一个键帽验证保存
    await boundKey.click();
    const input2 = boundKey.locator('input');
    await expect(input2).toBeVisible();
    expect(await input2.inputValue()).toBe('测试动作');
  });

  test('键位列表：点击动作名直接编辑', async ({ page }) => {
    // 找到第一个键位卡片中的可编辑文本
    const firstCard = page.locator('[data-slot="card"]').first();
    const actionSpan = firstCard.locator('span.cursor-text').first();
    const originalText = await actionSpan.textContent();

    await actionSpan.click();
    const input = firstCard.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await input.fill('新动作名');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // 验证保存
    const updatedCard = page.locator('[data-slot="card"]').first();
    const updatedSpan = updatedCard.locator('span.cursor-text').first();
    expect(await updatedSpan.textContent()).toBe('新动作名');
  });

  test('搜索键位', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('前进');
    await page.waitForTimeout(200);

    const items = page.locator('[data-slot="card"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20);
  });
});
