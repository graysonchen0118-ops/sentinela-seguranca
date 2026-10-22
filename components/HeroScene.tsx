"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A infraestrutura da plataforma vista em 3D: serviços ligados entre si, e os nós
// expostos pulsando em vermelho. O mundo do cliente, não um objeto genérico.
type Node = { pos: [number, number, number]; exposed?: boolean; big?: boolean };

const NODES: Node[] = [
  { pos: [0, 0.3, 0], big: true },
  { pos: [4.2, 1.6, -1.5] },
  { pos: [-4.4, 1.1, -0.6] },
  { pos: [2.6, -2.2, 1.2] },
  { pos: [-2.9, -1.9, 0.8] },
  { pos: [5.6, -0.8, -2.8], exposed: true },
  { pos: [-5.4, -1.1, -2.2], exposed: true },
  { pos: [1.4, 3.0, -2.0] },
  { pos: [-1.6, 2.7, -1.2] },
  { pos: [3.4, 0.4, 2.6] },
  { pos: [-3.6, 0.6, 2.2] },
  { pos: [0.6, -3.2, -2.4], exposed: true },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 7], [0, 8],
  [1, 5], [1, 9], [2, 6], [2, 10], [3, 5], [3, 9],
  [4, 6], [4, 10], [7, 8], [3, 11], [4, 11], [0, 11],
];

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
    scene.fog = new THREE.FogExp2(0x0b1324, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width() / height(), 0.1, 100);
    camera.position.set(0, 0.6, 15);

    // decorative scene behind text: render a little under native res to stay light
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5) * 0.72);
    renderer.setSize(width(), height());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

    const key = new THREE.DirectionalLight(0x9fe8ff, 1.1);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0x2dd4bf, 60, 40);
    rim.position.set(-6, -2, 4);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const nodeMeshes: { mesh: THREE.Mesh; ring?: THREE.Mesh; exposed: boolean }[] = [];
    const sphereGeo = new THREE.IcosahedronGeometry(0.62, 2);
    const bigGeo = new THREE.IcosahedronGeometry(1.05, 3);
    const ringGeo = new THREE.TorusGeometry(1.0, 0.045, 10, 36);

    NODES.forEach((n) => {
      const mat = new THREE.MeshStandardMaterial({
        color: n.exposed ? 0xf43f5e : n.big ? 0x22d3ee : 0x4e78b0,
        metalness: 0.45,
        roughness: 0.28,
        emissive: n.exposed ? 0xf43f5e : n.big ? 0x0e7490 : 0x16263f,
        emissiveIntensity: n.exposed ? 0.9 : n.big ? 0.5 : 0.25,
      });
      const mesh = new THREE.Mesh(n.big ? bigGeo : sphereGeo, mat);
      mesh.position.set(...n.pos);
      group.add(mesh);

      let ring: THREE.Mesh | undefined;
      if (n.exposed) {
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          transparent: true,
          opacity: 0.6,
        });
        ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(...n.pos);
        group.add(ring);
      }
      nodeMeshes.push({ mesh, ring, exposed: !!n.exposed });
    });

    // edges
    const edgePos: number[] = [];
    EDGES.forEach(([a, b]) => {
      const pa = NODES[a].pos;
      const pb = NODES[b].pos;
      edgePos.push(...pa, ...pb);
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePos, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edges);

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
      (entries) => entries.forEach((e) => (onScreen = e.isIntersecting)),
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
      if (!reduce) {
        group.rotation.y = t * 0.12 + cur.x * 0.5;
        group.rotation.x = Math.sin(t * 0.25) * 0.05 + cur.y * 0.3;
      } else {
        group.rotation.y = cur.x * 0.5;
        group.rotation.x = cur.y * 0.3;
      }
      const pulse = 1 + Math.sin(t * 2.4) * 0.14;
      nodeMeshes.forEach((nm) => {
        if (nm.ring) {
          nm.ring.scale.setScalar(pulse);
          (nm.ring.material as THREE.MeshBasicMaterial).opacity =
            0.55 - (pulse - 1) * 1.6;
          nm.ring.lookAt(camera.position);
        }
      });
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      mount.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      io.disconnect();
      sphereGeo.dispose();
      bigGeo.dispose();
      ringGeo.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      nodeMeshes.forEach((nm) => {
        (nm.mesh.material as THREE.Material).dispose();
        if (nm.ring) (nm.ring.material as THREE.Material).dispose();
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="hero-scene" aria-hidden="true" />;
}
