import * as THREE from '../../assets/threejs-r118/three.module.js'

import { getActiveInputs } from '../interaction/inputs.js'
import { startFieldRenderLoop, setupFieldCamera, setupDebugControls, initFieldDebug, setupViewClipping, adjustViewClipping, calculateViewClippingPointFromVector3 } from './field-scene.js'
import { loadFieldData, loadFieldBackground, loadModels, getFieldDimensions, getFieldBGLayerUrl } from './field-fetch-data.js'
import { gatewayTriggered, triggerTriggered, modelCollisionTriggered, setPlayableCharacterMovability } from './field-actions.js'
import { drawArrowPositionHelper, drawArrowPositionHelpers, updateCursorPositionHelpers } from './field-position-helpers.js'
import { initFieldKeypressActions } from './field-controls.js'
import { fadeIn, drawFader } from './field-fader.js'
import { showLoadingScreen } from '../loading/loading-module.js'
import { setupOrthoCamera } from './field-ortho-scene.js'
import { setupOrthoBgCamera } from './field-ortho-bg-scene.js'
import { initialiseOpLoops } from './field-op-loop.js'
import { resetTempBank } from '../data/savemap.js'
import { getPlayableCharacterName } from './field-op-codes-party-helper.js'
import { preLoadFieldMediaData } from '../media/media-module.js'
import { clearAllDialogs } from './field-dialog.js'
import { initBattleSettings } from './field-battle.js'

// Uses global states:
// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config

