import { createCanvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates the splash screen at iPhone 15 Pro Max resolution (1284x2778).
 * Expo's splash resizeMode: "contain" scales this down on other devices.
 *
 * Composition: icon centered, app name in crimson below it, subtitle in
 * muted gold beneath. Background is a subtle radial gradient from deep red
 * to near-black (matching the icon's palette).
 */

const WIDTH = 1284;
const HEIGHT = 2778;

async function main() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // ---- Background gradient ---------------------------------------------
  const bg = ctx.createRadialGradient(
    WIDTH / 2,
    HEIGHT * 0.42,
    WIDTH * 0.1,
    WIDTH / 2,
    HEIGHT * 0.42,
    HEIGHT * 0.7,
  );
  bg.addColorStop(0, '#1a0608');
  bg.addColorStop(0.6, '#0c0204');
  bg.addColorStop(1, '#06010a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ---- Icon (load the generated icon.png) -------------------------------
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  const icon = await loadImage(iconPath);
  const iconSize = 540;
  const iconX = (WIDTH - iconSize) / 2;
  const iconY = HEIGHT * 0.35 - iconSize / 2;

  // Halo behind icon
  const halo = ctx.createRadialGradient(
    WIDTH / 2,
    iconY + iconSize / 2,
    iconSize * 0.15,
    WIDTH / 2,
    iconY + iconSize / 2,
    iconSize * 1.1,
  );
  halo.addColorStop(0, 'rgba(255, 100, 20, 0.22)');
  halo.addColorStop(1, 'rgba(170, 34, 0, 0.0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(WIDTH / 2, iconY + iconSize / 2, iconSize * 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);

  // ---- Title text -------------------------------------------------------
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#cc2200';
  ctx.font = 'bold 96px serif';
  ctx.fillText('D2 Mule Tracker', WIDTH / 2, iconY + iconSize + 140);

  // Subtitle
  ctx.fillStyle = '#c9a84c';
  ctx.font = '44px serif';
  ctx.fillText('Diablo 2 Resurrected', WIDTH / 2, iconY + iconSize + 230);

  // ---- Save -------------------------------------------------------------
  const outPath = path.join(__dirname, '..', 'assets', 'splash-image.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated ${outPath} (${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
