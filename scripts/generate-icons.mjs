// Generates PWA icons using sharp
// Run: node scripts/generate-icons.mjs
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient (blue)
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#3b82f6');
  grad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = grad;

  // Rounded rect
  const r = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // 💰 emoji
  const fontSize = size * 0.52;
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💰', size / 2, size / 2 + size * 0.03);

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join(outDir, `icon-${size}x${size}.png`), buffer);
  console.log(`✓ icon-${size}x${size}.png`);
}

console.log('Icons generated in public/icons/');
