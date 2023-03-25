import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import DroidSans from 'three/examples/fonts/droid/droid_sans_bold.typeface.json'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import gsap from 'gsap'

import { Intercepted } from './intersector'

const colors = {
  primary: '#0000FF',
  onHover: '#1414ff',
}

class Button implements Intercepted {
  private box: THREE.Mesh
  private buttonGroup: THREE.Group
  private onClick: () => void

  isDisabled = false

  constructor(caption: string, onClick: () => void) {
    this.onClick = onClick

    this.buttonGroup = new THREE.Group()

    const fontLoader = new FontLoader()
    const textGeometry = new TextGeometry(caption, {
      font: fontLoader.parse(DroidSans),
      size: 0.4,
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

    const textMaterial = new THREE.MeshStandardMaterial({ color: '#FFFFFF' })
    textMaterial.transparent = true

    const text = new THREE.Mesh(textGeometry, textMaterial)
    text.rotation.x = -Math.PI * 0.5
    text.position.y = 0.05
    text.castShadow = false
    this.buttonGroup.add(text)

    const measure = new THREE.Box3().setFromObject(text)
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: colors.primary,
    })
    boxMaterial.transparent = true

    this.box = new THREE.Mesh(
      new RoundedBoxGeometry(measure.max.x - measure.min.x + 0.5, 0.7, 0.1),
      boxMaterial
    )

    this.box.rotation.x = -Math.PI * 0.5
    this.buttonGroup.add(this.box)
  }

  getObject3D = () => this.buttonGroup

  setPosition = (position: THREE.Vector3) => {
    this.buttonGroup.position.set(position.x, position.y, position.z)
  }

  mouseEnterHandler = () => {
    if (this.isDisabled) {
      return
    }

    document.body.style.cursor = 'pointer'
    if (this.box.material instanceof THREE.MeshStandardMaterial) {
      this.box.material.color.set(colors.onHover)
    }
  }

  mouseOutHandler = () => {
    if (this.isDisabled) {
      return
    }

    document.body.style.cursor = 'default'
    if (this.box.material instanceof THREE.MeshStandardMaterial) {
      this.box.material.color.set(colors.primary)
    }
  }

  clickHandler = () => {
    if (this.isDisabled) {
      return
    }

    gsap.to(this.buttonGroup.position, {
      duration: 0.1,
      ease: 'power2.inOut',
      y: '-=0.02',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.onClick()
      },
    })
  }
}

export default Button
