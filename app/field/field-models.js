import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { moveCameraToLeader } from './field-op-codes-camera-media-helper.js'

const directionToDegrees = (dir) => {
    return Math.round(dir * (360 / 255))
}
const degreesToDirection = (deg) => {
    return Math.round(dir * (255 / 360))
}
const isCharacterTheLeader = (characterName) => {
    // A lot of logic / assumptions to look at here, for now, just check if it's cloud
    if (characterName === 'Cloud') {
        return false
    }
    return false
}

const getModelScaleDownValue = () => {
    let factor = ((window.currentField.data.model.header.modelScale - 768) * -1) + 768 // Looks about right now
    if (window.currentField.data.model.header.modelScale >= 1024) {
        factor = (Math.pow(2, (Math.log2(window.currentField.data.model.header.modelScale) * -1) + 19))
    }

    const scaleDownValue = 1 / factor
    // console.log('getModelScaleDownValue', factor, scaleDownValue,
    //   window.currentField.data.model.header.modelScale)
    return scaleDownValue
}

const getModelByEntityName = (entityName) => {
    return window.currentField.models.filter(m => m.userData.entityName === entityName)[0]
}
const getModelByEntityId = (entityId) => {
    const entityName = window.currentField.data.script.entities[entityId].entityName
    return getModelByEntityName(entityName)
}

// This method also initialises defaults for model.userData and adds model to the field
const setModelAsEntity = (entityName, modelId) => {
    // console.log('setModelAsEntity', entityName, modelId)
    const model = window.currentField.models[modelId]
    model.userData.entityName = entityName
    const scaleDownValue = getModelScaleDownValue()
    model.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
    model.scene.rotation.x = THREE.Math.degToRad(90)
    model.scene.up.set(0, 0, 1)
    model.scene.visible = false
    model.userData.movementSpeed = 2048 // TODO - Absolute guess for default
    model.userData.animationSpeed = 1 // TODO - Absolute guess for default
    model.userData.talkEnabled = true
    model.userData.talkRadius = 48 // TODO - Absolute guess for default
    model.userData.collisionEnabled = true
    model.userData.collisionRadius = 24 // TODO - Absolute guess for default

    // console.log('setModelAsEntity: END', entityName, modelId, model)
    window.currentField.fieldScene.add(model.scene)
}
const setModelAsPlayableCharacter = (entityName, characterName) => {
    const model = getModelByEntityName(entityName)
    model.userData.isPlayableCharacter = true
    model.userData.isLeader = isCharacterTheLeader(characterName)
    model.userData.characterName = characterName
    console.log('setModelAsPlayableCharacter', entityName, model)
}

