import * as THREE from 'three'

export interface Intercepted {
  onClick(event: MouseEvent): void
  onClickOut?(event: MouseEvent): void
  onMouseEnter(event: MouseEvent): void
  onMouseOut(event: MouseEvent): void
  getObject3D(): THREE.Object3D
}

class Intersector {
  private camera: THREE.Camera
  private mouse: THREE.Vector2
  private raycaster: THREE.Raycaster
  private observers: Intercepted[]
  private interceptedObjects: Intercepted[]

  private static instance: Intersector

  private constructor(camera: THREE.Camera) {
    this.camera = camera
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.observers = []
    this.interceptedObjects = []

    document.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('pointerdown', this.onClick)
  }

  static getInstance(camera: THREE.Camera): Intersector {
    if (!Intersector.instance) {
      Intersector.instance = new Intersector(camera)
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

    this.raycaster.setFromCamera(this.mouse, this.camera)
    for (const observer of this.observers) {
      const intersects =
        this.raycaster.intersectObject(observer.getObject3D(), true).length > 0
      console.log(observer, intersects)
      if (intersects) {
        observer.onClick(event)
      } else {
        observer.onClickOut?.(event)
      }
    }
  }

  onPointerMove = (event: MouseEvent) => {
    event.preventDefault()

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    for (const observer of this.observers) {
      const intersects =
        this.raycaster.intersectObject(observer.getObject3D(), true).length > 0
      if (intersects) {
        this.interceptedObjects.push(observer)
        observer.onMouseEnter(event)
      } else {
        const index = this.interceptedObjects.indexOf(observer)
        if (index !== -1) {
          this.interceptedObjects.splice(index, 1)
          observer.onMouseOut(event)
        }
      }
    }
  }
}

export default Intersector
