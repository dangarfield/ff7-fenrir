import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { moveCameraToLeader } from './field-op-codes-camera-media-helper.js'
import { getPlayableCharacterName, getPlayableCharacterId } from './field-op-codes-party-helper.js'
import { calculateViewClippingPointFromVector3, adjustViewClipping } from './field-scene.js'
import * as modelFieldOpCodes from './field-op-codes-models.js'
import { playAnimationLoopedAsync } from './field-animations.js'

const directionToDegrees = (dir) => {
    return Math.round(dir * (360 / 255))
}
const degreesToDirection = (deg) => {
    // TODO - Not 100% sure about this, might have to take into consideration the relative positioning of the field
    return Math.round(deg * (255 / 360))
}
const radiansToDirection = (radians) => {
    let deg = THREE.Math.radToDeg(radians)
    if (deg < 0) {
        deg = 360 - deg
    }
    return degreesToDirection(deg)
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
const getModelByCharacterName = (characterName) => {
    return window.currentField.models.filter(m => m.userData.characterName === characterName)[0]
}
const getModelByCurrentPlayableCharacter = () => {
    return window.currentField.models.filter(m => m.userData.isPlayableCharacter === true)[0]
}
const getModelByPartyMemberId = (partyMemberId) => {
    const characterName = window.data.savemap.party.members[partyMemberId]
    console.log('getModelByPartyMemberId', partyMemberId, characterName)
    return getModelByCharacterName(characterName)
}
const getEntityIdFromEntityName = (entityName) => {
    for (let i = 0; i < window.currentField.data.script.entities.length; i++) {
        const entity = window.currentField.data.script.entities[i]
        if (entity.userData.entityName === entityName) {
            return i
        }
    }
    return -1
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
    if (model.userData.isPlayableCharacter) {
        model.scene.visible = true
    }
    model.userData.movementSpeed = 2048 // TODO - Absolute guess for default
    model.userData.animationSpeed = 1 // TODO - Absolute guess for default
    model.userData.talkEnabled = true
    model.userData.talkRadius = 48 // TODO - Absolute guess for default
    model.userData.collisionEnabled = true
    model.userData.collisionRadius = 24 // TODO - Absolute guess for default
    model.userData.rotationEnabled = true
    console.log('setModelAsEntity: END', entityName, modelId, model)
    window.currentField.fieldScene.add(model.scene)
}
const setModelAsPlayableCharacter = (entityName, characterName) => {
    const model = getModelByEntityName(entityName)
    model.userData.isPlayableCharacter = true
    model.userData.isLeader = isCharacterTheLeader(characterName)
    model.userData.characterName = characterName
    console.log('setModelAsPlayableCharacter', entityName, model)
}
const getFieldModelIdAndEntityNameForPlayableCharacter = (characterId) => {
    const entities = window.currentField.data.script.entities
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (entity.entityType !== 'Playable Character') { continue }
        for (let j = 0; j < entity.scripts.length; j++) {
            const script = entity.scripts[j]
            let modelId
            for (let k = 0; k < script.ops.length; k++) {
                const op = script.ops[k]
                if (op.op === 'CHAR') {
                    modelId = op.n
                    console.log('CHAR', op)
                } else if (op.op === 'PC' && op.c === characterId) {
                    console.log('PC', op)
                    return {
                        entityName: entity.entityName,
                        entityId: i,
                        modelId
                    }
                }


            }
        }
    }
}
const positionPlayableCharacterFromTransition = async () => {
    // This is messy and involves placing the character before the loop starts
    // not sure how this happens in the game, will investigate later
    if (window.currentField.playableCharacterInitData) {

        const initData = window.currentField.playableCharacterInitData
        console.log('init player from field transition', initData)

        // Need to ensure that this runs after all other entity inits...
        const { entityName, entityId, modelId } = getFieldModelIdAndEntityNameForPlayableCharacter(getPlayableCharacterId(initData.characterName))
        console.log('getFieldModelIdAndEntityNameForPlayableCharacter', entityName, modelId)
        setModelAsEntity(entityName, modelId)
        setModelAsPlayableCharacter(entityName, initData.characterName)
        // const model = getModelByCharacterName(initData.characterName)
        placeModel(entityName, initData.position.x, initData.position.y, undefined, initData.triangleId)
        setModelDirection(entityName, initData.direction)
        setModelVisibility(entityName, true)

        await setModelAsLeader(entityId, true)
        // Need to implement directionFacing (annoying in debug mode at this point as I have to reverse previous placeModel deg value)
        // let deg = window.config.debug.debugModeNoOpLoops ? window.currentField.playableCharacter.scene.userData.placeModeInitialDirection : 0
        // deg = deg - directionToDegrees(initData.direction) // TODO - Adjust this as it looks better, check when not in debug mode
        // window.currentField.playableCharacter.scene.rotateY(THREE.Math.degToRad(deg))

        // const relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
        // console.log('positionPlayableCharacterFromTransition', relativeToCamera.x, relativeToCamera.y)
        // adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
    }
}
const placeModel = (entityName, x, y, z, triangleId) => {
    console.log('placeModel: START', entityName, x, y, z, triangleId)
    const model = getModelByEntityName(entityName)

    if (x && y && z) {
        console.log('placeModel: x, y, z')
        model.scene.position.set(
            x / 4096,
            y / 4096,
            z / 4096)
    } else if (x && y && triangleId) {
        // Get the central point on the triangleId
        console.log('placeModel: x, y, triangleZ')
        const triangle = window.currentField.data.walkmeshSection.triangles[triangleId].vertices
        const triangleZ = (triangle[0].z + triangle[1].z + triangle[2].z) / 3
        model.scene.position.set(
            x / 4096,
            y / 4096,
            triangleZ / 4096)
        console.log('placeModel: triangleId', triangleId, triangle, '->', x, y, z)
    } else {
        console.log('placeModel: triangleX, triangleY, triangleZ')
        const triangle = window.currentField.data.walkmeshSection.triangles[triangleId].vertices
        const triangleX = (triangle[0].x + triangle[1].x + triangle[2].x) / 3
        const triangleY = (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        const triangleZ = (triangle[0].z + triangle[1].z + triangle[2].z) / 3
        model.scene.position.set(
            triangleX / 4096,
            triangleY / 4096,
            triangleZ / 4096)
    }
    if (triangleId !== undefined) {
        model.scene.userData.triangleId = triangleId
    }
    model.scene.visible = true
}
const placeModelsDebug = async () => {
    console.log('placeModelsDebug: START')
    window.anim.axesHelper = new THREE.AxesHelper(0.1);
    window.anim.axesHelper.visible = false
    window.currentField.fieldScene.add(window.anim.axesHelper);

    const ccOps = []
    for (let i = 0; i < window.currentField.data.script.entities.length; i++) {
        const entity = window.currentField.data.script.entities[i]

        const allOps = []
        for (let script of entity.scripts) {
            for (let op of script.ops) {
                allOps.push(op)
            }
        }
        // console.log('allOps', entity, allOps)

        const charOps = allOps.filter(o => o.op === 'CHAR')
        if (charOps.length > 0) {
            await modelFieldOpCodes.CHAR(entity.entityName, charOps[0])
            const model = getModelByEntityName(entity.entityName)
            if (model.animations.length > 0) {
                playAnimationLoopedAsync(entity.entityName, model.animations.length - 1, 1)
            }
        }
        const xyziOps = allOps.filter(o => o.op === 'XYZI')
        if (xyziOps.length > 0) {
            await modelFieldOpCodes.XYZI(entity.entityName, xyziOps[0])
        }
        const dirOps = allOps.filter(o => o.op === 'DIR')
        if (dirOps.length > 0) {
            await modelFieldOpCodes.DIR(entity.entityName, dirOps[0])
        }
        const pcOps = allOps.filter(o => o.op === 'PC')
        if (pcOps.length > 0) {
            await modelFieldOpCodes.PC(entity.entityName, pcOps[0])
        }
        const entityCcOps = allOps.filter(o => o.op === 'CC')
        if (entityCcOps.length > 0) {
            ccOps.push(entityCcOps[0])
        }
    }

    if (ccOps.length > 0) {
        await modelFieldOpCodes.CC('dir', ccOps[0])
    } else {
        let charFilter = window.currentField.models.filter(m => m.userData.characterName === 'Cloud')
        if (charFilter.length === 0) {
            charFilter = window.currentField.models.filter(m => m.userData.isPlayableCharacter === true)
            if (charFilter.length === 0) {
                charFilter = window.currentField.models
            }
        }
        const model = charFilter[0]
        // console.log('charFilter', charFilter)
        const entities = window.currentField.data.script.entities
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            if (entity.entityName === model.userData.entityName) {
                const triangleId = Math.round(window.currentField.data.walkmeshSection.triangles.length / 2)
                placeModel(model.userData.entityName, undefined, undefined, undefined, triangleId)
                setModelVisibility(model.userData.entityName, true)
                setModelAsLeader(i)
            }
        }
    }
    console.log('placeModelsDebug: END', window.currentField.models)
}
const setModelVisibility = (entityName, isVisible) => {
    console.log('setModelVisibility', entityName, isVisible)
    const model = getModelByEntityName(entityName)
    model.scene.visible = isVisible
}
const setModelRotationEnabled = (entityName, enabled) => {
    console.log('setModelRotationEnabled', entityName, enabled)
    const model = getModelByEntityName(entityName)
    model.userData.rotationEnabled = enabled
}
const setModelDirectionToFaceEntity = (entityName, targetEntityId) => {
    console.log('setModelDirectionToFaceEntity', entityName, targetEntityId)
    const model = getModelByEntityName(entityName)
    const targetModel = getModelByEntityId(targetEntityId)
    faceModelInstantly(model, targetModel)
}
const setModelDirectionToFaceCharacterOrPartyLeader = (entityName, characterId) => {
    console.log('setModelDirectionToFaceCharacterOrPartyLeader', entityName, characterId)
    const model = getModelByEntityName(entityName)
    const characterName = getPlayableCharacterName(characterId)
    const characterNameFilter = window.currentField.models.filter(m => m.userData.characterName === characterName)
    let targetModel
    if (characterNameFilter.length > 0) {
        targetModel = characterNameFilter[0]
        console.log('char', characterName, targetModel)
    } else {
        targetModel = getModelByCurrentPlayableCharacter()
        console.log('leader', targetModel)
    }
    faceModelInstantly(model, targetModel)
}
const faceModelInstantly = (model, targetModel) => {
    // TODO: This doesn't work properly. Need to fix
    const deg = getDegreesFromTwoPoints(model.scene.position, targetModel.scene.position)
    model.scene.rotation.y = THREE.Math.degToRad(deg)
}
const getEntityDirection = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityDirection', entityId, model)
    const direction = radiansToDirection(model.scene.rotation.y)
    console.log('getEntityDirection', entityId, model, model.scene.rotation.y, direction)
    return direction
}
const getPartyMemberDirection = (partyMemberId) => {
    const model = getModelByPartyMemberId(partyMemberId)
    console.log('getPartyMemberDirection', partyMemberId, model)
    const direction = radiansToDirection(model.scene.rotation.y)
    console.log('getPartyMemberDirection', partyMemberId, model, model.scene.rotation.y, direction)
    return direction

}
const setModelDirection = (entityName, direction) => {
    console.log('setModelVisibility', entityName, direction)
    const deg = directionToDegrees(direction)
    const model = getModelByEntityName(entityName)
    model.scene.rotation.y = THREE.Math.degToRad(deg)
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
const setModelAsLeader = async (entityId, instant) => {
    console.log('setModelAsLeader', entityId)
    window.currentField.models.map(m => {
        m.userData.isLeader = false
    })
    const entityName = window.currentField.data.script.entities[entityId].entityName
    const model = getModelByEntityName(entityName)
    console.log('setModelAsLeader 2', entityName, model)
    model.userData.isLeader = true
    // Leader should be persisted between map jumps by gateways and MAPJUMP
    // Leader should also be more accessible as it's in the movement section of render loop, eg
    // We probably shouldn't have to run models.filter(m => m.userData.isLeader)[0] every time
    window.currentField.playableCharacter = model
    window.data.savemap.location._fieldLeader = model.userData.characterName

    // Screen moves to centre on character
    // Not sure about this, it takes control of the camera
    //  which isnt right in all fields where the camera has been previously set
    await moveCameraToLeader(instant)
    // Assist cursor hand displays if visible
    window.currentField.positionHelpersEnabled = true
    // TODO - set positionHelpers position on playable character straight away
    console.log('setModelAsLeader: END', model)
}
const setPlayableCharacterCanMove = (canMove) => {
    console.log('setPlayableCharacterCanMove', canMove)
    window.currentField.playableCharacterCanMove = canMove
    // Also hides / shows cursor arrows if enabled
    window.currentField.positionHelpersEnabled = canMove
    if (!canMove && window.currentField.playableCharacter) {
        window.currentField.playableCharacter.mixer.stopAllAction()
    }
}
const getDegreesFromTwoPoints = (point1, point2) => {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y) * 180 / Math.PI
}
const turnModelToFaceEntity = async (entityName, entityIdToFace, whichWayId, steps) => {
    const model = getModelByEntityName(entityName)
    const modelToFace = getModelByEntityId(entityIdToFace)
    const degrees = getDegreesFromTwoPoints(model.scene.position, modelToFace.scene.position)
    // TODO - This doesn't work in the same way that the DIRA operations don't
    // Do something with ? window.currentField.data.triggers.header.controlDirectionDegrees
    await turnModel(entityName, degrees, whichWayId, steps, 2)
}
const turnModelToFacePartyMember = async (entityName, partyMemberId, whichWayId, steps) => {
    const model = getModelByEntityName(entityName)
    const modelToFace = getModelByPartyMemberId(partyMemberId)
    const degrees = getDegreesFromTwoPoints(model.scene.position, modelToFace.scene.position)
    // TODO - This doesn't work in the same way that the DIRA operations don't
    // Do something with ? window.currentField.data.triggers.header.controlDirectionDegrees
    await turnModel(entityName, degrees, whichWayId, steps, 2)
}
const turnModelToFaceDirection = async (entityName, direction, whichWayId, steps, stepType) => {
    let degrees = directionToDegrees(direction)
    await turnModel(entityName, degrees, whichWayId, steps, stepType)
}
const turnModel = async (entityName, degrees, whichWayId, steps, stepType) => {
    return new Promise((resolve) => {
        console.log('turnModel', entityName, degrees, whichWayId, steps, stepType)
        const model = getModelByEntityName(entityName)
        if (!model.userData.rotationEnabled) {
            resolve()
            return
        }
        // Get start and end angles in radians
        let desiredYDeg = degrees
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
        // console.log('easingType', easingType)
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
    positionPlayableCharacterFromTransition,
    placeModel,
    placeModelsDebug,
    setModelVisibility,
    setModelDirection,
    setModelDirectionToFaceEntity,
    setModelDirectionToFaceCharacterOrPartyLeader,
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
    getModelByPartyMemberId,
    turnModelToFaceEntity,
    turnModelToFacePartyMember,
    turnModelToFaceDirection,
    getDegreesFromTwoPoints,
    getEntityDirection,
    getPartyMemberDirection,
    setModelRotationEnabled
}