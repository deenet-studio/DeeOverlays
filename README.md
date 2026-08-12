# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Локальный запуск с VK Видео Live

1. Зарегистрируйте приложение в [кабинете разработчика VK Видео Live](https://dev.live.vkvideo.ru/).
2. Скопируйте `.env.example` в `.env` и заполните `VK_VIDEO_LIVE_CLIENT_ID` и `VK_VIDEO_LIVE_CLIENT_SECRET` значениями созданного приложения.
3. В кабинете укажите точный callback URL: `http://127.0.0.1:8787/integration/vk-video/callback`. Если меняете его, укажите то же значение в `VK_VIDEO_LIVE_REDIRECT_URI`.
4. Запустите одной командой:

   ```bash
   npm run dev
   ```

Редактор откроется на `http://127.0.0.1:5173`, а локальный integration service работает на `127.0.0.1:8787` и доступен редактору через тот же адрес. Реальные секреты не должны попадать в Git: `.env` уже исключён.

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
