import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import DroidSans from 'three/examples/fonts/droid/droid_sans_bold.typeface.json'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import Intersector, { Intercepted } from './intersector'

class Button implements Intercepted {
  scene: THREE.Scene
  camera: THREE.Camera
  box: THREE.Mesh
  raycaster: THREE.Raycaster

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene
    this.camera = camera
    this.raycaster = new THREE.Raycaster()

    Intersector.getInstance(camera).attach(this)

    const fontLoader = new FontLoader()
    const textGeometry = new TextGeometry('Click', {
      font: fontLoader.parse(DroidSans),
      size: 0.5,
      height: 0.01,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    })
    textGeometry.computeBoundingBox()
    textGeometry.center()

    const text = new THREE.Mesh(
      textGeometry,
      new THREE.MeshStandardMaterial({ color: '#FFFFFF' })
    )
    text.rotation.x = -Math.PI * 0.5
    text.position.x = 4
    text.position.y = 0.05
    scene.add(text)

    this.box = new THREE.Mesh(
      new RoundedBoxGeometry(2, 1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x0000ff })
    )

    this.box.position.x = 4
    this.box.rotation.x = -Math.PI * 0.5
    scene.add(this.box)
  }

  getObject3D = () => this.box

  onMouseEnter(): void {
    document.body.style.cursor = 'pointer'
  }
  onMouseOut(): void {
    document.body.style.cursor = 'default'
  }

  onClick = (event: MouseEvent) => {
    console.log('click')
  }
}

export default Button
