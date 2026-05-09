"use client";

import { useEffect, useRef } from "react";

const VSHADER_SRC = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FSHADER_SRC = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_velocity;
  uniform float u_angle;

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
      // Normalize pixel coords based on aspect ratio
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st.x *= u_resolution.x / u_resolution.y;

      vec2 mouse = u_mouse.xy / u_resolution.xy;
      mouse.x *= u_resolution.x / u_resolution.y;

      vec2 d = st - mouse;
      
      // Liquid distortion / domain warping scaling with velocity
      float warpAmount = min(u_velocity * 0.02, 1.0);
      float warp = sin(length(d) * 15.0 - u_time * 2.0) * 0.02 + sin(atan(d.y, d.x) * 4.0 + u_time * 1.5) * 0.015;
      d += d * warp * (1.0 + warpAmount * 3.0);

      float r = length(d);
      
      // Make the entire atom significantly smaller
      r *= 5.5;

      float angle = atan(d.y, d.x) - u_angle;

      // Slower, softer liquid diffusion waves
      float k = 40.0 + sin(u_time * 0.3) * 12.0;
      float x = r * k;
      float sinc = sin(x) / (x + 0.0001);
      // Stronger diffraction amplitude to let waves show further out
      float diffraction = pow(abs(sinc), 1.0) * 1.5;

      // Unstable shape transitioning (collapse and expand to different orbitals)
      // We interpolate between s-orbital (circular), p-orbital (2 lobes), d-orbital (4 lobes)
      float shapeCycle = u_time * 0.2;
      float pLobe = pow(cos(angle * 2.0), 2.0);
      float dLobe = pow(cos(angle * 4.0), 2.0);
      
      float activeSpots = 1.0;
      float state = fract(shapeCycle); // 0.0 to 1.0
      
      if (state < 0.33) {
          // Transition s -> p
          activeSpots = mix(1.0, pLobe, smoothstep(0.1, 0.25, state));
      } else if (state < 0.66) {
          // Transition p -> d
          activeSpots = mix(pLobe, dLobe, smoothstep(0.43, 0.58, state));
      } else {
          // Transition d -> collapse -> s
          float collapse = smoothstep(0.76, 0.90, state);
          activeSpots = mix(dLobe, 1.0, collapse);
          // Pinch the radius dramatically during the collapse
          r *= 1.0 + collapse * 1.5; 
      }

      // Strong overall density multiplier to spread the waves out
      float density = diffraction * (0.8 + activeSpots * 4.0) * 5.0;

      // Make the jitter smoother so it doesn't stutter as hard
      density *= 1.0 + sin(u_time * 20.0) * (0.2 + warpAmount * 0.5);
      density *= 1.0 + (random(st * floor(u_time * 6.0)) - 0.5) * (0.4 + warpAmount * 0.8);

      // Weaker exponent dropoff (exp(-r * 2.0)) allows the diffraction waves to spread much further out
      density *= exp(-r * 2.0);

      // Stronger core infinite probability point (electron/nucleus)
      float core = 0.00015 / (r * r + 0.00001);
      density += core;

      // Extract noisy "electron hits" by thresholding against a highly random field
      // The scatter exactly plots the calculated probability density!
      float randValue = random(gl_FragCoord.xy * fract(u_time + 1.0));
      float electronHit = step(1.0 - clamp(density, 0.0, 1.0), randValue);

      // Stronger surrounding structural glow
      float glow = exp(-r * 8.0) * 0.1;

      // Intensity composition (restore opacity and presence)
      float intensity = clamp(electronHit * 0.65 + glow + density * 0.1, 0.0, 1.0) * 0.85;

      // Bright white color
      vec3 color = vec3(1.0, 1.0, 1.0);
      
      // Bleed and trailing effect: Ensure minimum alpha to darken old frames
      // intensity acts as the brightness of the current atom
      float drawAlpha = max(intensity, 0.05); // 0.05 controls the trail fade length
      gl_FragColor = vec4(color * intensity, drawAlpha);
  }
`;

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { 
      premultipliedAlpha: false, 
      alpha: true,
      preserveDrawingBuffer: true 
    });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader syntax error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vShader = compileShader(gl.VERTEX_SHADER, VSHADER_SRC);
    const fShader = compileShader(gl.FRAGMENT_SHADER, FSHADER_SRC);
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1.0,  1.0,
      -1.0, -1.0,
       1.0,  1.0,
       1.0, -1.0
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uVelocity = gl.getUniformLocation(program, "u_velocity");
    const uAngle = gl.getUniformLocation(program, "u_angle");

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let velocity = 0;
    let currentAngle = 0;
    let initialized = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      targetX = (e.clientX - rect.left) * dpr;
      
      // Invert Y because WebGL's origin is bottom-left
      targetY = (rect.height - (e.clientY - rect.top)) * dpr;
      
      if (!initialized) {
        mouseX = targetX;
        mouseY = targetY;
        initialized = true;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
 
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      
      if (!initialized) {
         targetX = canvas.width / 2;
         targetY = canvas.height / 2;
         mouseX = targetX;
         mouseY = targetY;
      }
    };
    window.addEventListener("resize", resize);
    resize();

    let startTime = performance.now();
    let animationFrameId: number;

    const render = (time: number) => {
      // Highly fluid quantum mechanics interpolation
      const dx = targetX - mouseX;
      const dy = targetY - mouseY;
      
      // Calculate velocity for chaotic interference
      const currentVelocity = Math.sqrt(dx * dx + dy * dy);
      velocity += (currentVelocity - velocity) * 0.15;
      
      // Calculate bleeding orientation
      if (currentVelocity > 0.1) {
        const targetAngle = Math.atan2(dy, dx);
        let diff = targetAngle - currentAngle;
        // Normalize diff to -PI, PI
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        currentAngle += diff * 0.08;
      }
      
      // Responsive and smooth follow
      mouseX += dx * 0.08;
      mouseY += dy * 0.08;

      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uTime, (time - startTime) / 1000.0);
      gl.uniform1f(uVelocity, velocity);
      gl.uniform1f(uAngle, currentAngle);

      // Do NOT clear so preserveDrawingBuffer creates a smooth bleeding trail
      // gl.clearColor(0, 0, 0, 0);
      // gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none mix-blend-screen bg-transparent">
      <canvas ref={canvasRef} className="opacity-90 w-full h-full blur-[2px]" />
    </div>
  );
}
