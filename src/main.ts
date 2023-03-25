import './style.css'
import * as THREE from 'three'

import World from './world'
import Button from './button'
import GltfModel from './gltfmodel'

const grassGreen = 0x3f7d1a

const world = World.getInstance()

const addButton = new Button('+', () => {
  const randomTree = Math.floor(Math.random() * threes.length)
  const tree = threes[randomTree]
  tree.setPosition(new THREE.Vector3(5.5, 1.25, 7))
  tree.setScale(0.4)
  world.add(tree)

  world.remove(addButton)
})
addButton.setPosition(new THREE.Vector3(5.5, 0, 7))
world.add(addButton)
const transformButton = new Button('Move', () => {
  console.log('Translate')
})
transformButton.setPosition(new THREE.Vector3(3.5, 0, 6))

const transformControl = world.getTransformControl()

const birch = await new GltfModel(transformControl).loadModel('BirchTree_4')
const pine = await new GltfModel(transformControl).loadModel('PineTree_1')
const commonTree = await new GltfModel(transformControl).loadModel(
  'CommonTree_1'
)
const willow = await new GltfModel(transformControl).loadModel('Willow_1')

const threes = [birch, pine, commonTree, willow]

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

birch.setPosition(new THREE.Vector3(0, 0, 0))
world.add(birch)

world.updateAllMaterials()
