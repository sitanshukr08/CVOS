import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { Sparkles } from "lucide-react";

type ThreeStore = {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  stars: THREE.Points[];
  nebula: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null;
  mountains: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>[];
  animationId: number | null;
};

export const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });

  const threeRefs = useRef<ThreeStore>({
    scene: null,
    camera: null,
    renderer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null
  });

  const splitTitle = useMemo(
    () =>
      "HORIZON".split("").map((char, index) => (
        <span key={`${char}-${index}`} className="title-char inline-block">
          {char}
        </span>
      )),
    []
  );

  useEffect(() => {
    const refs = threeRefs.current;
    if (!canvasRef.current) {
      return;
    }

    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x02050b, 0.0004);

    refs.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1600);
    refs.camera.position.set(0, 18, 180);

    refs.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.22;

    const createStarField = () => {
      const layers = [
        { count: 900, radius: 320, size: 1.2 },
        { count: 1100, radius: 540, size: 1.6 }
      ];

      layers.forEach((layer, depth) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(layer.count * 3);
        const colors = new Float32Array(layer.count * 3);

        for (let i = 0; i < layer.count; i += 1) {
          const radius = 120 + Math.random() * layer.radius;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
          positions[i * 3 + 2] = radius * Math.cos(phi) - 240;

          const color = new THREE.Color(depth === 0 ? 0xc8dcff : 0x8fb7ff);
          color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: layer.size,
          vertexColors: true,
          transparent: true,
          opacity: depth === 0 ? 0.9 : 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene?.add(stars);
        refs.stars.push(stars);
      });
    };

    const createNebula = () => {
      const geometry = new THREE.PlaneGeometry(1800, 760, 1, 1);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          colorA: { value: new THREE.Color(0x0a2246) },
          colorB: { value: new THREE.Color(0x12081a) }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;

          float circle(vec2 uv, vec2 center, float radius, float blur) {
            float dist = distance(uv, center);
            return smoothstep(radius + blur, radius - blur, dist);
          }

          void main() {
            vec2 uv = vUv;
            float glowA = circle(uv, vec2(0.52, 0.28), 0.22, 0.24);
            float glowB = circle(uv, vec2(0.72 + sin(time * 0.08) * 0.02, 0.18), 0.16, 0.22);
            float glowC = circle(uv, vec2(0.24, 0.16), 0.12, 0.18);
            vec3 color = colorB;
            color = mix(color, colorA, glowA * 0.72);
            color += glowB * vec3(0.18, 0.34, 0.58);
            color += glowC * vec3(0.12, 0.16, 0.28);
            float alpha = 0.46 * (glowA + glowB * 0.8 + glowC * 0.6);
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        depthWrite: false
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.set(0, 60, -260);
      refs.scene?.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const layers = [
        { distance: -40, height: 42, color: 0x05080d, offset: -100 },
        { distance: -100, height: 58, color: 0x07111b, offset: -118 },
        { distance: -180, height: 80, color: 0x091827, offset: -130 }
      ];

      layers.forEach((layer) => {
        const points: THREE.Vector2[] = [];
        const segments = 16;
        for (let i = 0; i <= segments; i += 1) {
          const x = (i / segments - 0.5) * 1200;
          const y =
            Math.sin(i * 0.7) * layer.height +
            Math.cos(i * 0.34) * (layer.height * 0.42) +
            layer.offset;
          points.push(new THREE.Vector2(x, y));
        }

        points.push(new THREE.Vector2(900, -420));
        points.push(new THREE.Vector2(-900, -420));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 1
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        refs.scene?.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    createStarField();
    createNebula();
    createMountains();

    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.00018;

      refs.stars.forEach((starField, index) => {
        starField.rotation.z += index === 0 ? 0.00008 : -0.00005;
        starField.rotation.y += index === 0 ? 0.00004 : 0.00002;
      });

      if (refs.nebula) {
        refs.nebula.material.uniforms.time.value = time;
      }

      if (refs.camera) {
        refs.camera.position.x += (mouseTarget.current.x * 18 - refs.camera.position.x) * 0.028;
        refs.camera.position.y += (18 + mouseTarget.current.y * 10 - refs.camera.position.y) * 0.028;
        refs.camera.lookAt(0, 10, -200);
      }

      refs.renderer?.render(refs.scene as THREE.Scene, refs.camera as THREE.PerspectiveCamera);
    };

    animate();

    const handleResize = () => {
      if (!refs.camera || !refs.renderer) {
        return;
      }
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseTarget.current.x = event.clientX / window.innerWidth - 0.5;
      mouseTarget.current.y = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }

      refs.stars.forEach((starField) => {
        starField.geometry.dispose();
        const material = Array.isArray(starField.material)
          ? starField.material[0]
          : starField.material;
        material.dispose();
      });

      refs.mountains.forEach((mountain) => {
        mountain.geometry.dispose();
        mountain.material.dispose();
      });

      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        refs.nebula.material.dispose();
      }

      refs.renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (badgeRef.current) {
      timeline.from(badgeRef.current, { y: 18, opacity: 0, duration: 0.8 });
    }

    if (titleRef.current) {
      timeline.from(
        titleRef.current.querySelectorAll(".title-char"),
        {
          y: 90,
          opacity: 0,
          stagger: 0.05,
          duration: 1.1,
          ease: "power4.out"
        },
        "-=0.35"
      );
    }

    if (subtitleRef.current) {
      timeline.from(
        subtitleRef.current.children,
        {
          y: 24,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8
        },
        "-=0.55"
      );
    }

    if (panelRef.current) {
      timeline.from(
        panelRef.current,
        {
          y: 28,
          opacity: 0,
          duration: 0.9
        },
        "-=0.5"
      );
    }

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#02050b] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(190,220,255,0.12),transparent_16%),linear-gradient(180deg,rgba(2,5,11,0.08),rgba(2,5,11,0.42)_38%,rgba(2,5,11,0.86)_78%,#02050b_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(2,5,11,0.92)_56%,#02050b)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-8">
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/78 backdrop-blur-xl"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Curriculum Vitae Operating System
            </div>

            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.34em] text-cyan-200/78">
                What this website is about
              </p>
              <h1
                ref={titleRef}
                className="max-w-4xl text-5xl font-semibold leading-[0.9] text-white sm:text-6xl lg:text-8xl"
              >
                {splitTitle}
              </h1>
              <div ref={subtitleRef} className="space-y-3 text-base text-white/76 sm:text-xl">
                <p className="max-w-2xl">
                  CVOS turns profile data, GitHub work, and vague experience into a guided
                  resume workflow with visible review and scoring.
                </p>
                <p className="max-w-2xl">
                  The landing page should feel cinematic at the top, then become clear and precise
                  as it leads into the rest of the product.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="#overview"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                View the product flow
              </a>
              <div className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm text-white/68 backdrop-blur-xl">
                8 linked product pages
              </div>
            </div>
          </div>

          <div
            ref={panelRef}
            className="justify-self-end rounded-[2rem] border border-white/10 bg-[#08111b]/82 p-6 backdrop-blur-xl shadow-[0_28px_90px_rgba(0,0,0,0.34)]"
          >
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/72">Input</p>
                <p className="mt-3 text-2xl font-semibold text-white">Profile + links</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/72">Engine</p>
                <p className="mt-3 text-2xl font-semibold text-white">Writing + scoring loop</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/72">Output</p>
                <p className="mt-3 text-2xl font-semibold text-white">Reviewable export</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
