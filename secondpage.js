import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const stage = document.querySelector("#click-area");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030505, 0.075);

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.05, 7.2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
stage.appendChild(renderer.domElement);

const pointer = new THREE.Vector2(0, 0);
const easedPointer = new THREE.Vector2(0, 0);

const ambientLight = new THREE.HemisphereLight(0xd9f2dc, 0x050707, 0.72);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xf6f7df, 28, 13, Math.PI / 4.6, 0.96, 1.1);
spotlight.position.set(0, 6.2, 2.6);
spotlight.target.position.set(0, 0.15, 0);
scene.add(spotlight, spotlight.target);

const jadeFill = new THREE.PointLight(0x7af2bf, 3.1, 5.2);
jadeFill.position.set(-2.8, 1.55, 2.8);
scene.add(jadeFill);

const frontGlow = new THREE.PointLight(0xcfffe5, 1.25, 5.8);
frontGlow.position.set(1.6, 0.55, 3.2);
scene.add(frontGlow);

const rimLight = new THREE.DirectionalLight(0xe5fff0, 1.8);
rimLight.position.set(3.2, 3.1, -3.4);
scene.add(rimLight);

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function jadeNoise(x, y, z) {
  return (
    Math.sin(x * 2.7 + y * 1.4 - z * 1.1) * 0.11 +
    Math.cos(x * 4.6 - y * 2.1 + z * 1.7) * 0.07 +
    Math.sin((x + y + z) * 7.4) * 0.04 +
    Math.cos((x - z) * 10.2 + y * 2.6) * 0.025
  );
}

function applyJadeVertexColors(geometry) {
  const colors = [];
  const jadeColor = new THREE.Color();
  const positionAttribute = geometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i += 1) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);
    const cloudyTone = clamp01(0.58 + jadeNoise(x, y, z));
    const warmTone = clamp01(0.28 + Math.sin(x * 1.8 - y * 1.1 + z * 2.2) * 0.22);
    const paleTone = clamp01(0.32 + Math.cos(x * 2.4 + y * 1.6 + z * 0.9) * 0.2);

    const r = 0.38 + cloudyTone * 0.25 + warmTone * 0.13 + paleTone * 0.1;
    const g = 0.58 + cloudyTone * 0.25 + warmTone * 0.05 + paleTone * 0.08;
    const b = 0.42 + cloudyTone * 0.18 - warmTone * 0.04 + paleTone * 0.07;

    jadeColor.setRGB(clamp01(r), clamp01(g), clamp01(b));
    colors.push(jadeColor.r, jadeColor.g, jadeColor.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
}

function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  const glow = context.createRadialGradient(48, 48, 0, 48, 48, 46);
  glow.addColorStop(0, "rgba(255, 255, 238, 1)");
  glow.addColorStop(0.16, "rgba(225, 255, 224, 0.82)");
  glow.addColorStop(0.42, "rgba(154, 225, 185, 0.24)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 96, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarField() {
  const starCount = 520;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const phases = new Float32Array(starCount);
  const baseBrightness = new Float32Array(starCount);
  const color = new THREE.Color();

  for (let i = 0; i < starCount; i += 1) {
    const side = i % 3;
    const x = side === 0 ? -4.1 - Math.random() * 3.8 : side === 1 ? 4.1 + Math.random() * 3.8 : (Math.random() - 0.5) * 9.6;
    const y = -0.45 + Math.random() * 5.6;
    const z = -3.4 - Math.random() * 4.2;
    const brightness = 0.72 + Math.random() * 0.74;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    color.setHSL(0.28 + Math.random() * 0.1, 0.34, 0.62 + Math.random() * 0.26);
    colors[i * 3] = color.r * brightness;
    colors[i * 3 + 1] = color.g * brightness;
    colors[i * 3 + 2] = color.b * brightness;

    phases[i] = Math.random() * Math.PI * 2;
    baseBrightness[i] = brightness;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.095,
    map: createStarTexture(),
    transparent: true,
    opacity: 0.95,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  stars.userData = { phases, baseBrightness };
  scene.add(stars);
  return stars;
}

const stars = createStarField();
const relicGroup = new THREE.Group();
scene.add(relicGroup);

const jadeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb7e4b5,
  vertexColors: true,
  roughness: 0.24,
  metalness: 0.02,
  transmission: 0.5,
  thickness: 1.48,
  ior: 1.55,
  clearcoat: 0.9,
  clearcoatRoughness: 0.11,
  sheen: 0.32,
  sheenColor: 0xe1f1c9,
  emissive: 0x253f2f,
  emissiveIntensity: 0.1
});

