import { test, expect } from '@playwright/test';

const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;

test.describe('fluxos essenciais', () => {
  test.skip(!username || !password, 'Defina E2E_USERNAME e E2E_PASSWORD para executar contra um ambiente.');

  test('login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Login ou matrícula').fill(username!);
    await page.getByLabel('Senha corporativa').fill(password!);
    await page.getByRole('button', { name: 'Fazer Login' }).click();
    await expect(page).not.toHaveURL(/\/login$/);
  });

  test('cadastro individual', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Login ou matrícula').fill(username!);
    await page.getByLabel('Senha corporativa').fill(password!);
    await page.getByRole('button', { name: 'Fazer Login' }).click();
    await page.goto('/cadastro');
    await expect(page).toHaveURL(/\/cadastro$/);
  });

  test('cadastro em lote', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Login ou matrícula').fill(username!);
    await page.getByLabel('Senha corporativa').fill(password!);
    await page.getByRole('button', { name: 'Fazer Login' }).click();
    await page.goto('/cadastro-lote');
    await expect(page.getByRole('heading', { name: 'Cadastro em lote' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Adicionar equipamento/ })).toBeVisible();
  });
});
