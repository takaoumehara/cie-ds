"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { onThemeChange, readGroundColor, readTextColor, type RGBA } from "@/lib/cie-color"

// Atmosphere · WebGL fragment-shader field — the GPU tier of cie atmospheres.
// Domain-warped fbm noise mixes the ground colour (bg-background) toward the ink
// colour (text-foreground) — monochrome "ink in water", optional contour lines and
// grain. Aceternity aurora / wavy background lineage, rebuilt without three.js.
// Falls back to the plain ground if WebGL is unavailable. DPR-capped, pauses off-screen,
// one still frame under prefers-reduced-motion.

type ShaderFieldProps = React.ComponentProps<"div"> & {
  /** "flow" = soft ink clouds, "contour" = topographic lines, "dither" = ordered-dither halftone. */
  mode?: "flow" | "contour" | "dither"
  /** 0–1: how far toward the foreground colour the field reaches. */
  intensity?: number
  /** Time multiplier. */
  speed?: number
  /** Noise scale — higher = busier. */
  scale?: number
  /** Cursor bends the field. */
  interactive?: boolean
  /** Render-resolution multiplier (0.5 is plenty for soft modes on phones). */
  quality?: number
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const FRAG = `precision highp float;
uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform vec4 u_a;uniform vec4 u_b;
uniform float u_int;uniform float u_scale;uniform int u_mode;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
float bayer(vec2 p){vec2 q=mod(floor(p),4.);float i=q.x+q.y*4.;
float b=0.;
if(i<1.)b=0.;else if(i<2.)b=8.;else if(i<3.)b=2.;else if(i<4.)b=10.;
else if(i<5.)b=12.;else if(i<6.)b=4.;else if(i<7.)b=14.;else if(i<8.)b=6.;
else if(i<9.)b=3.;else if(i<10.)b=11.;else if(i<11.)b=1.;else if(i<12.)b=9.;
else if(i<13.)b=15.;else if(i<14.)b=7.;else if(i<15.)b=13.;else b=5.;
return (b+.5)/16.;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;vec2 p=uv*vec2(u_res.x/u_res.y,1.)*u_scale;
  float t=u_time*.06;
  vec2 m=(u_mouse-uv)*vec2(u_res.x/u_res.y,1.);float md=exp(-dot(m,m)*6.);
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+.8*t+md*.6),fbm(p+3.*q+vec2(8.3,2.8)-.6*t));
  float f=fbm(p+3.*r);
  float v;
  if(u_mode==1){float c=fract(f*9.);v=smoothstep(.0,.06,c)*smoothstep(.12,.06,c);v*=.35+.65*f;}
  else if(u_mode==2){v=step(bayer(gl_FragCoord.xy/2.),smoothstep(.25,.85,f));v*=.85;}
  else{v=smoothstep(.2,1.,f*f*1.6+length(q)*.25);}
  v=clamp(v*u_int+md*u_int*.25,0.,1.);
  float g=(h(gl_FragCoord.xy+fract(u_time))-.5)*.035;
  vec3 col=mix(u_a.rgb,u_b.rgb,v)+g;
  gl_FragColor=vec4(col,1.);
}`

const MODES = { flow: 0, contour: 1, dither: 2 } as const

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[cie/shader-field]", gl.getShaderInfoLog(s))
    return null
  }
  return s
}

function ShaderField({
  mode = "flow",
  intensity = 0.35,
  speed = 1,
  scale = 1.6,
  interactive = true,
  quality = 0.75,
  className,
  children,
  ...props
}: ShaderFieldProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    const gl = cv?.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" })
    if (!el || !cv || !gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "p")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (name: string) => gl.getUniformLocation(prog, name)
    const uRes = u("u_res"),
      uTime = u("u_time"),
      uMouse = u("u_mouse"),
      uA = u("u_a"),
      uB = u("u_b")
    gl.uniform1f(u("u_int"), intensity)
    gl.uniform1f(u("u_scale"), scale)
    gl.uniform1i(u("u_mode"), MODES[mode])

    const setColors = () => {
      const a: RGBA = readGroundColor(el)
      const b: RGBA = readTextColor(el)
      gl.uniform4fv(uA, a)
      gl.uniform4fv(uB, b)
    }
    setColors()

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let raf = 0
    let visible = true
    const t0 = performance.now()

    const render = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      gl.uniform1f(uTime, ((now - t0) / 1000) * speed)
      gl.uniform2f(uMouse, interactive ? mouse.x : -10, interactive ? mouse.y : -10)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = (now: number) => {
      render(now)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      cancelAnimationFrame(raf)
      if (reduce) render(t0 + 8000)
      else if (visible) raf = requestAnimationFrame(loop)
    }
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * quality
      cv.width = Math.max(1, Math.round(el.clientWidth * dpr))
      cv.height = Math.max(1, Math.round(el.clientHeight * dpr))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(uRes, cv.width, cv.height)
      render(performance.now())
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = 1 - (e.clientY - r.top) / r.height
    }

    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
      else cancelAnimationFrame(raf)
    })
    io.observe(el)
    const offTheme = onThemeChange(() => {
      setColors()
      render(performance.now())
    })
    if (interactive) window.addEventListener("pointermove", onMove, { passive: true })
    resize()
    start()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      offTheme()
      window.removeEventListener("pointermove", onMove)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [mode, intensity, speed, scale, interactive, quality, reduce])

  return (
    <div
      ref={wrap}
      data-slot="shader-field"
      className={cn("absolute inset-0 overflow-hidden bg-background text-foreground", className)}
      {...props}
    >
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 block size-full" />
      {children}
    </div>
  )
}

export { ShaderField }
