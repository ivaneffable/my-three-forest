import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import GltfModel from './gltfmodel'
import Intersector, { Intercepted } from './intersector'

export interface WorldElement {
  getWorldObject(): THREE.Object3D
}

class World {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private transformControl: TransformControls
  private environmentMap: THREE.CubeTexture
  private gltfLoader: GLTFLoader

  private static instance: World

  private constructor() {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.scene = new THREE.Scene()

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

    this.camera = new THREE.PerspectiveCamera(
      45,
      sizes.width / sizes.height,
      1,
      500
    )
    this.camera.position.set(7.5, 3, 14)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(dracoLoader)

    const cubeTextureLoader = new THREE.CubeTextureLoader()
    this.environmentMap = cubeTextureLoader.load([
      '/textures/environmentMaps/px.jpg',
      '/textures/environmentMaps/nx.jpg',
      '/textures/environmentMaps/py.jpg',
      '/textures/environmentMaps/ny.jpg',
      '/textures/environmentMaps/pz.jpg',
      '/textures/environmentMaps/nz.jpg',
    ])
    this.environmentMap.encoding = THREE.sRGBEncoding

    const orbit = new OrbitControls(this.camera, renderer.domElement)
    orbit.enableDamping = true

    this.transformControl = new TransformControls(
      this.camera,
      renderer.domElement
    )
    this.transformControl.showY = false
    this.transformControl.addEventListener(
      'dragging-changed',
      function (event) {
        orbit.enabled = !event.value
      }
    )
    this.scene.add(this.transformControl)

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
    this.scene.add(ambientLight)

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
    this.scene.add(directionalLight)

    window.addEventListener('resize', () => {
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      this.camera.aspect = sizes.width / sizes.height
      this.camera.updateProjectionMatrix()

      renderer.setSize(sizes.width, sizes.height)
    })

    const animate = () => {
      requestAnimationFrame(animate)

      orbit.update()
      renderer.render(this.scene, this.camera)
    }

    animate()
  }

  async loadModel(glftModel: GltfModel) {
    const gltf = await this.gltfLoader.loadAsync(
      `/models/${glftModel.getModel()}.glb`
    )
    glftModel.setWorldObject(gltf.scene)

    return glftModel
  }

  updateAllMaterials = () => {
    this.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.envMap = this.environmentMap
        child.material.envMapIntensity = 1.5
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  add = async (object: WorldElement | THREE.Mesh) => {
    this.scene.add(
      object instanceof THREE.Mesh ? object : object.getWorldObject()
    )

    if ('clickHandler' in object) {
      Intersector.getInstance().attach(object as Intercepted)
    }
    this.updateAllMaterials()
  }

  remove = (object: WorldElement | THREE.Mesh) => {
    if ('clickHandler' in object) {
      Intersector.getInstance().detach(object as Intercepted)
    }

    this.scene.remove(
      object instanceof THREE.Mesh ? object : object.getWorldObject()
    )
  }

  getCamera = () => this.camera

  toggleTransformControl = (object: WorldElement) => {
    const worldObject = object.getWorldObject()
    if (
      this.transformControl.object === worldObject &&
      this.transformControl.mode === 'translate'
    ) {
      this.transformControl.setMode('rotate')
      this.transformControl.showX = false
      this.transformControl.showY = true
      this.transformControl.showZ = false

      this.transformControl.detach()
    } else if (
      (this.transformControl.object === worldObject &&
        this.transformControl.mode === 'rotate') ||
      this.transformControl.object !== worldObject
    ) {
      this.transformControl.setMode('translate')
      this.transformControl.showX = true
      this.transformControl.showY = false
      this.transformControl.showZ = true

      this.transformControl.detach()
    }

    this.transformControl.attach(worldObject)
    document.body.style.cursor = 'default'
  }

  removeTransformControl = (object: WorldElement) => {
    const worldObject = object.getWorldObject()
    if (
      this.transformControl.object === worldObject &&
      !this.transformControl.dragging
    ) {
      this.transformControl.detach()
    }
  }

  static getInstance(): World {
    if (!World.instance) {
      World.instance = new World()
    }

    return World.instance
  }
}

export default World
