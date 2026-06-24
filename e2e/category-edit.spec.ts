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
    // 1. 点击第一个游戏卡片进入详情页
    await page.click('.game-card >> nth=0');
    await page.waitForSelector('.detail-header', { timeout: 5000 });

    // 2. 找到第一个分类标签，记录其所在分组
    const firstKbItem = page.locator('.kb-item').first();
    const categoryBadge = firstKbItem.locator('.badge');
    const originalText = await categoryBadge.textContent();
    console.log('原始分类:', originalText);

    // 记录原始分组中该分类的 badge 数量
    const originalCount = await page.locator(`.kb-item .badge:has-text("${originalText}")`).count();

    // 3. 点击分类标签进入编辑模式
    await categoryBadge.click();

    // 4. 等待 select 出现
    const select = firstKbItem.locator('select.input');
    await expect(select).toBeVisible({ timeout: 3000 });

    // 5. 选择一个不同的分类
    const options = await select.locator('option').allTextContents();
    const newOption = options.find((o) => o !== originalText) || options[0];
    console.log('选择新分类:', newOption);

    await select.selectOption({ label: newOption });

    // 6. 等待 React 重渲染
    await page.waitForTimeout(500);

    // 7. 验证：原始分类的 badge 数量减少了，新分类的 badge 数量增加了
    const afterOriginalCount = await page.locator(`.kb-item .badge:has-text("${originalText}")`).count();
    const newCount = await page.locator(`.kb-item .badge:has-text("${newOption}")`).count();

    console.log(`原始分类 "${originalText}": ${originalCount} → ${afterOriginalCount}`);
    console.log(`新分类 "${newOption}": → ${newCount}`);

    expect(afterOriginalCount).toBe(originalCount - 1);
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