const innerGlowMaterial = new THREE.MeshBasicMaterial({
  color: 0xe8f5cf,
  transparent: true,
  opacity: 0.1,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const jadeGeometry = new THREE.SphereGeometry(1.18, 72, 48);
const position = jadeGeometry.attributes.position;
const vertex = new THREE.Vector3();

for (let i = 0; i < position.count; i += 1) {
  vertex.fromBufferAttribute(position, i);
  const warp =
    1 +
    Math.sin(vertex.x * 2.2 + vertex.y * 1.1) * 0.018 +
    Math.cos(vertex.y * 2.8 - vertex.z * 1.5) * 0.022 +
    Math.sin(vertex.z * 3.2 + vertex.x * 1.2) * 0.014;

  vertex.x *= warp * 0.84;
  vertex.y *= warp * 1.16;
  vertex.z *= warp * 0.78;
  position.setXYZ(i, vertex.x, vertex.y, vertex.z);
}

jadeGeometry.computeVertexNormals();
applyJadeVertexColors(jadeGeometry);

const jade = new THREE.Mesh(jadeGeometry, jadeMaterial);
jade.position.y = 0.3;
relicGroup.add(jade);

const innerGlow = new THREE.Mesh(jadeGeometry.clone(), innerGlowMaterial);
innerGlow.scale.set(0.78, 0.82, 0.78);
innerGlow.position.y = 0.02;
jade.add(innerGlow);

const companionMaterial = jadeMaterial.clone();
companionMaterial.color = new THREE.Color(0xb8dfb1);
companionMaterial.vertexColors = false;
companionMaterial.transmission = 0.38;
companionMaterial.roughness = 0.3;
companionMaterial.clearcoat = 0.76;

const companionObjects = [];
const companionShapes = [
  new THREE.OctahedronGeometry(0.18, 1),
  new THREE.TetrahedronGeometry(0.2, 1),
  new THREE.TorusGeometry(0.14, 0.036, 12, 36),
  new THREE.CapsuleGeometry(0.07, 0.28, 8, 18),
  new THREE.BoxGeometry(0.12, 0.32, 0.1),
  new THREE.IcosahedronGeometry(0.15, 1)
];

for (let i = 0; i < 12; i += 1) {
  const mesh = new THREE.Mesh(companionShapes[i % companionShapes.length], companionMaterial.clone());
  const angle = (i / 12) * Math.PI * 2;
  const radius = 1.56 + (i % 4) * 0.18;
  mesh.position.set(
    Math.cos(angle) * radius,
    0.25 + Math.sin(i * 1.3) * 0.62,
    Math.sin(angle) * 0.52
  );
  mesh.scale.set(
    0.68 + (i % 4) * 0.13,
    0.64 + ((i + 2) % 5) * 0.12,
    0.68 + ((i + 1) % 3) * 0.14
  );
  mesh.userData = {
    angle,
    radius,
    verticalOffset: 0.2 + Math.sin(i * 1.3) * 0.54,
    speed: 0.34 + (i % 4) * 0.045,
    depth: 0.38 + (i % 5) * 0.08,
    wobble: 0.08 + (i % 4) * 0.035
  };
  companionObjects.push(mesh);
  relicGroup.add(mesh);
}

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.55, 1.88, 0.38, 72),
  new THREE.MeshStandardMaterial({
    color: 0x151817,
    roughness: 0.72,
    metalness: 0.18
  })
);
pedestal.position.y = -1.25;
scene.add(pedestal);

