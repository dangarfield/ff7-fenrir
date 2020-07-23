import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

import Stats from 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/controls/OrbitControls.js';
// import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
// import { VertexNormalsHelper } from './jsm/helpers/VertexNormalsHelper.js';
import { GLTFLoader } from 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js'

let container, stats, gui;

let walkmeshRenderer;
let walkmeshScene, walkmeshCamera, walkmeshControls, walkmeshCameraHelper
let bgScene, bgCamera
let walkmeshMesh, walkmeshLines
let clock
let axesHelper
let debugCamera, debugControls;

let currentFieldData, currentFieldModels

let sizing = {
    width: 320,
    height: 240,
    factor: 2
}
var options = {
    field: 'cosin4',
    debug: {
        showDebugCamera: false,
        showWalkmeshMesh: true,
        showWalkmeshLines: true,
        showAxes: false
    }
};

// const KUJATA_BASE = 'https://raw.githack.com/picklejar76/kujata-data/master' // TODO, move to CDN requests
const KUJATA_BASE = '/kujata-data'



const loadField = async (fieldName) => {
    const res = await fetch(`${KUJATA_BASE}/data/field/flevel.lgp/${fieldName}.json`)
    const fieldData = await res.json()
    return fieldData
}

const setupCamera = () => {
    var ffCamera = currentFieldData.cameraSection.cameras[0]; // TODO: Support multiple cameras

    let baseFOV = (2 * Math.atan(240.0 / (2.0 * ffCamera.zoom))) * 57.29577951;
    console.log('ffCamera', ffCamera)
    console.log('baseFOV', baseFOV)
    walkmeshRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    walkmeshRenderer.setSize(sizing.width * sizing.factor, sizing.height * sizing.factor)
    walkmeshRenderer.autoClear = false
    walkmeshScene = new THREE.Scene()
    walkmeshScene.background = new THREE.Color(0xffffff);
    // walkmeshCamera = new THREE.PerspectiveCamera(baseFOV, sizing.width / sizing.height, 0.001 / 4096, 100000 / 4096);
    // walkmeshCamera = new THREE.PerspectiveCamera(baseFOV, sizing.width / sizing.height, 0.001 / 4096, 100000 / 4096);
    walkmeshCamera = new THREE.PerspectiveCamera(baseFOV, sizing.width / sizing.height, 0.001, 1000);
    clock = new THREE.Clock();

    let camAxisXx = ffCamera.xAxis.x / 4096.0;
    let camAxisXy = ffCamera.xAxis.y / 4096.0;
    let camAxisXz = ffCamera.xAxis.z / 4096.0;

    let camAxisYx = -ffCamera.yAxis.x / 4096.0;
    let camAxisYy = -ffCamera.yAxis.y / 4096.0;
    let camAxisYz = -ffCamera.yAxis.z / 4096.0;

    let camAxisZx = ffCamera.zAxis.x / 4096.0;
    let camAxisZy = ffCamera.zAxis.y / 4096.0;
    let camAxisZz = ffCamera.zAxis.z / 4096.0;

    let camPosX = ffCamera.position.x / 4096.0;
    let camPosY = -ffCamera.position.y / 4096.0;
    let camPosZ = ffCamera.position.z / 4096.0;

    let tx = -(camPosX * camAxisXx + camPosY * camAxisYx + camPosZ * camAxisZx);
    let ty = -(camPosX * camAxisXy + camPosY * camAxisYy + camPosZ * camAxisZy);
    let tz = -(camPosX * camAxisXz + camPosY * camAxisYz + camPosZ * camAxisZz);

    // gluLookAt(eyeX, eyeY, eyeZ, centerX,        centerY,        centerZ,        upX,       upY,       upZ)
    // gluLookAt(tx,   ty,   tz,   tx + camAxisZx, ty + camAxisZy, tz + camAxisZz, camAxisYx, camAxisYy, camAxisYz);
    walkmeshCamera.position.x = tx;
    walkmeshCamera.position.y = ty;
    walkmeshCamera.position.z = tz;
    walkmeshCamera.up.set(camAxisYx, camAxisYy, camAxisYz)
    console.log('up', camAxisYx, camAxisYy, camAxisYz)
    walkmeshCamera.lookAt(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz)

    walkmeshCamera.updateProjectionMatrix()
    walkmeshScene.add(walkmeshCamera);
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 50).normalize();
    walkmeshScene.add(light);
    var ambientLight = new THREE.AmbientLight(0x404040); // 0x404040 = soft white light
    walkmeshScene.add(ambientLight);

    let cameraTarget = new THREE.Vector3(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz);

    console.log('Camera position', walkmeshCamera.position.x, walkmeshCamera.position.y, walkmeshCamera.position.z, 'facing', tx + camAxisZx, ty + camAxisZy, tz + camAxisZz, 'up', camAxisYx, camAxisYy, camAxisYz)


    setupDebugCamera()
    walkmeshCameraHelper = new THREE.CameraHelper(walkmeshCamera)
    walkmeshCameraHelper.visible = true
    walkmeshScene.add(walkmeshCameraHelper)

    // let viewport = walkmeshRenderer.getCurrentViewport()
    // console.log('viewport', viewport)
    // let viewOffset = walkmeshCamera.view
    // let offsetX = (-viewport.w / 2) - (viewport.w / 19.5)
    // let offsetY = (viewport.w / 30)
    // if (viewOffset) {
    //     offsetX = viewOffset.offsetX
    //     offsetY = viewOffset.offsetY
    // }
    // let offsetScale = 1.705
    // walkmeshCamera.setViewOffset(viewport.w / offsetScale, viewport.z / offsetScale, offsetX, offsetY, viewport.z, viewport.w)
    // walkmeshCamera.setViewOffset(sizing.width * sizing.factor, sizing.height * sizing.factor, 0, 0, sizing.width * sizing.factor, sizing.height * sizing.factor)
    walkmeshScene.add(walkmeshCamera)


    return cameraTarget
}

