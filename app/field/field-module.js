import * as THREE from '../../assets/threejs-r118/three.module.js'

import { startFieldRenderLoop, setupFieldCamera, setupDebugControls, initFieldDebug, setupViewClipping } from './field-scene.js'
import { loadFieldData, loadFieldBackground, loadModels, getFieldDimensions, getFieldBGLayerUrl } from './field-fetch-data.js'
import { drawArrowPositionHelper, drawArrowPositionHelpers } from './field-position-helpers.js'
import { initFieldKeypressActions } from './field-controls.js'
import { fadeIn, drawFader } from './field-fader.js'
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

// Uses global states:
// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config

const drawWalkmesh = () => {

    // Draw triangles for walkmesh
    let triangles = window.currentField.data.walkmeshSection.triangles;
    let numTriangles = triangles.length;


    window.currentField.walkmeshLines = new THREE.Group()
    window.currentField.walkmeshMesh = new THREE.Group()
    const walkmeshMaterial = new THREE.MeshBasicMaterial({ color: 0x2194CE, opacity: 0.2, transparent: true, side: THREE.DoubleSide })
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
        let walkmeshPositions = []
        walkmeshPositions.push(triangle.vertices[0].x / 4096, triangle.vertices[0].y / 4096, triangle.vertices[0].z / 4096)
        walkmeshPositions.push(triangle.vertices[1].x / 4096, triangle.vertices[1].y / 4096, triangle.vertices[1].z / 4096)
        walkmeshPositions.push(triangle.vertices[2].x / 4096, triangle.vertices[2].y / 4096, triangle.vertices[2].z / 4096)
        let walkmeshGeo = new THREE.BufferGeometry();
        walkmeshGeo.setAttribute('position', new THREE.Float32BufferAttribute(walkmeshPositions, 3))
        const walkmeshMeshTriangle = new THREE.Mesh(walkmeshGeo, walkmeshMaterial)
        walkmeshMeshTriangle.userData.triangleId = i
        walkmeshMeshTriangle.userData.movementAllowed = true
        window.currentField.walkmeshMesh.add(walkmeshMeshTriangle)
    }
    window.currentField.fieldScene.add(window.currentField.walkmeshLines)


    // Draw mesh for walkmesh
    // let geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', new THREE.Float32BufferAttribute(walkmeshPositions, 3))
    // let material = new THREE.MeshBasicMaterial({ color: 0x2194CE, opacity: 0.2, transparent: true, side: THREE.DoubleSide })
    // window.currentField.walkmeshMesh = new THREE.Mesh(geometry, material)
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


    // Placeholder for OP CODE based lineLines
    window.currentField.lineLines = new THREE.Group()
    window.currentField.fieldScene.add(window.currentField.lineLines)

    if (!window.config.debug.showWalkmeshLines) {
        window.currentField.walkmeshLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.gatewayLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.triggerLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.lineLines.visible = window.config.debug.showWalkmeshLines
    }

    window.currentField.movementHelpers = new THREE.Group()
    window.currentField.fieldScene.add(window.currentField.movementHelpers)
    if (!window.config.debug.showMovementHelpers) {
        window.currentField.movementHelpers.visible = window.config.debug.showMovementHelpers
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
        menuEnabled: true,
        gatewayTriggersEnabled: true,
        lineTriggersEnabled: true,
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

    if (window.config.debug.active) {
        await initFieldDebug(loadField)
        debugLogOpCodeCompletionForField()
    }
    initFieldKeypressActions()
    if (!window.config.debug.debugModeNoOpLoops) {
        await initialiseOpLoops()
    }
    await fadeIn()
}


export {
    loadField,
    setMenuEnabled,
    isMenuEnabled
}