import * as THREE from '../../assets/threejs-r118/three.module.js'
import TWEEN from '../../assets/tween.esm.js'
import {
    getModelByEntityId, getModelByPartyMemberId, getModelByCurrentPlayableCharacter,
    getModelByCharacterName, getDegreesFromTwoPoints, turnModelToFaceEntity, turnModelToFaceDirection,
    setModelCollisionEnabled, setModelTalkEnabled, setModelVisibility, placeModel, setModelDirection, directionToDegrees
} from './field-models.js'
import { sleep } from '../helpers/helpers.js'
import { adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { updateCursorPositionHelpers } from './field-position-helpers.js'
import { updateCurrentTriangleId } from './field-movement-player.js'

const moveEntityWithoutAnimationOrRotation = async (entityId, x, y) => {
    await moveEntity(entityId, x / 4096, y / 4096, false, false)
}
const moveEntityWithAnimationAndRotation = async (entityId, x, y) => {
    await moveEntity(entityId, x / 4096, y / 4096, true, true)
}
const moveEntityWithoutAnimationButWithRotation = async (entityId, x, y) => {
    await moveEntity(entityId, x / 4096, y / 4096, true, false)
}
const moveEntityToEntityWithAnimationAndRotation = async (entityId, targetEntityId) => {
    const targetModel = getModelByEntityId(targetEntityId)
    console.log('moveEntityToEntityWithAnimationAndRotation', targetModel)
    await moveEntityToEntity(entityId, targetModel)
}
const moveEntityToPartyMemberWithAnimationAndRotation = async (entityId, targetPartyMemberId) => {
    const targetModel = getModelByPartyMemberId(targetPartyMemberId)
    console.log('moveEntityToPartyMemberWithAnimationAndRotation', targetModel)
    await moveEntityToEntity(entityId, targetModel)
}
const moveEntityToEntity = async (entityId, targetModel) => {
    console.log('moveEntityToEntity', targetModel)
    if (targetModel.scene.visible) {
        // Move until they are within collision distance
        // TODO - Whilst moveEntity now takes into account the walkmesh, this really should have 'slippability'
        const sourceModel = getModelByEntityId(entityId)
        console.log('moveEntityToEntity source', sourceModel, sourceModel.userData.collisionRadius, sourceModel.scene.position)
        console.log('moveEntityToEntity target', targetModel, targetModel.userData.collisionRadius, targetModel.scene.position)
        const totalDistance = sourceModel.scene.position.distanceTo(targetModel.scene.position)
        const collisionDistance = 0.01 * 2 // TODO replace with userData collisionRadius (sourceModel.userData.collisionRadius + targetModel.userData.collisionRadius) / 4096
        const interpolationFactor = 1 - (collisionDistance / totalDistance)
        const collisionEdgeVector = new THREE.Vector3().lerpVectors(sourceModel.scene.position, targetModel.scene.position, interpolationFactor)
        console.log('moveEntityToEntity distance', totalDistance, collisionDistance, interpolationFactor, collisionEdgeVector)
        await moveEntity(entityId, collisionEdgeVector.x, collisionEdgeVector.y, true, true, true)
    }
}
const moveEntityJump = async (entityId, x, y, triangleId, height) => {
    const triangle = window.currentField.data.walkmeshSection.triangles[triangleId].vertices
    const targetX = x / 4096
    const targetY = y / 4096
    const targetZ = ((triangle[0].z + triangle[1].z + triangle[2].z) / 3) / 4096

    const model = getModelByEntityId(entityId)
    console.log('moveEntityJump', entityId, triangleId, targetX, targetY, targetZ, model)
    const directionDegrees = getDegreesFromTwoPoints(model.scene.position, { x: targetX, y: targetY })
    model.scene.rotation.y = THREE.Math.degToRad(directionDegrees) // TODO - Not sure if this works properly

    const heightAdjustment = 0.00235 * height // 0.04 <-> 17 // TODO - Need to test with other JUMP heights
    const time = 35 * height // 600 <-> 17 // TODO - Need to test with other JUMP heights

    const fromXY = { x: model.scene.position.x, y: model.scene.position.y }
    const toXY = { x: targetX, y: targetY }

    const fromZ1 = { z: model.scene.position.z }
    const toZ1 = { z: targetZ + heightAdjustment }
    const fromZ2 = { z: targetZ + heightAdjustment }
    const toZ2 = { z: targetZ }

    return new Promise(async (resolve) => {
        // A little messy, but I couldn't get different interpolations of different values working
        // This will do for the time being
        new TWEEN.Tween(fromXY)
            .to(toXY, time)
            .onUpdate(function () {
                console.log('moveEntityJump XY: UPDATE', fromXY)
                model.scene.position.x = fromXY.x
                model.scene.position.y = fromXY.y
                // TODO - Update camera position
                if (model.userData.isPlayableCharacter) {
                    let relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
                    adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
                }
                updateCursorPositionHelpers()
            })
            .onComplete(function () {
                console.log('moveEntityJump XY: END', fromXY)
                // Disable the reverse 'move' on land
                if (model.userData.isPlayableCharacter) {
                    console.log('moveEntityJump: land')
                    const targetVector = new THREE.Vector3(targetX, targetY, targetZ)
                    for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
                        const line = window.currentField.lineLines.children[i]
                        if (line.userData.enabled) {
                            const closestPointOnLine = new THREE.Line3(line.geometry.vertices[0], line.geometry.vertices[1]).closestPointToPoint(targetVector, true, new THREE.Vector3())
                            const distance = targetVector.distanceTo(closestPointOnLine)
                            const entityId = line.userData.entityId
                            if (distance < 0.01) {
                                if (line.userData.triggered === false) {
                                    line.userData.triggered = true
                                    // lineMoveTriggered(entityId, line)
                                }
                            }
                        }
                    }
                    updateCurrentTriangleId(model, model.scene.position)
                }
                resolve()
            })
            .start()


        new TWEEN.Tween(fromZ1)
            .to(toZ1, time / 2)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(function () {
                console.log('moveEntityJump Z1: UPDATE', fromZ1)
                model.scene.position.z = fromZ1.z
            })
            .onComplete(function () {
                console.log('moveEntityJump Z1: END', fromZ1)
                new TWEEN.Tween(fromZ2)
                    .to(toZ2, time / 2)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onUpdate(function () {
                        console.log('moveEntityJump Z2: UPDATE', fromZ2)
                        model.scene.position.z = fromZ2.z
                    })
                    .onComplete(function () {
                        console.log('moveEntityJump Z2: END', fromZ2)
                    })
                    .start()
            })
            .start()
    })

}
const moveEntity = async (entityId, x, y, rotate, animate, desiredSpeed, desiredFrames, enforceWalkmesh) => {
    const model = getModelByEntityId(entityId)
    console.log('moveEntity: START', model.userData.entityName, entityId, x, y, rotate, animate, model.userData.movementSpeed, window.currentField.data.model.header.modelScale, model)

    console.log('current position', model.scene.position.x, model.scene.position.y)
    const directionDegrees = getDegreesFromTwoPoints(model.scene.position, { x: x, y: y })

    // console.log('directionDegrees', directionDegrees, window.currentField.data.triggers.header.controlDirectionDegrees,
    //     // 180 + (directionDegrees * -1)
    // )

    const from = { x: model.scene.position.x, y: model.scene.position.y }
    const to = { x: x, y: y }
    const distance = 4096 * Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2))
    const speed = (model.userData.movementSpeed / 8.6428) * (window.currentField.data.model.header.modelScale / 512) // This 'seems' ok, at least for modelScale 512 fields
    let time = (distance / speed) * 1000
    console.log('moveEntity distance', distance)
    console.log('speed', speed)
    console.log('workings out', entityId, model.userData.entityName, '-', model.userData.movementSpeed, window.currentField.data.model.header.modelScale, 'dst', distance, speed, time)
    console.log('time', time)
    // at 512 & 2048 - speed = 8192

    let animationId = window.currentField.playerAnimations.run
    // if ((desiredSpeed && desiredSpeed >= 30)) { // TODO - Set with 'JOIN' and 'SPLIT', need to look at again
    if ((desiredSpeed && desiredSpeed >= 30) || model.userData.movementSpeed < 1600) { // TODO - Set with 'JOIN' and 'SPLIT', need to look at again
        // time = 1000 / 30 * desiredSpeed
        animationId = window.currentField.playerAnimations.walk
    }

    if (desiredFrames !== undefined) { // Desired frames sets the absolute time of the movement
        const distancePerFrame = distance / desiredFrames
        console.log('moveEntity desired frames', desiredFrames, distance, '->', distancePerFrame)
        if (distancePerFrame >= 10) {
            animationId = window.currentField.playerAnimations.run
        } else {
            animationId = window.currentField.playerAnimations.walk
        }
        time = (desiredFrames / 30 * 1000)
    }

    // console.log('moveEntity animationId', animationId, model.userData.movementSpeed, desiredSpeed)
    if (rotate && model.userData.rotationEnabled) {
        model.scene.rotation.y = THREE.Math.degToRad(directionDegrees)
    }
    if (animate && model.animations[animationId]) {
        // console.log('stopAllAction C', model.userData.entityName)
        model.mixer.stopAllAction()
        const action = model.mixer.clipAction(model.animations[animationId])
        action.setLoop(THREE.LoopRepeat)
        action.userData = {
            entityName: model.userData.entityName,
            entityId,
            animationId,
            type: 'movement'
        }
        action.play()
    }
    let lastZ = model.scene.position.z

    console.log('moveEntity READY', entityId, from, to, lastZ, distance, time)
    return new Promise(async (resolve) => {
        const moveTween = new TWEEN.Tween(from)
            .to(to, time)
        moveTween.onUpdate(function () {
            // Find the z position
            let movementRay = new THREE.Raycaster()
            const rayO = new THREE.Vector3(from.x, from.y, lastZ + 0.01)
            const rayD = new THREE.Vector3(0, 0, -1).normalize()
            movementRay.set(rayO, rayD)
            movementRay.far = 0.02

            let intersects = movementRay.intersectObjects(window.currentField.walkmeshMesh.children)
            // console.log('move UPDATE', entityId, intersects, from, to, lastZ)
            // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
            if (window.config.debug.showMovementHelpers) {
                window.currentField.movementHelpers.add(new THREE.ArrowHelper(movementRay.ray.direction, movementRay.ray.origin, movementRay.far, 0x229922)) // For debugging walkmesh raycaster    
            }
            if (intersects.length === 0) {
                console.log('moveEntity: no intersects')
                // TWEEN.remove(moveTween)
                if (enforceWalkmesh !== undefined && enforceWalkmesh) {
                    moveTween.stop()
                }
            } else {
                console.log('moveEntity: intersects')
                const point = intersects[0].point
                lastZ = point.z
                model.scene.userData.triangleId = intersects[0].object.userData.triangleId

                // Update the model position
                model.scene.position.x = from.x
                model.scene.position.y = from.y
                model.scene.position.z = lastZ

                // Camera follow
                if (model.userData.name === window.currentField.playableCharacter.userData.name && window.currentField.fieldCameraFollowPlayer) {
                    // Update camera position if this is the main character
                    const relativeToCamera = calculateViewClippingPointFromVector3(model.scene.position)
                    adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
                }
            }

        })
        moveTween.onStop(async () => {
            console.log('moveEntity: END (COMPLETE)', entityId, from, to, lastZ)
            if (animate) {
                // console.log('stopAllAction D', model.userData.entityName)
                model.mixer.stopAllAction()
            }
            if (model.userData.isPlayableCharacter) {
                updateCurrentTriangleId(model, model.scene.position)
            }
            await sleep(1000 / 30)
            // model.mixer.clipAction(window.currentField.playerAnimations.walk).play()
            resolve()
        })
        moveTween.onComplete(async () => {
            console.log('moveEntity: END (STOP)', entityId, from, to, lastZ)
            if (animate) {
                // console.log('stopAllAction D', model.userData.entityName)
                model.mixer.stopAllAction()
            }
            if (model.userData.isPlayableCharacter) {
                updateCurrentTriangleId(model, model.scene.position)
            }
            await sleep(1000 / 30)
            // model.mixer.clipAction(window.currentField.playerAnimations.walk).play()
            resolve()
        })
        moveTween.start()
    })
}
const moveEntityLadder = async (entityId, x, y, z, triangleId, keys, animationId, direction, speed) => {
    const model = getModelByEntityId(entityId)
    if (model.userData.name === window.currentField.playableCharacter.userData.name && window.currentField.playableCharacterCanMove) { // This should be the active character
        await moveEntityLadderPlayableCharacter(entityId, x, y, z, triangleId, keys, animationId, direction, speed, model)
    } else {
        await moveEntityLadderNPC(entityId, x, y, z, triangleId, keys, animationId, direction, speed, model)
    }
}
const moveEntityLadderPlayableCharacter = async (entityId, x, y, z, triangleId, keys, animationId, direction, speed, model) => {
    console.log('moveEntityLadderPlayableCharacter', entityId, x, y, z, triangleId, keys, animationId, direction, speed, model)
    return new Promise(async (resolve) => {
        // console.log('stopAllAction E', model.userData.entityName)
        model.mixer.stopAllAction()
        setModelDirection(entityId, direction)
        let keysForwards
        let keysBackwards
        switch (keys) {
            case 0: keysForwards = 'down'; keysBackwards = 'up'; break
            case 1: keysForwards = 'up'; keysBackwards = 'down'; break
            case 2: keysForwards = 'right'; keysBackwards = 'left'; break
            case 3: keysForwards = 'left'; keysBackwards = 'right'; break
        }
        model.userData.ladder = {
            from: { x: model.scene.position.x, y: model.scene.position.y, z: model.scene.position.z },
            to: { x: x / 4096, y: y / 4096, z: z / 4096 },
            animationId,
            direction,
            speed,
            keysForwards,
            keysBackwards,
            atStart: true,
            resolve: function () {
                resolve()
                console.log('moveEntityLadderPlayableCharacter: END')
                delete model.userData.ladder
                console.log('moveEntityLadderPlayableCharacter: CLEAN', model.userData)
            }
        }
        console.log('moveEntityLadderPlayableCharacter: READY', model.userData.ladder)
        // model.userData.ladder.resolve()
    })
}
const moveEntityLadderNPC = async (entityId, x, y, z, triangleId, keys, animationId, direction, animationSpeed, model) => {
    console.log('moveEntityLadderNPC', entityId, x, y, z, triangleId, '-', keys, animationId, direction, animationSpeed, model)
    // console.log('stopAllAction F', model.userData.entityName)
    model.mixer.stopAllAction()
    setModelDirection(entityId, direction)
    model.mixer.clipAction(model.animations[animationId]).play()
    // model.mixer.clipAction(model.animations[animationId]).timeScale = -1 // TODO Animation speed & direction?!

    // Facing direction for diagonal (eg non pure vertical) ladders is taken care of in the animation
    const from = { x: model.scene.position.x, y: model.scene.position.y, z: model.scene.position.z }
    const to = { x: x / 4096, y: y / 4096, z: z / 4096 }

    const distance = new THREE.Vector3(from.x, from.y, from.z).distanceTo(new THREE.Vector3(to.x, to.y, to.z))
    const speed = model.userData.movementSpeed * (1 / window.currentField.data.model.header.modelScale) * 1024 * 2 // TODO - Look at this properly, not sure of the scale here
    let time = distance * speed
    // TODO - The speed is very wrong
    console.log('moveEntityLadderNPC ready', entityId, from, to, distance, speed, time)
    return new Promise(async (resolve) => {
        new TWEEN.Tween(from)
            .to(to, time)
            .onUpdate(function () {
                // Update the model position
                model.scene.position.x = from.x
                model.scene.position.y = from.y
                model.scene.position.z = from.z
                console.log('moveEntityLadderNPC update', entityId, from)

                if (model.userData.name === window.currentField.playableCharacter.userData.name) {
                    // Update camera position if this is the main character
                    const relativeToCamera = calculateViewClippingPointFromVector3(from)
                    adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
                }
            })
            .onComplete(function () {
                console.log('moveEntityLadderNPC: END', entityId)
                // console.log('stopAllAction G', model.userData.entityName)
                model.mixer.stopAllAction()
                updateCurrentTriangleId(model, from)
                resolve()
            })
            .start()
    })

}
const getEntityPositionTriangle = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityPositionTriangle', entityId, model.scene.userData.triangleId, model.scene.userData.triangleId === undefined, model)
    return model.scene.userData.triangleId !== undefined ? model.scene.userData.triangleId : -1
}
const getEntityPositionXY = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityPositionXY', entityId, model)
    return {
        x: Math.floor(model.scene.position.x * 4096),
        y: Math.floor(model.scene.position.y * 4096),
    }
}
const getEntityPositionXYZTriangle = (entityId) => {
    const model = getModelByEntityId(entityId)
    console.log('getEntityPositionXYZTriangle', entityId, model)
    return {
        x: Math.floor(model.scene.position.x * 4096),
        y: Math.floor(model.scene.position.y * 4096),
        z: Math.floor(model.scene.position.z * 4096),
        triangleId: model.scene.userData.triangleId !== undefined ? model.scene.userData.triangleId : -1
    }
}
const getPartyMemberPositionXYZTriangle = (partyMemberId) => {
    const model = getModelByPartyMemberId(partyMemberId)
    console.log('getPartyMemberPositionXYZTriangle', partyMemberId, model)
    return {
        x: Math.floor(model.scene.position.x * 4096),
        y: Math.floor(model.scene.position.y * 4096),
        z: Math.floor(model.scene.position.z * 4096),
        triangleId: model.scene.userData.triangleId !== undefined ? model.scene.userData.triangleId : -1
    }
}
const setTriangleBoundaryMovementAllowed = (triangleId, allowed) => {
    console.log('setTriangleBoundaryMovementAllowed', triangleId, allowed)

    // walkmeshMeshTriangle.userData.triangleId = i
    // walkmeshMeshTriangle.userData.movementAllowed = true
    const mesh = window.currentField.walkmeshMesh.children.filter(m => m.userData.triangleId === triangleId)[0]
    console.log('mesh: START', mesh, mesh.userData)
    mesh.userData.movementAllowed = allowed
    if (allowed) {
        mesh.material.color.setHex(0x2194CE)
    } else {
        mesh.material.color.setHex(0xCE2194)
    }
    console.log('mesh: END', mesh.userData)
}
const offsetEntity = async (entityId, x, y, z, frames, type) => {
    // TODO - Need to check this later as in the doc it says: (which I haven't done yet)
    // Offsets the field object, belonging to the entity whose script this opcode resides in,
    // by a certain amount. After being offset, the character continues to be constrained in
    // movement as defined by the walkmesh's shape, but at a certain distance away from the
    // normal walkmesh position. Other field objects are unaffected, and their position or
    // movements are maintained on the walkmesh's original position




    const model = getModelByEntityId(entityId)
    model.userData.offsetInProgress = true
    console.log('offsetEntity: START', entityId, x, y, z, frames, type, model)

    // Note: If multiple offsets are chained, then they are relative to the 'pre-offset' position
    // : nivl_3 -> cloud -> Script 7
    if (model.scene.userData.currentOffset === undefined) {
        model.scene.userData.currentOffset = { x: 0, y: 0, z: 0 }
    }

    const from = {
        x: model.scene.position.x,
        y: model.scene.position.y,
        z: model.scene.position.z
    }
    const to = {
        x: model.scene.position.x + ((x - model.scene.userData.currentOffset.x) / 4096),
        y: model.scene.position.y + ((y - model.scene.userData.currentOffset.y) / 4096),
        z: model.scene.position.z + ((z - model.scene.userData.currentOffset.z) / 4096)
    }
    // 0 - instant
    const time = type === 0 ? 1 : 1000 / 30 * frames
    let easingType = TWEEN.Easing.Linear.None // 1 - linear
    if (type === 2) {
        easingType = (TWEEN.Easing.Quadratic.InOut) // 2 - smooth
    }
    return new Promise(async (resolve) => {
        new TWEEN.Tween(from)
            .to(to, time)
            .easing(easingType)
            .onUpdate(function () {
                // Update the model position
                model.scene.position.x = from.x
                model.scene.position.y = from.y
                model.scene.position.z = from.z

                console.log('offsetEntity: UPDATE', entityId, x, y, z, frames, type, model)
            })
            .onComplete(function () {
                console.log('offsetEntity: END', entityId, from)
                model.scene.userData.currentOffset = { x, y, z }
                delete model.userData.offsetInProgress
                resolve()
            })
            .start()
    })
}
const waitForOffset = async (entityId) => {
    console.log('waitForOffset ', entityId)
    const model = getModelByEntityId(entityId)
    while (model.userData.offsetInProgress) {
        // Should really replace this with promises...
        await sleep(1000 / 30 * 2)
        console.log('waitForOffset ', entityId, 'waiting...')
    }
}

