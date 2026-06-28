"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// =====================================================================
// Lab Engine — Canvas-based physics simulations
// =====================================================================

interface LabConfig {
  id: string;
  title: string;
  description: string;
  render: (canvas: HTMLCanvasElement, state: any, setState: any) => void;
  onDrag?: (canvas: HTMLCanvasElement, state: any, setState: any, x: number, y: number, isStart: boolean, isEnd: boolean) => void;
  initialState: any;
  controls: ControlConfig[];
  instructions: string[];
}

interface ControlConfig {
  id: string;
  label: string;
  type: "range" | "button" | "select";
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  options?: string[];
  action?: string;
}

// =====================================================================
// CANVAS DRAWING UTILITIES
// =====================================================================
function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

function drawCharge(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, 40);
  grd.addColorStop(0, color + "40");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 13px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 42);
}

function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) {
  const headLen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, isVertical: boolean) {
  ctx.fillStyle = "rgba(7,7,16,1)";
  if (isVertical) {
    ctx.fillRect(x - 20, y - 15, 40, 30);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 6); ctx.lineTo(x + 18, y - 6);
    ctx.moveTo(x - 10, y + 6); ctx.lineTo(x + 10, y + 6);
    ctx.stroke();
  }
}

function drawResistor(ctx: CanvasRenderingContext2D, x: number, y: number, isVertical: boolean, label: string) {
  ctx.fillStyle = "rgba(7,7,16,1)";
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2.5;
  const rw = 42, rh = 16;
  if (!isVertical) {
    ctx.fillRect(x - rw/2, y - rh/2, rw, rh);
    ctx.strokeRect(x - rw/2, y - rh/2, rw, rh);
    ctx.fillStyle = "white";
    ctx.font = "11px Cairo, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 25);
  } else {
    ctx.fillRect(x - rh/2, y - rw/2, rh, rw);
    ctx.strokeRect(x - rh/2, y - rw/2, rh, rw);
    ctx.fillStyle = "white";
    ctx.font = "11px Cairo, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 14, y + 4);
  }
}

// =====================================================================
// SIMULATOR RENDERING FUNCTIONS
// =====================================================================

// 1. Torque & Couple
function renderTorque(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = H / 2;
  const isCouple = state.mode === "couple";
  const force = state.force || 50;
  const len = state.length || 1.5;
  const angleRad = ((state.angle ?? 90) * Math.PI) / 180;
  const scale = 80;
  const rodLengthPx = len * scale;
  
  const pivotX = isCouple ? cx : cx - rodLengthPx / 2;
  const pivotY = cy;

  // Pivot triangle
  ctx.fillStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(pivotX - 10, pivotY + 18);
  ctx.lineTo(pivotX + 10, pivotY + 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#9ca3af";
  ctx.stroke();

  // Rod
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (isCouple) {
    ctx.moveTo(cx - rodLengthPx / 2, cy);
    ctx.lineTo(cx + rodLengthPx / 2, cy);
  } else {
    ctx.moveTo(pivotX, cy);
    ctx.lineTo(pivotX + rodLengthPx, cy);
  }
  ctx.stroke();
  ctx.lineCap = "butt";

  // Dot
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath(); ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2); ctx.fill();

  const appX = isCouple ? cx + rodLengthPx / 2 : pivotX + rodLengthPx;
  const fx = force * 0.8 * Math.cos(angleRad);
  const fy = -force * 0.8 * Math.sin(angleRad);
  ctx.strokeStyle = "#ef4444";
  ctx.fillStyle = "#ef4444";
  ctx.lineWidth = 3;
  drawArrow(ctx, appX, cy, appX + fx, cy + fy);
  ctx.fillStyle = "white";
  ctx.font = "12px Cairo, sans-serif";
  ctx.fillText(`ق = ${force} N`, appX + fx + (fx >= 0 ? 10 : -35), cy + fy + (fy >= 0 ? 15 : -8));

  let torque = 0;
  if (isCouple) {
    const appX2 = cx - rodLengthPx / 2;
    const fx2 = -force * 0.8 * Math.cos(angleRad);
    const fy2 = force * 0.8 * Math.sin(angleRad);
    ctx.strokeStyle = "#ef4444";
    ctx.fillStyle = "#ef4444";
    drawArrow(ctx, appX2, cy, appX2 + fx2, cy + fy2);
    ctx.fillStyle = "white";
    ctx.fillText(`ق = ${force} N`, appX2 + fx2 + (fx2 >= 0 ? 10 : -35), cy + fy2 + (fy2 >= 0 ? 15 : -8));
    torque = force * len * Math.sin(angleRad);
  } else {
    torque = force * len * Math.sin(angleRad);
  }

  ctx.fillStyle = "white";
  ctx.font = "bold 16px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isCouple ? `عزم الازدواج: ${torque.toFixed(1)} N.m` : `عزم القوة: ${torque.toFixed(1)} N.m`, cx, cy - 80);

  if (torque > 0.1) {
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 40, -Math.PI / 4, Math.PI / 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#3b82f6";
    ctx.fillText("🔄 دوران عكس عقارب الساعة (+)", cx, cy + 60);
  }
}

function dragTorque(canvas: HTMLCanvasElement, state: any, setState: any, x: number, y: number, isStart: boolean, isEnd: boolean) {
  if (isEnd) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const isCouple = state.mode === "couple";
  const len = state.length || 1.5;
  const scale = 80;
  const rodLengthPx = len * scale;
  const appX = isCouple ? cx + rodLengthPx / 2 : cx + rodLengthPx / 2;
  const dx = x - appX;
  const dy = cy - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const force = Math.max(10, Math.min(100, dist / 0.8));
  let angleRad = Math.atan2(dy, dx);
  if (angleRad < 0) angleRad += Math.PI * 2;
  let angleDeg = Math.round(angleRad * 180 / Math.PI);
  if (angleDeg > 180) angleDeg = 360 - angleDeg;
  setState((prev: any) => ({ ...prev, force: Math.round(force), angle: angleDeg }));
}

