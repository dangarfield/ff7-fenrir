import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import { moveCameraToLeader } from './field-op-codes-camera-media-helper.js'
import { getPlayableCharacterName, getPlayableCharacterId } from './field-op-codes-party-helper.js'
import * as modelFieldOpCodes from './field-op-codes-models.js'
import { playAnimationLoopedAsync, playStandAnimation } from './field-animations.js'
import { updateCurrentTriangleId } from './field-movement-player.js'
import { setFieldPointersEnabled, drawArrowPositionHelpers } from './field-position-helpers.js'

const directionToDegrees = (dir) => {
    const deg = Math.round(dir * (360 / 255))
    console.log('directionDegrees directionToDegrees', dir, deg, window.currentField.data.triggers.header.controlDirectionDegrees)
    return deg
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
    factor = factor * 1.1

    const scaleDownValue = 1 / factor
    console.log('getModelScaleDownValue', factor, scaleDownValue, window.currentField.data.model.header.modelScale)
    return scaleDownValue
}

const getModelByEntityId = (entityId) => {
    const modelsByEntityId = window.currentField.models.filter(m => m.userData.entityId === entityId)
    if (modelsByEntityId.length > 0) {
        return modelsByEntityId[0]
    }
    // Note: in mds7pb_2 there is a line called 'pinball' that uses SOLID that applies to a field model called 'pinball'
    const entityName = getEntityNameFromEntityId(entityId)
    const modelsByEntityNameAndFieldModel = window.currentField.models.filter(m => m.userData.entityName === entityName)
    if (modelsByEntityNameAndFieldModel.length > 0) {
        console.log('getModelByEntityId modelsByEntityNameAndFieldModel', modelsByEntityNameAndFieldModel)
        return modelsByEntityNameAndFieldModel[0]
    }
    return undefined

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
const getEntityNameFromEntityId = (entityId) => {
    return window.currentField.data.script.entities[entityId].entityName
}

// This method also initialises defaults for model.userData and adds model to the field
const setModelAsEntity = (entityId, modelId) => {
    // console.log('setModelAsEntity', entityName, modelId)
    const model = window.currentField.models[modelId]
    model.userData.entityId = entityId
    model.userData.entityName = getEntityNameFromEntityId(entityId)
    const scaleDownValue = getModelScaleDownValue()
    model.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
    model.scene.rotation.x = THREE.Math.degToRad(90)
    model.scene.up.set(0, 0, 1)
    model.scene.visible = false
    if (model.userData.isPlayableCharacter) {
        model.scene.visible = true
    }
    model.userData.movementSpeed = 1024 // Looks to be walk by default - md8_2
    model.userData.animationSpeed = 1 // Looks ok
    model.userData.talkEnabled = true
    model.userData.talkRadius = 60 // Looks ok
    model.userData.collisionEnabled = true
    model.userData.collisionRadius = 24 // TODO - Absolute guess for default
    model.userData.rotationEnabled = true
    console.log('setModelAsEntity: END', entityId, modelId, model)
    window.currentField.fieldScene.add(model.scene)
}
const setModelAsPlayableCharacter = (entityId, characterName) => {
    const model = getModelByEntityId(entityId)
    model.userData.isPlayableCharacter = true
    model.userData.isLeader = isCharacterTheLeader(characterName)
    model.userData.characterName = characterName
    console.log('setModelAsPlayableCharacter', entityId, model, window.currentField.futureLeader)
    if (window.currentField.futureLeader !== undefined && entityId === window.currentField.futureLeader) {
        console.log('setModelAsPlayableCharacter set leader', entityId, model)
        setModelAsLeader(entityId)
    }
}
const getFieldModelsForPlayableCharacter = (characterId) => {
    const models = []
    console.log('getFieldModelsForPlayableCharacter', characterId)
    // Get the models associated with an entity associated with a PC of that character
    const entities = window.currentField.data.script.entities
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (entity.entityType !== 'Playable Character') { continue } // colne1 does not have Playable Character...
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
                    models.push({
                        entityName: entity.entityName,
                        entityId: entity.entityId,
                        modelId
                    })
                }


            }
        }
    }
    if (models.length > 0) {
        return models
    }
    // Else just get the first char (debugging only)
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (entity.entityName === 'cl' || entity.entityName === 'cloud') {
            for (let j = 0; j < entity.scripts.length; j++) {
                const script = entity.scripts[j]
                for (let k = 0; k < script.ops.length; k++) {
                    const op = script.ops[k]
                    if (op.op === 'CHAR') {
                        const modelId = op.n
                        models.push({
                            entityName: entity.entityName,
                            entityId: entity.entityId,
                            modelId
                        })
                    }
                }
            }
        }
    }
    return models
}
const positionPlayableCharacterFromTransition = async () => {
    // This is messy and involves placing the character before the loop starts
    // not sure how this happens in the game, will investigate later
    if (window.currentField.playableCharacterInitData) {

        const initData = window.currentField.playableCharacterInitData
        console.log('positionPlayableCharacterFromTransition initData', initData)

        // Need to ensure that this runs after all other entity inits...
        const modelDatas = getFieldModelsForPlayableCharacter(getPlayableCharacterId(initData.characterName))
        // Frustatingly, there can be more than one model here, eg mrkt2 etc. So, we'll just do them ALL for this
        // character as in this case, there will be explicit PC and CCs called in the field op codes init scripts
        // based on the game moment
        console.log('positionPlayableCharacterFromTransition modelDatas', modelDatas)
        for (let i = 0; i < modelDatas.length; i++) {
            const modelData = modelDatas[i]
            const { entityName, entityId, modelId } = modelData
            console.log('positionPlayableCharacterFromTransition', entityId, entityName, modelId, initData)
            setModelAsEntity(entityId, modelId)
            setModelAsPlayableCharacter(entityId, initData.characterName)
            placeModel(entityId, initData.position.x, initData.position.y, initData.position.z, initData.triangleId)
            setModelDirection(entityId, initData.direction)
            setModelVisibility(entityId, true)

            setModelAsLeader(entityId)
            await moveCameraToLeader(true)
            // Need to implement directionFacing (annoying in debug mode at this point as I have to reverse previous placeModel deg value)
            // let deg = window.config.debug.debugModeNoOpLoops ? window.currentField.playableCharacter.scene.userData.placeModeInitialDirection : 0
            // deg = deg - directionToDegrees(initData.direction) // TODO - Adjust this as it looks better, check when not in debug mode
            // window.currentField.playableCharacter.scene.rotateY(THREE.Math.degToRad(deg))

            // const relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
            // console.log('positionPlayableCharacterFromTransition', relativeToCamera.x, relativeToCamera.y)
            // adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
        }

    } else {
        let leaderName = window.data.savemap.party.members[0]

        // Not sure why, but this initially this says Barret, Tifa and Cloud on a new savemap, when it should just be cloud
        // Hardcoding in here, just to make it work on a fresh save and retain the correct init game data
        if (window.currentField.name === 'md1stin') {
            leaderName = 'Cloud'
        }
        const leaderId = getPlayableCharacterId(leaderName)

        const modelDatas = getFieldModelsForPlayableCharacter(leaderId)
        for (let i = 0; i < modelDatas.length; i++) {
            const modelData = modelDatas[i]
            const { entityName, entityId, modelId } = modelData
            console.log('positionPlayableCharacterFromTransition NO init data', window.data.savemap.party.members, entityId, entityName, modelId)
            setModelAsEntity(entityId, modelId)
            setModelAsPlayableCharacter(entityId, leaderName)
            setModelAsLeader(entityId)
            await moveCameraToLeader(true)
        }
    }

    updateCurrentTriangleId(window.currentField.playableCharacter, window.currentField.playableCharacter.scene.position)
    drawArrowPositionHelpers()
}
const placeModel = (entityId, x, y, z, triangleId) => {
    console.log('placeModel: START', entityId, x, y, z, triangleId)
    const model = getModelByEntityId(entityId)

    if (model === undefined) {
        // TODO There are some instances where XYZI is called without a CHAR being called first
        return
    } else if (x !== undefined && y !== undefined && z !== undefined) {
        console.log('placeModel: x, y, z', entityId, model)
        model.scene.position.set(
            x / 4096,
            y / 4096,
            z / 4096)
    } else if (x !== undefined && y !== undefined && triangleId) {
        // Get the central point on the triangleId
        console.log('placeModel: x, y, triangleZ', entityId)
        const triangle = window.currentField.data.walkmeshSection.triangles[triangleId].vertices
        const triangleZ = (triangle[0].z + triangle[1].z + triangle[2].z) / 3
        model.scene.position.set(
            x / 4096,
            y / 4096,
            triangleZ / 4096)
        console.log('placeModel: triangleId', entityId, triangleId, triangle, '->', x, y, z)
    } else {
        console.log('placeModel: triangleX, triangleY, triangleZ', entityId)
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
    // TODO - Investigate this, md1stin, barret should not be shown, but the guards should. Not sure yet
    if (model.userData.setModelVisibility === false) {
        // model.scene.visible = falseda
    } else {
        model.scene.visible = true
    }

    if (!model.userData.hasBeenInitiallyPlaced) {
        playStandAnimation(model) // Play animation should not be executed each time this is envoked
        model.userData.hasBeenInitiallyPlaced = true
    }
}
const placeModelsDebug = async () => {
    console.log('placeModelsDebug: START')

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
            await modelFieldOpCodes.CHAR(entity.entityId, charOps[0])
            const model = getModelByEntityId(entity.entityId)
            if (model.animations.length > 0) {
                playAnimationLoopedAsync(entity.entityId, model.animations.length - 1, 1)
            }
        }
        const xyziOps = allOps.filter(o => o.op === 'XYZI')
        if (xyziOps.length > 0) {
            console.log('entity.entityName, xyziOps[0]', entity.entityId, entity.entityName, xyziOps[0])
            await modelFieldOpCodes.XYZI(entity.entityId, xyziOps[0])
        }
        const dirOps = allOps.filter(o => o.op === 'DIR')
        if (dirOps.length > 0) {
            await modelFieldOpCodes.DIR(entity.entityId, dirOps[0])
        }
        const pcOps = allOps.filter(o => o.op === 'PC')
        if (pcOps.length > 0) {
            await modelFieldOpCodes.PC(entity.entityId, pcOps[0])
        }
        const entityCcOps = allOps.filter(o => o.op === 'CC')
        if (entityCcOps.length > 0) {
            ccOps.push(entityCcOps[0])
        }
    }

    if (window.currentField.playableCharacterInitData) {
        await positionPlayableCharacterFromTransition()
    } else if (ccOps.length > 0) {
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
            if (entity.entityId === model.userData.entityId) {
                const triangleId = Math.round(window.currentField.data.walkmeshSection.triangles.length / 2)
                placeModel(model.userData.entityId, undefined, undefined, undefined, triangleId)
                setModelVisibility(model.userData.entityId, true)
                setModelAsLeader(model.userData.entityId)
            }
        }
    }

    console.log('placeModelsDebug: END', window.currentField.models)
}
const setModelVisibility = (entityId, isVisible) => {
    const model = getModelByEntityId(entityId)
    console.log('setModelVisibility', entityId, isVisible, model)
    // Sometimes this is called and the model has model has not be placed (eg, position (0,0,0), in the game, they are not visible - mkt_s3)
    model.userData.setModelVisibility = isVisible
    if (isVisible && model.scene.position.x === 0 && model.scene.position.y === 0 && model.scene.position.z === 0) {
        return
    }
    model.scene.visible = isVisible
}
const setModelRotationEnabled = (entityId, enabled) => {
    console.log('setModelRotationEnabled', entityId, enabled)
    const model = getModelByEntityId(entityId)
    model.userData.rotationEnabled = enabled
}
const setModelDirectionToFaceEntity = (entityId, targetEntityId) => {
    console.log('setModelDirectionToFaceEntity', entityId, targetEntityId)
    const model = getModelByEntityId(entityId)
    const targetModel = getModelByEntityId(targetEntityId)
    faceModelInstantly(model, targetModel)
}
const setModelDirectionToFaceCharacterOrPartyLeader = (entityId, characterId) => {
    console.log('setModelDirectionToFaceCharacterOrPartyLeader', entityId, characterId)
    const model = getModelByEntityId(entityId)
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
const setModelDirection = (entityId, direction) => {
    console.log('setModelDirection', entityId, direction)
    const deg = directionToDegrees(direction)
    const model = getModelByEntityId(entityId)
    model.scene.rotation.y = THREE.Math.degToRad(deg)
}
const setModelMovementSpeed = (entityId, speed) => {
    console.log('setModelMovementSpeed', entityId, speed)
    const model = getModelByEntityId(entityId)
    model.userData.movementSpeed = speed
}
const setModelAnimationSpeed = (entityId, speed) => {
    console.log('setModelAnimationSpeed', entityId, speed)
    const model = getModelByEntityId(entityId)
    model.userData.animationSpeed = speed
}
const setModelTalkEnabled = (entityId, isEnabled) => {
    console.log('setModelTalkEnabled', entityId, isEnabled)
    const model = getModelByEntityId(entityId)
    model.userData.talkEnabled = isEnabled
}
const setModelTalkRadius = (entityId, radius) => {
    console.log('setModelTalkRadius', entityId, radius)
    const model = getModelByEntityId(entityId)
    model.userData.talkRadius = radius
}
const setModelCollisionEnabled = (entityId, isEnabled) => {
    console.log('setModelCollisionEnabled', entityId, isEnabled)
    const model = getModelByEntityId(entityId)
    model.userData.collisionEnabled = isEnabled
}
const setModelCollisionRadius = (entityId, radius) => {
    console.log('setModelCollisionRadius', entityId, radius)
    const model = getModelByEntityId(entityId)
    model.userData.collisionRadius = radius
}
const setModelAsLeader = (entityId) => {
    console.log('setModelAsLeader', entityId)
    window.currentField.models.map(m => {
        m.userData.isLeader = false
    })
    // const entityName = window.currentField.data.script.entities[entityId].entityName
    const model = getModelByEntityId(entityId)
    if (model !== undefined) { // Eg - CHAR codes have already set models to entities
        // console.log('setModelAsLeader 2', entityId, entityName, model)
        const previousLeader = window.currentField.playableCharacter

        console.log('setModelAsLeader', entityId, 'MODEL SET')
        model.userData.isLeader = true
        // Leader should be persisted between map jumps by gateways and MAPJUMP
        // Leader should also be more accessible as it's in the movement section of render loop, eg
        // We probably shouldn't have to run models.filter(m => m.userData.isLeader)[0] every time
        window.currentField.playableCharacter = model
        window.data.savemap.location._fieldLeader = model.userData.characterName

        // Screen doesn't necessarily move to centre on character
        // Not sure about this, it takes control of the camera
        //  which isnt right in all fields where the camera has been previously set
        // await moveCameraToLeader(true)


        // colne_1 etc doesn't explcitly set the female cloud model as a PC
        // so we need to also set the position, direction & visibility from the current leader if there is one
        const entityHasPC = window.currentField.data.script.entities[12].scripts[0].ops.map(s => s.op).includes('PC')
        if (previousLeader && !entityHasPC) {
            console.log('setModelAsLeader previous leader', previousLeader.userData, previousLeader.scene)
            model.scene.position.x = previousLeader.scene.position.x
            model.scene.position.y = previousLeader.scene.position.y
            model.scene.position.z = previousLeader.scene.position.z
            model.scene.rotation.y = previousLeader.scene.rotation.y
            setModelVisibility(entityId, true)
        }


        if (window.currentField.futureLeader !== undefined) {
            delete window.currentField.futureLeader
        }

    } else { // CHAR codes have not set the models to entities
        // Set future leader so that when this is executed later in a PC, we can also set that model as leader
        console.log('setModelAsLeader', entityId, 'SET FUTURE LEADER')
        window.currentField.futureLeader = entityId
    }


    // Assist cursor hand displays if visible
    setFieldPointersEnabled(true)
    // TODO - set positionHelpers position on playable character straight away
    console.log('setModelAsLeader: END', model)
}
const setPlayableCharacterCanMove = (canMove) => {
    console.log('setPlayableCharacterCanMove', canMove)
    if (!canMove && window.currentField.playableCharacter) {
        playStandAnimation(window.currentField.playableCharacter)
    }
    window.currentField.playableCharacterCanMove = canMove
    // Also hides / shows cursor arrows if enabled
    setFieldPointersEnabled(canMove)
}
const getDegreesFromTwoPoints = (point1, point2) => {
    return 180 + -1 * (Math.atan2(point2.x - point1.x, point2.y - point1.y) * 180 / Math.PI)
}
const turnModelToFaceEntity = async (entityId, entityIdToFace, whichWayId, steps) => {
    const model = getModelByEntityId(entityId)
    const modelToFace = getModelByEntityId(entityIdToFace)
    const degrees = getDegreesFromTwoPoints(model.scene.position, modelToFace.scene.position)
    // TODO - This doesn't work in the same way that the DIRA operations don't
    // Do something with ? window.currentField.data.triggers.header.controlDirectionDegrees
    await turnModel(entityId, degrees, whichWayId, steps, 2)
}
const turnModelToFacePartyMember = async (entityId, partyMemberId, whichWayId, steps) => {
    const model = getModelByEntityId(entityId)
    const modelToFace = getModelByPartyMemberId(partyMemberId)
    const degrees = getDegreesFromTwoPoints(model.scene.position, modelToFace.scene.position)
    // TODO - This doesn't work in the same way that the DIRA operations don't
    // Do something with ? window.currentField.data.triggers.header.controlDirectionDegrees
    await turnModel(entityId, degrees, whichWayId, steps, 2)
}
const turnModelToFaceDirection = async (entityId, direction, whichWayId, steps, stepType) => {
    let degrees = directionToDegrees(direction)
    await turnModel(entityId, degrees, whichWayId, steps, stepType)
}
const turnModel = async (entityId, degrees, whichWayId, steps, stepType) => {
    return new Promise((resolve) => {
        console.log('turnModel: START', entityId, degrees, whichWayId, steps, stepType)
        const model = getModelByEntityId(entityId)
        if (!model.userData.rotationEnabled) {
            resolve()
            return
        }
        // Get start and end angles in radians
        let desiredYDeg = degrees
        let currentYDeg = THREE.Math.radToDeg(model.scene.rotation.y)
        console.log('turnModel currentYDeg 1', currentYDeg)
        currentYDeg = (3600 + currentYDeg) % 360 // Ensure currentYDeg is between 0 - 360
        // console.log('turnModel currentYDeg 2', currentYDeg)

        const clockwiseDiff = desiredYDeg > currentYDeg ? 360 + currentYDeg - desiredYDeg : currentYDeg - desiredYDeg
        const antiClockwiseDiff = currentYDeg > desiredYDeg ? 360 + desiredYDeg - currentYDeg : desiredYDeg - currentYDeg
        // console.log('turnModel clockwiseDiff', currentYDeg, desiredYDeg, '->', clockwiseDiff)
        // console.log('turnModel antiClockwiseDiff', currentYDeg, desiredYDeg, '->', antiClockwiseDiff)

        if (whichWayId === 1 || antiClockwiseDiff > clockwiseDiff) {
            // console.log('turnModel clockwise')
            desiredYDeg = currentYDeg - clockwiseDiff
        }
        if (whichWayId === 0 || clockwiseDiff > antiClockwiseDiff) {
            // console.log('turnModel anti-clockwise')
            desiredYDeg = currentYDeg + antiClockwiseDiff
        }

        // console.log('turnModel currentYDeg 3', currentYDeg, desiredYDeg)
        const currentYRad = THREE.Math.degToRad(currentYDeg)
        const desiredYRad = THREE.Math.degToRad(desiredYDeg)
        console.log('turnModel deg', currentYDeg, '->', desiredYDeg)
        console.log('turnModel rad', currentYRad, '->', desiredYRad)

        // Tween from currentYRad to desiredYRad
        model.scene.rotation.y = currentYRad
        const from = { y: currentYRad }
        const to = { y: desiredYRad }
        let easingType = TWEEN.Easing.Linear.None
        if (stepType === 2) {
            easingType = (TWEEN.Easing.Quadratic.InOut)
        }
        // console.log('easingType', easingType)
        let time = 350 // Not sure about the speed yet, md8_2, cloud turns with anim AQBF which is 15 frames, but timing videos, it seems like 350-400ms 
        new TWEEN.Tween(from)
            .to(to, time)
            .easing(easingType)
            .onUpdate(function () {
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

const registerLine = (entityId, lv0, lv1) => {
    console.log('registerLine', entityId, lv0, lv1)
    let v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
    let v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)
    let material1 = new THREE.LineBasicMaterial({ color: 0xff00ff })
    let geometry1 = new THREE.Geometry()
    geometry1.vertices.push(v0)
    geometry1.vertices.push(v1)
    let line = new THREE.Line(geometry1, material1)
    line.userData.triggered = false
    line.userData.triggeredOnce = false
    line.userData.playerClose = false
    line.userData.entityId = entityId
    line.userData.entityName = getEntityNameFromEntityId(entityId)
    line.userData.slippabilityEnabled = true
    line.userData.enabled = true
    window.currentField.lineLines.add(line)
    console.log('registerLine line', line)
}
const setLineSlippability = (entityId, enabled) => {
    console.log('setLineSlippability', entityId, enabled)
    const lines = window.currentField.lineLines.children.filter(l => l.userData.entityId === entityId)
    if (lines.length > 0) {
        lines[0].userData.slippabilityEnabled = enabled
    }
}
const enableLines = (entityId, enabled) => {
    console.log('enableLines', enabled)
    const lines = window.currentField.lineLines.children.filter(l => l.userData.entityId === entityId)
    console.log('lines', lines)
    if (lines.length > 0) {
        const line = lines[0]
        line.userData.enabled = enabled
        console.log('line', line, line.userData)
    }
}
const setLinePosition = (entityId, lv0, lv1) => {
    console.log('setLinePosition', entityId, lv0, lv1)
    const lines = window.currentField.lineLines.children.filter(l => l.userData.entityId === entityId)
    console.log('lines', lines)
    if (lines.length > 0) {
        // Wiki - If two or more lines are defined in one entity, SLINE only updates the first LINE definition.
        const line = lines[0]
        console.log('line', line, line.geometry.vertices[0], line.geometry.vertices[1])
        line.geometry.verticesNeedUpdate = true
        line.geometry.vertices[0].x = lv0.x / 4096
        line.geometry.vertices[0].y = lv0.y / 4096
        line.geometry.vertices[0].z = lv0.z / 4096
        line.geometry.vertices[1].x = lv1.x / 4096
        line.geometry.vertices[1].y = lv1.y / 4096
        line.geometry.vertices[1].z = lv1.z / 4096
        console.log('line', line, line.geometry.vertices[0], line.geometry.vertices[1])
    }
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
    getModelByEntityId,
    getModelByPartyMemberId,
    getModelByCurrentPlayableCharacter,
    getModelByCharacterName,
    turnModelToFaceEntity,
    turnModelToFacePartyMember,
    turnModelToFaceDirection,
    getDegreesFromTwoPoints,
    getEntityDirection,
    getPartyMemberDirection,
    setModelRotationEnabled,
    registerLine,
    setLineSlippability,
    enableLines,
    setLinePosition
}