const placeModel = (entityName, x, y, z, triangleId) => {
    console.log('placeModel: START', entityName, x, y, z, triangleId)
    const model = getModelByEntityName(entityName)

    // TODO - Potentially to do a little more, like use x, y, get z from triangle etc

    if (triangleId !== undefined) {
        // Get the central point on the triangleId
        const triangle = window.currentField.data.walkmeshSection.triangles[triangleId].vertices
        const triangleX = (triangle[0].x + triangle[1].x + triangle[2].x) / 3
        const triangleY = (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        const triangleZ = (triangle[0].z + triangle[1].z + triangle[2].z) / 3
        model.scene.position.set(
            triangleX / 4096,
            triangleY / 4096,
            triangleZ / 4096)
        console.log('placeModel: triangleId', triangleId, triangle, '->', x, y, z)
    } else {
        model.scene.position.set(
            x / 4096,
            y / 4096,
            z / 4096)
        console.log('placeModel: xyz', x, y, z)
    }
    model.scene.visible = true
}
const setModelVisibility = (entityName, isVisible) => {
    console.log('setModelVisibility', entityName, isVisible)
    const model = getModelByEntityName(entityName)
    model.scene.visible = isVisible
}
const setModelDirection = (entityName, direction) => {
    console.log('setModelVisibility', entityName, direction)
    const deg = directionToDegrees(direction)
    const model = getModelByEntityName(entityName)
    model.scene.rotateY(THREE.Math.degToRad(deg))
}
const setModelMovementSpeed = (entityName, speed) => {
    console.log('setModelMovementSpeed', entityName, speed)
    const model = getModelByEntityName(entityName)
    model.userData.movementSpeed = speed
}
const setModelAnimationSpeed = (entityName, speed) => {
    console.log('setModelAnimationSpeed', entityName, speed)
    const model = getModelByEntityName(entityName)
    model.userData.animationSpeed = speed
}
const setModelTalkEnabled = (entityName, isEnabled) => {
    console.log('setModelTalkEnabled', entityName, isEnabled)
    const model = getModelByEntityName(entityName)
    model.userData.talkEnabled = isEnabled
}
const setModelTalkRadius = (entityName, radius) => {
    console.log('setModelTalkRadius', entityName, radius)
    const model = getModelByEntityName(entityName)
    model.userData.talkRadius = radius
}
const setModelCollisionEnabled = (entityName, isEnabled) => {
    console.log('setModelCollisionEnabled', entityName, isEnabled)
    const model = getModelByEntityName(entityName)
    model.userData.collisionEnabled = isEnabled
}
const setModelCollisionRadius = (entityName, radius) => {
    console.log('setModelCollisionRadius', entityName, radius)
    const model = getModelByEntityName(entityName)
    model.userData.collisionRadius = radius
}
const setModelAsLeader = async (entityId) => {
    console.log('setModelAsLeader', entityId)
    window.currentField.models.map(m => {
        m.userData.isLeader = false
        console.log('m', m)
    })
    const entityName = window.currentField.data.script.entities[entityId].entityName
    const model = getModelByEntityName(entityName)
    model.userData.isLeader = true
    console.log('setModelAsLeader: END', model)
    // Leader should be persisted between map jumps by gateways and MAPJUMP
    // Leader should also be more accessible as it's in the movement section of render loop, eg
    // We probably shouldn't have to run models.filter(m => m.userData.isLeader)[0] every time
    window.currentField.playableCharacter = model

    // Screen moves to centre on character
    // Not sure about this, it takes control of the camera
    //  which isnt right in all fields where the camera has been previously set
    await moveCameraToLeader()
    // Assist cursor hand displays if visible
    window.currentField.positionHelpersEnabled = true
}
const setPlayableCharacterCanMove = (canMove) => {
    console.log('setPlayableCharacterCanMove', canMove)
    window.currentField.playableCharacterCanMove = canMove
    // Also hides / shows cursor arrows if enabled
    window.currentField.positionHelpersEnabled = canMove
}
const getDegreesFromTwoPoints = (point1, point2) => {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y) * 180 / Math.PI
}
const turnModelToFaceEntity = async (entityName, entityIdToFace, whichWayId, steps) => {
    const model = getModelByEntityName(entityName)
    const modelToFace = getModelByEntityId(entityIdToFace)

    // TODO - This is not right, look at this later
    // model.scene.lookAt(modelToFace.scene.position)
    // const direction = Math.atan2(modelToFace.scene.position.y - model.scene.position.y, modelToFace.scene.position.x - model.scene.position.x) * 180 / Math.PI
    // console.log('turnModelToFaceEntity direction', direction, modelToFace, modelToFace.scene.position, model.scene.position)
    // const yDiff = modelToFace.scene.position.y - model.scene.position.y
    // const xDiff = modelToFace.scene.position.x - model.scene.position.x
    // console.log('y', yDiff)
    // console.log('x', xDiff)
    // console.log('math', Math.atan2(yDiff, xDiff))
    // await turnModel(entityName, direction, whichWayId, steps, 2)
}
const turnModel = async (entityName, direction, whichWayId, steps, stepType) => {
    return new Promise((resolve) => {
        console.log('turnModel', entityName, direction, whichWayId, steps, stepType)
        const model = getModelByEntityName(entityName)

        // Get start and end angles in radians
        let desiredYDeg = directionToDegrees(direction)
        let currentYDeg = THREE.Math.radToDeg(model.scene.rotation.y)
        currentYDeg < 0 ? currentYDeg = 360 + currentYDeg : currentYDeg
        currentYDeg - 180 > desiredYDeg ? currentYDeg = currentYDeg - 360 : currentYDeg

        if (whichWayId === 0 && currentYDeg < desiredYDeg) {
            console.log('force clockwise')
            currentYDeg = currentYDeg + 360
        }
        if (whichWayId === 1 && currentYDeg > desiredYDeg) {
            console.log('force anti-clockwise')
            currentYDeg = currentYDeg - 360
        }
        const currentYRad = THREE.Math.degToRad(currentYDeg)
        const desiredYRad = THREE.Math.degToRad(desiredYDeg)
        console.log('turn deg', currentYDeg, '->', desiredYDeg)
        console.log('turn rad', currentYRad, '->', desiredYRad)

        // Tween from currentYRad to desiredYRad
        model.scene.rotation.y = currentYRad
        const from = { y: currentYRad }
        const to = { y: desiredYRad }
        let easingType = TWEEN.Easing.Linear.None
        if (stepType === 2) {
            easingType = (TWEEN.Easing.Quadratic.InOut)
        }
        console.log('easingType', easingType)
        let time = 200 // Not sure about the speed yet
        new TWEEN.Tween(from)
            .to(to, time)
            .easing(easingType)
            .onUpdate(function () {
                // window.currentField.fieldFader.material.opacity = from.opacity
                // console.log('turnModel: TWEEN', from)
                model.scene.rotation.y = from.y
                // if (from.r) {
                //     // Has to be like this for non THREE.NormalBlending modes
                //     mesh.material.color = new THREE.Color(`rgb(${Math.floor(from.r)},${Math.floor(from.g)},${Math.floor(from.b)})`)
                // }
            })
            .onComplete(function () {
                console.log('turnModel: END', from)
                resolve()
            })
            .start()
    })
}
export {
    directionToDegrees,
    degreesToDirection,
    setModelAsEntity,
    setModelAsPlayableCharacter,
    placeModel,
    setModelVisibility,
    setModelDirection,
    setModelMovementSpeed,
    setModelAnimationSpeed,
    setModelTalkEnabled,
    setModelTalkRadius,
    setModelCollisionEnabled,
    setModelCollisionRadius,
    setModelAsLeader,
    setPlayableCharacterCanMove,
    getModelByEntityName,
    getModelByEntityId,
    turnModelToFaceEntity,
    turnModel,
    getDegreesFromTwoPoints
}