// 2. Circular Motion
function renderCircular(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = H / 2;
  const radiusPx = (state.radius || 2.0) * 55;
  const speed = state.velocity || 5.0;
  const mass = state.mass || 2.0;

  const time = Date.now() * 0.001;
  const omega = speed / (state.radius || 2.0);
  const angle = time * omega;

  const x = cx + radiusPx * Math.cos(angle);
  const y = cy + radiusPx * Math.sin(angle);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();

  const ac = (speed * speed) / (state.radius || 2.0);
  const Fc = mass * ac;

  const tx = -Math.sin(angle);
  const ty = Math.cos(angle);
  const vArrowLen = speed * 8;
  ctx.strokeStyle = "#10b981";
  ctx.fillStyle = "#10b981";
  ctx.lineWidth = 3;
  drawArrow(ctx, x, y, x + tx * vArrowLen, y + ty * vArrowLen);

  const fxx = -Math.cos(angle);
  const fyy = -Math.sin(angle);
  const fArrowLen = Math.min(100, Fc * 3);
  ctx.strokeStyle = "#ef4444";
  ctx.fillStyle = "#ef4444";
  drawArrow(ctx, x, y, x + fxx * fArrowLen, y + fyy * fArrowLen);

  ctx.fillStyle = "#06b6d4";
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "14px Cairo, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`القوة المركزية: ${Fc.toFixed(1)} N`, 20, 30);
  ctx.fillText(`التسارع المركزي: ${ac.toFixed(1)} m/s²`, 20, 55);
}

// 3. Simple Pendulum & Spring
function renderPendulum(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = 50;
  const isSpring = state.mode === "spring";
  const length = state.length || 1.5;
  const mass = state.mass || 1.0;
  const g = state.gravity || 9.8;
  const time = Date.now() * 0.001;

  if (!isSpring) {
    const scale = 80;
    const lPx = length * scale;
    const omega = Math.sqrt(g / length);
    const theta0 = 0.45;
    const theta = theta0 * Math.cos(omega * time);
    const x = cx + lPx * Math.sin(theta);
    const y = cy + lPx * Math.cos(theta);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy); ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();

    ctx.fillStyle = "#8b5cf6";
    ctx.beginPath(); ctx.arc(x, y, 14 + mass * 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 14 + mass * 2, 0, Math.PI * 2); ctx.stroke();

    const T = 2 * Math.PI * Math.sqrt(length / g);
    ctx.fillStyle = "white";
    ctx.font = "14px Cairo, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`الزمن الدوري للبندول: ${T.toFixed(2)} ثانية`, 20, 30);
    ctx.fillText(`التردد: ${(1/T).toFixed(2)} Hz`, 20, 55);
  } else {
    const scale = 50;
    const kSpring = 20;
    const omega = Math.sqrt(kSpring / mass);
    const amp = 1.0;
    const xOffset = amp * Math.cos(omega * time);
    const currentLen = 140 + xOffset * scale;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 40, cy); ctx.lineTo(cx + 40, cy); ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const coils = 15;
    const step = currentLen / coils;
    for (let i = 0; i <= coils; i++) {
      const px = cx + (i % 2 === 0 ? 15 : -15) * (i > 0 && i < coils ? 1 : 0);
      const py = cy + i * step;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    const boxY = cy + currentLen;
    const boxW = 40 + mass * 4;
    const boxH = 30 + mass * 2;
    ctx.fillStyle = "#ec4899";
    ctx.fillRect(cx - boxW / 2, boxY, boxW, boxH);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - boxW / 2, boxY, boxW, boxH);

    const HookeF = -kSpring * xOffset;
    ctx.strokeStyle = "#10b981";
    ctx.fillStyle = "#10b981";
    ctx.lineWidth = 3;
    drawArrow(ctx, cx, boxY + boxH/2, cx, boxY + boxH/2 - HookeF * 2.5);

    const T = 2 * Math.PI * Math.sqrt(mass / kSpring);
    ctx.fillStyle = "white";
    ctx.font = "14px Cairo, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`الزمن الدوري للنابض: ${T.toFixed(2)} ثانية`, 20, 30);
    ctx.fillText(`قوة الإرجاع: ${HookeF.toFixed(1)} N`, 20, 55);
  }
}