const drawWalkmesh = () => {

    // Draw triangles for walkmesh
    let triangles = window.currentField.data.walkmeshSection.triangles;
    let numTriangles = triangles.length;

    let walkmeshPositions = []
    window.currentField.walkmeshLines = new THREE.Group()
    for (let i = 0; i < numTriangles; i++) {
        let triangle = window.currentField.data.walkmeshSection.triangles[i];
        let accessor = window.currentField.data.walkmeshSection.accessors[i];
        let v0 = new THREE.Vector3(triangle.vertices[0].x / 4096, triangle.vertices[0].y / 4096, triangle.vertices[0].z / 4096);
        let v1 = new THREE.Vector3(triangle.vertices[1].x / 4096, triangle.vertices[1].y / 4096, triangle.vertices[1].z / 4096);
        let v2 = new THREE.Vector3(triangle.vertices[2].x / 4096, triangle.vertices[2].y / 4096, triangle.vertices[2].z / 4096);
        let addLine = function (scene, va, vb, acc) {
            let lineColor = (acc == -1 ? 0x4488cc : 0x888888)
            let material1 = new THREE.LineBasicMaterial({ color: lineColor })
            let geometry1 = new THREE.Geometry();
            geometry1.vertices.push(va);
            geometry1.vertices.push(vb);
            let line = new THREE.Line(geometry1, material1);
            window.currentField.walkmeshLines.add(line)
        }
        addLine(window.currentField.fieldScene, v0, v1, accessor[0]);
        addLine(window.currentField.fieldScene, v1, v2, accessor[1]);
        addLine(window.currentField.fieldScene, v2, v0, accessor[2]);

        // positions for mesh buffergeo
        walkmeshPositions.push(triangle.vertices[0].x / 4096, triangle.vertices[0].y / 4096, triangle.vertices[0].z / 4096)
        walkmeshPositions.push(triangle.vertices[1].x / 4096, triangle.vertices[1].y / 4096, triangle.vertices[1].z / 4096)
        walkmeshPositions.push(triangle.vertices[2].x / 4096, triangle.vertices[2].y / 4096, triangle.vertices[2].z / 4096)
    }
    window.currentField.fieldScene.add(window.currentField.walkmeshLines)


    // Draw mesh for walkmesh
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(walkmeshPositions, 3))
    let material = new THREE.MeshBasicMaterial({ color: 0x2194CE, opacity: 0.2, transparent: true, side: THREE.DoubleSide })
    window.currentField.walkmeshMesh = new THREE.Mesh(geometry, material)
    window.currentField.walkmeshMesh.visible = window.config.debug.showWalkmeshMesh
    window.currentField.fieldScene.add(window.currentField.walkmeshMesh)

    // Draw gateways

    window.currentField.positionHelpers = new THREE.Group()
    window.currentField.gatewayLines = new THREE.Group()
    for (let i = 0; i < window.currentField.data.triggers.gateways.length; i++) {
        const gateway = window.currentField.data.triggers.gateways[i]
        let lv0 = gateway.exitLineVertex1
        let lv1 = gateway.exitLineVertex2
        let v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096)
        let v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096)
        let material1 = new THREE.LineBasicMaterial({ color: 0xff0000 })
        let geometry1 = new THREE.Geometry()
        geometry1.vertices.push(v0)
        geometry1.vertices.push(v1)
        let line = new THREE.Line(geometry1, material1)
        window.currentField.gatewayLines.add(line)

        // Gateway position helpers
        // Not all position helper are the midpoint of the gateway, these are drawn
        // seperately with coordinates from window.currentField.data.triggers.gatewayArrows
        if (gateway.showArrow) {
            const gatewayPositionHelperVector = new THREE.Vector3().lerpVectors(v0, v1, 0.5)
            drawArrowPositionHelper(gatewayPositionHelperVector, 1)
        }
    }
    window.currentField.fieldScene.add(window.currentField.gatewayLines)

    // Draw triggers / doors
    window.currentField.triggerLines = new THREE.Group()
    window.currentField.data.triggers.triggers = window.currentField.data.triggers.triggers.filter(t =>
        !(t.cornerVertex1.x === 0 && t.cornerVertex1.y === 0 && t.cornerVertex1.z === 0))
    // for some reason there are a lots of 0,0,0 triggers, remove them for now
    for (let trigger of window.currentField.data.triggers.triggers) {
        let lv0 = trigger.cornerVertex1;
        let lv1 = trigger.cornerVertex2;
        let v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096);
        let v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096);
        let material1 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        let geometry1 = new THREE.Geometry();
        geometry1.vertices.push(v0);
        geometry1.vertices.push(v1);
        let line = new THREE.Line(geometry1, material1);
        line.userData.triggered = false
        window.currentField.triggerLines.add(line);
        if (lv0.x !== 0) {
            // console.log('Door', lv0, v0, '&', lv1, v1)
        }
    }
    window.currentField.fieldScene.add(window.currentField.triggerLines)
    if (!window.config.debug.showWalkmeshLines) {
        window.currentField.walkmeshLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.gatewayLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.triggerLines.visible = window.config.debug.showWalkmeshLines
    }
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
const placeModelsDebug = () => {

    // console.log('window.currentField.data.script.entities', window.currentField.data.script.entities)
    // console.log('window.currentField.models', window.currentField.models)

    window.anim.axesHelper = new THREE.AxesHelper(0.1);
    window.anim.axesHelper.visible = false
    window.currentField.fieldScene.add(window.anim.axesHelper);

    for (let i = 0; i < window.currentField.data.script.entities.length; i++) {
        const entity = window.currentField.data.script.entities[i]
        // console.log('entity', entity)
        let fieldModelId
        let fieldModel
        let playableCharacter
        for (let script of entity.scripts) {

            // console.log('script', entity, script)
            placeOperationLoop:
            for (let op of script.ops) {
                // console.log('ops', entity, script, op, op.op)
                if (op.op === 'CHAR') {
                    fieldModelId = op.n
                    fieldModel = window.currentField.models[fieldModelId]
                    fieldModel.userData.modelId = fieldModelId
                    fieldModel.userData.entityId = i
                    console.log('CHAR', fieldModel)
                }
                if (op.op === 'XYZI') {

                    // console.log('fieldModelId', fieldModelId)
                    // fieldModel = window.currentField.models[fieldModelId]
                    // fieldModel.userData.modelId = fieldModelId
                    // fieldModel.userData.entityId = i
                    // console.log('fieldModel', fieldModel)
                    const scaleDownValue = getModelScaleDownValue()
                    if (fieldModelId !== undefined) {
                        // console.log('ops', entity, op, fieldModelId, fieldModel, fieldModelScene)
                        fieldModel.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
                        fieldModel.scene.position.set(op.x / 4096, op.y / 4096, op.z / 4096)
                        fieldModel.scene.rotation.x = THREE.Math.degToRad(90)
                        fieldModel.scene.up.set(0, 0, 1)

                        // console.log('fieldModel.scene', fieldModel.scene, op.x, op.y, op.z)
                        if (fieldModel.animations.length > 0) {
                            const modelHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), fieldModel.scene.position, 0.1, 0xffff00)
                            modelHelper.visible = window.config.debug.showModelHelpers
                            window.currentField.fieldScene.add(modelHelper)
                            // console.log('Place model', fieldModel.animations[fieldModel.animations.length - 1], fieldModel.mixer)
                            fieldModel.mixer.clipAction(fieldModel.animations[fieldModel.animations.length - 1]).play() // Just temporary for testing
                        }
                        // console.log('fieldModel.scene', entity.entityName, fieldModelId, op.i, fieldModel.scene, fieldModel.scene.rotation)
                        window.currentField.fieldScene.add(fieldModel.scene)

                        // playableCharacter = true // Temp to test scenes

                        // fieldModel.boxHelper = new THREE.BoxHelper(fieldModel.scene, 0xffff00)
                        // window.currentField.fieldScene.add(fieldModel.boxHelper)

                    }
                    // break placeOperationLoop
                }
                if (op.op === 'DIR' && fieldModel) {
                    let deg = 360 * op.d / 255
                    // console.log('DIR', op, deg)
                    // triggers.header.controlDirection
                    fieldModel.scene.rotateY(THREE.Math.degToRad(deg)) // Is this in degrees or 0-255 range?

                    // This is just for quick debugging, op codes will be used properly later
                    fieldModel.scene.userData.placeModeInitialDirection = deg // Purely to reverse this if needed
                    if (playableCharacter) {
                        window.currentField.playableCharacter = fieldModel

                        // console.log('window.currentField.playableCharacter', fieldModel)
                        setPlayableCharacterMovability(true)
                    }
                    // fieldModelScene.rotateY(THREE.Math.degToRad(window.currentField.data.triggers.header.controlDirection))
                    break placeOperationLoop
                }
                if (op.op === 'PC') {
                    // console.log('PC', op)
                    // if (op.c === 0) { // Cloud
                    //     console.log('cloud is playable char')
                    fieldModel.userData.playerId = op.c
                    fieldModel.userData.playerName = getPlayableCharacterName(op.c)
                    playableCharacter = true
                }
            }
        }
    }
    console.log('placeModelsDebug: END', window.currentField.models)
}


