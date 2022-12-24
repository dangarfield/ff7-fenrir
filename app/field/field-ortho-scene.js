import * as THREE from '../../assets/threejs-r148/build/three.module.js' // 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js'

let scene
let camera

const setupOrthoCamera = async () => {
  scene = new THREE.Scene()
  // scene.background = new THREE.Color(0x000000)
  // const font = await loadFont()

  camera = new THREE.OrthographicCamera(
    0,
    window.config.sizing.width,
    window.config.sizing.height,
    0,
    0,
    1001
  )
  camera.position.z = 1001

  // const textGeo = new TextGeometry('ORTHO TEST', {
  //     font: font,
  //     size: 5,
  //     height: 1,
  //     curveSegments: 10,
  //     bevelEnabled: false
  // })
  // const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true })
  // const text = new THREE.Mesh(textGeo, material)
  // text.position.y = 4
  // scene.add(text)

  // console.log('setupOrthoCamera: END')
}

export { setupOrthoCamera, scene, camera }
