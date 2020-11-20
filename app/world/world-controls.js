import { getKeyPressEmitter } from '../interaction/inputs.js'
import { loadField } from '../field/field-module.js'
import { WORLD_TO_FIELD_DATA } from './world-module.js'
import { getFieldNameForId } from '../field/field-metadata.js'

const areWorldControlsActive = () => { return window.anim.activeScene === 'world' }

const setupFieldTransitionData = async (transitionId, section) => {

    const playableCharacterInitData = {
        triangleId: WORLD_TO_FIELD_DATA[transitionId][section].triangleId,
        position: {
            x: WORLD_TO_FIELD_DATA[transitionId][section].x,
            y: WORLD_TO_FIELD_DATA[transitionId][section].y
        },
        direction: WORLD_TO_FIELD_DATA[transitionId][section].direction,
        characterName: 'Cloud' // This can be remove though
    }
    const fieldName = await getFieldNameForId(WORLD_TO_FIELD_DATA[transitionId][section].fieldId)
    return { fieldName, playableCharacterInitData }
}
const tempTransition = async (fieldAdjust) => {
    const newWMFieldReference = `wm${Math.max(0, parseInt(window.world.lastWMFieldReference.replace('wm', '')) + fieldAdjust)}`
    const { fieldName, playableCharacterInitData } = await setupFieldTransitionData(newWMFieldReference, 'sectionA')
    console.log('loadWorldMap loadField', window.world.lastWMFieldReference, window.world, newWMFieldReference, fieldName, playableCharacterInitData)
    loadField(fieldName, playableCharacterInitData)
}
const initWorldKeypressActions = () => {

    getKeyPressEmitter().on('o', (firstPress) => {
        if (areWorldControlsActive() && firstPress) {
            console.log('press o')
        }
    })

    getKeyPressEmitter().on('x', async (firstPress) => {
        if (areWorldControlsActive() && firstPress) {
            console.log('press x')
            // Temp
            tempTransition(1)
        }
    })
    getKeyPressEmitter().on('square', async (firstPress) => {
        if (areWorldControlsActive() && firstPress) {
            console.log('press square')
            // Temp
            tempTransition(-1)
        }
    })

}
export {
    initWorldKeypressActions
}