const updateFieldMovement = (delta) => {

    // Get active player
    if (!window.currentField.playableCharacter) {
        return
    }

    // Can player move?
    if (!window.currentField.playableCharacter.scene.userData.playableCharacterMovability) {
        return
    }

    let speed = 0.10 * delta// run - Need to set these from the placed character model. Maybe these can be defaults?
    let animNo = 2 // run

    if (window.config.debug.runByDefault === getActiveInputs().x) { // Adjust to walk
        speed = speed * 0.18
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
    let intersects = playerMovementRay.intersectObjects([window.currentField.walkmeshMesh])
    // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
    // window.currentField.fieldScene.add(new THREE.ArrowHelper(playerMovementRay.ray.direction, playerMovementRay.ray.origin, playerMovementRay.far, 0xff00ff)) // For debugging walkmesh raycaster
    if (intersects.length === 0) {
        // Player is off walkmap
        window.currentField.playableCharacter.mixer.stopAllAction()
        return
    } else {
        const point = intersects[0].point
        // Adjust nextPosition height to to adjust for any slopes
        nextPosition.z = point.z
    }



    // Detect gateways
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
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[0]).stop() // Probably a more efficient way to change these animations
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[1]).stop()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[2]).play()
    } else if (animNo === 1) { // Walk
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[0]).stop()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[2]).stop()
        window.currentField.playableCharacter.mixer.clipAction(window.currentField.playableCharacter.animations[1]).play()
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

