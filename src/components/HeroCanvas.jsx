import React, { useEffect, useRef } from 'react'

// Ultra-premium cinematic shader canvas
// - Flowing red-wine liquid background
// - Matte-black bottle silhouette with subtle warm-gold rim light
// - Slow, elegant motion

const vertexShader = `#version 100
attribute vec2 a_position;
void main(){
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const fragmentShader = `#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// Utility
float hash(vec2 p){
  p = fract(p*vec2(123.34, 456.21));
  p += dot(p, p+45.32);
  return fract(p.x*p.y);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Smoothstep
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    v += a*noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// Signed distance helpers
float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float sdCircle(vec2 p, float r){
  return length(p) - r;
}

float opSmoothUnion(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
  return mix(d2, d1, h) - k*h*(1.0-h);
}

// Approx wine bottle SDF (front silhouette)
// Coordinate system: center screen (0,0), y up, x right, aspect corrected
float sdBottle(vec2 p){
  // Scale to a nice size
  p.y -= 0.05; // slight vertical offset
  // Body (rounded rectangle)
  float body = sdRoundBox(p*vec2(0.95,1.0), vec2(0.18,0.42), 0.12);
  // Shoulder as circles union
  float shoulderL = sdCircle(p - vec2(-0.15, 0.08), 0.16);
  float shoulderR = sdCircle(p - vec2( 0.15, 0.08), 0.16);
  float shoulders = max(min(shoulderL, shoulderR), -sdRoundBox(p-vec2(0.0,0.02), vec2(0.2,0.1), 0.06));
  // Neck
  float neck = sdRoundBox(p - vec2(0.0, 0.37), vec2(0.065, 0.16), 0.04);
  // Lip
  float lip = sdRoundBox(p - vec2(0.0, 0.57), vec2(0.08, 0.03), 0.02);
  // Combine
  float upper = opSmoothUnion(neck, lip, 0.06);
  float mid = min(shoulders, upper);
  float bottle = min(body, mid);
  return bottle;
}

vec3 goldColor(){
  return vec3(0.82, 0.66, 0.28); // warm metallic gold
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy);
  vec2 p = uv*2.0 - 1.0;
  p.x *= u_resolution.x/u_resolution.y;

  // Base colors
  vec3 deepBlack = vec3(0.02, 0.02, 0.02);
  vec3 darkCocoa = vec3(0.06, 0.04, 0.03);
  vec3 wineRed = vec3(0.35, 0.02, 0.05);
  vec3 ruby = vec3(0.55, 0.05, 0.1);

  // Flowing wine background using advected fbm
  float t = u_time * 0.06;
  vec2 flowUV = p * 1.2;
  // Curl-like distortion
  float n1 = fbm(flowUV + vec2(t*0.3, -t*0.15));
  float n2 = fbm(flowUV*1.8 - vec2(t*0.1, t*0.25));
  float swirl = fbm(flowUV + 1.5*n1*vec2(0.6, -0.4));
  float depth = smoothstep(0.2, 0.9, swirl);
  vec3 wine = mix(wineRed, ruby, depth);
  // Add cocoa shadows for cinematic depth
  wine = mix(darkCocoa, wine, 0.85);

  // Gentle vignette
  float vig = smoothstep(1.2, 0.2, length(p));
  vec3 col = mix(deepBlack, wine, vig);

  // Bottle foreground
  float d = sdBottle(p*1.05);
  float edge = fwidth(d)*1.5;

  // Bottle matte shading
  // Fake normal from distance gradient
  vec2 e = vec2(0.001, 0.0);
  vec2 g = vec2(sdBottle((p+e.xy)*1.05)-sdBottle((p-e.xy)*1.05), sdBottle((p+e.yx)*1.05)-sdBottle((p-e.yx)*1.05));
  vec2 n = normalize(g);

  // Animated light direction to imply slow rotation
  float ang = 1.2 + sin(u_time*0.25)*0.35;
  vec2 lightDir = normalize(vec2(cos(ang), sin(ang)));

  float ndotl = clamp(dot(-n, lightDir), 0.0, 1.0);

  // Rim lighting in warm gold
  float rim = pow(1.0 - abs(dot(n, lightDir)), 2.5);
  vec3 rimCol = goldColor()*0.9 * rim;

  // Matte black base for bottle
  vec3 bottleBase = mix(deepBlack, darkCocoa, 0.2);
  // Subtle warm reflection
  vec3 warmReflect = goldColor()*0.15*ndotl;
  vec3 bottleCol = bottleBase + warmReflect;

  // Composite: if inside bottle (d<0), render bottle with subtle gold rim
  if(d < 0.0){
    // Soft inner shadow for volume
    float core = smoothstep(0.0, -0.02, d);
    bottleCol *= mix(1.0, 0.85, core);
    // Add rim
    bottleCol += rimCol*0.35;
    col = mix(col, bottleCol, 1.0);
  }

  // Soft bottle edge highlight to elevate premium feel
  float outline = smoothstep(0.0, edge, abs(d));
  col = mix(col, col + goldColor()*0.08*(1.0-outline), 0.28);

  // Final subtle film grain
  float grain = (hash(gl_FragCoord.xy + u_time) - 0.5)*0.02;
  col += grain;

  // Tone mapping
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}`

function createShader(gl, type, source){
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl, vsSource, fsSource){
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if(!vs || !fs) return null
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

export default function HeroCanvas(){
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false })
    if(!gl){
      console.warn('WebGL not supported')
      return
    }

    // Setup
    const program = createProgram(gl, vertexShader, fragmentShader)
    if(!program) return
    gl.useProgram(program)

    const a_position = gl.getAttribLocation(program, 'a_position')
    const u_resolution = gl.getUniformLocation(program, 'u_resolution')
    const u_time = gl.getUniformLocation(program, 'u_time')

    // Fullscreen quad
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const verts = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ])
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(a_position)
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const W = Math.max(1, Math.floor(w * dpr))
      const H = Math.max(1, Math.floor(h * dpr))
      if(canvas.width !== W || canvas.height !== H){
        canvas.width = W
        canvas.height = H
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(u_resolution, canvas.width, canvas.height)
    }

    let start = performance.now()
    const render = () => {
      rafRef.current = requestAnimationFrame(render)
      resize()
      const t = (performance.now() - start) / 1000
      gl.uniform1f(u_time, t)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    render()

    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      style={{ background: '#0b0b0b' }}
    />
  )
}