const pedestalTop = new THREE.Mesh(
  new THREE.CylinderGeometry(1.5, 1.5, 0.035, 72),
  new THREE.MeshBasicMaterial({
    color: 0x79d7a8,
    transparent: true,
    opacity: 0.18
  })
);
pedestalTop.position.y = -1.03;
scene.add(pedestalTop);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(7, 96),
  new THREE.MeshStandardMaterial({
    color: 0x030404,
    roughness: 0.86,
    metalness: 0.08
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.48;
scene.add(floor);

function updatePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("mousemove", updatePointer);

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    updatePointer(touch);
  },
  { passive: true }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  easedPointer.lerp(pointer, 0.12);

  relicGroup.position.x = easedPointer.x * 0.66;
  relicGroup.position.y = easedPointer.y * 0.28 + Math.sin(elapsed * 1.45) * 0.05;
  relicGroup.position.z = easedPointer.y * 0.2;
  relicGroup.rotation.y = easedPointer.x * 0.34;
  relicGroup.rotation.x = easedPointer.y * 0.16;

  jade.rotation.y = elapsed * 0.24 + easedPointer.x * 0.82;
  jade.rotation.x = -0.1 + easedPointer.y * 0.62;
  jade.rotation.z = easedPointer.x * -0.24 + easedPointer.y * 0.1;
  jade.position.y = 0.3;

  innerGlow.rotation.y = -elapsed * 0.11;
  innerGlow.material.opacity = 0.14 + Math.sin(elapsed * 1.25) * 0.035;

  const starColors = stars.geometry.attributes.color;
  for (let i = 0; i < starColors.count; i += 1) {
    const pulse = 0.68 + Math.sin(elapsed * (0.9 + (i % 7) * 0.08) + stars.userData.phases[i]) * 0.32;
    const shimmer = stars.userData.baseBrightness[i] * pulse;
    starColors.setXYZ(i, 0.78 * shimmer, 0.96 * shimmer, 0.8 * shimmer);
  }
  starColors.needsUpdate = true;
  stars.rotation.y = easedPointer.x * 0.035;
  stars.rotation.x = easedPointer.y * -0.018;

  companionObjects.forEach((mesh, index) => {
    const spin = mesh.userData.angle + elapsed * mesh.userData.speed + easedPointer.x * 0.7;
    mesh.position.x = Math.cos(spin) * mesh.userData.radius + easedPointer.x * 0.18;
    mesh.position.y = mesh.userData.verticalOffset + Math.sin(elapsed * 1.2 + index) * 0.1 + easedPointer.y * 0.2;
    mesh.position.z = Math.sin(spin) * mesh.userData.depth + easedPointer.y * 0.12;
    mesh.position.x += Math.sin(elapsed * 1.7 + index * 0.8) * mesh.userData.wobble;
    mesh.position.z += Math.cos(elapsed * 1.3 + index * 0.6) * mesh.userData.wobble;
    mesh.rotation.x = elapsed * (0.42 + index * 0.02);
    mesh.rotation.y = -elapsed * (0.36 + index * 0.015);
    mesh.rotation.z = Math.sin(elapsed * 0.9 + index) * 0.55;
  });

  spotlight.target.position.x = relicGroup.position.x * 0.14;
  spotlight.target.position.y = jade.position.y + relicGroup.position.y - 0.12;
  jadeFill.position.x = -2.8 + easedPointer.x * 0.55;
  frontGlow.position.x = 1.6 + easedPointer.x * 0.45;
  frontGlow.position.y = 0.55 + easedPointer.y * 0.22;
  pedestalTop.material.opacity = 0.16 + Math.sin(elapsed * 1.8) * 0.028;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
