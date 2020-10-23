import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import { getAnimatedArrowPositionHelperTextures, getCursorPositionHelperTexture } from './field-fetch-data.js'
import { areFieldPointersActive, persistFieldPointersActiveForPlayer } from '../data/savemap-alias.js'

let fieldPointersEnabled = true

const updateArrowPositionHelpers = () => {
    // console.log('updatePositionHelpers', window.currentField.positionHelpers.children.length)
    if (window.currentField.positionHelpers && window.currentField.positionHelpers.children) {
        let animatedIds = []
        let cursorId
        for (let i = 0; i < window.currentField.positionHelpers.children.length; i++) {
            if (window.currentField.positionHelpers.children[i].userData.type === 'animated') {
                animatedIds.push(i)
            } else if (window.currentField.positionHelpers.children[i].userData.type === 'cursor') {
                cursorId = i
            }
        }
        if (animatedIds.length > 0) {
            const helper = window.currentField.positionHelpers.children[animatedIds[0]]
            if (helper.userData.frameCount >= 7) {
                helper.userData.frameCount = 0
                helper.userData.index = helper.userData.index >= 3 ? 0 : helper.userData.index + 1
            } else {
                helper.userData.frameCount++
            }
            for (const i in animatedIds) {
                window.currentField.positionHelpers.children[i].material.map = helper.userData.textures[helper.userData.index]
            }
        }
        if (cursorId !== undefined && window.currentField.playableCharacter) {
            //  Update position of hand cursor

        }
        // console.log('cursorId', cursorId, window.currentField.playableCharacter)
    }
}
const updateCursorPositionHelpers = () => {
    if (window.currentField.positionHelpers && window.currentField.positionHelpers.children && window.currentField.playableCharacter) {
        for (let i = 0; i < window.currentField.positionHelpers.children.length; i++) {
            if (window.currentField.positionHelpers.children[i].userData.type === 'cursor') {
                const helper = window.currentField.positionHelpers.children[i]
                const playerPosition = window.currentField.playableCharacter.scene.position
                const helperPosition = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z + 0.02)
                // helperPosition.x = helperPosition.x - 0.01
                const distance = window.currentField.fieldCamera.position.distanceTo(helperPosition)
                // // lerp from camera to helperPosition, with a factor that always gives a specific distance (0.4)
                const intendedDistance = 0.009
                const ratio = intendedDistance / distance
                const helperOntopPoint = new THREE.Vector3().lerpVectors(window.currentField.fieldCamera.position, helperPosition, ratio)
                // const finalDistance = window.currentField.fieldCamera.position.distanceTo(helperOntopPoint)
                const scale = 0.015 * ratio
                // console.log('drawArrowPositionHelper', distance, intendedDistance, ratio, distance * ratio, '->', finalDistance, scale)
                // console.log('cursorId', cursorId, helperOntopPoint, window.currentField.playableCharacter)
                helper.position.set(helperOntopPoint.x, helperOntopPoint.y, helperOntopPoint.z)
                helper.scale.set(scale, scale, scale)

                // TODO - The scale of these is not right either
                break
            }
        }
    }
}
const drawArrowPositionHelpers = () => {
    // console.log('gatewayArrows', window.currentField.data)
    for (let i = 0; i < window.currentField.data.triggers.gatewayArrows.length; i++) {
        const arrowLocation = window.currentField.data.triggers.gatewayArrows[i]
        if (!(arrowLocation.x === 0 && arrowLocation.y === 0 && arrowLocation.z === 0)) { // Not sure what shownArrows signifies yet, but its not always right
            // console.log('arrowLocation', arrowLocation)

            // This doesn't work, need to figure this out. Don't know how to interpret these x,z,y coords
            // const arrowPosition = { x: arrowLocation.x / 4096, y: arrowLocation.z / 4096, z: arrowLocation.z / 4096 }
            // drawArrowPositionHelper(arrowPosition, arrowLocation.type)
        }
    }
    drawCursorPositionHelper()
    updatePositionHelperVisility()
    window.currentField.fieldScene.add(window.currentField.positionHelpers)
    updateCursorPositionHelpers()
}
const drawArrowPositionHelper = (helperPosition, type) => {

    // Get distance from camera to helperPosition
    const distance = window.currentField.fieldCamera.position.distanceTo(helperPosition)
    // lerp from camera to helperPosition, with a factor that always gives a specific distance (0.4)
    const intendedDistance = 0.01
    const ratio = intendedDistance / distance
    const helperOntopPoint = new THREE.Vector3().lerpVectors(window.currentField.fieldCamera.position, helperPosition, ratio)
    const finalDistance = window.currentField.fieldCamera.position.distanceTo(helperOntopPoint)
    const scale = 0.01 * ratio
    // console.log('drawArrowPositionHelper', distance, intendedDistance, ratio, distance * ratio, '->', finalDistance, scale)

    var spriteTextures = getAnimatedArrowPositionHelperTextures(type)
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteTextures[0] })
    var sprite = new THREE.Sprite(spriteMaterial)
    sprite.userData.type = 'animated'
    sprite.userData.textures = spriteTextures
    sprite.userData.index = 0
    sprite.userData.frameCount = 0
    // Not able to get the scale of the arrows sprites right at this point
    sprite.position.set(helperOntopPoint.x, helperOntopPoint.y, helperOntopPoint.z)
    // console.log('scale', sprite.getWorldScale(new THREE.Vector3()))
    // console.log('sprite', sprite)
    sprite.scale.set(scale, scale, scale)
    window.currentField.positionHelpers.add(sprite)
}
const drawCursorPositionHelper = () => {

    var spriteTexture = getCursorPositionHelperTexture()
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture })
    var sprite = new THREE.Sprite(spriteMaterial)
    sprite.center = new THREE.Vector2(0, 0)
    sprite.userData.type = 'cursor'
    // Not able to get the scale of the arrows sprites right at this point
    sprite.position.set(-1000, -1000, -1000) // Get it right out of the way in initialisaton
    // console.log('scale', sprite.getWorldScale(new THREE.Vector3()))
    // console.log('sprite', sprite)
    // sprite.scale.set(scale, scale, scale)
    window.currentField.positionHelpers.add(sprite)
}

