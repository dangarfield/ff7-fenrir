import { startFieldRenderLoop, setupFieldCamera, setupDebugControls, initFieldDebug, setupViewClipping } from './field-scene.js'
import { loadFieldData, loadFieldBackground, loadModels } from './field-fetch-data.js'
import { initFieldKeypressActions } from './field-controls.js'
import { transitionIn, drawFaders } from './field-fader.js'
import { showLoadingScreen } from '../loading/loading-module.js'
import { setupOrthoCamera } from './field-ortho-scene.js'
import { setupOrthoBgCamera } from './field-ortho-bg-scene.js'
import { initialiseOpLoops, debugLogOpCodeCompletionForField } from './field-op-loop.js'
import { resetTempBank } from '../data/savemap.js'
import { updateSavemapLocationField } from '../data/savemap-alias.js'
import { preLoadFieldMediaData } from '../media/media-module.js'
import { clearAllDialogs } from './field-dialog.js'
import { initBattleSettings } from './field-battle.js'
import { placeModelsDebug } from './field-models.js'
import { drawWalkmesh, placeBG } from './field-backgrounds.js'

// Uses global states:
// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config


const setMenuEnabled = (enabled) => { window.currentField.menuEnabled = enabled }
const isMenuEnabled = () => { return window.currentField.menuEnabled }

const loadField = async (fieldName, playableCharacterInitData) => {

    console.log('loadField', fieldName, playableCharacterInitData)
    // Reset field values
    const lastFieldName = window.currentField && window.currentField.name ? window.currentField.name : ''
    window.currentField = {
        name: fieldName,
        lastFieldName: lastFieldName,
        data: undefined,
        backgroundData: undefined,
        metaData: undefined,
        models: undefined,
        playableCharacter: undefined,
        playableCharacterCanMove: true,
        playableCharacterIsInteracting: false,
        fieldScene: undefined,
        fieldCamera: undefined,
        fieldCameraHelper: undefined,
        videoCamera: undefined,
        showVideoCamera: false,
        allowVideoCamera: true,
        debugCamera: undefined,
        walkmeshMesh: undefined,
        walkmeshLines: undefined,
        gatewayLines: undefined,
        triggerLines: undefined,
        backgroundLayers: undefined,
        backgroundVideo: undefined,
        positionHelpers: undefined,
        cameraTarget: undefined,
        playableCharacterInitData: playableCharacterInitData,
        media: undefined,
        menuEnabled: true,
        gatewayTriggersEnabled: true,
        movementHelpers: undefined,
        playerAnimations: {
            stand: 0, walk: 1, run: 2
        }
    }
    updateSavemapLocationField(fieldName, fieldName)
    showLoadingScreen()
    resetTempBank()
    window.currentField.data = await loadFieldData(fieldName)
    window.currentField.media = await preLoadFieldMediaData()
    // console.log('field-module -> window.currentField.data', window.currentField.data)
    // console.log('field-module -> window.anim', window.anim)
    window.currentField.cameraTarget = setupFieldCamera()
    await setupOrthoBgCamera()
    await setupOrthoCamera()
    drawFaders()
    clearAllDialogs()
    window.currentField.backgroundData = await loadFieldBackground(fieldName)
    window.currentField.models = await loadModels(window.currentField.data.model.modelLoaders)
    console.log('window.currentField', window.currentField)
    initBattleSettings()
    await placeBG(fieldName)
    setupDebugControls()
    startFieldRenderLoop()
    await setupViewClipping()
    drawWalkmesh()
    if (window.config.debug.debugModeNoOpLoops) {
        placeModelsDebug()
    }

    if (window.config.debug.active) {
        await initFieldDebug(loadField)
        debugLogOpCodeCompletionForField()
    }
    initFieldKeypressActions()
    if (!window.config.debug.debugModeNoOpLoops) {
        await initialiseOpLoops()
    }
    window.anim.clock.start()
    await transitionIn()
}


export {
    loadField,
    setMenuEnabled,
    isMenuEnabled
}