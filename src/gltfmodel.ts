import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import Intersector, { Intercepted } from './intersector'

class GltfModel implements Intercepted {
  private controls: TransformControls
  private scene: THREE.Scene
  private gltfLoader: GLTFLoader
  private object: THREE.Object3D = new THREE.Object3D()

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    controls: TransformControls
  ) {
    this.scene = scene
    this.controls = controls

    Intersector.getInstance(camera).attach(this)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(dracoLoader)
  }

  public async loadModel(model: string) {
    const gltf = await this.gltfLoader.loadAsync(`/models/${model}.glb`)
    this.object = gltf.scene
    this.scene.add(this.object)

    return this.object
  }

  getObject3D = () => this.object

  onMouseEnter(): void {
    document.body.style.cursor = 'pointer'
  }
  onMouseOut(): void {
    document.body.style.cursor = 'default'
  }

  onClick = () => {
    console.log('click')
    if (!this.controls.dragging) {
      this.controls.detach()
    }
    this.controls.attach(this.object)
    document.body.style.cursor = 'default'
  }

  onClickOut = () => {
    console.log('click out')
    if (this.controls.object === this.object && !this.controls.dragging) {
      this.controls.detach()
    }
  }
}

export default GltfModel