const animateCamera = () => {
    if (debugCamera) {
        debugCamera.visible = options.debug.showDebugCamera
        walkmeshCameraHelper.visible = options.debug.showDebugCamera

        debugControls.enableZoom = true //options.debug.showDebugCamera
        debugControls.enableRotate = true //options.debug.showDebugCamera
        debugControls.enablePan = true //options.debug.showDebugCamera
    }
}

const setupDebugCamera = () => {
    debugCamera = walkmeshCamera.clone()

}

const drawWalkmesh = () => {

    // Draw triangles for walkmesh
    let triangles = currentFieldData.walkmeshSection.triangles;
    let numTriangles = triangles.length;

    let walkmeshPositions = []
    walkmeshLines = new THREE.Group()
    for (let i = 0; i < numTriangles; i++) {
        let triangle = currentFieldData.walkmeshSection.triangles[i];
        let accessor = currentFieldData.walkmeshSection.accessors[i];
        var v0 = new THREE.Vector3(triangle.vertices[0].x / 4096, triangle.vertices[0].y / 4096, triangle.vertices[0].z / 4096);
        var v1 = new THREE.Vector3(triangle.vertices[1].x / 4096, triangle.vertices[1].y / 4096, triangle.vertices[1].z / 4096);
        var v2 = new THREE.Vector3(triangle.vertices[2].x / 4096, triangle.vertices[2].y / 4096, triangle.vertices[2].z / 4096);
        var addLine = function (scene, va, vb, acc) {
            var lineColor = (acc == -1 ? 0x4488cc : 0x888888);
            // if (i - 1 === 248 || i - 1 === 262 || i - 1 === 256 || i - 1 === 292
            //     || i - 1 === 254 || i - 1 === 57 || i - 1 === 282 || i - 1 === 268
            //     || i - 1 === 246 || i - 1 === 88 || i - 1 === 282 || i - 1 === 268) {
            //     lineColor = 0xffff00
            // }
            var material1 = new THREE.LineBasicMaterial({ color: lineColor });
            var geometry1 = new THREE.Geometry();
            geometry1.vertices.push(va);
            geometry1.vertices.push(vb);
            var line = new THREE.Line(geometry1, material1);
            walkmeshLines.add(line)
        }
        addLine(walkmeshScene, v0, v1, accessor[0]);
        addLine(walkmeshScene, v1, v2, accessor[1]);
        addLine(walkmeshScene, v2, v0, accessor[2]);

        // positions for mesh buffergeo
        walkmeshPositions.push(triangle.vertices[0].x / 4096, triangle.vertices[0].y / 4096, triangle.vertices[0].z / 4096)
        walkmeshPositions.push(triangle.vertices[1].x / 4096, triangle.vertices[1].y / 4096, triangle.vertices[1].z / 4096)
        walkmeshPositions.push(triangle.vertices[2].x / 4096, triangle.vertices[2].y / 4096, triangle.vertices[2].z / 4096)
    }



    // Draw mesh for walkmesh
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(walkmeshPositions, 3))
    var material = new THREE.MeshBasicMaterial({ color: 0x2194CE, opacity: 0.2, transparent: true, side: THREE.DoubleSide })
    walkmeshMesh = new THREE.Mesh(geometry, material)
    walkmeshMesh.visible = options.debug.showWalkmeshMesh

    walkmeshScene.add(walkmeshMesh)

    // Draw gateways
    for (let gateway of currentFieldData.triggers.gateways) {
        var lv0 = gateway.exitLineVertex1;
        var lv1 = gateway.exitLineVertex2;
        var v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096);
        var v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096);
        var material1 = new THREE.LineBasicMaterial({ color: 0xff0000 });
        var geometry1 = new THREE.Geometry();
        geometry1.vertices.push(v0);
        geometry1.vertices.push(v1);
        var line = new THREE.Line(geometry1, material1);
        walkmeshLines.add(line);
    }

    // Draw triggers / doors
    for (let trigger of currentFieldData.triggers.triggers) {
        var lv0 = trigger.cornerVertex1;
        var lv1 = trigger.cornerVertex2;
        var v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096);
        var v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096);
        var material1 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        var geometry1 = new THREE.Geometry();
        geometry1.vertices.push(v0);
        geometry1.vertices.push(v1);
        var line = new THREE.Line(geometry1, material1);
        walkmeshLines.add(line);
        if (lv0.x !== 0) {
            console.log('Door', lv0, v0, '&', lv1, v1)
        }
    }

    walkmeshScene.add(walkmeshLines)
}
const setupControls = (cameraTarget) => {
    walkmeshControls = new OrbitControls(walkmeshCamera, walkmeshRenderer.domElement);
    walkmeshControls.target = cameraTarget
    walkmeshControls.panSpeed = 1 / 4;
    walkmeshControls.rotateSpeed = 1 / 4;
    walkmeshControls.zoomSpeed = 1 / 4;
    walkmeshControls.update()

    walkmeshControls.enableZoom = false
    walkmeshControls.enableRotate = false
    walkmeshControls.enablePan = false
}
const setupDebugControls = (cameraTarget) => {
    debugControls = new OrbitControls(debugCamera, walkmeshRenderer.domElement);
    debugControls.target = cameraTarget
    debugControls.panSpeed = 1 / 4;
    debugControls.rotateSpeed = 1 / 4;
    debugControls.zoomSpeed = 1 / 4;
    debugControls.update()

    // if (options.debug.showDebugCamera) {
    debugControls.enableZoom = options.debug.showDebugCamera
    debugControls.enableRotate = options.debug.showDebugCamera
    debugControls.enablePan = options.debug.showDebugCamera
    // }
    animateCamera()
}
const setupRenderer = () => {
    var walkmeshContainerElement = document.getElementById("container");

    // if this is not our first time here, remove the previous walkmesh display
    while (walkmeshContainerElement.firstChild) {
        walkmeshContainerElement.removeChild(walkmeshContainerElement.firstChild);
    }

    walkmeshContainerElement.appendChild(walkmeshRenderer.domElement);
    walkmeshRenderer.render(walkmeshScene, walkmeshCamera);

    var walkmeshTick = function () {
        // if (!app || app.isDestroyed) {
        //     console.log("stopping walkmeshTick()", app);
        //     return;
        // } else {
        //     console.log('walkmeshTick()', app)
        // }
        // Note: Even if app.isAnimationEnabled == false, we must still
        // keep calling appTick(), to let the OrbitControls adjust the
        // camera if the user moves it.
        requestAnimationFrame(walkmeshTick);
        var delta = clock.getDelta();
        if (debugControls) {
            debugControls.update(delta);
        }
        /*
        if (app.mixer) {
          if (app.isAnimationEnabled) {
            app.mixer.update(delta);
          }
        }
        */
        if (walkmeshRenderer && walkmeshScene && walkmeshCamera) {
            // console.log('render')
            walkmeshRenderer.clear()
            walkmeshRenderer.render(walkmeshScene, options.debug.showDebugCamera === true ? debugCamera : walkmeshCamera)
            walkmeshRenderer.clearDepth()
            // walkmeshRenderer.render(bgScene, bgCamera)
        }
        stats.update();
        walkmeshCameraHelper.update()
    }

    walkmeshTick();

}
const showStats = () => {
    stats = new Stats()
    container.appendChild(stats.dom)
}
const getFieldList = async () => {
    let chaptersRes = await fetch(`${KUJATA_BASE}/metadata/chapters.json`)
    let chapters = await chaptersRes.json()
    console.log('chapters', chapters)
    let fields = {}
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i]
        console.log('chapter', chapter)
        for (let j = 0; j < chapter.fieldNames.length; j++) {
            const fieldName = chapter.fieldNames[j];
            fields[fieldName] = fieldName
        }
    }
    return fields
}
const showDebug = async () => {
    let fields = await getFieldList()
    gui = new GUI({ width: 250 })
    let fieldGUI = gui.addFolder('Field Data')
    fieldGUI.add(options, 'field', fields).onChange(function () {
        console.log('options', options, '-> fieldID')
        initField(options.field)
    }).setValue(fields.nrthmk)//cosin3


    let debugGUI = gui.addFolder('Debug')
    debugGUI.add(options.debug, 'showDebugCamera').onChange(function () {
        console.log('options', options, '-> showDebugCamera')
        animateCamera()
    }).setValue(options.debug.showDebugCamera)
    debugGUI.add(options.debug, 'showWalkmeshMesh').onChange(function () {
        console.log('options', options, '-> showWalkmeshMesh')
        walkmeshMesh.visible = options.debug.showWalkmeshMesh
    })
    debugGUI.add(options.debug, 'showWalkmeshLines').onChange(function () {
        console.log('options', options, '-> showWalkmeshLines', walkmeshLines)
        walkmeshLines.visible = options.debug.showWalkmeshLines
    })
    debugGUI.add(options.debug, 'showAxes').onChange(() => {
        console.log('options', options, '-> showAxes')
        axesHelper.visible = options.debug.showAxes
    })


    animateCamera()
}

