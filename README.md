# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Локальный запуск

Запустите редактор и демонстрационный Overlay Runtime одной командой:

   ```bash
   npm run dev
   ```

Редактор откроется на `http://127.0.0.1:5173`.

### VK Видео Live integration service

Локальный integration server запускается отдельно:

```bash
npm run dev:integration
```

Он слушает только `127.0.0.1:8787`. Для OAuth заполните `.env` по образцу `.env.example` и добавьте в кабинете VK Видео Live redirect URI `https://dev-overlays.deenet.ru/integration/vk-video/callback`. Публичный HTTPS-домен должен перенаправлять этот единственный маршрут в локальный сервис через заранее настроенный туннель. Серверную инфраструктуру DeeOverlays этот проект не настраивает.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
