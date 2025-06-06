
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamanhos de splash screens
const splashSizes = [
  // iOS
  { width: 1242, height: 2208, name: 'splash-1242x2208.png', platform: 'ios' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png', platform: 'ios' },
  { width: 828, height: 1792, name: 'splash-828x1792.png', platform: 'ios' },
  { width: 1242, height: 2688, name: 'splash-1242x2688.png', platform: 'ios' },
  { width: 750, height: 1334, name: 'splash-750x1334.png', platform: 'ios' },
  { width: 640, height: 1136, name: 'splash-640x1136.png', platform: 'ios' },
  
  // Android
  { width: 480, height: 800, name: 'splash-port-hdpi.png', platform: 'android' },
  { width: 720, height: 1280, name: 'splash-port-xhdpi.png', platform: 'android' },
  { width: 960, height: 1600, name: 'splash-port-xxhdpi.png', platform: 'android' },
  { width: 1280, height: 1920, name: 'splash-port-xxxhdpi.png', platform: 'android' }
];

async function generateSplashScreens() {
  const sourceLogo = path.join(__dirname, '../public/app-icon.png');
  
  if (!fs.existsSync(sourceLogo)) {
    console.error('❌ Arquivo app-icon.png não encontrado em /public');
    return;
  }

  const backgroundColor = '#1f2937'; // Gray-800
  const logoSize = 200;

  // Criar diretórios
  const iosDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/Splash.imageset');
  const androidDir = path.join(__dirname, '../android/app/src/main/res');

  if (!fs.existsSync(iosDir)) {
    fs.mkdirSync(iosDir, { recursive: true });
  }

  console.log('📱 Gerando splash screens...');

  for (const { width, height, name, platform } of splashSizes) {
    // Criar canvas com cor de fundo
    const canvas = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: backgroundColor
      }
    });

    // Adicionar logo centralizado
    const logo = await sharp(sourceLogo)
      .resize(logoSize, logoSize)
      .png()
      .toBuffer();

    const outputPath = platform === 'ios' 
      ? path.join(iosDir, name)
      : path.join(androidDir, `drawable-${name.includes('hdpi') ? 'hdpi' : name.includes('xhdpi') ? 'xhdpi' : name.includes('xxhdpi') ? 'xxhdpi' : 'xxxhdpi'}`, 'splash.png');

    if (platform === 'android') {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    await canvas
      .composite([{
        input: logo,
        left: Math.round((width - logoSize) / 2),
        top: Math.round((height - logoSize) / 2)
      }])
      .png()
      .toFile(outputPath);

    console.log(`✅ ${name} (${width}x${height})`);
  }

  // Gerar Contents.json para iOS splash
  const splashContents = {
    images: [
      {
        filename: 'splash-1242x2208.png',
        idiom: 'iphone'
      }
    ],
    info: {
      author: 'capacitor',
      version: 1
    }
  };

  fs.writeFileSync(
    path.join(iosDir, 'Contents.json'),
    JSON.stringify(splashContents, null, 2)
  );

  console.log('🎉 Splash screens gerados com sucesso!');
}

generateSplashScreens().catch(console.error);