const loadModel = (loader, path) => {
    return new Promise((resolve, reject) => {
        loader.load(path, data => resolve(data), null, reject);
    })
}


const loadModels = async () => {
    let fieldModels = []
    for (let modelLoader of currentFieldData.model.modelLoaders) {
        const animGLTFRes = await fetch(`${KUJATA_BASE}/data/field/char.lgp/${modelLoader.hrcId}.gltf`)
        modelLoader.animGLTF = await animGLTFRes.json()
        console.log('modelLoader', modelLoader)

        let loader = new GLTFLoader().setPath(`${KUJATA_BASE}/data/field/char.lgp/`)
        let gltf = await loadModel(loader, `${modelLoader.hrcId}.gltf`)
        gltf.userData['name'] = modelLoader.name
        gltf.userData['hrcId'] = modelLoader.hrcId
        gltf.userData['globalLight'] = modelLoader.globalLight
        gltf.userData['animations'] = modelLoader.animations

        console.log('Loaded GLTF', gltf)
        modelLoader.gltf = gltf
        // walkmeshScene.add(gltf)
        fieldModels.push(gltf)
    }
    return fieldModels
}
const placeModels = (mode) => {
    console.log('currentFieldData.script.entities', currentFieldData.script.entities)
    console.log('currentFieldModels', currentFieldModels)

    // let sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1)
    // sphere.position.set(0, 0, 0)
    // var geometry = new THREE.SphereGeometry(50, 32, 32);
    // var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    // var sphere = new THREE.Mesh(geometry, material);
    // sphere.position.set(0.2745535969734192, -0.2197556495666504, 0.0959818959236145)
    // walkmeshScene.add(sphere);

    axesHelper = new THREE.AxesHelper(0.1);
    axesHelper.visible = false
    walkmeshScene.add(axesHelper);

    for (let entity of currentFieldData.script.entities) {
        // console.log('entity', entity)
        let fieldModelId
        let fieldModel
        for (let script of entity.scripts) {

            // console.log('script', entity, script)
            placeOperationLoop:
            for (let op of script.ops) {
                // console.log('ops', entity, script, op, op.op)
                if (op.op === 'CHAR') {
                    fieldModelId = op.n
                }
                if (op.op === 'XYZI') {

                    console.log('fieldModelId', fieldModelId)
                    fieldModel = currentFieldModels[fieldModelId]

                    const scaleDownValue = 1 / (512 * 2)
                    if (fieldModelId !== undefined) {
                        console.log('ops', entity, op, fieldModelId, fieldModel, fieldModel.scene)
                        fieldModel.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
                        fieldModel.scene.position.set(op.x / 4096, op.y / 4096, op.z / 4096)
                        fieldModel.scene.rotateX(THREE.Math.degToRad(90))
                        walkmeshScene.add(fieldModel.scene)
                    }
                    // break placeOperationLoop
                }
                if (op.op === 'DIR' && fieldModel) {
                    console.log('DIR', op)
                    fieldModel.scene.rotateY(THREE.Math.degToRad(156 - op.d))
                    break placeOperationLoop
                }
            }
        }

        // var lv0 = trigger.cornerVertex1;
        // var lv1 = trigger.cornerVertex2;
        // var v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096);
        // var v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096);
        // var material1 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        // var geometry1 = new THREE.Geometry();
        // geometry1.vertices.push(v0);
        // geometry1.vertices.push(v1);
        // var line = new THREE.Line(geometry1, material1);
        // walkmeshScene.add(line);
    }
}
const setupKeys = () => {
    let viewportPanSpeed = 1
    document.addEventListener("keydown", (event) => {
        var keyCode = event.which;
        console.log('keyCode', event.which)

        // walkmeshCamera.setViewOffset(viewport.width, viewport.height, 0, 0, viewport.width, viewport.height);

        // let viewport = walkmeshRenderer.getCurrentViewport()
        // console.log('viewport', viewport)
        // let viewOffset = walkmeshCamera.view
        // let offsetX = (-viewport.w / 2) - (viewport.w / 19.5)
        // let offsetY = (viewport.w / 30)
        // if (viewOffset) {
        //     offsetX = viewOffset.offsetX
        //     offsetY = viewOffset.offsetY
        // }
        // console.log('viewOffset', viewOffset)
        if (keyCode == 27) {
            console.log('toggle')
            $('#container').toggle()
        }
        if (keyCode == 37) { // Left key
            // offsetX = offsetX - viewportPanSpeed
        } else if (keyCode == 39) { // Right key
            // offsetX = offsetX + viewportPanSpeed
        } else if (keyCode == 38) { // Up key
            // offsetY = offsetY - viewportPanSpeed
        } else if (keyCode == 40) { // Down key
            // offsetY = offsetY + viewportPanSpeed
        }
        // walkmeshRenderer.setViewport(viewport)

        let offsetScale = 1.705
        // walkmeshCamera.setViewOffset(viewport.w / offsetScale, viewport.z / offsetScale, offsetX, offsetY, viewport.z, viewport.w)

    }, false)

}

