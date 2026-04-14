import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates the D2 Mule Tracker app icon — a hellfire treasure chest with
 * flame tongues rising from an open lid on a near-black background.
 * The concept evokes Diablo's hellish aesthetic without copying any
 * Blizzard-owned art. Everything here is drawn procedurally.
 *
 * Colors:
 *   bg:        #0c0204  near-black with red undertone
 *   chest:     #140606  very dark red-black body
 *   crimson:   #aa2200  crimson band / outline color
 *   flames:    #ff2200, #ff4400, #ff6600, #ff8800
 *   glow:      orange inner glow from inside the chest
 *   lock:      bright orange glowing lock at the front
 */

const SIZE = 1024;

function drawIcon(ctx: CanvasRenderingContext2D, size: number) {
  // ---- Background -------------------------------------------------------
  const bgGrad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.75,
  );
  bgGrad.addColorStop(0, '#1a0608');
  bgGrad.addColorStop(1, '#0c0204');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle outer crimson vignette
  const vignette = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.45,
    size / 2,
    size / 2,
    size * 0.55,
  );
  vignette.addColorStop(0, 'rgba(170, 34, 0, 0.0)');
  vignette.addColorStop(1, 'rgba(170, 34, 0, 0.18)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  // ---- Inner chest glow (behind the flames) -----------------------------
  const cx = size / 2;
  const chestTop = size * 0.48;
  const chestBottom = size * 0.82;
  const chestLeft = size * 0.18;
  const chestRight = size * 0.82;
  const chestW = chestRight - chestLeft;
  const chestH = chestBottom - chestTop;

  // Warm halo above the chest
  const halo = ctx.createRadialGradient(
    cx,
    size * 0.36,
    size * 0.02,
    cx,
    size * 0.36,
    size * 0.42,
  );
  halo.addColorStop(0, 'rgba(255, 180, 80, 0.85)');
  halo.addColorStop(0.35, 'rgba(255, 100, 20, 0.35)');
  halo.addColorStop(1, 'rgba(170, 34, 0, 0.0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, size * 0.36, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // ---- Chest body (trapezoid-ish) ---------------------------------------
  ctx.save();
  ctx.fillStyle = '#140606';
  ctx.strokeStyle = '#aa2200';
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(chestLeft, chestTop);
  ctx.lineTo(chestRight, chestTop);
  ctx.lineTo(chestRight + chestW * 0.03, chestBottom);
  ctx.lineTo(chestLeft - chestW * 0.03, chestBottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Metal bands on chest body (vertical)
  ctx.save();
  ctx.strokeStyle = 'rgba(170, 34, 0, 0.55)';
  ctx.lineWidth = size * 0.01;
  const bandXs = [0.32, 0.68];
  bandXs.forEach((frac) => {
    const x = size * frac;
    ctx.beginPath();
    ctx.moveTo(x, chestTop);
    ctx.lineTo(x + (x < cx ? -size * 0.008 : size * 0.008), chestBottom);
    ctx.stroke();
  });

  // Horizontal band near bottom
  ctx.strokeStyle = 'rgba(170, 34, 0, 0.45)';
  ctx.beginPath();
  ctx.moveTo(chestLeft - chestW * 0.015, chestBottom - chestH * 0.2);
  ctx.lineTo(chestRight + chestW * 0.015, chestBottom - chestH * 0.2);
  ctx.stroke();
  ctx.restore();

  // Glowing cracks on chest body (interior light bleeding out)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 120, 30, 0.55)';
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.moveTo(chestLeft + chestW * 0.25, chestTop + chestH * 0.1);
  ctx.lineTo(chestLeft + chestW * 0.22, chestTop + chestH * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chestLeft + chestW * 0.72, chestTop + chestH * 0.15);
  ctx.lineTo(chestLeft + chestW * 0.78, chestTop + chestH * 0.6);
  ctx.stroke();
  ctx.restore();

  // ---- Chest interior opening (a dark slit along the top) ---------------
  const lidBaseY = chestTop;
  const lidLeft = chestLeft - chestW * 0.02;
  const lidRight = chestRight + chestW * 0.02;
  const lidW = lidRight - lidLeft;

  // Inside of chest (visible under open lid)
  ctx.save();
  const innerGrad = ctx.createLinearGradient(cx, chestTop - size * 0.08, cx, chestTop + size * 0.03);
  innerGrad.addColorStop(0, '#ff9933');
  innerGrad.addColorStop(0.5, '#ff4400');
  innerGrad.addColorStop(1, '#220000');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(lidLeft + lidW * 0.05, lidBaseY);
  ctx.quadraticCurveTo(cx, lidBaseY - size * 0.04, lidRight - lidW * 0.05, lidBaseY);
  ctx.lineTo(lidRight - lidW * 0.08, lidBaseY + size * 0.015);
  ctx.quadraticCurveTo(cx, lidBaseY + size * 0.005, lidLeft + lidW * 0.08, lidBaseY + size * 0.015);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ---- Chest lid (open, tilted back) ------------------------------------
  ctx.save();
  ctx.fillStyle = '#140606';
  ctx.strokeStyle = '#aa2200';
  ctx.lineWidth = size * 0.012;
  const lidTopY = size * 0.29;
  ctx.beginPath();
  ctx.moveTo(lidLeft, lidBaseY);
  ctx.lineTo(lidLeft + lidW * 0.08, lidTopY + size * 0.02);
  ctx.quadraticCurveTo(cx, lidTopY - size * 0.03, lidRight - lidW * 0.08, lidTopY + size * 0.02);
  ctx.lineTo(lidRight, lidBaseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lid metal band
  ctx.strokeStyle = 'rgba(170, 34, 0, 0.55)';
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(lidLeft + lidW * 0.05, lidBaseY - size * 0.002);
  ctx.quadraticCurveTo(cx, lidTopY + size * 0.01, lidRight - lidW * 0.05, lidBaseY - size * 0.002);
  ctx.stroke();
  ctx.restore();

  // ---- Flames rising from the chest -------------------------------------
  drawFlame(ctx, cx - size * 0.18, chestTop + size * 0.01, size * 0.09, size * 0.22, '#ff6600', '#ff2200');
  drawFlame(ctx, cx + size * 0.18, chestTop + size * 0.01, size * 0.09, size * 0.22, '#ff6600', '#ff2200');
  drawFlame(ctx, cx - size * 0.06, chestTop - size * 0.01, size * 0.1, size * 0.3, '#ff8800', '#ff4400');
  drawFlame(ctx, cx + size * 0.07, chestTop - size * 0.01, size * 0.11, size * 0.34, '#ffaa33', '#ff4400');
  drawFlame(ctx, cx, chestTop - size * 0.015, size * 0.13, size * 0.4, '#ffcc55', '#ff6600');

  // ---- Lock on chest front ---------------------------------------------
  const lockX = cx;
  const lockY = chestTop + chestH * 0.35;
  const lockR = size * 0.07;
  const lockGrad = ctx.createRadialGradient(lockX, lockY, lockR * 0.1, lockX, lockY, lockR);
  lockGrad.addColorStop(0, '#ffdd88');
  lockGrad.addColorStop(0.35, '#ff8800');
  lockGrad.addColorStop(0.75, '#ff2200');
  lockGrad.addColorStop(1, 'rgba(170, 34, 0, 0.1)');
  ctx.save();
  ctx.fillStyle = lockGrad;
  ctx.beginPath();
  ctx.arc(lockX, lockY, lockR, 0, Math.PI * 2);
  ctx.fill();
  // Keyhole
  ctx.fillStyle = 'rgba(20, 6, 6, 0.85)';
  ctx.beginPath();
  ctx.arc(lockX, lockY - lockR * 0.1, lockR * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(lockX - lockR * 0.12, lockY);
  ctx.lineTo(lockX + lockR * 0.12, lockY);
  ctx.lineTo(lockX + lockR * 0.06, lockY + lockR * 0.38);
  ctx.lineTo(lockX - lockR * 0.06, lockY + lockR * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ---- Ground glow under chest -----------------------------------------
  const groundGlow = ctx.createRadialGradient(
    cx,
    chestBottom + size * 0.02,
    size * 0.02,
    cx,
    chestBottom + size * 0.02,
    size * 0.32,
  );
  groundGlow.addColorStop(0, 'rgba(255, 80, 0, 0.35)');
  groundGlow.addColorStop(1, 'rgba(170, 34, 0, 0.0)');
  ctx.fillStyle = groundGlow;
  ctx.beginPath();
  ctx.ellipse(cx, chestBottom + size * 0.02, size * 0.3, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlame(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  halfWidth: number,
  height: number,
  coreColor: string,
  outerColor: string,
) {
  // Outer flame shape (soft)
  ctx.save();
  const outerGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY - height);
  outerGrad.addColorStop(0, outerColor);
  outerGrad.addColorStop(0.6, outerColor);
  outerGrad.addColorStop(1, 'rgba(170, 34, 0, 0.0)');
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(baseX - halfWidth, baseY);
  ctx.quadraticCurveTo(baseX - halfWidth * 1.3, baseY - height * 0.45, baseX - halfWidth * 0.3, baseY - height * 0.7);
  ctx.quadraticCurveTo(baseX - halfWidth * 0.1, baseY - height * 0.88, baseX, baseY - height);
  ctx.quadraticCurveTo(baseX + halfWidth * 0.15, baseY - height * 0.85, baseX + halfWidth * 0.4, baseY - height * 0.7);
  ctx.quadraticCurveTo(baseX + halfWidth * 1.3, baseY - height * 0.4, baseX + halfWidth, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Inner flame core (brighter)
  ctx.save();
  const coreGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY - height * 0.85);
  coreGrad.addColorStop(0, '#ffe680');
  coreGrad.addColorStop(0.5, coreColor);
  coreGrad.addColorStop(1, 'rgba(255, 100, 20, 0.0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(baseX - halfWidth * 0.55, baseY - height * 0.02);
  ctx.quadraticCurveTo(baseX - halfWidth * 0.7, baseY - height * 0.4, baseX - halfWidth * 0.15, baseY - height * 0.6);
  ctx.quadraticCurveTo(baseX - halfWidth * 0.05, baseY - height * 0.78, baseX, baseY - height * 0.85);
  ctx.quadraticCurveTo(baseX + halfWidth * 0.1, baseY - height * 0.75, baseX + halfWidth * 0.2, baseY - height * 0.6);
  ctx.quadraticCurveTo(baseX + halfWidth * 0.7, baseY - height * 0.35, baseX + halfWidth * 0.55, baseY - height * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function main() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  drawIcon(ctx, SIZE);

  const outPath = path.join(__dirname, '..', 'assets', 'icon.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated ${outPath} (${SIZE}x${SIZE})`);
}

main();
