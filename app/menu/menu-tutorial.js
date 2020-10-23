import { showDebugText } from './menu-scene.js'

const loadMainMenuWithTutorial = (tutorialId) => {
    console.log('loadMainMenuWithTutorial', tutorialId)
    showDebugText(`Tutorial: ${tutorialId}`)
}

export {
    loadMainMenuWithTutorial
}