import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getActiveInputs } from '../interaction/inputs.js'
import { adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { gatewayTriggered, triggerTriggered, modelCollisionTriggered } from './field-actions.js'
import { updateCursorPositionHelpers } from './field-position-helpers.js'
import { updateSavemapLocationFieldPosition, updateSavemapLocationFieldLeader } from '../data/savemap-alias.js'


const updateFieldMovement = (delta) => {
    // console.log('movementDirection', delta)
    // Get active player
    if (!window.currentField.playableCharacter) {
        return
    }

    // console.log('asd', delta, window.currentField.playableCharacterCanMove, window.currentField.setPlayableCharacterIsInteracting)
    // Can player move?
    if (!window.currentField.playableCharacterCanMove) {
        return
    }
    if (window.currentField.setPlayableCharacterIsInteracting) {
        return
    }

    let speed = (window.currentField.data.model.header.modelScale / 4400) * delta // run - Need to set these from the placed character model. Maybe these can be defaults?
    let animNo = 2 // run

    if (window.currentField.playableCharacter.userData.ladder) {
        return ladderMovement(speed)
    }
    if (window.config.debug.runByDefault) {
        if (getActiveInputs().x) { // Adjust to walk
            speed = speed * 0.20
            animNo = 1
        }
    } else {
        if (!getActiveInputs().x) { // Adjust to walk
            speed = speed * 0.20
            animNo = 1
        }
    }



    // console.log('speed', speed, delta, animNo, window.currentField.playableCharacter.animations[animNo].name)
    // Find direction that player should be facing
    // let direction = ((256 - window.currentField.data.triggers.header.controlDirection) * 360 / 256) - 180 // Moved this to kujata-data
    let direction = window.currentField.data.triggers.header.controlDirectionDegrees
    // console.log('Direction', window.currentField.data.triggers.header.controlDirection, window.currentField.data.triggers.header.controlDirectionDegrees, direction)

    let shouldMove = true
    if (getActiveInputs().up && getActiveInputs().right) { direction += 45 }
    else if (getActiveInputs().right && getActiveInputs().down) { direction += 135 }
    else if (getActiveInputs().down && getActiveInputs().left) { direction += 225 }
    else if (getActiveInputs().left && getActiveInputs().up) { direction += 315 }
    else if (getActiveInputs().up) { direction += 0 }
    else if (getActiveInputs().right) { direction += 90 }
    else if (getActiveInputs().down) { direction += 180 }
    else if (getActiveInputs().left) { direction += 270 }
    else { shouldMove = false }

    if (!shouldMove) {
        // If no movement but window.animation - stop window.animation (stand)
        window.currentField.playableCharacter.mixer.stopAllAction()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[0]).play() // stand window.anim
        return
    }

    // Deal with 'slippability'
    const SLIP_ANGLE = 45
    const directions = [direction, direction - SLIP_ANGLE, direction + SLIP_ANGLE]
    let nextPosition
    let walkmeshFound = false
    let isSlipDirection = false
    const originalDirection = direction
    window.currentField.playableCharacter.scene.userData.originalDirection = originalDirection
    const originalDirectionRadians = THREE.Math.degToRad(originalDirection)
    const originalDirectionVector = new THREE.Vector3(Math.sin(originalDirectionRadians), Math.cos(originalDirectionRadians), 0)
    const playerPositionOffset = window.currentField.playableCharacter.scene.position.clone().addScaledVector(originalDirectionVector, 0.01)

    // console.log('movementDirection', originalDirection, originalDirectionRadians, originalDirectionVector, playerPositionOffset)
    for (let i = 0; i < directions.length; i++) {
        const potentialDirection = directions[i]
        // Set player in direction
        let directionRadians = THREE.Math.degToRad(potentialDirection)
        let directionVector = new THREE.Vector3(Math.sin(directionRadians), Math.cos(directionRadians), 0)
        nextPosition = window.currentField.playableCharacter.scene.position.clone().addScaledVector(directionVector, speed)
        const nextPositionForRaycast = playerPositionOffset.clone().addScaledVector(directionVector, speed)
        window.currentField.playableCharacter.scene.rotation.y = THREE.Math.degToRad(180 - potentialDirection)

        // Adjust for climbing slopes and walking off walkmesh
        // Create a ray at next position (higher z, but pointing down) to find correct z position
        // TODO - Need to deal with transitioning from a non-adjacent triangle, eg, just to different areas
        let playerMovementRay = new THREE.Raycaster()
        const rayO = new THREE.Vector3(nextPositionForRaycast.x, nextPositionForRaycast.y, nextPositionForRaycast.z + 0.05)
        const rayD = new THREE.Vector3(0, 0, -1).normalize()
        playerMovementRay.set(rayO, rayD)
        playerMovementRay.far = 0.1
        let intersects = playerMovementRay.intersectObjects(window.currentField.walkmeshMesh.children)
        // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
        if (window.config.debug.showMovementHelpers) {
            window.currentField.movementHelpers.add(new THREE.ArrowHelper(playerMovementRay.ray.direction, playerMovementRay.ray.origin, playerMovementRay.far, 0xfff00ff)) // For debugging walkmesh raycaster
        }
        if (intersects.length === 0) {
            // Player is off walkmap
            continue
        } else if (!intersects[0].object.userData.movementAllowed) {
            // Triangle locked through IDLCK
            continue
        } else {

            const intersect = getNextPositionRaycast(nextPosition)
            if (!intersect) {
                continue
            }
            const currentTriangleId = window.currentField.playableCharacter.scene.userData.triangleId
            const nextTriangleId = intersect.object.userData.triangleId
            const nextTriangleMovementAllowed = currentTriangleId === nextTriangleId ? true : window.currentField.data.walkmeshSection.accessors[nextTriangleId].includes(currentTriangleId)
            console.log('playerMovement nextTriangle', intersects, currentTriangleId, nextTriangleId, nextTriangleMovementAllowed)
            if (!nextTriangleMovementAllowed && currentTriangleId !== undefined) {
                console.log('playerMovement nextTriangle STOP')
                continue
            }

            walkmeshFound = true
            if (i >= 1) {
                isSlipDirection = true
            }
            console.log('playerMovement nextTriangle CONTINUE')
            nextPosition.z = intersect.point.z
            window.currentField.playableCharacter.scene.userData.triangleId = nextTriangleId
            updateSavemapLocationFieldPosition(
                Math.round(nextPosition.x * 4096),
                Math.round(nextPosition.y * 4096),
                window.currentField.playableCharacter.scene.userData.triangleId,
                direction - window.currentField.data.triggers.header.controlDirectionDegrees)
            updateSavemapLocationFieldLeader(window.currentField.playableCharacter.userData.characterName)
            // console.log('asd player movement', window.currentField.playableCharacter.scene.position, nextPosition, intersects[0].object.userData.triangleId, directionVector, speed)

            break
        }
    }

    if (!walkmeshFound) {
        // console.log('asd no walkmesh found')
        window.currentField.playableCharacter.scene.rotation.y = THREE.Math.degToRad(180 - originalDirection)
        window.currentField.playableCharacter.mixer.stopAllAction()
        return
    }








    // Detect gateways
    if (window.currentField.gatewayTriggersEnabled) {
        for (let i = 0; i < window.currentField.gatewayLines.children.length; i++) {
            const gatewayLine = window.currentField.gatewayLines.children[i]
            const closestPointOnLine = new THREE.Line3(gatewayLine.geometry.vertices[0], gatewayLine.geometry.vertices[1]).closestPointToPoint(nextPosition, true, new THREE.Vector3())
            const distance = nextPosition.distanceTo(closestPointOnLine)
            if (distance < 0.005) {
                console.log('gateway hit')
                if (animNo === 2) { // Run
                    window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[2]).paused = true
                } else if (animNo === 1) { // Walk
                    window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[1]).paused = true
                }
                // Should probably also pause ALL animations including screen background loops like in the game
                gatewayTriggered(i)
                return
            }
        }
    }
    // Detect triggers
    for (let i = 0; i < window.currentField.triggerLines.children.length; i++) {
        const triggerLine = window.currentField.triggerLines.children[i]
        const closestPointOnLine = new THREE.Line3(triggerLine.geometry.vertices[0], triggerLine.geometry.vertices[1]).closestPointToPoint(nextPosition, true, new THREE.Vector3())
        const distance = nextPosition.distanceTo(closestPointOnLine)
        if (distance < 0.01) {
            if (triggerLine.userData.triggered === false) {
                triggerLine.userData.triggered = true
                triggerTriggered(i, true)
            }
        } else {
            if (triggerLine.userData.triggered === true) {
                triggerLine.userData.triggered = false
                triggerTriggered(i, false)
            }
        }
    }
    // Move line triggers to render loop
    window.currentField.playableCharacter.scene.userData.isSlipDirection = isSlipDirection
    for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
        const line = window.currentField.lineLines.children[i]
        if (line.userData.enabled &&
            line.userData.playerClose &&
            window.currentField.playableCharacter.scene.userData.isSlipDirection &&
            !line.userData.slippabilityEnabled) {
            window.currentField.playableCharacter.scene.rotation.y = THREE.Math.degToRad(180 - window.currentField.playableCharacter.scene.userData.originalDirection)
            window.currentField.playableCharacter.mixer.stopAllAction()
            return
        }
        //         const closestPointOnLine = new THREE.Line3(line.geometry.vertices[0], line.geometry.vertices[1]).closestPointToPoint(nextPosition, true, new THREE.Vector3())
        //         const distance = nextPosition.distanceTo(closestPointOnLine)
        //         const entityId = line.userData.entityId
        //         if (distance < 0.01) {
        //             if (line.userData.triggered === false) {
        //                 line.userData.triggered = true
        //                 lineMoveTriggered(entityId, line)
        //             }
        //             if (isSlipDirection && !line.userData.slippabilityEnabled) {
        //                 window.currentField.playableCharacter.scene.rotation.y = THREE.Math.degToRad(180 - originalDirection)
        //                 window.currentField.playableCharacter.mixer.stopAllAction()
        //                 return
        //             }
        //         } else {
        //             if (line.userData.triggered === true) {
        //                 line.userData.triggered = false
        //                 lineGoTriggered(entityId, line)
        //             }
        //         }
        //         if (distance < 0.05) { // TODO - Guess
        //             if (line.userData.triggeredAway === false) {
        //                 line.userData.triggeredAway = true
        //             }
        //         } else {
        //             if (line.userData.triggeredAway === true) {
        //                 line.userData.triggeredAway = false
        //                 lineAwayTriggered(entityId)
        //             }
        //         }
    }

    // Detect model collisions
    // Can probably filter out models that haven't been placed onto the scene
    for (let i = 0; i < window.currentField.models.length; i++) {
        const fieldModel = window.currentField.models[i]

        if (fieldModel === window.currentField.playableCharacter) {
            continue
        }
        if (fieldModel.scene.position.x === 0 &&
            fieldModel.scene.position.y === 0 &&
            fieldModel.scene.position.z === 0) { // Temporary until we place models properly, playable chars are dropped at 0,0,0
            continue
        }
        if (fieldModel.visible === false) {
            continue
        }
        if (!fieldModel.userData.collisionEnabled) {
            continue
        }
        const distance = nextPosition.distanceTo(fieldModel.scene.position)

        // Need to check distances aren't set from op codes, and solidMode is enabled etc
        // Big assumption, radial and uniform distances will work, rather than bounding box based collisions
        // console.log('closeToTalk', fieldModel.scene.userData, fieldModel.userData.talkRadius, fieldModel.userData.talkRadius / 4096 * 1.3, distance)
        console.log(`Talk distance ${fieldModel.userData.entityName}`, i, distance, (fieldModel.userData.talkRadius / 4096 * 1.3))
        if (distance < (fieldModel.userData.talkRadius / 4096 * 1.3)) { //60 is roughly 0.015
            if (fieldModel.scene.userData.closeToTalk === false) {
                fieldModel.scene.userData.closeToTalk = true
                console.log('Close to talk', i, fieldModel.scene.userData.closeToTalk, fieldModel.userData)
            }
        } else {
            if (fieldModel.scene.userData.closeToTalk === true) {
                fieldModel.scene.userData.closeToTalk = false
                console.log('Close to talk', i, fieldModel.scene.userData.closeToTalk, fieldModel.userData)
            }
        }
        if (distance < 0.01) { // Set based on collisionRadius
            if (fieldModel.scene.userData.closeToCollide === false && fieldModel.userData.collisionEnabled) {
                fieldModel.scene.userData.closeToCollide = true
                console.log('Close to collide', i, fieldModel.scene.userData.closeToCollide, fieldModel.userData)
                modelCollisionTriggered(i, fieldModel)
            }
            // Stop movement
            window.currentField.playableCharacter.mixer.stopAllAction()
            console.log('playerMovement TOO CLOSE TO ENTITY', distance, fieldModel.scene.userData)

            // Add a directional check so that a player can move away from the entity if placed next / on an entity
            const nextDir = new THREE.Vector3().subVectors(window.currentField.playableCharacter.scene.position, nextPosition).normalize()
            const entityDir = new THREE.Vector3().subVectors(window.currentField.playableCharacter.scene.position, fieldModel.scene.position).normalize()
            const directionDiff = nextDir.distanceTo(entityDir)
            // This can probably be done in a better mathematical way
            // console.log('playerMovement CLOSE DIRECTION player', window.currentField.playableCharacter.scene.position)
            // console.log('playerMovement CLOSE DIRECTION next', nextPosition)
            // console.log('playerMovement CLOSE DIRECTION entity', fieldModel.userData, fieldModel.scene.userData, distance, fieldModel.scene.position)
            // console.log('playerMovement CLOSE DIRECTION next dir', nextDir)
            // console.log('playerMovement CLOSE DIRECTION entity dir', entityDir)
            // console.log('playerMovement CLOSE DIRECTION next to entity dir diff', directionDiff)
            if (directionDiff < 1) {
                return
            }
        } else {
            if (fieldModel.scene.userData.closeToCollide === true) { // Is this needed to keep collision state??
                fieldModel.scene.userData.closeToCollide = false
                // console.log('Close to collide', i, fieldModel.scene.userData.closeToCollide, fieldModel.userData)
            }
        }
    }



    // If walk/run is toggled, stop the existing window.animation
    if (animNo === 2) { // Run
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.stand]).stop() // Probably a more efficient way to change these animations
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.walk]).stop()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.run]).play()
    } else if (animNo === 1) { // Walk
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.stand]).stop()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.run]).stop()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.walk]).play()
    }

    // There is movement, set next position
    window.currentField.playableCharacter.scene.position.x = nextPosition.x
    window.currentField.playableCharacter.scene.position.y = nextPosition.y
    window.currentField.playableCharacter.scene.position.z = nextPosition.z

    // Update camera position if camera is following user
    if (window.currentField.fieldCameraFollowPlayer) {
        // Adjust the camera offset to centre on character
        const relativeToCamera = calculateViewClippingPointFromVector3(nextPosition)
        // console.log('window.currentField.playableCharacter relativeToCamera', relativeToCamera)
        adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
    }


    // Maybe should change this to distance to the normal of the camera position -> camera target line ?
    // Looks ok so far, but there are a few maps with clipping that should therefore switch
    // to an orthogonal camera
    let camDistance = window.currentField.playableCharacter.scene.position.distanceTo(window.currentField.fieldCamera.position)
    // console.log(
    //     'Distance from camera',
    //     camDistance,
    //     camDistance * 1000)

    updateCursorPositionHelpers()
}
const getNextPositionRaycast = (nextPosition) => {
    const rayOffset = 0.05
    let playerMovementRay = new THREE.Raycaster()
    const rayO = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z + rayOffset)
    const rayD = new THREE.Vector3(0, 0, -1).normalize()
    playerMovementRay.set(rayO, rayD)
    playerMovementRay.far = rayOffset * 2
    let intersects = playerMovementRay.intersectObjects(window.currentField.walkmeshMesh.children)

    // Sort by closest Z to nextPosition.z
    for (let i = 0; i < intersects.length; i++) {
        const intersect = intersects[i]
        intersect.distanceZ = Math.abs(intersect.distance - rayOffset)
    }
    intersects.sort((a, b) => a.distanceZ - b.distanceZ)
    // console.log('getNextPositionRaycast', nextPosition.z, intersects)

    if (intersects.length === 0) {
        return null
    } else if (!intersects[0].object.userData.movementAllowed) {
        return null
    } else {
        return intersects[0]
    }
}

