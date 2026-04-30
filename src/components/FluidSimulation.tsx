"use client";

import { useEffect, useRef } from "react";

const VERT = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main(){
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const ADVECTION = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main(){
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = dissipation * texture2D(uSource, coord);
    gl_FragColor = result;
  }
`;

const DIVERGENCE = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main(){
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const CURL = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main(){
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const VORTICITY = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main(){
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 1e-5;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel += force * dt;
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const PRESSURE = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main(){
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SUBTRACT = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main(){
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const SPLAT = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main(){
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p,p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const DISPLAY = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main(){
    vec3 c = texture2D(uTexture, vUv).rgb;
    float a = max(c.r, max(c.g, c.b));
    gl_FragColor = vec4(c, a);
  }
`;

const CLEAR = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main(){
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const SIM_RES = 128;
const DYE_RES = 1024;
const PRESSURE_ITERS = 20;
const CURL_STRENGTH = 30;
const SPLAT_RADIUS = 0.25;
const SPLAT_FORCE = 6000;
const DENSITY_DISSIPATION = 0.97;
const VELOCITY_DISSIPATION = 0.98;
const PRESSURE_VALUE = 0.8;
const EDGE_ZONE = 0.25;

function getEdgeStrength(y: number, h: number): number {
  const norm = y / h;
  if (norm < EDGE_ZONE) return 1 - norm / EDGE_ZONE;
  if (norm > 1 - EDGE_ZONE) return (norm - (1 - EDGE_ZONE)) / EDGE_ZONE;
  return 0;
}

export default function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const params: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };
    let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
    const isWebGL2 = !!gl;
    if (!gl) {
      gl = (canvas.getContext("webgl", params) ||
        canvas.getContext("experimental-webgl", params)) as WebGL2RenderingContext | null;
    }
    if (!gl) return;

    const glCtx = gl;

    if (isWebGL2) {
      glCtx.getExtension("EXT_color_buffer_float");
      glCtx.getExtension("OES_texture_float_linear");
    } else {
      glCtx.getExtension("OES_texture_half_float");
      glCtx.getExtension("OES_texture_half_float_linear");
    }

    glCtx.clearColor(0.0, 0.0, 0.0, 0.0);

    const halfFloatTexType = isWebGL2
      ? glCtx.HALF_FLOAT
      : (glCtx.getExtension("OES_texture_half_float")?.HALF_FLOAT_OES ?? glCtx.UNSIGNED_BYTE);

    type FmtInfo = { internalFormat: number; format: number };

    function getSupportedFormat(
      internalFormat: number,
      format: number,
      type: number
    ): FmtInfo | null {
      const texture = glCtx.createTexture();
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = glCtx.createFramebuffer();
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fbo);
      glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D, texture, 0);
      const status = glCtx.checkFramebufferStatus(glCtx.FRAMEBUFFER);
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
      glCtx.deleteTexture(texture);
      glCtx.deleteFramebuffer(fbo);
      if (status === glCtx.FRAMEBUFFER_COMPLETE) return { internalFormat, format };
      if (internalFormat === (glCtx as WebGL2RenderingContext).R16F)
        return getSupportedFormat((glCtx as WebGL2RenderingContext).RG16F, glCtx.RG ?? glCtx.RGBA, type);
      if (internalFormat === (glCtx as WebGL2RenderingContext).RG16F)
        return getSupportedFormat((glCtx as WebGL2RenderingContext).RGBA16F, glCtx.RGBA, type);
      return null;
    }

    let formatRGBA: FmtInfo | null;
    let formatRG: FmtInfo | null;
    let formatR: FmtInfo | null;

    if (isWebGL2) {
      const gl2 = glCtx as WebGL2RenderingContext;
      formatRGBA = getSupportedFormat(gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl2.RG16F, gl2.RG, halfFloatTexType);
      formatR = getSupportedFormat(gl2.R16F, gl2.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(glCtx.RGBA, glCtx.RGBA, halfFloatTexType);
      formatRG = formatRGBA;
      formatR = formatRGBA;
    }

    if (!formatRGBA || !formatRG || !formatR) return;

    const fmtRGBA = formatRGBA;
    const fmtRG = formatRG;
    const fmtR = formatR;

    // Compile shaders
    function compileShader(type: number, source: string): WebGLShader {
      const shader = glCtx.createShader(type)!;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      return shader;
    }

    function createProgram(vertSrc: string, fragSrc: string) {
      const program = glCtx.createProgram()!;
      glCtx.attachShader(program, compileShader(glCtx.VERTEX_SHADER, vertSrc));
      glCtx.attachShader(program, compileShader(glCtx.FRAGMENT_SHADER, fragSrc));
      glCtx.bindAttribLocation(program, 0, "aPosition");
      glCtx.linkProgram(program);
      const uniforms: Record<string, WebGLUniformLocation> = {};
      const count = glCtx.getProgramParameter(program, glCtx.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = glCtx.getActiveUniform(program, i);
        if (info) {
          const loc = glCtx.getUniformLocation(program, info.name);
          if (loc) uniforms[info.name] = loc;
        }
      }
      return {
        program,
        uniforms,
        bind() {
          glCtx.useProgram(program);
        },
      };
    }

    // Quad geometry
    const quadBuf = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, quadBuf);
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), glCtx.STATIC_DRAW);
    const indexBuf = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, indexBuf);
    glCtx.bufferData(glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), glCtx.STATIC_DRAW);
    glCtx.vertexAttribPointer(0, 2, glCtx.FLOAT, false, 0, 0);
    glCtx.enableVertexAttribArray(0);

    function blit(target: WebGLFramebuffer | null) {
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, quadBuf);
      glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, indexBuf);
      glCtx.vertexAttribPointer(0, 2, glCtx.FLOAT, false, 0, 0);
      glCtx.enableVertexAttribArray(0);
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, target);
      glCtx.drawElements(glCtx.TRIANGLES, 6, glCtx.UNSIGNED_SHORT, 0);
    }

    // Framebuffer helpers
    type FBO = {
      texture: WebGLTexture;
      fbo: WebGLFramebuffer;
      width: number;
      height: number;
      attach(unit: number): number;
    };

    type DoubleFBO = {
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      read: FBO;
      write: FBO;
      swap(): void;
    };

    function createFBO(w: number, h: number, intFmt: number, fmt: number, type: number, filter: number): FBO {
      glCtx.activeTexture(glCtx.TEXTURE0);
      const texture = glCtx.createTexture()!;
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, filter);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, filter);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, intFmt, w, h, 0, fmt, type, null);
      const fbo = glCtx.createFramebuffer()!;
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fbo);
      glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D, texture, 0);
      glCtx.viewport(0, 0, w, h);
      glCtx.clear(glCtx.COLOR_BUFFER_BIT);
      return {
        texture,
        fbo,
        width: w,
        height: h,
        attach(unit: number) {
          glCtx.activeTexture(glCtx.TEXTURE0 + unit);
          glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
          return unit;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, intFmt: number, fmt: number, type: number, filter: number): DoubleFBO {
      let fbo1 = createFBO(w, h, intFmt, fmt, type, filter);
      let fbo2 = createFBO(w, h, intFmt, fmt, type, filter);
      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        get read() { return fbo1; },
        get write() { return fbo2; },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
      };
    }

    // Compile all programs
    const advectionProg = createProgram(VERT, ADVECTION);
    const divergenceProg = createProgram(VERT, DIVERGENCE);
    const curlProg = createProgram(VERT, CURL);
    const vorticityProg = createProgram(VERT, VORTICITY);
    const pressureProg = createProgram(VERT, PRESSURE);
    const gradSubProg = createProgram(VERT, GRADIENT_SUBTRACT);
    const splatProg = createProgram(VERT, SPLAT);
    const displayProg = createProgram(VERT, DISPLAY);
    const clearProg = createProgram(VERT, CLEAR);

    // Size helpers
    function getResolution(resolution: number) {
      let aspectRatio = glCtx.canvas.width / glCtx.canvas.height;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      return glCtx.canvas.width > glCtx.canvas.height ? { width: max, height: min } : { width: min, height: max };
    }

    let velocity: DoubleFBO;
    let pressure: DoubleFBO;
    let divergenceField: FBO;
    let curlField: FBO;
    let dye: DoubleFBO;

    function destroyFBO(fbo: FBO) {
      glCtx.deleteTexture(fbo.texture);
      glCtx.deleteFramebuffer(fbo.fbo);
    }

    function destroyDoubleFBO(dfbo: DoubleFBO) {
      destroyFBO(dfbo.read);
      destroyFBO(dfbo.write);
    }

    function initFramebuffers() {
      if (velocity) destroyDoubleFBO(velocity);
      if (pressure) destroyDoubleFBO(pressure);
      if (divergenceField) destroyFBO(divergenceField);
      if (curlField) destroyFBO(curlField);
      if (dye) destroyDoubleFBO(dye);

      const simRes = getResolution(SIM_RES);
      const dyeRes = getResolution(DYE_RES);
      const texType = halfFloatTexType;
      const linearFilter = glCtx.LINEAR;

      velocity = createDoubleFBO(simRes.width, simRes.height, fmtRG.internalFormat, fmtRG.format, texType, linearFilter);
      pressure = createDoubleFBO(simRes.width, simRes.height, fmtR.internalFormat, fmtR.format, texType, linearFilter);
      divergenceField = createFBO(simRes.width, simRes.height, fmtR.internalFormat, fmtR.format, texType, glCtx.NEAREST);
      curlField = createFBO(simRes.width, simRes.height, fmtR.internalFormat, fmtR.format, texType, glCtx.NEAREST);
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, fmtRGBA.internalFormat, fmtRGBA.format, texType, linearFilter);
    }

    function resizeCanvas() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        initFramebuffers();
      }
    }

    resizeCanvas();

    // Splat function
    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      splatProg.bind();
      glCtx.uniform1i(splatProg.uniforms["uTarget"], velocity.read.attach(0));
      glCtx.uniform1f(splatProg.uniforms["aspectRatio"], canvas.width / canvas.height);
      glCtx.uniform2f(splatProg.uniforms["point"], x, y);
      glCtx.uniform3f(splatProg.uniforms["color"], dx, dy, 0.0);
      glCtx.uniform1f(splatProg.uniforms["radius"], correctRadius(SPLAT_RADIUS / 100));
      glCtx.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();

      glCtx.uniform1i(splatProg.uniforms["uTarget"], dye.read.attach(0));
      glCtx.uniform3f(splatProg.uniforms["color"], color[0], color[1], color[2]);
      glCtx.viewport(0, 0, dye.width, dye.height);
      blit(dye.write.fbo);
      dye.swap();
    }

    function correctRadius(radius: number) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) return radius * aspectRatio;
      return radius;
    }

    // Pointer tracking
    const pointer = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      moved: false,
      initialized: false,
    };

    function handleMouseMove(e: MouseEvent) {
      if (!pointer.initialized) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.initialized = true;
      }
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.moved = true;
    }

    function handleTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      if (!pointer.initialized) {
        pointer.x = touch.clientX;
        pointer.y = touch.clientY;
        pointer.initialized = true;
      }
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
      pointer.moved = true;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Animation loop
    let lastTime = Date.now();
    let animFrameId: number;

    function step() {
      animFrameId = requestAnimationFrame(step);
      resizeCanvas();

      const now = Date.now();
      let dt = (now - lastTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastTime = now;

      if (pointer.moved) {
        pointer.moved = false;
        const strength = getEdgeStrength(pointer.y, canvas.height);
        if (strength > 0) {
          const dx = ((pointer.x - pointer.prevX) / canvas.width) * SPLAT_FORCE;
          const dy = -((pointer.y - pointer.prevY) / canvas.height) * SPLAT_FORCE;
          const px = pointer.x / canvas.width;
          const py = 1.0 - pointer.y / canvas.height;
          const white: [number, number, number] = [
            1.0 * strength,
            1.0 * strength,
            1.0 * strength,
          ];
          splat(px, py, dx * strength, dy * strength, white);
        }
      }

      // Curl
      curlProg.bind();
      glCtx.uniform2f(curlProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(curlProg.uniforms["uVelocity"], velocity.read.attach(0));
      glCtx.viewport(0, 0, curlField.width, curlField.height);
      blit(curlField.fbo);

      // Vorticity
      vorticityProg.bind();
      glCtx.uniform2f(vorticityProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(vorticityProg.uniforms["uVelocity"], velocity.read.attach(0));
      glCtx.uniform1i(vorticityProg.uniforms["uCurl"], curlField.attach(1));
      glCtx.uniform1f(vorticityProg.uniforms["curl"], CURL_STRENGTH);
      glCtx.uniform1f(vorticityProg.uniforms["dt"], dt);
      glCtx.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();

      // Divergence
      divergenceProg.bind();
      glCtx.uniform2f(divergenceProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(divergenceProg.uniforms["uVelocity"], velocity.read.attach(0));
      glCtx.viewport(0, 0, divergenceField.width, divergenceField.height);
      blit(divergenceField.fbo);

      // Clear pressure
      clearProg.bind();
      glCtx.uniform1i(clearProg.uniforms["uTexture"], pressure.read.attach(0));
      glCtx.uniform1f(clearProg.uniforms["value"], PRESSURE_VALUE);
      glCtx.viewport(0, 0, pressure.width, pressure.height);
      blit(pressure.write.fbo);
      pressure.swap();

      // Pressure solve (Jacobi iterations)
      pressureProg.bind();
      glCtx.uniform2f(pressureProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(pressureProg.uniforms["uDivergence"], divergenceField.attach(0));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        glCtx.uniform1i(pressureProg.uniforms["uPressure"], pressure.read.attach(1));
        glCtx.viewport(0, 0, pressure.width, pressure.height);
        blit(pressure.write.fbo);
        pressure.swap();
      }

      // Gradient subtract
      gradSubProg.bind();
      glCtx.uniform2f(gradSubProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(gradSubProg.uniforms["uPressure"], pressure.read.attach(0));
      glCtx.uniform1i(gradSubProg.uniforms["uVelocity"], velocity.read.attach(1));
      glCtx.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();

      // Advect velocity
      advectionProg.bind();
      glCtx.uniform2f(advectionProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(advectionProg.uniforms["uVelocity"], velocity.read.attach(0));
      glCtx.uniform1i(advectionProg.uniforms["uSource"], velocity.read.attach(0));
      glCtx.uniform1f(advectionProg.uniforms["dt"], dt);
      glCtx.uniform1f(advectionProg.uniforms["dissipation"], VELOCITY_DISSIPATION);
      glCtx.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();

      // Advect dye
      glCtx.uniform2f(advectionProg.uniforms["texelSize"], velocity.texelSizeX, velocity.texelSizeY);
      glCtx.uniform1i(advectionProg.uniforms["uVelocity"], velocity.read.attach(0));
      glCtx.uniform1i(advectionProg.uniforms["uSource"], dye.read.attach(1));
      glCtx.uniform1f(advectionProg.uniforms["dissipation"], DENSITY_DISSIPATION);
      glCtx.viewport(0, 0, dye.width, dye.height);
      blit(dye.write.fbo);
      dye.swap();

      // Display
      displayProg.bind();
      glCtx.uniform1i(displayProg.uniforms["uTexture"], dye.read.attach(0));
      glCtx.viewport(0, 0, glCtx.canvas.width, glCtx.canvas.height);
      blit(null);
    }

    step();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-[2] pointer-events-none"
      style={{ mixBlendMode: "difference" }}
    />
  );
}