const imageDimensions = file => new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = img
        resolve({ width, height })
    }
    img.src = file
})
const drawBG = async (x, y, z, distance, bg) => {
    let vH = Math.tan(THREE.Math.degToRad(walkmeshCamera.getEffectiveFOV() / 2)) * distance * 2
    let vW = vH * walkmeshCamera.aspect
    console.log('drawBG', distance, '->', vH, vW)
    var geometry = new THREE.PlaneGeometry(vW, vH, 0)
    var texture = new THREE.TextureLoader().load(`${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${bg}.png`)
    // var planeMaterial = new THREE.MeshLambertMaterial({ map: texture })
    var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.set(x, y, z)
    plane.lookAt(walkmeshCamera.position)
    plane.setRotationFromEuler(walkmeshCamera.rotation)
    walkmeshScene.add(plane)
}

const placeBG = async (cameraTarget) => {
    let meta = await imageDimensions(`${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${options.field}.png`)

    const imageScaleFactor = {
        width: meta.width / sizing.width,
        height: meta.height / sizing.height,
        bgScale: meta.height / sizing.height,
        adjustedFOV: walkmeshCamera.fov * (meta.height / sizing.height)
    }
    console.log('imageScaleFactor', imageScaleFactor)

    $('.holder, field-back').width(meta.width * sizing.factor)
    $('.holder, field-back').height(meta.height * sizing.factor)


    console.log('existing FOV', walkmeshCamera.fov, debugCamera.fov, walkmeshCamera.fov * imageScaleFactor.bgScale)
    // let fov = baseFOV * meta.height * sizing.factor
    // console.log('fov', baseFOV, fov)
    // walkmeshCamera.fov = baseFOV
    // debugCamera.fov = baseFOV
    // walkmeshRenderer.setSize(meta.width * sizing.factor * imageScaleFactor.width, meta.height * sizing.factor * imageScaleFactor.height)
    // walkmeshRenderer.setSize(meta.width * sizing.factor, meta.height * sizing.factor)
    walkmeshRenderer.setSize(meta.width * sizing.factor * imageScaleFactor.bgScale, meta.height * sizing.factor * imageScaleFactor.bgScale)
    walkmeshCamera.aspect = meta.width / meta.height
    walkmeshCamera.fov = imageScaleFactor.adjustedFOV
    walkmeshCamera.lookAt(cameraTarget)
    walkmeshCamera.updateProjectionMatrix()
    debugCamera.aspect = meta.width / meta.height
    debugCamera.fov = imageScaleFactor.adjustedFOV
    walkmeshCamera.lookAt(cameraTarget)
    debugCamera.updateProjectionMatrix()


    console.log('image meta', meta, 'imageScaleFactor.bgScale', imageScaleFactor.bgScale)

    console.log('walkmeshCamera.position', walkmeshCamera.position)
    console.log('walkmeshCamera', walkmeshCamera)
    console.log('walkmeshCamera target', cameraTarget)
    let bgCenter = cameraTarget.clone().sub(walkmeshCamera.position)
    console.log('bgCenter', bgCenter)
    let bgCenterHalf = bgCenter.divideScalar(2)
    console.log('bgCenter half', bgCenterHalf)
    var lookAtDistance = walkmeshCamera.position.distanceTo(cameraTarget)

    console.log('lookAtDistance', lookAtDistance, lookAtDistance * 4096)
    let intendedDistance = 10
    let intendedDistanceRatio = intendedDistance / lookAtDistance
    let intendedVector3 = new THREE.Vector3().lerpVectors(walkmeshCamera.position, cameraTarget, intendedDistanceRatio)

    console.log('intendedDistance', intendedDistance, intendedDistanceRatio, intendedVector3)
    drawBG(intendedVector3.x, intendedVector3.y, intendedVector3.z, intendedDistance, options.field)

    const n = 3
    for (let i = 1; i <= n; i++) {
        let r = (intendedDistance / lookAtDistance) * (i / (n + 1))
        // console.log('r', r)
        let intendedVector3 = new THREE.Vector3().lerpVectors(walkmeshCamera.position, cameraTarget, r)
        // drawBG(intendedVector3.x, intendedVector3.y, intendedVector3.z, r, options.field)
    }


    $('.field-back').empty()
    let bgEle = `
        <img class="field layer0" src="${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${options.field}.png"
            style="width:${meta.width * sizing.factor}px; height:${meta.height * sizing.factor}px; transform: scale(${imageScaleFactor.bgScale}) translate(0,0);"
            />
    `
    // $('.field-back').append(bgEle)

    // Add debug values
    // gui.__folders['Field Data'].remove('fov')
    let guiToDelete = []
    if (gui.__folders['Field Data'].__controllers.length > 0) {
        console.log('gui', gui.__folders['Field Data'].__controllers.length)
        for (let i = 0; i < gui.__folders['Field Data'].__controllers.length; i++) {
            const controller = gui.__folders['Field Data'].__controllers[i]
            console.log('controller', controller, controller.property)
            if (controller.property !== 'field') {
                guiToDelete.push(controller)
            }
        }
    }
    for (let i = 0; i < guiToDelete.length; i++) {
        const controller = guiToDelete[i];
        gui.__folders['Field Data'].remove(controller)
        console.log('gui - remove ->', controller.property)
    }

    gui.__folders['Field Data'].add(walkmeshCamera, 'fov').min(0).max(90).step(0.001).listen().onChange((val) => {
        console.log('debug fov', val)
        walkmeshCamera.fov = val
        walkmeshCamera.updateProjectionMatrix()
    })
    gui.__folders['Field Data'].add(meta, 'width')
    gui.__folders['Field Data'].add(meta, 'height')
    gui.__folders['Field Data'].add(walkmeshCamera, 'aspect')
    gui.__folders['Field Data'].add(imageScaleFactor, 'bgScale').min(0.5).max(4).step(0.001).onChange((val) => {
        console.log('debug bgScale', val)
        walkmeshRenderer.setSize(meta.width * sizing.factor * imageScaleFactor.bgScale, meta.height * sizing.factor * imageScaleFactor.bgScale)
    })

}

const initField = async (fieldName) => {
    currentFieldData = await loadField(fieldName)
    currentFieldModels = await loadModels()
    let cameraTarget = setupCamera()
    drawWalkmesh()
    placeModels()
    placeBG(cameraTarget)
    setupControls(cameraTarget)
    setupDebugControls(cameraTarget)
    setupRenderer()
    setupKeys()
}
const init = async () => {

    container = document.getElementById('container');
    showStats()
    await showDebug()

    // initField('cosin4')
}

init()
