import * as THREE from 'three'
import gsap from 'gsap'

import { World } from './world'
import Button from './components/button'
import GltfModel from './components/gltfmodel'

import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

function createCSS3DObject(content: string) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = content
  const div = wrapper.firstChild as HTMLDivElement
  // set some values on the div to style it. // normally you do this directly in HTML and // CSS files.
  div.style.width = '150px'
  div.style.height = '150px'
  div.style.color = 'blue'
  // create a CSS3Dobject and return it.
  const object = new CSS3DObject(div)
  return object
}

const grassGreen = 0x3f7d1a

const world = World.getInstance()

let selectedTree = 0

const birch = new GltfModel('BirchTree_4')
const pine = new GltfModel('PineTree_1')
const commonTree = new GltfModel('CommonTree_1')
const willow = new GltfModel('Willow_1')
const cactus = new GltfModel('Cactus_3')
const rock = new GltfModel('Rock_1')
const rockMoss = new GltfModel('Rock_Moss_6')

await world.loadModel(birch)
await world.loadModel(pine)
await world.loadModel(commonTree)
await world.loadModel(willow)
await world.loadModel(cactus)
await world.loadModel(rock)
await world.loadModel(rockMoss)
const trees = [birch, pine, commonTree, willow, cactus, rock, rockMoss]

trees.forEach((tree) => {
  tree.setScale(0.6)
  tree.setPosition(new THREE.Vector3(5.9, 1, 7))
  gsap.to(tree.getWorldObject().rotation, {
    duration: 5,
    y: 2 * Math.PI,
    ease: 'none',
    repeat: -1,
  })
})

const moveCameraIfFar = () => {
  const camera = world.getCamera()
  const distance = camera.position.distanceTo(new THREE.Vector3(7.5, 3, 14))
  if (distance > 2) {
    gsap.to(camera.position, {
      duration: 1.5,
      x: 7.5,
      y: 3,
      z: 14,
      ease: 'power4.out',
    })
  }
}

const removeCurrentTree = () => {
  world.remove(trees[selectedTree])
}

const selectButton = new Button('+', () => {
  const newTree = trees[selectedTree].clone()
  newTree.setScale(1)
  newTree.setPosition(new THREE.Vector3(0, 0, 7))
  world.toggleTransformControl(newTree)
  world.add(newTree)
  newTree.onClick = () => {
    world.toggleTransformControl(newTree)
  }
  newTree.onClickOut = () => {
    world.removeTransformControl(newTree)
  }
})
selectButton.setPosition(new THREE.Vector3(5.9, 0, 7))

const moveLeftButton = new Button('<', () => {
  moveCameraIfFar()
  removeCurrentTree()

  selectedTree = selectedTree === 0 ? trees.length - 1 : selectedTree - 1
  world.add(trees[selectedTree])
})
moveLeftButton.setPosition(new THREE.Vector3(5, 0, 7))

const moveRightButton = new Button('>', () => {
  moveCameraIfFar()
  removeCurrentTree()

  selectedTree = selectedTree === trees.length - 1 ? 0 : selectedTree + 1
  world.add(trees[selectedTree])
})
moveRightButton.setPosition(new THREE.Vector3(6.8, 0, 7))

world.add(trees[selectedTree])
world.add(moveLeftButton)
world.add(moveRightButton)
world.add(selectButton)

const geometry = new THREE.PlaneGeometry(15, 15)
const material = new THREE.MeshStandardMaterial({
  color: grassGreen,
  side: THREE.DoubleSide,
  metalness: 0,
  roughness: 1,
})
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = -Math.PI * 0.5
plane.receiveShadow = true
plane.castShadow = true
world.add(plane)

// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(5, 5, 5),
//   new THREE.MeshBasicMaterial({ color: 'red' })
// )
// cube.position.set(0, 2.5, 0)
// world.add(cube)

const content = `<div>
  <h3>the Ad appears here...</h3>
</div>`

const cssElement = createCSS3DObject(content)
cssElement.scale.set(0.05, 0.05, 0.05)
cssElement.position.set(0, 2.5, 1.25)

const ins = document.createElement('ins')
ins.className = 'adsbygoogle'
ins.style.display = 'block'
ins.style.width = '450px'
ins.style.height = '200px'
ins.style.display = 'block'
const attClient = document.createAttribute('data-ad-client')
ins.setAttributeNode(attClient)
attClient.value = 'ca-pub-5949634287255808'
const attSlot = document.createAttribute('data-ad-slot')
attSlot.value = '5648580138'
ins.setAttributeNode(attSlot)

const myScript = document.createElement('script')
myScript.setAttribute('type', 'text/javascript')
myScript.innerHTML = '(adsbygoogle = window.adsbygoogle || []).push({});'

cssElement.element.appendChild(ins)

world.add(cssElement)
