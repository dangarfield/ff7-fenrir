import { loadPHSMenu } from './menu-main-phs.js'
const loadPartySelectMenu = async (param) => {
  console.log('phs loadPartySelectMenu', param)
  // showDebugText('Party Select')
  // temporaryPHSMenuSetParty()
  // setMenuState('party')
  await loadPHSMenu(param)
}

export { loadPartySelectMenu }
