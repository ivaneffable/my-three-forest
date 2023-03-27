import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

import World from './world'
import Button from './button'
import GltfModel from './gltfmodel'

const grassGreen = 0x3f7d1a

const world = World.getInstance()

let selectedTree = 0

const birch = await world.loadModel(new GltfModel('BirchTree_4'))
const pine = await world.loadModel(new GltfModel('PineTree_1'))
const commonTree = await world.loadModel(new GltfModel('CommonTree_1'))
const willow = await world.loadModel(new GltfModel('Willow_1'))
const cactus = await world.loadModel(new GltfModel('Cactus_3'))
const rock = await world.loadModel(new GltfModel('Rock_1'))
const rockMoss = await world.loadModel(new GltfModel('Rock_Moss_6'))
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