const ladderMovement = (speed) => {
    const model = window.currentField.playableCharacter
    const ladder = model.userData.ladder

    const movementForwards = getActiveInputs()[ladder.keysForwards]
    const movementBackwards = getActiveInputs()[ladder.keysBackwards]

    model.mixer.clipAction(model.animations[ladder.animationId]).play()

    if (!movementForwards && !movementBackwards) {
        model.mixer.clipAction(model.animations[ladder.animationId]).paused = true
        return
    }

    const forwardsVector = new THREE.Vector3(ladder.to.x, ladder.to.y, ladder.to.z)
    const backwardsVector = new THREE.Vector3(ladder.from.x, ladder.from.y, ladder.from.z)
    let targetVector
    let timeScale
    if (movementForwards) {
        targetVector = forwardsVector
        timeScale = ladder.speed
    } else if (movementBackwards) {
        targetVector = backwardsVector
        timeScale = -ladder.speed
    }

    // Control animation
    model.mixer.clipAction(model.animations[ladder.animationId]).paused = false
    model.mixer.clipAction(model.animations[ladder.animationId]).timeScale = timeScale

    // Get next position
    const directionVector = new THREE.Vector3()
    directionVector.subVectors(targetVector, model.scene.position)
    directionVector.normalize()

    // TODO - Deal with axis based rotation for non-vertical ladders

    const nextPosition = model.scene.position.clone().addScaledVector(directionVector, speed * 0.3)

    // Set next position
    model.scene.position.x = nextPosition.x
    model.scene.position.y = nextPosition.y
    model.scene.position.z = nextPosition.z

    // Update camera position
    const relativeToCamera = calculateViewClippingPointFromVector3(nextPosition)
    adjustViewClipping(relativeToCamera.x, relativeToCamera.y)

    // Check for arrival
    const distanceToTarget = model.scene.position.distanceTo(targetVector)
    const distanceToOrigin = model.scene.position.distanceTo(backwardsVector)
    if (ladder.atStart) {
        if (distanceToOrigin > 0.001) {
            delete ladder.atStart
        }
    }
    // console.log('ladderMovement', movementForwards, movementBackwards, distanceToTarget, ladder.atStart, distanceToOrigin, movementBackwards !== ladder.atStart, model.scene.userData.triangleId)
    if (distanceToTarget <= 0.005 || (movementBackwards && ladder.atStart)) {
        model.mixer.stopAllAction()

        model.scene.rotation.x = THREE.Math.degToRad(90)
        model.scene.rotation.z = THREE.Math.degToRad(0)
        model.scene.up.set(0, 0, 1)

        for (let i = 0; i < window.currentField.gatewayLines.children.length; i++) {
            const gatewayLine = window.currentField.gatewayLines.children[i]
            const closestPointOnLine = new THREE.Line3(gatewayLine.geometry.vertices[0], gatewayLine.geometry.vertices[1]).closestPointToPoint(nextPosition, true, new THREE.Vector3())
            const distance = nextPosition.distanceTo(closestPointOnLine)
            if (distance < 0.005) {
                console.log('gateway hit')
                if (animNo === 2) { // Run
                    window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[2]).paused = true
                } else if (animNo === 1) { // Walk
                    window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[1]).paused = true
                }
                // Should probably also pause ALL animations including screen background loops like in the game
                gatewayTriggered(i)
                return
            }
        }

        console.log('ladderMovement: currentTriangle BEFORE', model.scene.userData.triangleId)
        updateCurrentTriangleId(model, nextPosition)
        console.log('ladderMovement: currentTriangle AFTER', model.scene.userData.triangleId)

        ladder.resolve()
    }
    updateCursorPositionHelpers()
}

