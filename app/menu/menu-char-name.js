import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'
import { scene, showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'

const loadCharNameMenu = async param => {
  console.log('loadCharNameMenu', param)
  showDebugText(`Character Name Entry - ${getPlayableCharacterName(param)}`)
  setMenuState('char')
}

export { loadCharNameMenu }
