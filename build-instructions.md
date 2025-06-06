
# Instruções de Build

## Adicionar ao package.json

Adicione estes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "build:production": "node scripts/build-production.js",
    "generate:icons": "node scripts/generate-icons.js",
    "generate:splash": "node scripts/generate-splash.js",
    "cap:sync": "npx cap sync",
    "cap:ios": "npx cap open ios",
    "cap:android": "npx cap open android"
  }
}
```

## Dependências Necessárias

```bash
npm install sharp --save-dev
```

## Como Usar

1. **Preparar ícone**: Coloque um arquivo `app-icon.png` (1024x1024px) na pasta `public/`

2. **Build completo**:
   ```bash
   npm run build:production
   ```

3. **Gerar apenas assets**:
   ```bash
   npm run generate:icons
   npm run generate:splash
   ```

4. **Abrir projetos nativos**:
   ```bash
   npm run cap:ios     # Para iOS
   npm run cap:android # Para Android
   ```

## Próximos Passos

1. Leia a documentação completa em `docs/app-store-submission.md`
2. Configure certificados de produção
3. Gere builds assinados
4. Submeta para as lojas