const updateCurrentTriangleId = (model, nextPosition) => {
    let playerMovementRay = new THREE.Raycaster()
    const rayO = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z + 0.01)
    const rayD = new THREE.Vector3(0, 0, -1).normalize()
    playerMovementRay.set(rayO, rayD)
    playerMovementRay.far = 0.02
    let intersects = playerMovementRay.intersectObjects(window.currentField.walkmeshMesh.children)
    console.log('updateCurrentTriangleId', nextPosition, nextPosition, rayD, intersects)
    if (window.config.debug.showMovementHelpers) {
        window.currentField.movementHelpers.add(new THREE.ArrowHelper(playerMovementRay.ray.direction, playerMovementRay.ray.origin, playerMovementRay.far, 0xfff00ff)) // For debugging walkmesh raycaster
    }
    if (intersects.length === 0) {
        const closestTriangle = getClosestTriangleId(model, nextPosition)
        console.log('ladderMovement: updateCurrentTriangleId NO INTERSECT', intersects, closestTriangle)
        model.scene.userData.triangleId = closestTriangle
    } else {
        // const point = intersects[0].point
        model.scene.userData.triangleId = intersects[0].object.userData.triangleId
    }
    console.log('updateCurrentTriangleId is playablechar', model.userData.name, window.currentField.playableCharacter.userData.name,
        model.userData.name === window.currentField.playableCharacter.userData.name)
    if (model.userData.name === window.currentField.playableCharacter.userData.name) { // This should be the active character
        updateSavemapLocationFieldPosition(
            Math.round(nextPosition.x * 4096),
            Math.round(nextPosition.y * 4096),
            window.currentField.playableCharacter.scene.userData.triangleId,
            0) // Direction is inaccurate
    }



}
const getClosestTriangleId = (model, position) => {
    const triangles = window.currentField.data.walkmeshSection.triangles
    const closest = {
        distance: 100000,
        triangleId: -1
    }
    for (let i = 0; i < triangles.length; i++) {
        const triangle = triangles[i]
        for (let j = 0; j < triangle.vertices.length; j++) {
            const vertice = triangle.vertices[j]
            const vec = new THREE.Vector3(vertice.x / 4096, vertice.y / 4096, vertice.z / 4096)
            const distance = vec.distanceTo(model.scene.position)
            if (distance < closest.distance) {
                closest.distance = distance
                closest.triangleId = i
            }
        }
    }
    return closest.triangleId
}
export {
    updateFieldMovement,
    updateCurrentTriangleId
}