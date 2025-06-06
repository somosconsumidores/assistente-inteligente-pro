
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build de produção...');

try {
  // 1. Limpar dist
  console.log('🧹 Limpando arquivos anteriores...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }

  // 2. Build da aplicação
  console.log('📦 Construindo aplicação...');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. Gerar ícones
  console.log('🎨 Gerando ícones...');
  execSync('node scripts/generate-icons.js', { stdio: 'inherit' });

  // 4. Gerar splash screens
  console.log('📱 Gerando splash screens...');
  execSync('node scripts/generate-splash.js', { stdio: 'inherit' });

  // 5. Sync com Capacitor
  console.log('🔄 Sincronizando com Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });

  // 6. Verificar se as plataformas existem
  const iosExists = fs.existsSync('ios');
  const androidExists = fs.existsSync('android');

  if (!iosExists) {
    console.log('📱 Adicionando plataforma iOS...');
    execSync('npx cap add ios', { stdio: 'inherit' });
  }

  if (!androidExists) {
    console.log('🤖 Adicionando plataforma Android...');
    execSync('npx cap add android', { stdio: 'inherit' });
  }

  // 7. Update das plataformas
  console.log('🔄 Atualizando plataformas...');
  if (iosExists || !iosExists) {
    execSync('npx cap update ios', { stdio: 'inherit' });
  }
  if (androidExists || !androidExists) {
    execSync('npx cap update android', { stdio: 'inherit' });
  }

  console.log('✅ Build de produção concluído!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Para iOS: npx cap open ios (requer macOS e Xcode)');
  console.log('2. Para Android: npx cap open android (requer Android Studio)');
  console.log('3. Configure certificados de produção');
  console.log('4. Gere builds assinados para as lojas');

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
