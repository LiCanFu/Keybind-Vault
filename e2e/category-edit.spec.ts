import { test, expect } from '@playwright/test';

test.describe('分类编辑', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.game-card', { timeout: 5000 });
  });

  test('列表视图：原生 select 切换分类', async ({ page }) => {
    await page.click('.game-card >> nth=0');
    await page.waitForSelector('.detail-header');

    const crouchItem = page.locator('.kb-item', { hasText: '蹲下' });
    const categorySelect = crouchItem.locator('select');
    expect(await categorySelect.inputValue()).toBe('movement');

    await categorySelect.selectOption('other');
    await page.waitForTimeout(300);

    expect(await categorySelect.inputValue()).toBe('other');

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('keybind-vault-games');
      const games = JSON.parse(raw!);
      return games.flatMap((g: any) => g.keybindings).find((kb: any) => kb.action === '蹲下')?.category;
    });
    expect(stored).toBe('other');
  });

  test('键盘视图：底部操作栏切换分类后保存生效', async ({ page }) => {
    await page.click('.game-card >> nth=0');
    await page.waitForSelector('.detail-header');

    const boundKey = page.locator('.keycap-bound').first();
    await boundKey.click();

    const bottomBar = page.locator('.keyboard-container .card').first();
    await expect(bottomBar).toBeVisible();

    const categorySelect = bottomBar.locator('select.input');
    const originalCategory = await categorySelect.inputValue();

    const options = await categorySelect.locator('option').all();
    const newOption = options.length > 1 ? options[1] : options[0];
    const newValue = await newOption.getAttribute('value');

    await categorySelect.selectOption(newValue!);
    const saveBtn = bottomBar.locator('button.btn-primary');
    await saveBtn.click();
    await page.waitForTimeout(300);

    await boundKey.click();
    await expect(bottomBar).toBeVisible();
    expect(await categorySelect.inputValue()).toBe(newValue);
  });
});

test.describe('游戏管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.game-card', { timeout: 5000 });
  });

  test('新建游戏配置', async ({ page }) => {
    const initialCount = await page.locator('.game-card').count();

    await page.click('button:has-text("新建配置")');
    await expect(page.locator('.modal')).toBeVisible();

    await page.fill('.modal input[type="text"]', 'Apex Legends');
    await page.selectOption('.modal select', 'FPS');
    await page.click('.modal button:has-text("创建")');

    await expect(page.locator('.modal')).not.toBeVisible();
    expect(await page.locator('.game-card').count()).toBe(initialCount + 1);
    await expect(page.locator('.game-card:has-text("Apex Legends")')).toBeVisible();
  });

  test('删除游戏配置', async ({ page }) => {
    const initialCount = await page.locator('.game-card').count();
    page.on('dialog', (dialog) => dialog.accept());

    await page.locator('.game-card').first().locator('button:has-text("删除")').click();
    await page.waitForTimeout(300);

    expect(await page.locator('.game-card').count()).toBe(initialCount - 1);
  });
});

test.describe('键位操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.game-card', { timeout: 5000 });
    await page.click('.game-card >> nth=0');
    await page.waitForSelector('.detail-header');
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
    const firstAction = page.locator('.kb-item .kb-action').first();
    const originalText = await firstAction.textContent();

    await firstAction.click();
    const input = page.locator('.kb-item input[type="text"]').first();
    await expect(input).toBeVisible();
    await input.fill('新动作名');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // 验证保存
    const updatedAction = page.locator('.kb-item .kb-action').first();
    expect(await updatedAction.textContent()).toBe('新动作名');
  });

  test('搜索键位', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('前进');
    await page.waitForTimeout(200);

    const items = page.locator('.kb-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(20); // 应该过滤掉大部分
  });
});
