import { test, expect } from '@playwright/test';

test.describe('分类编辑', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage 确保干净状态
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.game-card', { timeout: 5000 });
  });

  test('点击分类标签选择新值后不回退', async ({ page }) => {
    await page.click('.game-card >> nth=0');
    await page.waitForSelector('.detail-header', { timeout: 5000 });

    const crouchItem = page.locator('.kb-item', { hasText: '蹲下' });
    const badge = crouchItem.locator('.badge');
    expect(await badge.textContent()).toBe('移动');

    await badge.click();
    const select = crouchItem.locator('select.input');
    await expect(select).toBeVisible();
    await select.selectOption({ label: '其他' });
    await page.waitForTimeout(500);

    const storedCategory = await page.evaluate(() => {
      const raw = localStorage.getItem('keybind-vault-games');
      const games = JSON.parse(raw!);
      return games.flatMap((g: any) => g.keybindings).find((kb: any) => kb.action === '蹲下')?.category;
    });
    expect(storedCategory).toBe('other');
  });

  test('键盘视图底部操作栏切换分类后保存生效', async ({ page }) => {
    // 1. 进入详情页
    await page.click('.game-card >> nth=0');
    await page.waitForSelector('.detail-header', { timeout: 5000 });

    // 2. 点击一个已绑定的键帽
    const boundKey = page.locator('.keycap-bound').first();
    await boundKey.click();

    // 3. 等待底部操作栏出现
    const bottomBar = page.locator('.keyboard-container .card').first();
    await expect(bottomBar).toBeVisible({ timeout: 3000 });

    // 4. 记录当前分类
    const categorySelect = bottomBar.locator('select.input');
    const originalCategory = await categorySelect.inputValue();
    console.log('键盘视图原始分类:', originalCategory);

    // 5. 选择一个不同的分类
    const options = await categorySelect.locator('option').all();
    const newOption = options.length > 1 ? options[1] : options[0];
    const newValue = await newOption.getAttribute('value');
    const newText = await newOption.textContent();
    console.log('选择新分类:', newText);

    await categorySelect.selectOption(newValue!);

    // 6. 点击保存按钮
    const saveBtn = bottomBar.locator('button.btn-primary');
    await saveBtn.click();

    // 7. 等待保存完成
    await page.waitForTimeout(300);

    // 8. 再次点击同一个键帽验证保存是否生效
    await boundKey.click();
    await expect(bottomBar).toBeVisible({ timeout: 3000 });

    const savedCategory = await categorySelect.inputValue();
    console.log('保存后分类:', savedCategory);

    expect(savedCategory).toBe(newValue);
  });
});
