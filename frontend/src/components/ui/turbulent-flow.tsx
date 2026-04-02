import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export function Component({
  children,
  className = ""
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const mount = mountRef.current;

    if (!container || !mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    const size = {
      width: container.clientWidth,
      height: container.clientHeight
    };

    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_noise_scale;
      uniform float u_distortion;
      uniform float u_turbulence;
      uniform float u_sharpness;
      varying vec2 vUv;

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(
          permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
            i.x +
            vec4(0.0, i1.x, i2.x, 1.0)
        );

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(
          0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)),
          0.0
        );
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.6;

        for (int i = 0; i < 6; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      float turbulence(vec3 p) {
        float t = 0.0;
        float amplitude = 1.0;
        float frequency = 0.4;

        for (int i = 0; i < 4; i++) {
          t += abs(snoise(p * frequency)) * amplitude;
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return t;
      }

      vec2 curl(vec2 p, float time) {
        float eps = 0.01;
        float n1 = snoise(vec3(p.x, p.y + eps, time));
        float n2 = snoise(vec3(p.x, p.y - eps, time));
        float n3 = snoise(vec3(p.x + eps, p.y, time));
        float n4 = snoise(vec3(p.x - eps, p.y, time));
        return vec2(n1 - n2, n4 - n3) / (2.0 * eps);
      }

      void main() {
        vec2 uv = vUv;
        float time = u_time * 0.5;
        vec3 pos = vec3(uv * u_noise_scale * 1.5, time * 0.1);

        float turb1 = turbulence(pos) * u_turbulence;
        float turb2 = turbulence(pos * 1.7 + vec3(100.0, 50.0, time * 0.3)) * u_turbulence * 0.3;
        float turb3 = fbm(pos * 0.8 + vec3(200.0, 100.0, time * 0.15)) * u_turbulence * 0.5;

        vec2 curlForce = curl(uv * 2.0, time * 0.5) * 0.25;
        vec2 distortion = vec2(turb1 + turb2, turb2 + turb3) * u_distortion + curlForce;
        vec2 distortedUV = uv + distortion;

        vec2 center1 = vec2(0.48 + sin(time * 0.38) * 0.2 + turb1 * 0.08, 0.72 + cos(time * 0.28) * 0.16);
        vec2 center2 = vec2(0.74 + sin(time * 0.31) * 0.16 + turb2 * 0.07, 0.52 + cos(time * 0.42) * 0.18);
        vec2 center3 = vec2(0.36 + sin(time * 0.46) * 0.12 + turb3 * 0.05, 0.22 + cos(time * 0.37) * 0.16);

        float dist1 = length(distortedUV - center1);
        float dist2 = length(distortedUV - center2);
        float dist3 = length(distortedUV - center3);

        float grad1 = 1.0 - smoothstep(0.0, 0.58 - turb1 * 0.08, dist1);
        float grad2 = 1.0 - smoothstep(0.0, 0.48 - turb2 * 0.08, dist2);
        float grad3 = 1.0 - smoothstep(0.0, 0.52 - turb3 * 0.08, dist3);

        vec3 color1 = vec3(0.85, 0.63, 0.35);
        vec3 color2 = vec3(0.33, 0.55, 0.66);
        vec3 color3 = vec3(0.89, 0.83, 0.69);

        vec3 finalColor = vec3(0.02, 0.03, 0.05);
        finalColor += color1 * grad1 * 0.9;
        finalColor += color2 * grad2 * 0.72;
        finalColor += color3 * grad3 * 0.45;

        float detail = fbm(vec3(uv * 12.0, time * 0.08)) * 0.14;
        finalColor += detail;

        finalColor = pow(finalColor, vec3(1.08));
        finalColor *= 0.82;

        float vignette = 1.0 - length(uv - 0.5) * 1.3;
        vignette = smoothstep(0.0, 1.0, vignette);
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(size.width, size.height) },
        u_noise_scale: { value: 3.8 },
        u_distortion: { value: 0.12 },
        u_turbulence: { value: 0.6 },
        u_sharpness: { value: 1.2 }
      }
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    timeline
      .to(material.uniforms.u_turbulence, { value: 0.9, duration: 7, ease: "sine.inOut" })
      .to(material.uniforms.u_noise_scale, { value: 5.1, duration: 10, ease: "power2.inOut" }, 0)
      .to(material.uniforms.u_distortion, { value: 0.18, duration: 8, ease: "power1.inOut" }, 1)
      .to(material.uniforms.u_sharpness, { value: 1.45, duration: 7, ease: "sine.inOut" }, 2);

    let time = 0;

    const render = () => {
      time += 0.006;
      material.uniforms.u_time.value = time;
      renderer.render(scene, camera);
      frameRef.current = window.requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const influence = Math.min(Math.sqrt(x * x + y * y), 0.6);
      material.uniforms.u_turbulence.value = 0.6 + influence * 0.18;
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      material.uniforms.u_resolution.value.set(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      observer.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      timeline.kill();
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} ref={containerRef}>
      <div className="absolute inset-0" ref={mountRef} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(5,7,9,0.08),rgba(5,7,9,0.56)_40%,rgba(5,7,9,0.84)_100%)]" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
