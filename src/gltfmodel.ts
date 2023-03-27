import * as THREE from 'three'

import { Intercepted } from './intersector'

class GltfModel implements Intercepted {
  private model: string
  private object: THREE.Object3D = new THREE.Object3D()

  onClick?: () => void
  onClickOut?: () => void

  constructor(model: string) {
    this.model = model
  }

  getWorldObject = () => this.object

  setWorldObject = (object: THREE.Object3D) => {
    this.object = object
  }

  getModel = () => this.model

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
    const clone = new GltfModel(this.getModel())
    clone.object = this.object.clone()

    return clone
  }
}

export default GltfModel
