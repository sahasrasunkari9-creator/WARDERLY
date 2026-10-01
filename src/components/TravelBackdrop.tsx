"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function cloudTexture(color: string): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.45, "rgba(160,180,230,0.18)");
  g.addColorStop(1, "rgba(140,160,220,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    pts.push(new THREE.Vector3(Math.cos(th) * r * radius, y * radius, Math.sin(th) * r * radius));
  }
  return pts;
}

/**
 * Cinematic 3D travel background: rotating dotted globe with glowing flight
 * routes and little airplanes, drifting clouds, star particles and mouse
 * parallax. Purely decorative — safe to disable if WebGL is unavailable.
 */
export default function TravelBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      canvas.style.display = "none";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a18, 0.022);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 260);
    camera.position.set(0, 0.6, 18);

    const globe = new THREE.Group();
    globe.position.set(3.5, 1.6, -2);
    scene.add(globe);

    // dotted globe
    const R = 6;
    const spherePts = fibonacciSphere(900, R);
    const geo = new THREE.BufferGeometry().setFromPoints(spherePts);
    const palette = [
      new THREE.Color(0x22d3ee),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x67e8f9),
      new THREE.Color(0xfb923c),
    ];
    const colors = new Float32Array(spherePts.length * 3);
    for (let i = 0; i < spherePts.length; i++) {
      const c = palette[Math.random() > 0.86 ? 3 : Math.floor(Math.random() * 3)];
      const v = 0.35 + Math.random() * 0.65;
      colors[i * 3] = c.r * v;
      colors[i * 3 + 1] = c.g * v;
      colors[i * 3 + 2] = c.b * v;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const dots = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.07,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    globe.add(dots);

    // faint wireframe shell
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.005, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x334c88, wireframe: true, transparent: true, opacity: 0.08 })
    );
    globe.add(shell);

    // glowing atmosphere
    const atmo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: cloudTexture("rgba(80,160,255,0.5)"), transparent: true, opacity: 0.4, depthWrite: false })
    );
    atmo.scale.set(R * 3.4, R * 3.4, 1);
    globe.add(atmo);

    // flight routes + airplanes
    const airplanes: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; offset: number }[] = [];
    const addRoute = (a: THREE.Vector3, b: THREE.Vector3, color: number, speed: number, offset: number) => {
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.35 + Math.random() * 0.3));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
      );
      globe.add(line);
      const mesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.3, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
      );
      globe.add(mesh);
      airplanes.push({ mesh, curve, speed, offset });
    };
    const p = (lat: number, lng: number) =>
      new THREE.Vector3(
        R * Math.cos((lat * Math.PI) / 180) * Math.cos((lng * Math.PI) / 180),
        R * Math.sin((lat * Math.PI) / 180),
        R * Math.cos((lat * Math.PI) / 180) * Math.sin((lng * Math.PI) / 180)
      );
    addRoute(p(28, 77), p(48, 2), 0x22d3ee, 0.05, 0);
    addRoute(p(35, 139), p(40, -74), 0xa855f7, 0.04, 0.4);
    addRoute(p(25, 55), p(-8, 115), 0xfb923c, 0.045, 0.7);
    addRoute(p(9, 77), p(36, 25), 0x67e8f9, 0.035, 0.2);

    // star field
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 220;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 2] = -40 - Math.random() * 120;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0xbcd0ff, size: 0.14, transparent: true, opacity: 0.7, depthWrite: false })
    );
    scene.add(stars);

    // clouds
    const cloudTex = cloudTexture("rgba(200,215,255,0.55)");
    const clouds: { sprite: THREE.Sprite; speed: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.05 + Math.random() * 0.05, depthWrite: false, color: i % 2 ? 0xa8c4ff : 0xffd9a8 })
      );
      const scale = 16 + Math.random() * 22;
      s.scale.set(scale, scale * 0.4, 1);
      s.position.set((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 26, -12 - Math.random() * 30);
      scene.add(s);
      clouds.push({ sprite: s, speed: 0.35 + Math.random() * 0.55 });
    }

    // sun + moon glows
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTexture("rgba(251,146,60,0.65)"), transparent: true, opacity: 0.5, depthWrite: false }));
    sun.scale.set(30, 30, 1);
    sun.position.set(-19, -8, -30);
    scene.add(sun);
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTexture("rgba(103,232,249,0.6)"), transparent: true, opacity: 0.35, depthWrite: false }));
    moon.scale.set(22, 22, 1);
    moon.position.set(20, 12, -28);
    scene.add(moon);

    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let raf = 0;
    const sm = { x: 0, y: 0 };

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      globe.rotation.y = t * 0.12;
      globe.rotation.x = Math.sin(t * 0.05) * 0.08;
      globe.position.y = 1.6 + Math.sin(t * 0.4) * 0.25;

      for (const a of airplanes) {
        const u = (t * a.speed + a.offset) % 1;
        const pos = a.curve.getPoint(u);
        const tan = a.curve.getTangent(u);
        a.mesh.position.copy(pos);
        a.mesh.lookAt(pos.clone().add(tan));
        a.mesh.rotateX(Math.PI / 2);
      }

      for (const c of clouds) {
        c.sprite.position.x += c.speed * dt;
        if (c.sprite.position.x > 45) c.sprite.position.x = -45;
      }
      stars.rotation.y = t * 0.004;

      sm.x += (mouse.x - sm.x) * Math.min(1, dt * 2);
      sm.y += (mouse.y - sm.y) * Math.min(1, dt * 2);
      camera.position.x = Math.sin(t * 0.04) * 2.6 + sm.x * 1.4;
      camera.position.y = 0.6 + Math.sin(t * 0.05) * 0.8 - sm.y * 1.0;
      camera.lookAt(0, 0.5, -4);

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      geo.dispose();
      starsGeo.dispose();
      cloudTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-80"
    />
  );
}
