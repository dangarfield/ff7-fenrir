import { showDebugText } from './menu-scene.js'
import { temporaryPHSMenuSetParty } from '../field/field-op-codes-party-helper.js'
import { setMenuState } from './menu-module.js'
const loadPartySelectMenu = async () => {
  console.log('loadPartySelectMenu')
  showDebugText('Party Select')
  temporaryPHSMenuSetParty()
  setMenuState('party')
}

export { loadPartySelectMenu }