const drawBG = async (x, y, z, distance, bgImgUrl, group, visible, userData) => {
    let vH = Math.tan(THREE.Math.degToRad(window.currentField.fieldCamera.getEffectiveFOV() / 2)) * distance * 2
    let vW = vH * window.currentField.fieldCamera.aspect
    // console.log('drawBG', distance, '->', vH, vW)
    let geometry = new THREE.PlaneGeometry(vW, vH, 0)

    let texture = new THREE.TextureLoader().load(bgImgUrl)
    texture.magFilter = THREE.NearestFilter
    // let planeMaterial = new THREE.MeshLambertMaterial({ map: texture })
    let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    let plane = new THREE.Mesh(geometry, material);
    plane.position.set(x, y, z)
    plane.lookAt(window.currentField.fieldCamera.position)
    plane.setRotationFromEuler(window.currentField.fieldCamera.rotation)
    plane.visible = visible
    plane.userData = userData

    if (userData.typeTrans === 1) {
        // console.log('typeTrans', userData.typeTrans, bgImgUrl)
        plane.material.blending = THREE.AdditiveBlending // md1_2, mds5_1
        // plane.visible = false
    } else if (userData.typeTrans === 2) {
        // console.log('typeTrans', userData.typeTrans, bgImgUrl)
        plane.material.blending = THREE.SubtractiveBlending // Not right at all. // jtempl, trnad_1, bugin1a
        // plane.visible = false
    } else if (userData.typeTrans === 3) {
        // console.log('typeTrans', userData.typeTrans, bgImgUrl)
        plane.material.blending = THREE.AdditiveBlending // md1_2, mds5_1 // 25% of colours are cut in bg image already
    }
    group.add(plane)
}

const placeBG = async (fieldName) => {

    let assetDimensions = await getFieldDimensions(fieldName)
    // Create meta-data
    window.currentField.metaData = {
        assetDimensions: assetDimensions,
        width: assetDimensions.width / window.config.sizing.width,
        height: assetDimensions.height / window.config.sizing.height,
        bgScale: 1, // assetDimensions.height / window.config.sizing.height,
        adjustedFOV: window.currentField.fieldCamera.fov * (assetDimensions.height / window.config.sizing.height),
        cameraUnknown: window.currentField.data.cameraSection.cameras[0].unknown,
        modelScale: window.currentField.data.model.header.modelScale,
        scaleDownValue: getModelScaleDownValue(),
        numModels: window.currentField.data.model.header.numModels,
        layersAvailable: window.currentField.backgroundData !== undefined,
        bgZDistance: 1024,
        fieldCoordinates: { x: 0, y: 0 } // Defaults, will be updated

    }
    // console.log('window.currentField.metaData', window.currentField.metaData)

    // Rescale renderer and cameras for scene
    window.anim.renderer.setSize(assetDimensions.width * window.config.sizing.factor * window.currentField.metaData.bgScale, assetDimensions.height * window.config.sizing.factor * window.currentField.metaData.bgScale)
    window.currentField.fieldCamera.aspect = assetDimensions.width / assetDimensions.height
    window.currentField.fieldCamera.fov = window.currentField.metaData.adjustedFOV
    window.currentField.fieldCamera.lookAt(window.currentField.cameraTarget)
    window.currentField.fieldCamera.updateProjectionMatrix()
    window.currentField.debugCamera.aspect = assetDimensions.width / assetDimensions.height
    window.currentField.debugCamera.fov = window.currentField.metaData.adjustedFOV
    window.currentField.fieldCamera.lookAt(window.currentField.cameraTarget)
    window.currentField.debugCamera.updateProjectionMatrix()



    // Draw backgrounds
    // let lookAtDistance = window.currentField.fieldCamera.position.distanceTo(window.currentField.cameraTarget)
    // console.log('lookAtDistance', lookAtDistance, lookAtDistance * 4096)
    let intendedDistance = 1
    window.currentField.backgroundLayers = new THREE.Group()
    for (let i = 0; i < window.currentField.backgroundData.length; i++) {
        const layer = window.currentField.backgroundData[i]
        if (layer.depth === 0) {
            layer.depth = 1
        }

        if (layer.z <= 10) { // z = doesn't show, just set it slightly higher for now
            layer.z = layer.z + 10
        }
        // If layer containers a param, make sure it sits infront of its default background - Not entirely sure if this is right, need to check with different triggers and switches
        if (layer.param > 0) {
            layer.z = layer.z - 1
        }
        let visible = layer.param === 0 // By default hide all non zero params, field op codes will how them

        // const bgDistance = (intendedDistance * (layer.z / 4096)) // First attempt at ratios, not quite right but ok
        const bgDistance = layer.z / window.currentField.metaData.bgZDistance // First attempt at ratios, not quite right but ok
        // console.log('Layer', layer, bgDistance)

        const userData = {
            z: layer.z,
            param: layer.param,
            state: layer.state,
            typeTrans: layer.typeTrans
        }
        let bgVector = new THREE.Vector3().lerpVectors(window.currentField.fieldCamera.position, window.currentField.cameraTarget, bgDistance)
        let url = getFieldBGLayerUrl(fieldName, layer.fileName)
        drawBG(bgVector.x, bgVector.y, bgVector.z, bgDistance, url, window.currentField.backgroundLayers, visible, userData)
    }
    window.currentField.fieldScene.add(window.currentField.backgroundLayers)
}
const positionPlayableCharacterFromTransition = () => {
    if (window.currentField.playableCharacter && window.currentField.playableCharacterInitData) {
        const initData = window.currentField.playableCharacterInitData
        console.log('init player from field transition', initData)
        window.currentField.playableCharacter.scene.position.set(
            initData.position.x / 4096,
            initData.position.y / 4096,
            initData.position.z / 4096)
        // Need to implement directionFacing (annoying in debug mode at this point as I have to reverse previous placeModel deg value)
        const deg = window.currentField.playableCharacter.scene.userData.placeModeInitialDirection
        window.currentField.playableCharacter.scene.rotateY(THREE.Math.degToRad(-deg))
        const relativeToCamera = calculateViewClippingPointFromVector3(window.currentField.playableCharacter.scene.position)
        console.log('positionPlayableCharacterFromTransition', adjustViewClipping, relativeToCamera.x, relativeToCamera.y)
        adjustViewClipping(relativeToCamera.x, relativeToCamera.y)
    }
}

