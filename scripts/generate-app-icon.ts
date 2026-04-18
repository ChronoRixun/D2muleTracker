import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Diamond Sigil app icon generator — a forged gold diamond with glowing
 * ember core. Generates all required sizes for iOS/Android/Web.
 *
 * Ember palette matches lib/theme.ts (gold + ember + charred backgrounds).
 */

const C = {
  void: '#030201',
  bg: '#0a0403',
  bg2: '#1c0d08',
  gold1: '#f5cf7a',
  gold2: '#e8b048',
  gold3: '#c88a28',
  goldDim: '#8a5018',
  ember1: '#ffd080',
  ember2: '#ff8038',
  ember3: '#ff5020',
  emberDim: '#b03810',
};

function drawDiamondSigil(
  ctx: CanvasRenderingContext2D,
  size: number,
  withGlow = true,
) {
  const scale = size / 1024;
  const center = size / 2;

  // Background radial gradient — hellforge backdrop.
  const bgGrad = ctx.createRadialGradient(
    center,
    center * 1.1,
    0,
    center,
    center * 1.1,
    size * 0.75,
  );
  bgGrad.addColorStop(0, C.bg2);
  bgGrad.addColorStop(1, C.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Outer ember glow (skipped for adaptive icons where Android masks).
  if (withGlow && size > 200) {
    ctx.save();
    // node-canvas supports filter via ctx.filter on recent versions.
    (ctx as unknown as { filter: string }).filter = 'blur(20px)';
    ctx.fillStyle = C.ember3;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(center, center, 280 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Diamond (rotated square) is drawn around the center.
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(Math.PI / 4);

  // Outer diamond — forged gold gradient.
  const outerSize = 270 * scale;
  const goldGrad = ctx.createLinearGradient(0, -outerSize, 0, outerSize);
  goldGrad.addColorStop(0, C.gold1);
  goldGrad.addColorStop(0.5, C.gold2);
  goldGrad.addColorStop(1, C.gold3);

  ctx.fillStyle = goldGrad;
  ctx.fillRect(-outerSize, -outerSize, outerSize * 2, outerSize * 2);

  // Bevel stroke.
  ctx.strokeStyle = C.gold3;
  ctx.lineWidth = 6 * scale;
  ctx.strokeRect(-outerSize, -outerSize, outerSize * 2, outerSize * 2);

  // Black cutout 1 — creates the outer ring shape.
  ctx.fillStyle = C.bg;
  const cutout1 = 240 * scale;
  ctx.fillRect(-cutout1, -cutout1, cutout1 * 2, cutout1 * 2);

  // Inner diamond ring.
  const innerSize = 170 * scale;
  ctx.fillStyle = goldGrad;
  ctx.fillRect(-innerSize, -innerSize, innerSize * 2, innerSize * 2);

  // Black cutout 2 — opens the core for the ember.
  ctx.fillStyle = C.bg;
  const cutout2 = 140 * scale;
  ctx.fillRect(-cutout2, -cutout2, cutout2 * 2, cutout2 * 2);

  ctx.restore();

  // Ember core — radial hot spot (not rotated with diamond).
  const emberGrad = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    95 * scale,
  );
  emberGrad.addColorStop(0, C.ember1);
  emberGrad.addColorStop(0.3, C.ember2);
  emberGrad.addColorStop(0.7, C.ember3);
  emberGrad.addColorStop(1, 'rgba(255, 80, 32, 0)');

  ctx.fillStyle = emberGrad;
  ctx.beginPath();
  ctx.arc(center, center, 95 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Hot center.
  ctx.fillStyle = '#ffe8b0';
  ctx.beginPath();
  ctx.arc(center, center, 40 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function generateIcon(size: number, filename: string, withGlow = true) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  drawDiamondSigil(ctx, size, withGlow);

  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'assets', 'icon', filename);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

generateIcon(1024, 'icon.png', true);
generateIcon(1024, 'adaptive-icon.png', false);
generateIcon(200, 'splash-icon.png', true);
generateIcon(48, 'favicon.png', false);

console.log('App icons generated successfully');
