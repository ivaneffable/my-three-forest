import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import { WorldElement } from './world'

class TransformController {
  private transformControl: TransformControls

  constructor(camera: THREE.PerspectiveCamera, element: HTMLElement) {
    this.transformControl = new TransformControls(camera, element)
  }

  public getTransformControl(): TransformControls {
    return this.transformControl
  }

  public toggleTransformControl = (object: WorldElement) => {
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

  public removeTransformControl = (object: WorldElement) => {
    const worldObject = object.getWorldObject()
    if (
      this.transformControl.object === worldObject &&
      !this.transformControl.dragging
    ) {
      this.transformControl.detach()
    }
  }
}

export default TransformController
