import { showDebugText } from './menu-scene.js'
import { setMenuState } from './menu-module.js'
const loadMainMenuWithTutorial = tutorialId => {
  console.log('loadMainMenuWithTutorial', tutorialId)
  showDebugText(`Tutorial: ${tutorialId}`)
  setMenuState('tutorial')
}

export { loadMainMenuWithTutorial }
