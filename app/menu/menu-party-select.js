import { showDebugText } from './menu-scene.js'
import { temporaryPHSMenuSetParty } from '../field/field-op-codes-party-helper.js'
import { setMenuState } from './menu-module.js'
import { loadPHSMenu } from './menu-main-phs.js'
import { initPointers } from './menu-box-helper.js'
const loadPartySelectMenu = async (param) => {
  // console.log('loadPartySelectMenu')
  // showDebugText('Party Select')
  // temporaryPHSMenuSetParty()
  // setMenuState('party')
  await initPointers()
  await loadPHSMenu(param)
}

export { loadPartySelectMenu }
