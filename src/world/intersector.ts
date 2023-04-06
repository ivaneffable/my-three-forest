import * as THREE from 'three'

import World, { WorldElement } from './world'

export interface Intercepted extends WorldElement {
  clickHandler(event: MouseEvent): void
  clickOutHandler?(event: MouseEvent): void
  mouseEnterHandler(event: MouseEvent): void
  mouseOutHandler(event: MouseEvent): void
}

class Intersector {
  private world: World = World.getInstance()
  private mouse: THREE.Vector2
  private raycaster: THREE.Raycaster
  private observers: Intercepted[]
  private interceptedObjects: Intercepted[]

  private static instance: Intersector

  private constructor() {
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.observers = []
    this.interceptedObjects = []

    document.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('pointerdown', this.onClick)
  }

  static getInstance(): Intersector {
    if (!Intersector.instance) {
      Intersector.instance = new Intersector()
    }

    return Intersector.instance
  }

  public attach(observer: Intercepted): void {
    const isExist = this.observers.includes(observer)
    if (!isExist) {
      this.observers.push(observer)
    }
  }

  public detach(observer: Intercepted): void {
    const observerIndex = this.observers.indexOf(observer)
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1)
    }
  }

  onClick = (event: MouseEvent) => {
    event.preventDefault()

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.world.getCamera())
    for (const observer of this.observers) {
      const intersects =
        this.raycaster.intersectObject(observer.getWorldObject(), true).length >
        0
      if (intersects) {
        observer.clickHandler(event)
      } else {
        observer.clickOutHandler?.(event)
      }
    }
  }

  onPointerMove = (event: MouseEvent) => {
    event.preventDefault()

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.world.getCamera())
    for (const observer of this.observers) {
      const object3D = observer.getWorldObject()

      const intersects =
        this.raycaster.intersectObject(object3D, true).length > 0
      if (intersects) {
        if (!object3D.visible) {
          continue
        }
        this.interceptedObjects.push(observer)
        observer.mouseEnterHandler(event)
      } else {
        const index = this.interceptedObjects.indexOf(observer)
        if (index !== -1) {
          this.interceptedObjects.splice(index, 1)
          observer.mouseOutHandler(event)
        }
      }
    }
  }
}

export default Intersector
