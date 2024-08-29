import * as THREE from '../../assets/threejs-r148/build/three.module.js'

let scene
let camera

const createVideoBackground = video => {
  const geometry = new THREE.PlaneGeometry(
    window.config.sizing.width,
    window.config.sizing.height
  )
  const texture = new THREE.VideoTexture(video)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBAFormat
  texture.encoding = THREE.sRGBEncoding
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  })
  // const material = new THREE.MeshBasicMaterial({ color: 0xFFF00F, transparent: true })
  const videoBG = new THREE.Mesh(geometry, material)
  videoBG.position.x = window.config.sizing.width / 2
  videoBG.position.y = window.config.sizing.height / 2
  window.currentField.backgroundVideo.add(videoBG)
}

const setupOrthoBgCamera = async () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.OrthographicCamera(
    0,
    window.config.sizing.width,
    window.config.sizing.height,
    0,
    0,
    10000
  )
  camera.position.z = 1
  window.currentField.backgroundVideo = new THREE.Group()
  scene.add(window.currentField.backgroundVideo)
}

export { setupOrthoBgCamera, scene, camera, createVideoBackground }
