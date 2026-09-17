import { useEffect, useRef } from 'react'

/**
 * DepthTree — rend une photo comme un objet pseudo-3D interactif.
 *
 * Technique : « depth parallax ». Un quad plein écran échantillonne la photo
 * (uColor) en décalant les UV selon une carte de profondeur (uDepth) générée
 * par IA (Depth Anything V2). Le tronc et les racines (proches = clair) se
 * déplacent plus que le ciel (loin = noir) quand la souris bouge → illusion
 * de relief, tout en gardant les vrais pixels photoréalistes.
 *
 * Zéro dépendance : WebGL2 brut.
 */

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2  uResolution;   // taille du canvas en px
uniform vec2  uImageSize;    // taille de la photo en px
uniform vec2  uMouse;        // -0.5..0.5, lissée
uniform vec2  uStrength;     // amplitude du parallaxe (x, y)
uniform float uZoom;         // sur-cadrage pour éviter les bords vides

// mapping "cover" : la photo remplit le canvas sans déformation
vec2 coverUv(vec2 st) {
  vec2 s = uResolution;
  vec2 i = uImageSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 nw = (rs < ri) ? vec2(i.x * s.y / i.y, s.y)
                      : vec2(s.x, i.y * s.x / i.x);
  vec2 off = ((rs < ri) ? vec2((nw.x - s.x) * 0.5, 0.0)
                        : vec2(0.0, (nw.y - s.y) * 0.5)) / nw;
  return st * s / nw + off;
}

void main() {
  vec2 uv = coverUv(vUv);
  // sur-cadrage : on laisse de la marge pour le déplacement
  uv = (uv - 0.5) / uZoom + 0.5;

  vec2 dir = uMouse * uStrength;

  // Itération à point fixe : converge vers la surface visible.
  // Le décalage est proportionnel à (profondeur - 0.5) : les objets proches
  // partent dans un sens, le lointain dans l'autre → pivot naturel.
  vec2 p = uv;
  for (int k = 0; k < 6; k++) {
    float d = texture(uDepth, p).r;
    p = uv + dir * (d - 0.5);
  }

  p = clamp(p, vec2(0.0), vec2(1.0));
  fragColor = texture(uColor, p);
}`

function makeShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error('shader: ' + gl.getShaderInfoLog(sh))
  }
  return sh
}

function loadTexture(gl, url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      resolve({ tex, w: img.naturalWidth, h: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

export default function DepthTree({
  color = '/images/arbre-color.jpg',
  depth = '/images/arbre-depth.png',
  strength = [0.038, 0.028],
  className = '',
}) {
  const canvasRef = useRef(null)
  // souris cible / lissée + phase de dérive au repos
  const target = useRef({ x: 0, y: 0 })
  const eased = useRef({ x: 0, y: 0 })
  const active = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false })
    if (!gl) {
      canvas.style.background = '#0a0f14'
      return
    }

    let raf = 0
    let disposed = false
    let colorTex = null
    let depthTex = null
    let imgW = 1920
    let imgH = 1404

    const prog = gl.createProgram()
    gl.attachShader(prog, makeShader(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, makeShader(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // quad plein écran
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 3, -1, -1, 3,
    ]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const U = {
      color: gl.getUniformLocation(prog, 'uColor'),
      depth: gl.getUniformLocation(prog, 'uDepth'),
      resolution: gl.getUniformLocation(prog, 'uResolution'),
      imageSize: gl.getUniformLocation(prog, 'uImageSize'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
      strength: gl.getUniformLocation(prog, 'uStrength'),
      zoom: gl.getUniformLocation(prog, 'uZoom'),
    }
    gl.uniform1i(U.color, 0)
    gl.uniform1i(U.depth, 1)
    gl.uniform2f(U.strength, strength[0], strength[1])
    gl.uniform1f(U.zoom, 1.04)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const start = performance.now()
    function frame(now) {
      if (disposed) return
      const t = (now - start) / 1000

      // dérive lente au repos → le hero « respire » même sans souris
      const idleX = active.current ? 0 : Math.sin(t * 0.35) * 0.14
      const idleY = active.current ? 0 : Math.cos(t * 0.27) * 0.09
      const tx = target.current.x + idleX
      const ty = target.current.y + idleY

      // lissage (ressort simple)
      eased.current.x += (tx - eased.current.x) * 0.06
      eased.current.y += (ty - eased.current.y) * 0.06

      gl.useProgram(prog)
      gl.bindVertexArray(vao)
      gl.uniform2f(U.resolution, canvas.width, canvas.height)
      gl.uniform2f(U.imageSize, imgW, imgH)
      gl.uniform2f(U.mouse, eased.current.x, eased.current.y)
      if (colorTex && depthTex) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, colorTex)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, depthTex)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
      raf = requestAnimationFrame(frame)
    }

    // Suivi de la souris au niveau fenêtre (relatif au canvas) : fonctionne
    // même si du contenu recouvre le canvas dans le hero.
    function onMove(e) {
      const r = canvas.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      const inside = nx >= -0.5 && nx <= 0.5 && ny >= -0.5 && ny <= 0.5
      if (inside) {
        active.current = true
        target.current.x = nx
        target.current.y = ny
      } else {
        active.current = false
        target.current.x = 0
        target.current.y = 0
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    Promise.all([loadTexture(gl, color), loadTexture(gl, depth)])
      .then(([c, d]) => {
        if (disposed) return
        colorTex = c.tex
        depthTex = d.tex
        imgW = c.w
        imgH = c.h
        raf = requestAnimationFrame(frame)
      })
      .catch(() => {})

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [color, depth, strength[0], strength[1]])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
