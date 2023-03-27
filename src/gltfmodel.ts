import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import { Intercepted } from './intersector'

class GltfModel implements Intercepted {
  private gltfLoader: GLTFLoader
  private object: THREE.Object3D = new THREE.Object3D()

  onClick?: () => void
  onClickOut?: () => void

  constructor() {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(dracoLoader)
  }

  async loadModel(model: string) {
    const gltf = await this.gltfLoader.loadAsync(`/models/${model}.glb`)
    this.object = gltf.scene

    return this
  }

  getWorldObject = () => this.object

  setPosition = (position: THREE.Vector3) => {
    this.object.position.set(position.x, position.y, position.z)
  }

  setScale = (scale: number) => {
    this.object.scale.set(scale, scale, scale)
  }

  mouseEnterHandler = () => {
    if (!this.onClick) {
      return
    }

    document.body.style.cursor = 'pointer'
  }
  mouseOutHandler = () => {
    if (!this.onClick) {
      return
    }

    document.body.style.cursor = 'default'
  }

  clickHandler = () => {
    this.onClick?.()
  }

  clickOutHandler = () => {
    this.onClickOut?.()
  }

  clone = () => {
    const clone = new GltfModel()
    clone.object = this.object.clone()

    return clone
  }
}

export default GltfModel
