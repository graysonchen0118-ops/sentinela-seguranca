"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A mesa de poker em 3D: as cartas ficam viradas pra baixo, porque o jogo do cliente
// é justamente manter cada mão secreta. O mundo do cliente, não um objeto genérico.
export default function HeroScene() {
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
    const width = () => mount.clientWidth || 600;
    const height = () => mount.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1324, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 100);
    camera.position.set(0, 6.2, 9.2);
    camera.lookAt(0, 0, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5) * 0.72);
    renderer.setSize(width(), height());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

    const key = new THREE.DirectionalLight(0xbfefff, 1.0);
    key.position.set(5, 9, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x2dd4bf, 70, 40);
    rim.position.set(-6, 3, 4);
    scene.add(rim);

    const group = new THREE.Group();
    group.rotation.x = 0.06;
    scene.add(group);

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(x: T) => {
      disposables.push(x);
      return x;
    };

    // ---- felt table (ellipse) ----
    const feltGeo = track(new THREE.CylinderGeometry(4, 4, 0.35, 64));
    const feltMat = track(
      new THREE.MeshStandardMaterial({ color: 0x10433c, roughness: 0.92, metalness: 0.05 })
    );
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.scale.set(1.5, 1, 1);
    group.add(felt);

    const railGeo = track(new THREE.TorusGeometry(4.02, 0.26, 16, 80));
    const railMat = track(
      new THREE.MeshStandardMaterial({ color: 0x1c2c4a, roughness: 0.4, metalness: 0.5 })
    );
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 0.16;
    rail.scale.set(1.5, 1, 1);
    group.add(rail);

    // ---- cards (face down) ----
    const cardGeo = track(new THREE.BoxGeometry(0.66, 0.035, 0.95));
    const backMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x16263f,
        roughness: 0.35,
        metalness: 0.2,
        emissive: 0x0e7490,
        emissiveIntensity: 0.22,
      })
    );
    const edgeMat = track(
      new THREE.MeshStandardMaterial({ color: 0xeef4ff, roughness: 0.6, metalness: 0.1 })
    );
    const cardMats = [edgeMat, edgeMat, backMat, edgeMat, edgeMat, edgeMat];

    function addCard(x: number, z: number, ry: number, lift = 0) {
      const m = new THREE.Mesh(cardGeo, cardMats);
      m.position.set(x, 0.2 + lift, z);
      m.rotation.y = ry;
      group.add(m);
    }

    // hole cards around the ellipse
    const seats = 6;
    for (let i = 0; i < seats; i++) {
      const a = (i / seats) * Math.PI * 2 + Math.PI / seats;
      const rx = 5.0;
      const rz = 3.0;
      const cx = Math.cos(a) * rx;
      const cz = Math.sin(a) * rz;
      const face = Math.atan2(cx, cz);
      addCard(cx - Math.cos(face) * 0.22, cz + Math.sin(face) * 0.22, face + 0.12);
      addCard(cx + Math.cos(face) * 0.22, cz - Math.sin(face) * 0.22, face - 0.12);
    }

    // community cards in the middle
    for (let i = 0; i < 5; i++) {
      addCard((i - 2) * 0.78, 0, 0);
    }

    // ---- chip stacks ----
    const chipGeo = track(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 28));
    const chipColors = [0x2dd4bf, 0x22d3ee, 0xf43f5e, 0xfbbf24, 0x4e78b0];
    const chipMats = chipColors.map((c) =>
      track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.35 }))
    );
    function addStack(x: number, z: number, n: number, ci: number) {
      for (let k = 0; k < n; k++) {
        const chip = new THREE.Mesh(chipGeo, chipMats[ci % chipMats.length]);
        chip.position.set(x, 0.22 + k * 0.075, z);
        group.add(chip);
      }
    }
    addStack(1.1, 1.0, 7, 0);
    addStack(1.5, 0.8, 5, 2);
    addStack(-1.3, 0.9, 6, 1);
    addStack(-0.2, 1.4, 4, 3);
    addStack(0.4, -1.3, 5, 4);

    // ---- interaction ----
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height());
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    let onScreen = true;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => (onScreen = e.isIntersecting)),
      { threshold: 0.02 }
    );
    io.observe(mount);

    let raf = 0;
    const clock = new THREE.Clock();
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!onScreen || document.visibilityState !== "visible") return;
      const t = clock.getElapsedTime();
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      group.rotation.y = (reduce ? 0 : t * 0.07) + cur.x * 0.4;
      group.rotation.x = 0.06 + cur.y * 0.12;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      mount.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="hero-scene" aria-hidden="true" />;
}
