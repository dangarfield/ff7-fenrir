import { setupScenes, startWorldRenderingLoop, scene, orthoScene } from './world-scene.js'
import { initWorldKeypressActions } from './world-controls.js'
import { loadWorldMap2d } from './world-2d.js'
import { loadWorldMap3d } from './world-3d.js'
import { getFieldToWorldMapTransitionData } from '../data/world-fetch-data.js'
import { tempLoadDestinationSelector } from './world-destination-selector.js'

let FIELD_TO_WORLD_DATA

const initWorldModule = async () => {
    setupScenes()
    initWorldKeypressActions()
    await loadWorldMapTransitionData()
}

const cleanScene = () => {
    while (scene.children.length) { scene.remove(scene.children[0]) }
    while (orthoScene.children.length) { orthoScene.remove(orthoScene.children[0]) }
}

const loadWorldMapTransitionData = async () => {
    FIELD_TO_WORLD_DATA = await getFieldToWorldMapTransitionData()
}

const loadWorldMap = async (lastWMFieldReference) => {
    const transitionDataId = `${parseInt(lastWMFieldReference.replace('wm', '')) + 1}`
    let transitionData = FIELD_TO_WORLD_DATA[transitionDataId]
    if (transitionData === undefined) { // TODO: some wmIds in field-id-to-world-map-coords.js do not have a destination
        transitionData = { meshX: 'unknown', meshY: 'unknown' }
    }
    console.log('loadWorldMap', lastWMFieldReference, 'transitionData', transitionDataId, transitionData)

    window.world = {
        lastWMFieldReference,
        transitionData
    }

    cleanScene()
    startWorldRenderingLoop()

    // Temp
    await loadWorldMap2d(`${lastWMFieldReference} - meshX: ${transitionData.meshX}, meshY: ${transitionData.meshY} - SELECT DESTINATION`)
    // loadWorldMap3d()
    tempLoadDestinationSelector(lastWMFieldReference)
}

export {
    initWorldModule,
    loadWorldMap
}