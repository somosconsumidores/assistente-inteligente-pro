
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamanhos de ícones para iOS
const iosSizes = [
  { size: 20, name: 'icon-20.png' },
  { size: 29, name: 'icon-29.png' },
  { size: 40, name: 'icon-40.png' },
  { size: 58, name: 'icon-58.png' },
  { size: 60, name: 'icon-60.png' },
  { size: 80, name: 'icon-80.png' },
  { size: 87, name: 'icon-87.png' },
  { size: 120, name: 'icon-120.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 167, name: 'icon-167.png' },
  { size: 180, name: 'icon-180.png' },
  { size: 1024, name: 'icon-1024.png' }
];

// Tamanhos de ícones para Android
const androidSizes = [
  { size: 36, density: 'ldpi', name: 'ic_launcher.png' },
  { size: 48, density: 'mdpi', name: 'ic_launcher.png' },
  { size: 72, density: 'hdpi', name: 'ic_launcher.png' },
  { size: 96, density: 'xhdpi', name: 'ic_launcher.png' },
  { size: 144, density: 'xxhdpi', name: 'ic_launcher.png' },
  { size: 192, density: 'xxxhdpi', name: 'ic_launcher.png' }
];

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../public/app-icon.png');
  
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Arquivo app-icon.png não encontrado em /public');
    console.log('📝 Crie um ícone de 1024x1024px em /public/app-icon.png');
    return;
  }

  // Criar diretórios
  const iosDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
  const androidDir = path.join(__dirname, '../android/app/src/main/res');

  if (!fs.existsSync(iosDir)) {
    fs.mkdirSync(iosDir, { recursive: true });
  }

  // Gerar ícones iOS
  console.log('🍎 Gerando ícones iOS...');
  for (const { size, name } of iosSizes) {
    const outputPath = path.join(iosDir, name);
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ ${name} (${size}x${size})`);
  }

  // Gerar Contents.json para iOS
  const contentsJson = {
    images: iosSizes.map(({ size, name }) => ({
      filename: name,
      idiom: size >= 1024 ? 'ios-marketing' : 'iphone',
      scale: size <= 29 ? '1x' : size <= 60 ? '2x' : '3x',
      size: `${Math.floor(size / (size <= 29 ? 1 : size <= 60 ? 2 : 3))}x${Math.floor(size / (size <= 29 ? 1 : size <= 60 ? 2 : 3))}`
    })),
    info: {
      author: 'capacitor',
      version: 1
    }
  };

  fs.writeFileSync(
    path.join(iosDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );

  // Gerar ícones Android
  console.log('🤖 Gerando ícones Android...');
  for (const { size, density, name } of androidSizes) {
    const densityDir = path.join(androidDir, `mipmap-${density}`);
    if (!fs.existsSync(densityDir)) {
      fs.mkdirSync(densityDir, { recursive: true });
    }

    const outputPath = path.join(densityDir, name);
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ ${name} ${density} (${size}x${size})`);
  }

  console.log('🎉 Ícones gerados com sucesso!');
}

generateIcons().catch(console.error);