const setMenuEnabled = (enabled) => { window.currentField.menuEnabled = enabled }
const isMenuEnabled = () => { return window.currentField.menuEnabled }

const loadField = async (fieldName, playableCharacterInitData) => {


    // Reset field values
    window.currentField = {
        name: fieldName,
        data: undefined,
        backgroundData: undefined,
        metaData: undefined,
        models: undefined,
        playableCharacter: undefined,
        fieldScene: undefined,
        fieldCamera: undefined,
        fieldCameraHelper: undefined,
        debugCamera: undefined,
        walkmeshMesh: undefined,
        walkmeshLines: undefined,
        gatewayLines: undefined,
        triggerLines: undefined,
        backgroundLayers: undefined,
        backgroundVideo: undefined,
        positionHelpers: undefined,
        positionHelpersEnabled: true,
        cameraTarget: undefined,
        fieldFader: undefined,
        playableCharacterInitData: playableCharacterInitData,
        media: undefined,
        menuEnabled: true
    }
    showLoadingScreen()
    resetTempBank()
    window.currentField.data = await loadFieldData(fieldName)
    window.currentField.media = await preLoadFieldMediaData()
    // console.log('field-module -> window.currentField.data', window.currentField.data)
    // console.log('field-module -> window.anim', window.anim)
    window.currentField.cameraTarget = setupFieldCamera()
    await setupOrthoBgCamera()
    await setupOrthoCamera()
    drawFader()
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
    drawArrowPositionHelpers()
    if (window.config.debug.debugModeNoOpLoops) {
        placeModelsDebug()
    }

    positionPlayableCharacterFromTransition()
    if (window.config.debug.active) {
        await initFieldDebug(loadField)
    }
    await fadeIn()
    initFieldKeypressActions()
    if (!window.config.debug.debugModeNoOpLoops) {
        await initialiseOpLoops()
    }
}


export {
    loadField,
    updateFieldMovement,
    setMenuEnabled,
    isMenuEnabled
}