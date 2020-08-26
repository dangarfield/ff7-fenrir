import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

import { GUI } from '../../assets/threejs-r118/jsm/libs/dat.gui.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../../assets/threejs-r118/jsm/controls/OrbitControls.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/controls/OrbitControls.js';
import TWEEN from '../../assets/tween.esm.js'

import { updateArrowPositionHelpers } from './field-position-helpers.js'
import { updateFieldMovement } from './field-module.js'
import { getFieldList } from './field-fetch-data.js'
import { getActiveInputs } from '../interaction/inputs.js'
import { scene as orthoFrontScene, camera as orthoFrontCamera } from './field-ortho-scene.js'

// Uses global states:
// let currentField = window.currentField // Handle this better in the future
// let anim = window.anim
// let config = window.config


const renderLoop = function () {
    // console.log('renderLoop frame')
    if (window.anim.activeScene !== 'field') {
        console.log('Stopping field renderLoop')
        return
    }
    requestAnimationFrame(renderLoop);
    let delta = window.anim.clock.getDelta();
    if (window.currentField.debugCameraControls) {
        window.currentField.debugCameraControls.update(delta);
    }
    if (window.currentField.models) {
        for (let i = 0; i < window.currentField.models.length; i++) {
            let model = window.currentField.models[i]
            model.mixer.update(delta) // Render character window.animations
        }
    }
    TWEEN.update()
    updateFieldMovement(delta) // Ideally this should go in a separate loop
    updateArrowPositionHelpers()
    if (window.anim.renderer && window.currentField.fieldScene && window.currentField.fieldCamera) {
        // console.log('render')
        let activeCamera = window.config.debug.showDebugCamera === true ? window.currentField.debugCamera : window.currentField.fieldCamera
        if (window.config.raycast.active) {
            raycasterFieldRendering(activeCamera)
        }
        window.anim.renderer.clear()
        window.anim.renderer.render(window.currentField.fieldScene, activeCamera)

        window.anim.renderer.clearDepth()
        window.anim.renderer.render(orthoFrontScene, orthoFrontCamera)
        // window.anim.renderer.render(bgScene, bgCamera)
    }
    if (window.config.debug.active) {
        window.anim.stats.update()
    }
    if (window.currentField.fieldCameraHelper) {
        window.currentField.fieldCameraHelper.update()
    }
}
const startFieldRenderLoop = () => {
    if (window.anim.activeScene !== 'field') {
        window.anim.activeScene = 'field'
        setupRaycasting()
        renderLoop()
    }
}

