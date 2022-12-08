import { FontLoader } from '../../assets/threejs-r135-dg/examples/jsm/loaders/FontLoader.js'

const loadFont = async () => {
  return new Promise((resolve, reject) => {
    new FontLoader().load(
      'assets/threejs-r135-dg/examples/fonts/helvetiker_regular.typeface.json',
      font => {
        resolve(font)
      }
    )
  })
}
export {
  loadFont
}
