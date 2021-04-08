import { showDebugText } from './menu-scene.js'
import { getMenuState } from './menu-module.js'
import { loadHomeMenu, keyPress as keyPressHome } from './menu-main-home.js'

// Window size 320,240
const loadMainMenu = async () => {
  console.log('loadMainMenu')
  showDebugText('Main Menu')
  loadHomeMenu()
}

const keyPress = async (key, firstPress) => {
  console.log('press MAIN MENU', key)
  const state = getMenuState()
  if (state.startsWith('home')) {
    keyPressHome(key, firstPress, state)
  }
}
export { loadMainMenu, keyPress }