const setupRaycasting = async () => {
    if (window.config.raycast.active) {
        raycaster = new THREE.Raycaster()
        mouse = new THREE.Vector2()
        let geometry = new THREE.SphereGeometry(0.002, 32, 32)
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        window.config.raycast.raycasterHelper = new THREE.Mesh(geometry, material)
        window.config.raycast.raycasterHelper.visible = false
        window.currentField.fieldScene.add(window.config.raycast.raycasterHelper)
        window.addEventListener('mousemove', function (event) {
            let canvasBounds = window.anim.renderer.getContext().canvas.getBoundingClientRect();
            window.config.raycast.mouse.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            window.config.raycast.mouse.y = - ((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }, false)
    }
}
const raycasterFieldRendering = (camera) => {
    window.config.raycast.raycaster.setFromCamera(window.config.raycast.mouse, camera)
    let intersects = window.config.raycast.raycaster.intersectObjects([window.currentField.walkmeshMesh])//window.currentField.walkmeshMesh//window.currentField.fieldScene.children
    // console.log('window.currentField.walkmeshMesh', window.currentField.walkmeshMesh)
    if (intersects.length === 0) {
        window.config.raycast.raycasterHelper.visible = false
    } else {
        window.config.raycast.raycasterHelper.visible = true
    }
    for (let i = 0; i < intersects.length; i++) {
        // intersects[i].object.material.color.set(0xff0000)
        const point = intersects[i].point
        // window.config.raycast.raycasterHelper.visible = true
        window.config.raycast.raycasterHelper.position.set(point.x, point.y, point.z)
        console.log('intersect point', point, window.config.raycast.raycasterHelper.position)
    }
}
const setupFieldCamera = () => {
    // console.log('field-scene -> window.currentField', window.currentField, window.currentField)
    let ffCamera = window.currentField.data.cameraSection.cameras[0] // TODO: Support multiple cameras
    let baseFOV = (2 * Math.atan(240.0 / (2.0 * ffCamera.zoom))) * 57.29577951
    window.currentField.fieldScene = new THREE.Scene()
    window.currentField.fieldScene.background = new THREE.Color(0x000000)
    window.currentField.fieldCamera = new THREE.PerspectiveCamera(baseFOV, window.config.sizing.width / window.config.sizing.height, 0.001, 1000); // near and far is 0.001 / 4096, 100000 / 4096 in makou reactor
    window.anim.clock = new THREE.Clock();

    let camAxisXx = ffCamera.xAxis.x / 4096.0
    let camAxisXy = ffCamera.xAxis.y / 4096.0
    let camAxisXz = ffCamera.xAxis.z / 4096.0

    let camAxisYx = -ffCamera.yAxis.x / 4096.0
    let camAxisYy = -ffCamera.yAxis.y / 4096.0
    let camAxisYz = -ffCamera.yAxis.z / 4096.0

    let camAxisZx = ffCamera.zAxis.x / 4096.0
    let camAxisZy = ffCamera.zAxis.y / 4096.0
    let camAxisZz = ffCamera.zAxis.z / 4096.0

    let camPosX = ffCamera.position.x / 4096.0
    let camPosY = -ffCamera.position.y / 4096.0
    let camPosZ = ffCamera.position.z / 4096.0

    let tx = -(camPosX * camAxisXx + camPosY * camAxisYx + camPosZ * camAxisZx)
    let ty = -(camPosX * camAxisXy + camPosY * camAxisYy + camPosZ * camAxisZy)
    let tz = -(camPosX * camAxisXz + camPosY * camAxisYz + camPosZ * camAxisZz)

    window.currentField.fieldCamera.position.x = tx
    window.currentField.fieldCamera.position.y = ty
    window.currentField.fieldCamera.position.z = tz
    window.currentField.fieldCamera.up.set(camAxisYx, camAxisYy, camAxisYz)
    // console.log('up', camAxisYx, camAxisYy, camAxisYz)
    window.currentField.fieldCamera.lookAt(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz)

    window.currentField.fieldCamera.updateProjectionMatrix()
    window.currentField.fieldScene.add(window.currentField.fieldCamera)
    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 0, 50).normalize()
    window.currentField.fieldScene.add(light)
    let ambientLight = new THREE.AmbientLight(0x404040) // 0x404040 = soft white light
    window.currentField.fieldScene.add(ambientLight)

    let cameraTarget = new THREE.Vector3(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz)

    setupFieldDebugCamera()
    window.currentField.fieldCameraHelper = new THREE.CameraHelper(window.currentField.fieldCamera)
    window.currentField.fieldCameraHelper.visible = true
    window.currentField.fieldScene.add(window.currentField.fieldCameraHelper)
    window.currentField.fieldScene.add(window.currentField.fieldCamera)


    return cameraTarget
}


const activateDebugCamera = () => {
    if (window.currentField.debugCamera) {
        window.currentField.debugCamera.visible = window.config.debug.showDebugCamera
        window.currentField.fieldCameraHelper.visible = window.config.debug.showDebugCamera

        window.currentField.debugCameraControls.enableZoom = true //window.config.debug.showDebugCamera
        window.currentField.debugCameraControls.enableRotate = true //window.config.debug.showDebugCamera
        window.currentField.debugCameraControls.enablePan = true //window.config.debug.showDebugCamera
    }
}

const setupFieldDebugCamera = () => {
    window.currentField.debugCamera = window.currentField.fieldCamera.clone()
}
const setupDebugControls = () => {
    window.currentField.debugCameraControls = new OrbitControls(window.currentField.debugCamera, window.anim.renderer.domElement);
    window.currentField.debugCameraControls.target = window.currentField.cameraTarget
    window.currentField.debugCameraControls.panSpeed = 1 / 4;
    window.currentField.debugCameraControls.rotateSpeed = 1 / 4;
    window.currentField.debugCameraControls.zoomSpeed = 1 / 4;
    window.currentField.debugCameraControls.update()

    // if (window.config.debug.showDebugCamera) {
    window.currentField.debugCameraControls.enableZoom = window.config.debug.showDebugCamera
    window.currentField.debugCameraControls.enableRotate = window.config.debug.showDebugCamera
    window.currentField.debugCameraControls.enablePan = window.config.debug.showDebugCamera
    // }
    activateDebugCamera()
}

const initFieldDebug = async (loadFieldCB) => {
    // Clear all existing debug info
    if (window.anim.gui) {
        window.anim.gui.destroy()
    }
    window.anim.gui = new GUI({ width: 250, hideable: false })

    let fieldGUI = window.anim.gui.addFolder('Field Data')
    // if (window.currentField === undefined) { window.currentField = { name: 'cosin4' } } // Just set this like this, it will be overridden on init
    let fields = await getFieldList()
    fieldGUI.add(window.currentField, 'name', fields).onChange((val) => {
        console.log('window.currentField.name ->', val)
        loadFieldCB(val)
    }).listen()

    fieldGUI.add(window.currentField.fieldCamera, 'fov').min(0).max(90).step(0.001).listen().onChange((val) => {
        // console.log('debug fov', val)
        window.currentField.fieldCamera.fov = val
        window.currentField.fieldCamera.updateProjectionMatrix()
    })
    fieldGUI.add(window.currentField.metaData.assetDimensions, 'width')
    fieldGUI.add(window.currentField.metaData.assetDimensions, 'height')
    fieldGUI.add(window.currentField.fieldCamera, 'aspect')
    fieldGUI.add(window.currentField.metaData, 'bgScale').min(0.5).max(4).step(0.001).onChange((val) => {
        // console.log('debug bgScale', val)
        window.anim.renderer.setSize(window.currentField.metaData.assetDimensions.width * window.config.sizing.factor * window.currentField.metaData.bgScale, window.currentField.metaData.assetDimensions.height * window.config.sizing.factor * window.currentField.metaData.bgScale)
    })
    fieldGUI.add(window.currentField.metaData, 'cameraUnknown')
    fieldGUI.add(window.currentField.metaData, 'modelScale')
    fieldGUI.add(window.currentField.metaData, 'numModels')
    fieldGUI.add(window.currentField.metaData, 'scaleDownValue').step(0.00001)
    fieldGUI.add(window.currentField.metaData, 'layersAvailable')
    fieldGUI.add(window.currentField.metaData.fieldCoordinates, 'x').min(0).max(window.currentField.metaData.assetDimensions.width).step(1).listen().onChange((val) => adjustViewClipping(val, window.currentField.metaData.fieldCoordinates.y))
    fieldGUI.add(window.currentField.metaData.fieldCoordinates, 'y').min(0).max(window.currentField.metaData.assetDimensions.height).step(1).listen().onChange((val) => adjustViewClipping(window.currentField.metaData.fieldCoordinates.x, val))
    fieldGUI.open()

    let debugGUI = window.anim.gui.addFolder('Debug')
    // debugGUI.add(window.config.sizing, 'factor').min(1).max(3).step(1).onChange((val) => {
    //     console.log('window.config.sizing.factor', window.config.sizing.factor, window.currentField.name)
    //     initField(window.currentField.name)
    //     if (window.config.sizing.factor !== val) {
    //         console.log('window.config.sizing.factor', val)
    //     }
    // })
    debugGUI.add(window.config.debug, 'debugModeNoOpLoops').onChange((isDebugMode) => {
        if (isDebugMode) {
            window.location.href = window.location.href + '?debug'
        } else {
            window.location.href = window.location.href.replace('?debug', '')
        }
    })
    debugGUI.add(window.config.debug, 'showDebugCamera').onChange(function () {
        activateDebugCamera()
    }).setValue(window.config.debug.showDebugCamera)
    debugGUI.add(window.config.debug, 'showWalkmeshMesh').onChange(function () {
        window.currentField.walkmeshMesh.visible = window.config.debug.showWalkmeshMesh
    })
    debugGUI.add(window.config.debug, 'showWalkmeshLines').onChange(function () {
        window.currentField.walkmeshLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.gatewayLines.visible = window.config.debug.showWalkmeshLines
        window.currentField.triggerLines.visible = window.config.debug.showWalkmeshLines
    })
    debugGUI.add(window.config.debug, 'showBackgroundLayers').onChange(function () {
        window.currentField.backgroundLayers.visible = window.config.debug.showBackgroundLayers
    })
    debugGUI.add(window.config.debug, 'showModelHelpers').onChange(function () {
        const arrowHelpers = window.currentField.fieldScene.children.filter(e => e.type === 'ArrowHelper')
        arrowHelpers.map(a => a.visible = window.config.debug.showModelHelpers)
        console.log('window.currentField.fieldScene.children', arrowHelpers)
        // window.currentField.backgroundLayers.visible = window.config.debug.showModelHelpers
    })
    debugGUI.add(window.config.debug, 'showAxes').onChange(() => {
        window.anim.axesHelper.visible = window.config.debug.showAxes
    })
    debugGUI.open()

    let inputsGUI = window.anim.gui.addFolder('Inputs')
    inputsGUI.add(window.config.debug, 'showInstructions').listen().onChange((val) => {
        console.log('showInstructions', val)
        // A lot of tiding required here but we'll do this properly another day, just for quick debug for now
        document.querySelector('.keyboard-instructions .modal .close-button').addEventListener('click', () => {
            console.log('keyboard-instructions close', window.config.debug.showInstructions)
            window.config.debug.showInstructions = false
            document.querySelector('.keyboard-instructions .modal').classList.remove('show-modal')
        })
        if (val) {
            document.querySelector('.keyboard-instructions .modal').classList.add('show-modal')
        } else {
            document.querySelector('.keyboard-instructions .modal').classList.remove('show-modal')
        }
        // console.log('modal', modal)
    })
    inputsGUI.add(getActiveInputs(), 'up').listen()
    inputsGUI.add(getActiveInputs(), 'right').listen()
    inputsGUI.add(getActiveInputs(), 'down').listen()
    inputsGUI.add(getActiveInputs(), 'left').listen()
    inputsGUI.add(getActiveInputs(), 'x').listen()
    inputsGUI.add(getActiveInputs(), 'o').listen()
    inputsGUI.add(getActiveInputs(), 'square').listen()
    inputsGUI.add(getActiveInputs(), 'triangle').listen()
    inputsGUI.add(getActiveInputs(), 'l1').listen()
    inputsGUI.add(getActiveInputs(), 'l2').listen()
    inputsGUI.add(getActiveInputs(), 'r1').listen()
    inputsGUI.add(getActiveInputs(), 'r2').listen()
    inputsGUI.add(getActiveInputs(), 'select').listen()
    inputsGUI.add(getActiveInputs(), 'start').listen()

    activateDebugCamera()

}
const setupViewClipping = async () => {
    window.anim.renderer.setSize(window.config.sizing.width * window.config.sizing.factor, window.config.sizing.height * window.config.sizing.factor)

    // Need to set a default, this is centre, should really be triggered from the player character being active on the screen
    const x = window.currentField.metaData.assetDimensions.width / 2
    const y = window.currentField.metaData.assetDimensions.height / 2
    adjustViewClipping(x, y) // Set initial view, will be overridden on movement and op codes, probably also when we place the playable character
    // console.log('window.currentField.metaData', window.currentField.metaData)
}
const calculateViewClippingPointFromVector3 = (v) => {
    let relativeToCamera = new THREE.Vector3(v.x, v.y, v.z).project(window.currentField.debugCamera) // Debug camera has whole view
    relativeToCamera.x = (relativeToCamera.x + 1) * (window.currentField.metaData.assetDimensions.width * 1) / 2
    relativeToCamera.y = - (relativeToCamera.y - 1) * (window.currentField.metaData.assetDimensions.height * 1) / 2
    relativeToCamera.z = 0
    // console.log('calculateViewClippingPointFromVector3', v, relativeToCamera)

    // If the character is near the edge of the screen, calculate the correct x, y for the viewport
    let adjustedX = relativeToCamera.x - (window.config.sizing.width / 2)
    let adjustedY = relativeToCamera.y - (window.config.sizing.height / 2)
    let maxAdjustedX = 2 * (window.currentField.metaData.assetDimensions.width / 2 - (window.config.sizing.width / 2))
    let maxAdjustedY = 2 * (window.currentField.metaData.assetDimensions.height / 2 - (window.config.sizing.height / 2))

    if (adjustedX < 0) {
        relativeToCamera.x = 0 + (window.config.sizing.width / 2)
    } else if (adjustedX > maxAdjustedX) {
        relativeToCamera.x = maxAdjustedX + (window.config.sizing.width / 2)
    }
    if (adjustedY < 0) {
        relativeToCamera.y = 0 + (window.config.sizing.height / 2)
    } else if (adjustedY > maxAdjustedY) {
        relativeToCamera.y = maxAdjustedY + (window.config.sizing.height / 2)
    }
    // console.log('maxAdjustedX', maxAdjustedX)
    // console.log('maxAdjustedY', maxAdjustedY)
    // console.log('adjustedX', adjustedX, relativeToCamera)
    // console.log('adjustedY', adjustedY, relativeToCamera)


    return relativeToCamera
}
const adjustViewClipping = async (x, y) => {
    // console.log('x', x, '->', adjustedX, 'y', y, '->', adjustedY)
    window.currentField.metaData.fieldCoordinates.x = x
    window.currentField.metaData.fieldCoordinates.y = y
    let adjustedX = x - (window.config.sizing.width / 2)
    let adjustedY = y - (window.config.sizing.height / 2)
    // Note: Logic to get the edge of scene screen offsets have been moved to calculateViewClippingPointFromVector3(...)
    // console.log('adjustViewClipping', 'x', x, '->', adjustedX, 'y', y, '->', adjustedY)
    window.currentField.fieldCamera.setViewOffset(
        window.currentField.metaData.assetDimensions.width * window.config.sizing.factor,
        window.currentField.metaData.assetDimensions.height * window.config.sizing.factor,
        adjustedX * window.config.sizing.factor,
        adjustedY * window.config.sizing.factor,
        window.config.sizing.width * window.config.sizing.factor,
        window.config.sizing.height * window.config.sizing.factor,
    )
}
export {
    startFieldRenderLoop,
    setupFieldCamera,
    setupDebugControls,
    initFieldDebug,
    setupViewClipping,
    calculateViewClippingPointFromVector3,
    adjustViewClipping
}