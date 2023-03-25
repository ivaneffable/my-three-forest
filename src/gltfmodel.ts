import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import { Intercepted } from './intersector'

class GltfModel implements Intercepted {
  private gltfLoader: GLTFLoader
  private object: THREE.Object3D = new THREE.Object3D()
  private transformControl: TransformControls

  isDisabled = false

  constructor(transformControl: TransformControls) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(dracoLoader)
    this.transformControl = transformControl
  }

  async loadModel(model: string) {
    const gltf = await this.gltfLoader.loadAsync(`/models/${model}.glb`)
    this.object = gltf.scene

    return this
  }

  getObject3D = () => this.object

  setPosition = (position: THREE.Vector3) => {
    this.object.position.set(position.x, position.y, position.z)
  }

  setScale = (scale: number) => {
    this.object.scale.set(scale, scale, scale)
  }

  mouseEnterHandler = () => {
    if (this.isDisabled) {
      return
    }

    document.body.style.cursor = 'pointer'
  }
  mouseOutHandler = () => {
    if (this.isDisabled) {
      return
    }

    document.body.style.cursor = 'default'
  }

  clickHandler = () => {
    if (this.isDisabled) {
      return
    }

    if (
      this.transformControl.object === this.object &&
      this.transformControl.mode === 'translate'
    ) {
      this.transformControl.setMode('rotate')
      this.transformControl.showX = false
      this.transformControl.showY = true
      this.transformControl.showZ = false

      this.transformControl.detach()
    } else if (
      (this.transformControl.object === this.object &&
        this.transformControl.mode === 'rotate') ||
      this.transformControl.object !== this.object
    ) {
      this.transformControl.setMode('translate')
      this.transformControl.showX = true
      this.transformControl.showY = false
      this.transformControl.showZ = true

      this.transformControl.detach()
    }

    this.transformControl.attach(this.object)
    document.body.style.cursor = 'default'
  }

  clickOutHandler = () => {
    if (
      this.transformControl.object === this.object &&
      !this.transformControl.dragging
    ) {
      this.transformControl.detach()
    }
  }
}

export default GltfModel
