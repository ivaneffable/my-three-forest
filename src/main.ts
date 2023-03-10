import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import Button from './button'
import GltfModel from './gltfmodel'

const grassGreen = 0x3f7d1a

const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

document.body.appendChild(renderer.domElement)
renderer.domElement.setAttribute('class', 'webgl')

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  1,
  500
)
camera.position.set(0, 3, 10)

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const cubeTextureLoader = new THREE.CubeTextureLoader()

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = environmentMap
      child.material.envMapIntensity = 1.5
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/px.jpg',
  '/textures/environmentMaps/nx.jpg',
  '/textures/environmentMaps/py.jpg',
  '/textures/environmentMaps/ny.jpg',
  '/textures/environmentMaps/pz.jpg',
  '/textures/environmentMaps/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding

const scene = new THREE.Scene()

const control = new TransformControls(camera, renderer.domElement)
control.addEventListener('dragging-changed', function (event) {
  orbit.enabled = !event.value
})
scene.add(control)
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.enableDamping = true

new Button(scene, camera)

await new GltfModel(scene, camera, control).loadModel('BirchTree_4')
const pine = await new GltfModel(scene, camera, control).loadModel('PineTree_1')
pine.position.x = 2

updateAllMaterials()

const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 15, -10)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 25
directionalLight.shadow.camera.right = 15
directionalLight.shadow.camera.left = -15
directionalLight.shadow.camera.top = 15
directionalLight.shadow.camera.bottom = -15
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

const geometry = new THREE.PlaneGeometry(25, 25)
const material = new THREE.MeshStandardMaterial({
  color: grassGreen,
  side: THREE.DoubleSide,
  metalness: 0,
  roughness: 1,
})
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = -Math.PI * 0.5
plane.receiveShadow = true
plane.castShadow = true
scene.add(plane)

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
})

function animate() {
  requestAnimationFrame(animate)

  orbit.update()
  renderer.render(scene, camera)
}

animate()