const updatePositionHelperVisility = () => {
    // TODO - This sets both the pointer and the green / red arrows. But I believe this should be separately controlled
    let fieldPointersActive = areFieldPointersActive()
    console.log('updatePositionHelperVisility', fieldPointersActive, window.currentField.positionHelpers, fieldPointersEnabled)
    if (window.currentField.positionHelpers) {
        // if (fieldPointersEnabled && fieldPointersActive) { // TODO: Reinstate check for are pointers allowed
        if (fieldPointersActive) {
            window.currentField.positionHelpers.visible = true
        } else {
            window.currentField.positionHelpers.visible = false
        }
    }
}

const setFieldPointersActiveForPlayer = (active) => {
    persistFieldPointersActiveForPlayer(active)
}
const setFieldPointersEnabled = (active) => {
    fieldPointersEnabled = active
    if (!fieldPointersEnabled) {
        setFieldPointersActiveForPlayer(false)
    }
    updatePositionHelperVisility()
}

const togglePositionHelperVisility = () => {
    let fieldPointersActive = areFieldPointersActive()
    console.log('setFieldPointersActive', !fieldPointersActive)
    setFieldPointersActiveForPlayer(!fieldPointersActive)

    // updatePositionHelperVisility() // Gets triggered from savemap alias
    // 0x0BA4 = 2980
    // 0x0CA4 = 3236
    // 0x0DA4 = 3492

    // Save Memory Bank D/E - // 0x0EC2 = 3778, eg // 0x0EA4 = 3748 = 0
    // 1 byte - Field pointers mask (hand over party leader's head + red and green arrows)
    // 0x00: Inactive
    // 0x02: Active
}
export {
    updateArrowPositionHelpers,
    updateCursorPositionHelpers,
    drawArrowPositionHelper,
    drawArrowPositionHelpers,
    togglePositionHelperVisility,
    updatePositionHelperVisility,
    setFieldPointersEnabled
}