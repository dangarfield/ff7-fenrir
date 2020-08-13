import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
import { getAnimatedArrowPositionHelperTextures, getCursorPositionHelperTexture } from './field-fetch-data.js'

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
    if (window.currentField.positionHelpers && window.currentField.positionHelpers.children) {
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

                break
            }
        }
    }
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
    console.log('drawArrowPositionHelper', distance, intendedDistance, ratio, distance * ratio, '->', finalDistance, scale)

    var spriteTextures = getAnimatedArrowPositionHelperTextures(type)
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteTextures[0] })
    var sprite = new THREE.Sprite(spriteMaterial)
    sprite.userData.type = 'animated'
    sprite.userData.textures = spriteTextures
    sprite.userData.index = 0
    sprite.userData.frameCount = 0
    // Not able to get the scale of the arrows sprites right at this point
    sprite.position.set(helperOntopPoint.x, helperOntopPoint.y, helperOntopPoint.z)
    console.log('scale', sprite.getWorldScale(new THREE.Vector3()))
    console.log('sprite', sprite)
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
const togglePositionHelperVisility = () => {
    window.currentField.positionHelpers.visible = !window.currentField.positionHelpers.visible
}
export {
    updateArrowPositionHelpers,
    updateCursorPositionHelpers,
    drawArrowPositionHelper,
    drawCursorPositionHelper,
    togglePositionHelperVisility
}