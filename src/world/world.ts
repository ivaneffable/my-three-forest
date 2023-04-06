import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import Intersector, { Intercepted } from './intersector'
import TransformController from './transformController'

import {
  CSS3DObject,
  CSS3DRenderer,
} from 'three/examples/jsm/renderers/CSS3DRenderer.js'

export interface WorldElement {
  getWorldObject(): THREE.Object3D
  setWorldObject(object: THREE.Object3D): void
}

export interface WorldModel extends WorldElement {
  getModel(): string
}

class World {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private transformController: TransformController
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

    /**
     * CSS3 stuff
     */
    const cssRenderer = new CSS3DRenderer()
    cssRenderer.setSize(sizes.width, sizes.height)
    document.body.appendChild(cssRenderer.domElement)
    cssRenderer.domElement.setAttribute('class', 'webgl')

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

    const orbit = new OrbitControls(this.camera, cssRenderer.domElement)
    orbit.enableDamping = true

    this.transformController = new TransformController(this.camera, renderer)
    const transformControl = this.transformController.getTransformControl()
    transformControl.addEventListener('dragging-changed', function (event) {
      orbit.enabled = !event.value
    })
    this.scene.add(transformControl)

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
      cssRenderer.render(this.scene, this.camera)
    }

    animate()
  }

  async loadModel(glftModel: WorldModel) {
    const gltf = await this.gltfLoader.loadAsync(
      `/models/${glftModel.getModel()}.glb`
    )
    glftModel.setWorldObject(gltf.scene)
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

  add = async (object: WorldElement | THREE.Mesh | CSS3DObject) => {
    this.scene.add(
      'getWorldObject' in object ? object.getWorldObject() : object
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
    this.transformController.toggleTransformControl(object)
  }

  removeTransformControl = (object: WorldElement) => {
    this.transformController.removeTransformControl(object)
  }

  static getInstance(): World {
    if (!World.instance) {
      World.instance = new World()
    }

    return World.instance
  }
}

export default World
