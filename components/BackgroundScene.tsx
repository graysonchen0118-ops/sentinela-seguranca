"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Campo de profundidade do site inteiro: uma constelação de nós que representa a
// infraestrutura da plataforma em camadas, com paralaxe no ponteiro e no scroll.
export default function BackgroundScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080e1b, 0.016);

    const width = () => mount.clientWidth || window.innerWidth;
    const height = () => mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width() / height(), 0.1, 200);
    camera.position.set(0, 0, 34);

    // fullscreen ambient depth: render under native res, it is soft by design
    const pr = width() >= 900 ? 0.6 : Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(width(), height());
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ----- nodes -----
    const COUNT = width() < 768 ? 120 : 170;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const base = new THREE.Color(0x3a5680);
    const teal = new THREE.Color(0x2dd4bf);
    const cyan = new THREE.Color(0x22d3ee);
    const red = new THREE.Color(0xf43f5e);
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 72;
      const y = (Math.random() - 0.5) * 42;
      const z = (Math.random() - 0.5) * 60 - 8;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      pts.push(new THREE.Vector3(x, y, z));
      const r = Math.random();
      const c = r > 0.93 ? red : r > 0.72 ? (r > 0.85 ? cyan : teal) : base;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const nodeMat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(nodeGeo, nodeMat);
    group.add(points);

    // ----- connections between nearby nodes -----
    const linePos: number[] = [];
    const maxLinks = 320;
    let links = 0;
    for (let i = 0; i < COUNT && links < maxLinks; i++) {
      for (let j = i + 1; j < COUNT && links < maxLinks; j++) {
        if (pts[i].distanceTo(pts[j]) < 9.5 && Math.random() > 0.5) {
          linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          links++;
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // ----- interaction state -----
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let scroll = 0;

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      scroll = window.scrollY || 0;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // ----- resize -----
    const onResize = () => {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height());
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ----- visibility -----
    let visible = true;
    const onVis = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVis);

    let raf = 0;
    const clock = new THREE.Clock();
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      const t = clock.getElapsedTime();
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;
      if (!reduce) {
        group.rotation.y = t * 0.03 + pointer.x * 0.35;
        group.rotation.x = Math.sin(t * 0.08) * 0.04 + pointer.y * 0.18;
      } else {
        group.rotation.y = pointer.x * 0.35;
        group.rotation.x = pointer.y * 0.18;
      }
      camera.position.y = -scroll * 0.004;
      camera.position.z = 34 - Math.min(scroll * 0.002, 8);
      camera.lookAt(0, camera.position.y * 0.3, 0);
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      nodeGeo.dispose();
      lineGeo.dispose();
      nodeMat.dispose();
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="bg-canvas" aria-hidden="true" />;
}
