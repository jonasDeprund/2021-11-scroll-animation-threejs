import './style.css';
import * as THREE from 'three';
import * as dat from 'lil-gui';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: '#ffeded',
};

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor);
  particulesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * objects
 */

/**
 * Models
 */
const model1 = new GLTFLoader();

model1.load('/models/party.glb', function (gltf) {
  // called when the resource is loaded
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.position.y = -objectsDistance * 0 - 1;
  gltf.scene.position.x = 1.5;
  scene.add(gltf.scene);
});

const model2 = new GLTFLoader();

model1.load('/models/star.gltf', function (gltf) {
  // called when the resource is loaded
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.position.y = -objectsDistance * 1 - 1;
  gltf.scene.position.x = -2;
  scene.add(gltf.scene);
});

const model3 = new GLTFLoader();

model1.load('/models/party.glb', function (gltf) {
  // called when the resource is loaded
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.position.y = -objectsDistance * 2 - 1;
  gltf.scene.position.x = 1.5;
  scene.add(gltf.scene);
});

/**
 * Light
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

// Texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

// Material
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

// Meshes
const objectsDistance = 4;

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

// scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particules
 */

// Geometry

const particulesCount = 200;
const positions = new Float32Array(particulesCount * 3);

for (let i = 0; i < particulesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particulesGeometry = new THREE.BufferGeometry();
particulesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

// Material

const particulesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points

const particules = new THREE.Points(particulesGeometry, particulesMaterial);
scene.add(particules);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Create group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection !== currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5',
    });
  }
});

/**
 * Cursor
 */
const cursor = {};
(cursor.x = 0),
  (cursor.y = 0),
  window.addEventListener('mousemove', (e) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
    console.log(cursor.x);
  });

renderer.physicallyCorrectLights = true;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 3 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 3 * deltaTime;
  // Animate meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