const joinLeader = async (speed) => {
    const leaderModel = getModelByCurrentPlayableCharacter()
    const targetX = leaderModel.scene.position.x
    const targetY = leaderModel.scene.position.y
    const joinerNames = window.data.savemap.party.members.filter(m => m !== 'None' && m !== leaderModel.userData.characterName)
    console.log('joinLeader', leaderModel, joinerNames, speed)
    const result = await Promise.all(
        joinerNames.map(async (joinerName) => {
            const model = getModelByCharacterName(joinerName)
            console.log('model', model)
            await turnModelToFaceEntity(model.userData.entityId, leaderModel.userData.entityId, 2, 15) // TODO not sure about speed here
            await moveEntity(model.userData.entityId, targetX, targetY, true, true, speed, speed)
            setModelCollisionEnabled(model.userData.entityId, false)
            setModelTalkEnabled(model.userData.entityId, false)
            setModelVisibility(model.userData.entityId, false)
            return model
        })
    )
    console.log('result', result)
}
const splitPartyFromLeader = async (char1, char2, speed) => {
    console.log('splitPartyFromLeader', char1, char2, speed)

    const leaderModel = getModelByCurrentPlayableCharacter()
    const targetX = leaderModel.scene.position.x
    const targetY = leaderModel.scene.position.y
    const targetZ = leaderModel.scene.position.z
    const leavers = window.data.savemap.party.members.filter(m => m !== 'None' && m !== leaderModel.userData.characterName)
    if (leavers.length > 0) {
        leavers[0] = { name: leavers[0], x: char1.x / 4096, y: char1.y / 4096, z: targetZ, direction: char1.direction }
    }
    if (leavers.length > 1) {
        leavers[1] = { name: leavers[1], x: char2.x / 4096, y: char2.y / 4096, z: targetZ, direction: char2.direction }
    }
    console.log('splitPartyFromLeader joinLeader', leaderModel, leavers)
    const result = await Promise.all(
        leavers.map(async (leaver) => {
            const model = getModelByCharacterName(leaver.name)
            console.log('model', model)
            placeModel(model.userData.entityId, targetX * 4096, targetY * 4096, targetZ * 4096)

            setModelVisibility(model.userData.entityId, true)
            await turnModelToFaceDirection(model.userData.entityId, 255 - leaver.direction, 2, 15, 2) // TODO not sure about speed here
            await moveEntity(model.userData.entityId, leaver.x, leaver.y, true, true, speed, speed)
            await turnModelToFaceDirection(model.userData.entityId, leaver.direction, 2, 15, 2) // TODO not sure about speed here
            setModelCollisionEnabled(model.userData.entityId, true)
            setModelTalkEnabled(model.userData.entityId, true)
            return model
        })
    )
    console.log('splitPartyFromLeader', result)
}
export {
    moveEntityWithAnimationAndRotation,
    moveEntityWithoutAnimationOrRotation,
    moveEntityWithoutAnimationButWithRotation,
    moveEntityToEntityWithAnimationAndRotation,
    moveEntityToPartyMemberWithAnimationAndRotation,
    moveEntityJump,
    moveEntityLadder,
    getEntityPositionTriangle,
    getEntityPositionXY,
    getEntityPositionXYZTriangle,
    getPartyMemberPositionXYZTriangle,
    setTriangleBoundaryMovementAllowed,
    offsetEntity,
    waitForOffset,
    joinLeader,
    splitPartyFromLeader
}