
# Guia de Submissão para App Store

## 📋 Pré-requisitos

### Para iOS (App Store)
- **macOS** com Xcode instalado
- **Conta de desenvolvedor Apple** ($99/ano)
- **Certificados de distribuição** configurados
- **Provisioning profiles** de produção

### Para Android (Google Play)
- **Android Studio** instalado
- **Conta Google Play Console** ($25 taxa única)
- **Keystore** para assinatura de apps

## 🛠️ Preparação dos Assets

### 1. Ícone Principal
- Crie um arquivo `public/app-icon.png` de **1024x1024px**
- Formato PNG com fundo transparente ou sólido
- Design simples e reconhecível

### 2. Gerar Assets Automaticamente
```bash
# Instalar dependência para geração de imagens
npm install sharp

# Gerar todos os ícones e splash screens
npm run build:production
```

## 📱 Build para iOS

### 1. Configurar Certificados
1. Acesse [Apple Developer Portal](https://developer.apple.com)
2. Crie um **App ID** para `app.lovable.7f025a902daf499ebc5519c59def333f`
3. Gere certificados de distribuição
4. Crie provisioning profiles de produção

### 2. Configurar no Xcode
```bash
# Abrir projeto iOS
npx cap open ios
```

No Xcode:
1. Selecione o target **App**
2. Vá para **Signing & Capabilities**
3. Configure o **Team** e **Bundle Identifier**
4. Selecione o provisioning profile de produção

### 3. Gerar Build para App Store
1. No Xcode, selecione **Product > Archive**
2. Após o archive, clique em **Distribute App**
3. Escolha **App Store Connect**
4. Siga o assistente para upload

### 4. App Store Connect
1. Acesse [App Store Connect](https://appstoreconnect.apple.com)
2. Crie um novo app
3. Preencha metadados:
   - **Nome**: Assistente Inteligente Pro
   - **Descrição**: Seu assistente pessoal com IA
   - **Palavras-chave**: assistente, IA, produtividade
   - **Categoria**: Produtividade
4. Adicione screenshots (veja seção Screenshots)
5. Envie para revisão

## 🤖 Build para Android

### 1. Gerar Keystore
```bash
# Gerar keystore (faça isso apenas uma vez!)
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

⚠️ **IMPORTANTE**: Guarde o keystore e senha em local seguro!

### 2. Configurar Gradle
Edite `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Configurar Variáveis
Crie `android/gradle.properties`:
```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

### 4. Gerar APK/AAB
```bash
# Abrir Android Studio
npx cap open android

# Ou via linha de comando:
cd android
./gradlew assembleRelease  # Para APK
./gradlew bundleRelease    # Para AAB (recomendado)
```

### 5. Google Play Console
1. Acesse [Google Play Console](https://play.google.com/console)
2. Crie um novo app
3. Preencha informações básicas
4. Faça upload do AAB em **Produção**
5. Preencha ficha da loja (veja seção Screenshots)
6. Envie para revisão

## 📸 Screenshots e Assets para Lojas

### Screenshots Necessários

**iOS (App Store):**
- iPhone 6.7": 1290x2796px (3 a 10 screenshots)
- iPhone 6.5": 1242x2688px (3 a 10 screenshots)
- iPhone 5.5": 1242x2208px (3 a 10 screenshots)

**Android (Google Play):**
- Telefone: 320-3840px de largura
- Tablet 7": 600-1024px de largura
- Tablet 10": 1024-3840px de largura

### Capturar Screenshots
1. Use simuladores/emuladores para capturar
2. Navegue pelas principais telas do app
3. Capture telas representativas:
   - Tela inicial/dashboard
   - Funcionalidades principais
   - Resultados/benefícios

### Outros Assets

**Ícone da Loja:**
- iOS: 1024x1024px (já gerado pelo script)
- Android: 512x512px

**Feature Graphic (Android):**
- 1024x500px
- Destaque visual do app

## ✅ Checklist Final

### Antes da Submissão
- [ ] App testado em dispositivos reais
- [ ] Todas as funcionalidades funcionando
- [ ] Screenshots de qualidade capturadas
- [ ] Descrições escritas e revisadas
- [ ] Termos de uso e política de privacidade
- [ ] Certificados e keystore configurados
- [ ] Builds de produção gerados
- [ ] Metadados preenchidos nas lojas

### Pós-Submissão
- [ ] Monitorar status da revisão
- [ ] Responder feedback dos revisores
- [ ] Planejar atualizações futuras
- [ ] Configurar analytics e crash reporting

## 🔧 Comandos Úteis

```bash
# Build completo de produção
npm run build:production

# Gerar apenas ícones
node scripts/generate-icons.js

# Gerar apenas splash screens
node scripts/generate-splash.js

# Sync com capacitor
npx cap sync

# Abrir projetos nativos
npx cap open ios
npx cap open android

# Verificar plugins instalados
npx cap doctor
```

## 🆘 Problemas Comuns

### iOS
- **Erro de certificado**: Verifique se o bundle ID está correto
- **Provisioning profile**: Certifique-se de usar perfil de distribuição
- **Ícones ausentes**: Execute o script de geração de ícones

### Android
- **Erro de assinatura**: Verifique keystore e senhas
- **Permissões**: Revise permissions no AndroidManifest.xml
- **Tamanho do APK**: Use AAB para reduzir tamanho

## 📞 Suporte

- [Apple Developer Support](https://developer.apple.com/support/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
