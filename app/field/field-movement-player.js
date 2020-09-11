import * as THREE from '../../assets/threejs-r118/three.module.js'
import { getActiveInputs } from '../interaction/inputs.js'
import { adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { gatewayTriggered, triggerTriggered, lineMoveTriggered, lineGoTriggered, lineAwayTriggered, modelCollisionTriggered } from './field-actions.js'
import { updateCursorPositionHelpers } from './field-position-helpers.js'
import { updateSavemapLocationFieldPosition, updateSavemapLocationFieldLeader } from '../data/savemap-alias.js'


const updateFieldMovement = (delta) => {

    // Get active player
    if (!window.currentField.playableCharacter) {
        return
    }

    // Can player move?
    if (!window.currentField.playableCharacterCanMove) {
        return
    }
    if (window.currentField.setPlayableCharacterIsInteracting) {
        return
    }

    let speed = (window.currentField.data.model.header.modelScale / 5120) * delta// run - Need to set these from the placed character model. Maybe these can be defaults?
    let animNo = 2 // run

    if (window.config.debug.runByDefault === getActiveInputs().x) { // Adjust to walk
        speed = speed * 0.20
        animNo = 1
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
    // Set player in direction 
    let directionRadians = THREE.Math.degToRad(direction)
    let directionVector = new THREE.Vector3(Math.sin(directionRadians), Math.cos(directionRadians), 0)
    // console.log('directionVector', directionVector, window.currentField.data.triggers.header.controlDirection)
    let nextPosition = window.currentField.playableCharacter.scene.position.clone().addScaledVector(directionVector, speed) // Show probably factor in window.anim.clock delta so its smoother
    window.currentField.playableCharacter.scene.lookAt(new THREE.Vector3().addVectors(window.currentField.playableCharacter.scene.position, directionVector)) // Doesn't work perfectly
    // window.currentField.fieldScene.add(new THREE.ArrowHelper(directionVector, window.currentField.playableCharacter.scene.position, 0.1, 0xff00ff))

    // window.currentField.playableCharacter.boxHelper.update()

    // Adjust for climbing slopes and walking off walkmesh
    // Create a ray at next position (higher z, but pointing down) to find correct z position
    let playerMovementRay = new THREE.Raycaster()
    const rayO = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z + 0.01)
    const rayD = new THREE.Vector3(0, 0, -1).normalize()
    playerMovementRay.set(rayO, rayD)
    playerMovementRay.far = 0.02
    let intersects = playerMovementRay.intersectObjects(window.currentField.walkmeshMesh.children)
    // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
    if (window.config.debug.showMovementHelpers) {
        window.currentField.movementHelpers.add(new THREE.ArrowHelper(playerMovementRay.ray.direction, playerMovementRay.ray.origin, playerMovementRay.far, 0xfff00ff)) // For debugging walkmesh raycaster
    }
    if (intersects.length === 0) {
        // Player is off walkmap
        window.currentField.playableCharacter.mixer.stopAllAction()
        return
    } else if (!intersects[0].object.userData.movementAllowed) {
        // Triangle locked through IDLCK
        window.currentField.playableCharacter.mixer.stopAllAction()
        return
    } else {
        const point = intersects[0].point
        // Adjust nextPosition height to to adjust for any slopes
        nextPosition.z = point.z
        window.currentField.playableCharacter.scene.userData.triangleId = intersects[0].object.userData.triangleId
        updateSavemapLocationFieldPosition(
            Math.round(nextPosition.x * 4096),
            Math.round(nextPosition.y * 4096),
            window.currentField.playableCharacter.scene.userData.triangleId,
            direction - window.currentField.data.triggers.header.controlDirectionDegrees)
        updateSavemapLocationFieldLeader(window.currentField.playableCharacter.userData.characterName)
        // console.log('player movement', nextPosition.z, intersects[0].object.userData.triangleId)
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
    if (window.currentField.lineTriggersEnabled) {
        for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
            const line = window.currentField.lineLines.children[i]
            const closestPointOnLine = new THREE.Line3(line.geometry.vertices[0], line.geometry.vertices[1]).closestPointToPoint(nextPosition, true, new THREE.Vector3())
            const distance = nextPosition.distanceTo(closestPointOnLine)
            const entityId = line.userData.entityId
            if (distance < 0.01) {
                if (line.userData.triggered === false) {
                    line.userData.triggered = true
                    lineMoveTriggered(entityId, line)
                }
            } else {
                if (line.userData.triggered === true) {
                    line.userData.triggered = false
                    lineGoTriggered(entityId, line)
                }
            }
            if (distance < 0.05) { // TODO - Guess
                if (line.userData.triggeredAway === false) {
                    line.userData.triggeredAway = true
                }
            } else {
                if (line.userData.triggeredAway === true) {
                    line.userData.triggeredAway = false
                    lineAwayTriggered(entityId)
                }
            }
        }
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
        if (distance < 0.015) {
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
        if (distance < 0.012) {
            if (fieldModel.scene.userData.closeToCollide === false) {
                fieldModel.scene.userData.closeToCollide = true
                console.log('Close to collide', i, fieldModel.scene.userData.closeToCollide, fieldModel)
                modelCollisionTriggered(i)
            }
            // Stop movement
            window.currentField.playableCharacter.mixer.stopAllAction()
            return
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
    if (window.currentField.fieldCamera.userData.followUser) {
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

export {
    updateFieldMovement
}