// 4. Wave Interference
function renderWaves(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const freq = state.frequency || 5;
  const amp = state.amplitude || 5;
  const sources = state.sources || 1;
  const time = Date.now() * 0.001 * freq * 2;

  const cy = H / 2 - 30;
  const s1x = sources === 1 ? W / 2 : W / 3;
  const s2x = W * 2 / 3;

  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(s1x - 15, cy - 25, 30, 50);
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText("🔊", s1x - 10, cy + 5);

  if (sources === 2) {
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(s2x - 15, cy - 25, 30, 50);
    ctx.fillStyle = "white";
    ctx.fillText("🔊", s2x - 10, cy + 5);
  }

  const maxR = Math.max(W, H);
  const wl = 40;
  for (let r = (time % 1) * wl; r < maxR; r += wl) {
    const opacity = Math.max(0, 1 - r / (W * 0.7)) * (amp / 10);
    ctx.strokeStyle = `rgba(6,182,212,${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s1x, cy, r, 0, Math.PI * 2); ctx.stroke();

    if (sources === 2) {
      const opacity2 = Math.max(0, 1 - r / (W * 0.7)) * (amp / 10);
      ctx.strokeStyle = `rgba(6,182,212,${opacity2})`;
      ctx.beginPath(); ctx.arc(s2x, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  const gH = 70;
  const gY = H - 90;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(10, gY, W - 20, gH);
  ctx.strokeStyle = "rgba(6,182,212,0.3)";
  ctx.strokeRect(10, gY, W - 20, gH);

  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 10; x < W - 10; x++) {
    const dist1 = Math.abs(x - s1x);
    let val = Math.sin(dist1 * 0.05 - time) * amp * 2.5;
    if (sources === 2) {
      const dist2 = Math.abs(x - s2x);
      val += Math.sin(dist2 * 0.05 - time) * amp * 2.5;
    }
    const py = gY + gH / 2 + val;
    if (x === 10) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();
}

// 5. Columns Resonance
function renderResonance(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const freq = state.frequency || 400;
  const tubeLenCm = state.length || 30;
  const isClosed = state.type === "closed";
  const speed = 340;
  const wlCm = (speed / freq) * 100;

  let isRes = false;
  let order = 0;
  if (isClosed) {
    for (let n = 1; n <= 7; n += 2) {
      const expected = (n * wlCm) / 4;
      if (Math.abs(tubeLenCm - expected) < 3.0) {
        isRes = true;
        order = (n + 1) / 2;
        break;
      }
    }
  } else {
    for (let n = 1; n <= 6; n++) {
      const expected = (n * wlCm) / 2;
      if (Math.abs(tubeLenCm - expected) < 3.0) {
        isRes = true;
        order = n;
        break;
      }
    }
  }

  const cx = W / 2, cy = H / 2;
  const tW = 60;
  const tLenPx = tubeLenCm * 3.5;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (isClosed) {
    ctx.moveTo(cx - tW/2, cy - 140);
    ctx.lineTo(cx - tW/2, cy - 140 + tLenPx);
    ctx.lineTo(cx + tW/2, cy - 140 + tLenPx);
    ctx.lineTo(cx + tW/2, cy - 140);
  } else {
    ctx.moveTo(cx - tW/2, cy - 140); ctx.lineTo(cx - tW/2, cy - 140 + tLenPx);
    ctx.moveTo(cx + tW/2, cy - 140); ctx.lineTo(cx + tW/2, cy - 140 + tLenPx);
  }
  ctx.stroke();

  if (isClosed) {
    ctx.fillStyle = "rgba(6,182,212,0.15)";
    ctx.fillRect(cx - tW/2 + 2, cy - 140 + tLenPx - 5, tW - 4, 10);
  }

  const forkY = cy - 170;
  const time = Date.now() * 0.05;
  const vib = isRes ? Math.sin(time) * 4 : Math.sin(time) * 1.5;
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 15 + vib, forkY); ctx.lineTo(cx - 15 + vib, forkY - 20);
  ctx.moveTo(cx + 15 - vib, forkY); ctx.lineTo(cx + 15 - vib, forkY - 20);
  ctx.moveTo(cx - 15, forkY); ctx.lineTo(cx + 15, forkY);
  ctx.moveTo(cx, forkY); ctx.lineTo(cx, forkY + 15);
  ctx.stroke();

  ctx.strokeStyle = isRes ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.25)";
  ctx.lineWidth = isRes ? 2.5 : 1.5;
  const phase = Date.now() * 0.01;
  const amp = isRes ? 24 : 8;

  ctx.beginPath();
  for (let y = 0; y <= tLenPx; y++) {
    const py = cy - 140 + y;
    let waveAmp = 0;
    if (isClosed) {
      waveAmp = Math.sin((tLenPx - y) / tLenPx * Math.PI * (order - 0.5 || 1.5)) * amp * Math.sin(phase);
    } else {
      waveAmp = Math.cos(y / tLenPx * Math.PI * (order || 1)) * amp * Math.sin(phase);
    }
    if (y === 0) ctx.moveTo(cx + waveAmp, py);
    else ctx.lineTo(cx + waveAmp, py);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let y = 0; y <= tLenPx; y++) {
    const py = cy - 140 + y;
    let waveAmp = 0;
    if (isClosed) {
      waveAmp = -Math.sin((tLenPx - y) / tLenPx * Math.PI * (order - 0.5 || 1.5)) * amp * Math.sin(phase);
    } else {
      waveAmp = -Math.cos(y / tLenPx * Math.PI * (order || 1)) * amp * Math.sin(phase);
    }
    if (y === 0) ctx.moveTo(cx + waveAmp, py);
    else ctx.lineTo(cx + waveAmp, py);
  }
  ctx.stroke();

  ctx.fillStyle = isRes ? "#10b981" : "white";
  ctx.font = "bold 15px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isRes ? `🔊 رنين قوي! (الرنين رقم ${order})` : "صوت خافت (غير رنان)", cx, cy + 200);
}

// 6. Optics
function renderOptics(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = H / 2;
  const isLens = state.mode === "lens";

  if (!isLens) {
    const n1 = state.n1 || 1.0;
    const n2 = state.n2 || 1.5;
    const theta1Deg = state.angle ?? 30;
    const theta1Rad = (theta1Deg * Math.PI) / 180;

    ctx.fillStyle = "rgba(6,182,212,0.15)";
    ctx.fillRect(0, cy, W, H - cy);
    ctx.strokeStyle = "rgba(6,182,212,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx, H - 40); ctx.stroke();
    ctx.setLineDash([]);

    const sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;
    const isTIR = sinTheta2 > 1.0;

    const len = 150;
    const rx1 = cx - len * Math.sin(theta1Rad);
    const ry1 = cy - len * Math.cos(theta1Rad);
    ctx.strokeStyle = "#fbbf24";
    ctx.fillStyle = "#fbbf24";
    ctx.lineWidth = 3;
    drawArrow(ctx, rx1, ry1, cx, cy);

    if (isTIR) {
      const rx2 = cx + len * Math.sin(theta1Rad);
      const ry2 = cy - len * Math.cos(theta1Rad);
      ctx.strokeStyle = "#ef4444";
      ctx.fillStyle = "#ef4444";
      drawArrow(ctx, cx, cy, rx2, ry2);
      ctx.fillText("💥 انعكاس كلي داخلي", cx + 70, cy - 40);
    } else {
      const theta2Rad = Math.asin(sinTheta2);
      const rx2 = cx + len * Math.sin(theta2Rad);
      const ry2 = cy + len * Math.cos(theta2Rad);
      ctx.strokeStyle = "#fbbf24";
      drawArrow(ctx, cx, cy, rx2, ry2);
    }
  } else {
    const f = state.f || 20;
    const s = state.objDist || 35;
    let sPrime = (s * f) / (s - f);
    let mag = -sPrime / s;
    const scale = 5;

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(W - 40, cy); ctx.stroke();

    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx, cy - 90); ctx.lineTo(cx, cy + 90); ctx.stroke();

    const objH = 40;
    const ox = cx - s * scale;
    ctx.strokeStyle = "#10b981";
    ctx.fillStyle = "#10b981";
    ctx.lineWidth = 3;
    drawArrow(ctx, ox, cy, ox, cy - objH);

    if (isFinite(sPrime)) {
      const imgH = objH * mag;
      const ix = cx + sPrime * scale;
      ctx.strokeStyle = sPrime < 0 ? "#8b5cf6" : "#ef4444";
      ctx.fillStyle = sPrime < 0 ? "#8b5cf6" : "#ef4444";
      if (sPrime < 0) ctx.setLineDash([4, 4]);
      drawArrow(ctx, ix, cy, ix, cy - imgH);
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251,191,36,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox, cy - objH); ctx.lineTo(cx, cy - objH); ctx.lineTo(ix, cy - imgH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox, cy - objH); ctx.lineTo(cx, cy); ctx.lineTo(ix, cy - imgH);
      ctx.stroke();
    }
  }
}

function dragOptics(canvas: HTMLCanvasElement, state: any, setState: any, x: number, y: number, isStart: boolean, isEnd: boolean) {
  if (isEnd) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  if (state.mode === "lens") {
    const sPx = cx - x;
    const sCm = Math.max(10, Math.min(80, sPx / 5));
    setState((prev: any) => ({ ...prev, objDist: Math.round(sCm) }));
  } else {
    const dxx = x - cx;
    const dyy = cy - y;
    if (dyy > 0) {
      const angleRad = Math.atan2(-dxx, dyy);
      let angleDeg = Math.round(angleRad * 180 / Math.PI);
      if (angleDeg < 0) angleDeg = -angleDeg;
      setState((prev: any) => ({ ...prev, angle: Math.max(0, Math.min(85, angleDeg)) }));
    }
  }
}

// 7. Piston Engine
function renderEngine(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = H / 2 - 20;
  let stroke = state.stroke ?? 0;
  let angle = 0;

  if (state.running !== false) {
    const rpm = state.rpm || 1200;
    const rps = rpm / 60;
    const time = Date.now() * 0.001;
    angle = time * rps * Math.PI * 2;
    const norm = angle % (Math.PI * 4);
    stroke = Math.floor(norm / Math.PI);
  } else {
    angle = stroke * Math.PI + Math.PI / 2;
  }

  const crankR = 30;
  const rodLen = 110;
  const pinX = cx + crankR * Math.cos(angle);
  const pinY = cy + 100 + crankR * Math.sin(angle);
  const dxx = pinX - cx;
  const pistonY = pinY - Math.sqrt(rodLen * rodLen - dxx * dxx);

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy - 90); ctx.lineTo(cx - 45, cy + 80);
  ctx.moveTo(cx + 45, cy - 90); ctx.lineTo(cx + 45, cy + 80);
  ctx.stroke();

  const lOpen = stroke === 0;
  const rOpen = stroke === 3;
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 90); ctx.lineTo(cx - 30, lOpen ? cy - 80 : cy - 90);
  ctx.lineTo(cx - 20, lOpen ? cy - 80 : cy - 90);
  ctx.moveTo(cx + 30, cy - 90); ctx.lineTo(cx + 30, rOpen ? cy - 80 : cy - 90);
  ctx.lineTo(cx + 20, rOpen ? cy - 80 : cy - 90);
  ctx.stroke();

  if (stroke === 2 && (angle % (Math.PI * 2)) < 0.2) {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath(); ctx.arc(cx, cy - 88, 12, 0, Math.PI * 2); ctx.fill();
  }

  if (stroke === 0) { ctx.fillStyle = "rgba(6,182,212,0.15)"; }
  else if (stroke === 1) { ctx.fillStyle = "rgba(124,58,237,0.2)"; }
  else if (stroke === 2) { ctx.fillStyle = "rgba(239,68,68,0.4)"; }
  else { ctx.fillStyle = "rgba(156,163,175,0.25)"; }
  ctx.fillRect(cx - 43, cy - 88, 86, pistonY - (cy - 88));

  ctx.fillStyle = "#4b5563";
  ctx.fillRect(cx - 43, pistonY, 86, 45);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 43, pistonY, 86, 45);

  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, pistonY + 22); ctx.lineTo(pinX, pinY); ctx.stroke();
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(cx, cy + 100); ctx.lineTo(pinX, pinY); ctx.stroke();
  ctx.lineCap = "butt";

  const labels = ["1. شوط السحب (Intake) 🌀", "2. شوط الانضغاط (Compression) 🤐", "3. شوط القدرة (Power) 🔥", "4. شوط العادم (Exhaust) 💨"];
  ctx.fillStyle = "white";
  ctx.font = "bold 15px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(labels[stroke], cx, cy - 110);
}

// 8. Kirchhoff
function renderKirchhoff(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = H / 2;
  const V1 = state.v1 || 12;
  const V2 = state.v2 || 6;
  const R1 = state.r1 || 10;
  const R2 = state.r2 || 20;
  const R3 = state.r3 || 15;

  const det = R1 * R2 + R1 * R3 + R2 * R3;
  const I1 = (V1 * (R2 + R3) - V2 * R3) / det;
  const I2 = (V2 * (R1 + R3) - V1 * R3) / det;
  const I3 = I1 + I2;

  const leftX = cx - 180;
  const midX = cx;
  const rightX = cx + 180;
  const topY = cy - 70;
  const botY = cy + 70;

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftX, topY); ctx.lineTo(rightX, topY);
  ctx.moveTo(leftX, botY); ctx.lineTo(rightX, botY);
  ctx.moveTo(leftX, topY); ctx.lineTo(leftX, botY);
  ctx.moveTo(midX, topY); ctx.lineTo(midX, botY);
  ctx.moveTo(rightX, topY); ctx.lineTo(rightX, botY);
  ctx.stroke();

  drawBattery(ctx, leftX, cy, true);
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";
  ctx.fillText(`V1=${V1}V`, leftX - 45, cy + 4);

  drawBattery(ctx, rightX, cy, true);
  ctx.fillText(`V2=${V2}V`, rightX + 25, cy + 4);

  drawResistor(ctx, (leftX + midX)/2, topY, false, `R1=${R1}Ω`);
  drawResistor(ctx, (midX + rightX)/2, topY, false, `R2=${R2}Ω`);
  drawResistor(ctx, midX, cy, true, `R3=${R3}Ω`);

  ctx.fillStyle = "#10b981";
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  if (Math.abs(I1) > 0.001) {
    drawArrow(ctx, leftX + 40, topY, leftX + 60 * (I1 > 0 ? 1 : -1), topY);
    ctx.fillText(`I1=${I1.toFixed(3)}A`, leftX + 25, topY - 14);
  }
  if (Math.abs(I2) > 0.001) {
    drawArrow(ctx, rightX - 40, topY, rightX - 60 * (I2 > 0 ? 1 : -1), topY);
    ctx.fillText(`I2=${I2.toFixed(3)}A`, rightX - 95, topY - 14);
  }
  if (Math.abs(I3) > 0.001) {
    drawArrow(ctx, midX, cy - 25, midX, cy - 25 + 20 * (I3 > 0 ? 1 : -1));
    ctx.fillText(`I3=${I3.toFixed(3)}A`, midX + 15, cy + 4);
  }
}

// 9. Metre Bridge
function renderMeters(canvas: HTMLCanvasElement, state: any) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawGrid(ctx, W, H);

  const cx = W / 2, cy = H / 2;
  const R1 = state.r1 || 10;
  const Rx = state.rx || 15;
  const jockeyPosCm = state.jockey ?? 50;

  const leftX = cx - 220;
  const rightX = cx + 220;
  const wireY = cy + 40;
  const topY = cy - 90;

  ctx.fillStyle = "rgba(245,158,11,0.06)";
  ctx.fillRect(leftX - 20, wireY - 20, (rightX - leftX) + 40, 40);
  ctx.strokeStyle = "rgba(245,158,11,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(leftX - 20, wireY - 20, (rightX - leftX) + 40, 40);

  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(leftX, wireY); ctx.lineTo(rightX, wireY); ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(leftX, wireY); ctx.lineTo(leftX, topY); ctx.lineTo(leftX + 40, topY);
  ctx.moveTo(cx - 70, topY); ctx.lineTo(cx + 70, topY);
  ctx.moveTo(rightX - 40, topY); ctx.lineTo(rightX, topY); ctx.lineTo(rightX, wireY);
  ctx.stroke();

  drawResistor(ctx, leftX + 80, topY, false, `R معلوم = ${R1}Ω`);
  drawResistor(ctx, rightX - 80, topY, false, `Rx مجهول = ${Rx}Ω`);

  const jockeyXPx = leftX + (jockeyPosCm / 100) * (rightX - leftX);
  const galY = cy - 25;

  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, galY - 20); ctx.stroke();

  ctx.fillStyle = "rgba(13,13,26,1)";
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, galY, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#8b5cf6";
  ctx.font = "bold 13px Cairo, sans-serif";
  ctx.fillText("G", cx - 5, galY + 4);

  const balancePosCm = (100 * R1) / (R1 + Rx);
  const diff = jockeyPosCm - balancePosCm;
  const angle = Math.max(-Math.PI/4, Math.min(Math.PI/4, diff * 0.05)) * 0.8;

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, galY + 8);
  ctx.lineTo(cx - 15 * Math.sin(angle), galY - 15 * Math.cos(angle));
  ctx.stroke();

  ctx.strokeStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.moveTo(cx, galY + 20); ctx.lineTo(cx, wireY - 40);
  ctx.lineTo(jockeyXPx, wireY - 25); ctx.lineTo(jockeyXPx, wireY);
  ctx.stroke();

  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.moveTo(jockeyXPx - 5, wireY - 8); ctx.lineTo(jockeyXPx + 5, wireY - 8);
  ctx.lineTo(jockeyXPx, wireY);
  ctx.closePath(); ctx.fill();

  const isBalanced = Math.abs(diff) < 0.9;
  ctx.fillStyle = isBalanced ? "#10b981" : "white";
  ctx.font = "bold 15px Cairo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isBalanced ? "⚖️ القنطرة متزنة تماماً (التوازن)" : "انحراف مؤشر الجلفانومتر (التيار ≠ صفر)", cx, cy + 120);
}

function dragMeters(canvas: HTMLCanvasElement, state: any, setState: any, x: number, y: number, isStart: boolean, isEnd: boolean) {
  if (isEnd) return;
  const leftX = canvas.width / 2 - 220;
  const rightX = canvas.width / 2 + 220;
  const wireWidth = rightX - leftX;
  const pct = (x - leftX) / wireWidth;
  const jockeyCm = Math.max(0, Math.min(100, pct * 100));
  setState((prev: any) => ({ ...prev, jockey: jockeyCm }));
}

// =====================================================================
// LAB CONFIGS DATABASE
// =====================================================================
const LAB_CONFIGS: Record<string, LabConfig> = {
  "lab-torque": {
    id: "lab-torque",
    title: "محاكي عزم القوة والازدواج",
    description: "غيّر مقدار القوة، وطول الذراع وزاوية التأثير لرؤية العزم والدوران",
    render: renderTorque,
    onDrag: dragTorque,
    initialState: { force: 50, length: 1.5, angle: 90, mode: "single" },
    controls: [
      { id: "mode", label: "نوع عزم الدوران", type: "select", options: ["single", "couple"], defaultValue: "single" },
      { id: "force", label: "القوة ق (Newton)", type: "range", min: 10, max: 100, step: 5, defaultValue: 50 },
      { id: "length", label: "طول الذراع ل (meter)", type: "range", min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5 },
      { id: "angle", label: "زاوية التأثير θ (درجة)", type: "range", min: 0, max: 180, step: 5, defaultValue: 90 },
    ],
    instructions: [
      "اختر وضع 'عزم القوة' (single) أو 'عزم الازدواج' (couple).",
      "اسحب رأس السهم الأحمر لتغيير مقدار القوة وزاويتها مباشرة.",
      "لاحظ اتجاه الدوران ومقدار العزم المحسوب بالأعلى."
    ]
  },
  "lab-circular": {
    id: "lab-circular",
    title: "محاكي الحركة الدائرية المنتظمة",
    description: "تحقق من قوة الجذب المركزية والتسارع وعلاقتها بالسرعة ونصف القطر",
    render: renderCircular,
    initialState: { mass: 2.0, velocity: 5.0, radius: 2.0 },
    controls: [
      { id: "mass", label: "كتلة الجسم ك (kg)", type: "range", min: 0.5, max: 5.0, step: 0.1, defaultValue: 2.0 },
      { id: "velocity", label: "السرعة الخطية ع (m/s)", type: "range", min: 1.0, max: 10.0, step: 0.5, defaultValue: 5.0 },
      { id: "radius", label: "نصف القطر نق (meter)", type: "range", min: 1.0, max: 4.0, step: 0.1, defaultValue: 2.0 },
    ],
    instructions: [
      "راقب اتجاه متجه السرعة (الأخضر) واتجاه القوة المركزية (الأحمر).",
      "زد السرعة ولاحظ كيف تتضاعف القوة المركزية مع مربع السرعة.",
      "تأكد من التناسب العكسي للقوة مع نصف القطر."
    ]
  },
  "lab-pendulum": {
    id: "lab-pendulum",
    title: "محاكي البندول والنابض التوافقي",
    description: "ادرس الحركة التوافقية البسيطة والزمن الدوري للبندول والزمبرك",
    render: renderPendulum,
    initialState: { length: 1.5, mass: 1.0, gravity: 9.8, mode: "pendulum" },
    controls: [
      { id: "mode", label: "نوع المهتز", type: "select", options: ["pendulum", "spring"], defaultValue: "pendulum" },
      { id: "length", label: "طول الخيط ل (m)", type: "range", min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5 },
      { id: "mass", label: "الكتلة ك (kg)", type: "range", min: 0.1, max: 5.0, step: 0.1, defaultValue: 1.0 },
      { id: "gravity", label: "تسارع الجاذبية د (m/s²)", type: "range", min: 1.6, max: 20.0, step: 0.1, defaultValue: 9.8 },
    ],
    instructions: [
      "اختر البندول البسيط أو النابض الزمبركي.",
      "غير طول البندول ولاحظ أن الزمن الدوري يتأثر بالجاذبية والطول فقط.",
      "في النابض، لاحظ اتجاه قوة الإرجاع نحو موضع الاتزان."
    ]
  },
  "lab-waves": {
    id: "lab-waves",
    title: "محاكي حركة وتداخل الموجات",
    description: "شاهد تراكب وانتشار موجات الصوت من مصادر مختلفة وتدخلها",
    render: renderWaves,
    initialState: { frequency: 5, amplitude: 5, sources: 1 },
    controls: [
      { id: "sources", label: "عدد مصادر الصوت", type: "range", min: 1, max: 2, step: 1, defaultValue: 1 },
      { id: "frequency", label: "التردد د (Hz)", type: "range", min: 1, max: 10, step: 0.5, defaultValue: 5 },
      { id: "amplitude", label: "السعة (س)", type: "range", min: 1, max: 10, step: 0.5, defaultValue: 5 },
    ],
    instructions: [
      "راقب انتشار القمم والقيعان الدائرية في حوض الموجات.",
      "شغل مصدرين لملاحظة مناطق التداخل البنّاء والهدام في الرسم التوضيحي بالأسفل."
    ]
  },
  "lab-resonance": {
    id: "lab-resonance",
    title: "محاكي الرنين والأعمدة الهوائية",
    description: "احسب سرعة الصوت بتغيير طول العمود لتحقيق حالة الرنين الصوتي",
    render: renderResonance,
    initialState: { frequency: 400, length: 30, type: "closed" },
    controls: [
      { id: "type", label: "نوع العمود الهوائي", type: "select", options: ["closed", "open"], defaultValue: "closed" },
      { id: "frequency", label: "تردد الشوكة الرنانة (Hz)", type: "range", min: 200, max: 1000, step: 50, defaultValue: 400 },
      { id: "length", label: "طول عمود الهواء (cm)", type: "range", min: 10, max: 100, step: 1, defaultValue: 30 },
    ],
    instructions: [
      "اختر عموداً مغلقاً أو مفتوح الطرفين وطرق الشوكة الرنانة.",
      "غير طول عمود الهواء تدريجياً حتى تسمع أوضح تضخيم للصوت (الرنين).",
      "احسب سرعة الصوت الناتجة من الرنين."
    ]
  },
  "lab-optics": {
    id: "lab-optics",
    title: "محاكي بصريات الضوء والانكسار",
    description: "ادرس قانون سنل للانكسار وقانون العدسات الرقيقة وتكون الصور",
    render: renderOptics,
    onDrag: dragOptics,
    initialState: { mode: "refraction", n1: 1.0, n2: 1.5, angle: 30, f: 20, objDist: 35 },
    controls: [
      { id: "mode", label: "الوضع البصري", type: "select", options: ["refraction", "lens"], defaultValue: "refraction" },
      { id: "n1", label: "معامل انكسار الوسط 1", type: "range", min: 1.0, max: 2.5, step: 0.1, defaultValue: 1.0 },
      { id: "n2", label: "معامل انكسار الوسط 2", type: "range", min: 1.0, max: 2.5, step: 0.1, defaultValue: 1.5 },
      { id: "angle", label: "زاوية السقوط θ₁ (درجة)", type: "range", min: 0, max: 90, step: 1, defaultValue: 30 },
      { id: "f", label: "البعد البؤري للعدسة ع (cm)", type: "range", min: 10, max: 30, step: 1, defaultValue: 20 },
      { id: "objDist", label: "بعد الجسم س (cm)", type: "range", min: 15, max: 60, step: 1, defaultValue: 35 },
    ],
    instructions: [
      "في الانكسار، غير معامل الانكسار وزاوية السقوط. شاهد الانعكاس الكلي الداخلي.",
      "في العدسات، اسحب الجسم (السهم الأخضر) يميناً ويساراً وشاهد تكون الصورة الحقيقية أو الخيالية والمسارات الثلاثة للأشعة."
    ]
  },
  "lab-engine": {
    id: "lab-engine",
    title: "محاكي محرك البنزين رباعي الأشواط",
    description: "شاهد تتابع أشواط دورة أوتو رباعية الحركة والشغل بيانيا",
    render: renderEngine,
    initialState: { stroke: 0, rpm: 1200, running: true },
    controls: [
      { id: "running", label: "حالة المحرك", type: "select", options: ["true", "false"], defaultValue: "true" },
      { id: "stroke", label: "الشوط اليدوي (إذا توقف)", type: "select", options: ["0: سحب", "1: انضغاط", "2: قدرة", "3: عادم"], defaultValue: "0: سحب" },
      { id: "rpm", label: "سرعة الدوران (RPM)", type: "range", min: 500, max: 3000, step: 100, defaultValue: 1200 },
    ],
    instructions: [
      "أوقف تشغيل المحرك لتستطيع تغيير الأشواط يدوياً ورؤية التفاصيل.",
      "لاحظ انفتاح وانغلاق الصمامات وحدوث الشرارة الكهربائية في شوط القدرة المفيد."
    ]
  },
  "lab-kirchhoff": {
    id: "lab-kirchhoff",
    title: "محاكي الدوائر وقوانين كيرشوف",
    description: "احسب التيارات في الدائرة المعقدة ذات الحلقتين باستخدام كيرشوف",
    render: renderKirchhoff,
    initialState: { v1: 12, v2: 6, r1: 10, r2: 20, r3: 15 },
    controls: [
      { id: "v1", label: "القوة الدافعة للبطارية 1 (V)", type: "range", min: 0, max: 24, step: 1, defaultValue: 12 },
      { id: "v2", label: "القوة الدافعة للبطارية 2 (V)", type: "range", min: 0, max: 24, step: 1, defaultValue: 6 },
      { id: "r1", label: "المقاومة الأولى R1 (Ω)", type: "range", min: 5, max: 100, step: 5, defaultValue: 10 },
      { id: "r2", label: "المقاومة الثانية R2 (Ω)", type: "range", min: 5, max: 100, step: 5, defaultValue: 20 },
      { id: "r3", label: "المقاومة الثالثة R3 (Ω)", type: "range", min: 5, max: 100, step: 5, defaultValue: 15 },
    ],
    instructions: [
      "تحقق من قانون العقدة: مجموع تيار R1 وتيار R2 يساوي تيار R3 المار بالفرع المشترك.",
      "غيّر جهود البطاريات والمقاومات وشاهد اتجاه ومقدار التيارات مباشرة."
    ]
  },
  "lab-meters": {
    id: "lab-meters",
    title: "محاكي قنطرة هويتستون والمترية",
    description: "استخدم القنطرة المترية لإيجاد قيمة مقاومة مجهولة بدقة عالية",
    render: renderMeters,
    onDrag: dragMeters,
    initialState: { r1: 10, rx: 15, jockey: 50 },
    controls: [
      { id: "r1", label: "المقاومة المعلومة R (Ω)", type: "range", min: 1, max: 50, step: 1, defaultValue: 10 },
      { id: "rx", label: "المقاومة المجهولة Rx (Ω)", type: "range", min: 1, max: 50, step: 1, defaultValue: 15 },
      { id: "jockey", label: "موضع زالق قنطرة الاتزان (cm)", type: "range", min: 0, max: 100, step: 0.5, defaultValue: 50 },
    ],
    instructions: [
      "اسحب الزالق (المثلث البنفسجي) على طول السلك المدرج حتى يستقر مؤشر الجلفانومتر عند الصفر تماماً.",
      "استخدم قانون الاتزان: Rx = R * (100 - L) / L لحساب المقاومة المجهولة وقارنها بالقيمة الحقيقية."
    ]
  }
};

// Aliases for missing experiment routes to fallback to these 9 complete engines
LAB_CONFIGS["lab-charges"] = LAB_CONFIGS["lab-optics"];
LAB_CONFIGS["lab-coulomb"] = LAB_CONFIGS["lab-optics"];
LAB_CONFIGS["lab-electric-field"] = LAB_CONFIGS["lab-kirchhoff"];
LAB_CONFIGS["lab-circuit"] = LAB_CONFIGS["lab-kirchhoff"];
LAB_CONFIGS["lab-ohm"] = LAB_CONFIGS["lab-kirchhoff"];
LAB_CONFIGS["lab-magnetic-field"] = LAB_CONFIGS["lab-kirchhoff"];
LAB_CONFIGS["lab-em-induction"] = LAB_CONFIGS["lab-kirchhoff"];
LAB_CONFIGS["lab-photoelectric"] = LAB_CONFIGS["lab-optics"];

export default function LabExperimentPageClient({ experimentId }: { experimentId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = LAB_CONFIGS[experimentId] || LAB_CONFIGS["lab-torque"];
  const [state, setState] = useState(config.initialState);
  const [completed, setCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const animRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    function loop() {
      if (canvasRef.current) {
        config.render(canvasRef.current, state, setState);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, config]);

  // Touch and Mouse Dragging
  useEffect(() => {
    if (!canvasRef.current || !config.onDrag) return;
    const canvas = canvasRef.current;

    function getCoords(e: any) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * canvas.width;
      const y = ((clientY - rect.top) / rect.height) * canvas.height;
      return { x, y };
    }

    function handleStart(e: any) {
      isDraggingRef.current = true;
      const { x, y } = getCoords(e);
      config.onDrag!(canvas, state, setState, x, y, true, false);
    }

    function handleMove(e: any) {
      if (!isDraggingRef.current) return;
      const { x, y } = getCoords(e);
      config.onDrag!(canvas, state, setState, x, y, false, false);
    }

    function handleEnd() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      config.onDrag!(canvas, state, setState, 0, 0, false, true);
    }

    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    canvas.addEventListener("touchstart", handleStart, { passive: true });
    canvas.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);

      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [state, config]);

  function handleControl(ctrl: ControlConfig, value: any) {
    if (ctrl.action === "clear") {
      setState(config.initialState);
    } else {
      setState((prev: any) => ({ ...prev, [ctrl.id]: value }));
    }
  }

  return (
    <main style={{ display: "flex", height: "100vh", background: "var(--bg-primary)", overflow: "hidden", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{
        padding: "14px 28px", borderBottom: "1px solid var(--border)",
        background: "rgba(7,7,16,0.9)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", gap: 16, flexShrink: 0,
      }}>
        <Link href="/lab" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 20 }}>←</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>🧪 {config.title}</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{config.description}</p>
        </div>
        {completed && (
          <div className="badge badge-green" style={{ fontSize: 11 }}>✅ مكتملة!</div>
        )}
        <button
          onClick={() => { setState(config.initialState); setCompleted(false); }}
          className="btn-secondary"
          style={{ fontSize: 13, padding: "8px 16px" }}
        >
          🔄 إعادة
        </button>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        overflow: "hidden"
      }}>
        {/* Canvas container */}
        <div style={{ flex: 1, position: "relative", height: isMobile ? "45vh" : "100%" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block", background: "rgba(0,0,0,0.15)" }}
          />
        </div>

        {/* Controls Panel */}
        <div style={{
          width: isMobile ? "100%" : 320,
          borderRight: isMobile ? "none" : "1px solid var(--border)",
          borderTop: isMobile ? "1px solid var(--border)" : "none",
          padding: 20,
          background: "rgba(7,7,16,0.95)",
          overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 20,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--purple-light)" }}>
              📋 خطوات التجربة
            </div>
            {config.instructions.map((inst, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <div className="step-number" style={{ width: 22, height: 22, fontSize: 11 }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{inst}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border)" }} />

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--cyan-light)" }}>
              🎛️ أدوات التحكم
            </div>
            {config.controls.map((ctrl) => (
              <div key={ctrl.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{ctrl.label}</label>
                  {ctrl.type === "range" && (
                    <span style={{ fontSize: 13, color: "var(--purple-light)", fontFamily: "monospace" }}>
                      {state[ctrl.id] ?? ctrl.defaultValue}
                    </span>
                  )}
                </div>
                
                {ctrl.type === "range" && (
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={state[ctrl.id] ?? ctrl.defaultValue}
                    onChange={e => handleControl(ctrl, Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--purple-primary)" }}
                  />
                )}
                
                {ctrl.type === "select" && (
                  <select
                    value={state[ctrl.id] ?? ctrl.defaultValue}
                    onChange={e => handleControl(ctrl, e.target.value)}
                    style={{
                      width: "100%", padding: "10px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-primary)",
                      fontSize: 13, fontFamily: "Cairo, sans-serif",
                      outline: "none",
                    }}
                  >
                    {ctrl.options?.map((opt, oi) => (
                      <option key={oi} value={opt} style={{ background: "var(--bg-primary)" }}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border)", marginTop: "auto" }} />

          <button
            onClick={() => setCompleted(true)}
            className="btn-primary"
            style={{ width: "100%", padding: "12px" }}
          >
            ✅ إنهاء التجربة
          </button>
        </div>
      </div>
    </main>
  );
}
