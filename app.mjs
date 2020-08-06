import * as THREE from './assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

import Stats from './assets/threejs-r118/jsm/libs/stats.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';
import { GUI } from './assets/threejs-r118/jsm/libs/dat.gui.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from './assets/threejs-r118/jsm/controls/OrbitControls.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './assets/threejs-r118/jsm/loaders/GLTFLoader.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js'
// import { GLTFLoader } from 'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js'
import { SkeletonUtils } from './assets/threejs-r118/jsm/utils/SkeletonUtils.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/utils/SkeletonUtils.js'

let container, stats, gui;

let walkmeshRenderer;
let walkmeshScene, walkmeshCamera, walkmeshControls, walkmeshCameraHelper

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()
let raycasterHelper

let walkmeshMesh, walkmeshLines, backgroundLayers
let clock
let axesHelper
let debugCamera, debugControls;

let currentFieldData, currentFieldBackgroundData, currentFieldMetaData, currentFieldModels, currentPlayableCharacter

let input = {
    up: false,
    right: false,
    down: false,
    left: false,
    x: false,
    o: false,
    square: false,
    triangle: false,
    l1: false,
    l2: false,
    r1: false,
    r2: false,
    select: false,
    start: false
}
let sizing = {
    width: 320,
    height: 240,
    factor: 2
}
var options = {
    field: 'md1_1',
    debug: {
        showDebugCamera: false,
        showWalkmeshMesh: false,
        showWalkmeshLines: true,
        showBackgroundLayers: true,
        showAxes: false,
        runByDefault: true
    }
};

const KUJATA_BASE = window.location.host.includes('localhost') ? 'kujata-data' : 'https://kujata-data-dg.netlify.app'



const loadField = async (fieldName) => {
    const res = await fetch(`${KUJATA_BASE}/data/field/flevel.lgp/${fieldName}.json`)
    const fieldData = await res.json()
    return fieldData
}
const loadFieldBackground = async (fieldName) => {
    const bgMetaRes = await fetch(`${KUJATA_BASE}/metadata/background-layers/${fieldName}/${fieldName}.json`)
    const bgMetaData = await bgMetaRes.json()
    console.log('bgMetaData', bgMetaData)
    return bgMetaData
}

const setupCamera = () => {
    var ffCamera = currentFieldData.cameraSection.cameras[0]; // TODO: Support multiple cameras

    let baseFOV = (2 * Math.atan(240.0 / (2.0 * ffCamera.zoom))) * 57.29577951;
    // console.log('ffCamera', ffCamera)
    // console.log('baseFOV', baseFOV)
    walkmeshRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    walkmeshRenderer.setSize(sizing.width * sizing.factor, sizing.height * sizing.factor)
    walkmeshRenderer.autoClear = false
    walkmeshScene = new THREE.Scene()
    walkmeshScene.background = new THREE.Color(0x000000);
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
    // console.log('up', camAxisYx, camAxisYy, camAxisYz)
    walkmeshCamera.lookAt(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz)

    walkmeshCamera.updateProjectionMatrix()
    walkmeshScene.add(walkmeshCamera);
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 50).normalize();
    walkmeshScene.add(light);
    var ambientLight = new THREE.AmbientLight(0x404040); // 0x404040 = soft white light
    walkmeshScene.add(ambientLight);

    let cameraTarget = new THREE.Vector3(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz);

    // console.log('Camera position', walkmeshCamera.position.x, walkmeshCamera.position.y, walkmeshCamera.position.z, 'facing', tx + camAxisZx, ty + camAxisZy, tz + camAxisZz, 'up', camAxisYx, camAxisYy, camAxisYz)


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
            // console.log('Door', lv0, v0, '&', lv1, v1)
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
const setupRaycasting = async () => {
    var geometry = new THREE.SphereGeometry(0.002, 32, 32)
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    raycasterHelper = new THREE.Mesh(geometry, material)
    raycasterHelper.visible = false
    walkmeshScene.add(raycasterHelper)
    window.addEventListener('mousemove', function (event) {
        let canvasBounds = walkmeshRenderer.getContext().canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
        mouse.y = - ((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;

        // mouse.x = ((event.clientX - walkmeshRenderer.domElement.offsetLeft) / walkmeshRenderer.domElement.clientWidth) * 2 - 1;
        // mouse.y = - ((event.clientY - walkmeshRenderer.domElement.offsetTop) / walkmeshRenderer.domElement.clientHeight) * 2 + 1;
        // console.log('mouse', mouse)
    }, false)
}
const raycasterRendering = (camera) => {

    raycaster.setFromCamera(mouse, camera)
    let intersects = raycaster.intersectObjects([walkmeshMesh])//walkmeshMesh//walkmeshScene.children
    // console.log('walkmeshMesh', walkmeshMesh)
    if (intersects.length === 0) {
        raycasterHelper.visible = false
    } else {
        raycasterHelper.visible = true
    }
    for (var i = 0; i < intersects.length; i++) {
        // intersects[i].object.material.color.set(0xff0000)
        const point = intersects[i].point
        // raycasterHelper.visible = true
        raycasterHelper.position.set(point.x, point.y, point.z)
        console.log('intersect point', point, raycasterHelper.position)
    }
}
const setupRenderer = () => {
    var walkmeshContainerElement = document.getElementById("container");

    // if this is not our first time here, remove the previous walkmesh display
    while (walkmeshContainerElement.firstChild) {
        walkmeshContainerElement.removeChild(walkmeshContainerElement.firstChild);
    }

    walkmeshContainerElement.appendChild(walkmeshRenderer.domElement);
    setupRaycasting()
    walkmeshRenderer.render(walkmeshScene, walkmeshCamera);

    var walkmeshTick = function () {
        // if (!app || app.isDestroyed) {
        //     // console.log("stopping walkmeshTick()", app);
        //     return;
        // } else {
        //     // console.log('walkmeshTick()', app)
        // }
        // Note: Even if app.isAnimationEnabled == false, we must still
        // keep calling appTick(), to let the OrbitControls adjust the
        // camera if the user moves it.
        requestAnimationFrame(walkmeshTick);
        var delta = clock.getDelta();
        if (debugControls) {
            debugControls.update(delta);
        }
        if (currentFieldModels) {
            for (let i = 0; i < currentFieldModels.length; i++) {
                let model = currentFieldModels[i]
                model.mixer.update(delta) // Render character animations
            }
        }
        updateFieldMovement(delta) // Ideally this should go in a separate loop
        if (walkmeshRenderer && walkmeshScene && walkmeshCamera) {
            // console.log('render')
            let activeCamera = options.debug.showDebugCamera === true ? debugCamera : walkmeshCamera
            // raycasterRendering(activeCamera)
            walkmeshRenderer.clear()
            walkmeshRenderer.render(walkmeshScene, activeCamera)
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
    // console.log('chapters', chapters)
    let fields = {}
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i]
        // console.log('chapter', chapter)
        for (let j = 0; j < chapter.fieldNames.length; j++) {
            const fieldName = chapter.fieldNames[j];
            fields[fieldName] = fieldName
        }
    }
    return fields
}
const showDebug = async () => {
    let fields = await getFieldList()
    gui = new GUI({ width: 250, hideable: false })
    let fieldGUI = gui.addFolder('Field Data')
    fieldGUI.add(options, 'field', fields).onChange(function () {
        // console.log('options', options, '-> fieldID')
        initField(options.field)
    }).setValue(options.field)


    let debugGUI = gui.addFolder('Debug')
    debugGUI.add(options.debug, 'showDebugCamera').onChange(function () {
        // console.log('options', options, '-> showDebugCamera')
        animateCamera()
    }).setValue(options.debug.showDebugCamera)
    debugGUI.add(options.debug, 'showWalkmeshMesh').onChange(function () {
        // console.log('options', options, '-> showWalkmeshMesh')
        walkmeshMesh.visible = options.debug.showWalkmeshMesh
    })
    debugGUI.add(options.debug, 'showWalkmeshLines').onChange(function () {
        // console.log('options', options, '-> showWalkmeshLines', walkmeshLines)
        walkmeshLines.visible = options.debug.showWalkmeshLines
    })
    debugGUI.add(options.debug, 'showBackgroundLayers').onChange(function () {
        // console.log('options', options, '-> showBackgroundLayers', backgroundLayers)
        backgroundLayers.visible = options.debug.showBackgroundLayers
    })
    debugGUI.add(options.debug, 'showAxes').onChange(() => {
        // console.log('options', options, '-> showAxes')
        axesHelper.visible = options.debug.showAxes
    })

    let inputsGUI = gui.addFolder('Inputs')
    inputsGUI.add(input, 'up').listen()
    inputsGUI.add(input, 'right').listen()
    inputsGUI.add(input, 'down').listen()
    inputsGUI.add(input, 'left').listen()
    inputsGUI.add(input, 'x').listen()
    inputsGUI.add(input, 'o').listen()
    inputsGUI.add(input, 'square').listen()
    inputsGUI.add(input, 'triangle').listen()
    inputsGUI.add(input, 'l1').listen()
    inputsGUI.add(input, 'l2').listen()
    inputsGUI.add(input, 'r1').listen()
    inputsGUI.add(input, 'r2').listen()
    inputsGUI.add(input, 'select').listen()
    inputsGUI.add(input, 'start').listen()

    animateCamera()
}

const loadModel = (combinedGLTF) => {
    return new Promise((resolve, reject) => {
        let loader = new GLTFLoader()
        loader.parse(JSON.stringify(combinedGLTF), `${KUJATA_BASE}/data/field/char.lgp/`, function (gltf) {
            // console.log("combined gltf:", gltf)
            resolve(gltf)
        })
    })
}
const createCombinedGLTF = (modelGLTF, animGLTF) => {
    // console.log("modelGLTF:", modelGLTF);
    // console.log("animGLTF:", animGLTF);
    var gltf1 = JSON.parse(JSON.stringify(modelGLTF)); // clone
    var gltf2 = JSON.parse(JSON.stringify(animGLTF));  // clone
    var numModelBuffers = gltf1.buffers.length;
    var numModelBufferViews = gltf1.bufferViews.length;
    var numModelAccessors = gltf1.accessors.length;
    if (!gltf1.animations) {
        gltf1.animations = [];
    }
    for (let buffer of gltf2.buffers) {
        gltf1.buffers.push(buffer);
    }
    for (let bufferView of gltf2.bufferViews) {
        bufferView.buffer += numModelBuffers;
        gltf1.bufferViews.push(bufferView);
    }
    for (let accessor of gltf2.accessors) {
        accessor.bufferView += numModelBufferViews;
        gltf1.accessors.push(accessor);
    }
    for (let animation of gltf2.animations) {
        for (let sampler of animation.samplers) {
            sampler.input += numModelAccessors;
            sampler.output += numModelAccessors;
        }
        gltf1.animations.push(animation);
    }
    // console.log("combinedGLTF:", gltf1)
    return gltf1;
}


const loadModels = async (modelLoaders) => {
    let fieldModels = []
    for (let modelLoader of modelLoaders) {
        // console.log('modelLoader', modelLoader, modelLoader.hrcId)
        const modelGLTFRes = await fetch(`${KUJATA_BASE}/data/field/char.lgp/${modelLoader.hrcId.toLowerCase()}.gltf`)
        let modelGLTF = await modelGLTFRes.json()
        console.log('modelLoader', modelLoader)
        for (let i = 0; i < modelLoader.animations.length; i++) {
            const animId = modelLoader.animations[i].toLowerCase().substring(0, modelLoader.animations[i].indexOf('.'))
            let animRes = await fetch(`${KUJATA_BASE}/data/field/char.lgp/${animId}.a.gltf`)
            let animGLTF = await animRes.json()
            modelGLTF = createCombinedGLTF(modelGLTF, animGLTF)
        }
        let gltf = await loadModel(modelGLTF)
        gltf.userData['name'] = modelLoader.name
        gltf.userData['hrcId'] = modelLoader.hrcId
        gltf.userData['globalLight'] = modelLoader.globalLight

        gltf.scene = SkeletonUtils.clone(gltf.scene) // Do we still need to do this because multiples of the same model are loaded?
        gltf.mixer = new THREE.AnimationMixer(gltf.scene)

        // console.log('Loaded GLTF', gltf, modelLoader)
        // modelLoader.gltf = gltf
        // walkmeshScene.add(gltf)

        fieldModels.push(gltf)
    }
    return fieldModels
}
const getModelScaleDownValue = () => {
    // const scaleDownValue = 1 / (currentFieldData.model.header.modelScale * 0.5)
    // SEE workings-out -> getModelScaleDownValue.js
    // [
    //     { 'scale': '400', 'count': 4, 'exampleField': 'gidun_1' },
    //     { 'scale': '448', 'count': 1, 'exampleField': 'rcktin3' },
    //     { 'scale': '480', 'count': 2, 'exampleField': 'mkt_w' },
    //     { 'scale': '512', 'count': 643, 'exampleField': 'ancnt1' },
    //     { 'scale': '576', 'count': 5, 'exampleField': 'fship_2' },
    //     { 'scale': '600', 'count': 5, 'exampleField': 'ealin_12' },
    //     { 'scale': '640', 'count': 2, 'exampleField': 'del1' },
    //     { 'scale': '650', 'count': 2, 'exampleField': 'mds7st3' },
    //     { 'scale': '700', 'count': 6, 'exampleField': 'astage_b' },
    //     { 'scale': '720', 'count': 1, 'exampleField': 'mtcrl_8' },
    //     { 'scale': '768', 'count': 12, 'exampleField': 'bwhlin' },
    //     { 'scale': '1024', 'count': 9, 'exampleField': 'ancnt3' },
    //     { 'scale': '2048', 'count': 7, 'exampleField': 'fr_e' },
    //     { 'scale': '4096', 'count': 2, 'exampleField': 'bugin1b' },
    //     { 'scale': '5120', 'count': 1, 'exampleField': 'rootmap' }
    // ]

    // Looks like:
    // 256  -> 1 / 1280        linear
    // 512  -> 1 / 1024        linear
    // 768  -> 1 / 768         linear
    // 1024 -> 1 / 512         linear
    // 2048 -> 1 / 256         power
    // 4096 -> 1 / 128         power

    let factor = ((currentFieldData.model.header.modelScale - 768) * -1) + 768
    if (currentFieldData.model.header.modelScale >= 1024) {
        factor = (Math.pow(2, (Math.log2(currentFieldData.model.header.modelScale) * -1) + 19))
    }

    const scaleDownValue = 1 / factor
    // console.log('getModelScaleDownValue', factor, scaleDownValue, currentFieldData.model.header.modelScale)
    return scaleDownValue
}
const placeModels = (mode) => {
    console.log('currentFieldData', currentFieldData)
    // console.log('currentFieldData.script.entities', currentFieldData.script.entities)
    // console.log('currentFieldModels', currentFieldModels)

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
        let playableCharacter
        for (let script of entity.scripts) {

            // console.log('script', entity, script)
            placeOperationLoop:
            for (let op of script.ops) {
                // console.log('ops', entity, script, op, op.op)
                if (op.op === 'CHAR') {
                    fieldModelId = op.n
                }
                if (op.op === 'XYZI') {

                    // console.log('fieldModelId', fieldModelId)
                    fieldModel = currentFieldModels[fieldModelId]

                    const scaleDownValue = getModelScaleDownValue()
                    if (fieldModelId !== undefined) {
                        // console.log('ops', entity, op, fieldModelId, fieldModel, fieldModelScene)
                        fieldModel.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
                        fieldModel.scene.position.set(op.x / 4096, op.y / 4096, op.z / 4096)
                        fieldModel.scene.rotation.x = THREE.Math.degToRad(90)
                        fieldModel.scene.up.set(0, 0, 1)


                        if (fieldModel.animations.length > 0) {
                            // walkmeshScene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), fieldModel.scene.position, 0.1, 0xffff00))
                            // console.log('Place model with animation', fieldModel.animations[fieldModel.animations.length - 1], fieldModel.mixer)
                            fieldModel.mixer.clipAction(fieldModel.animations[fieldModel.animations.length - 1]).play() // Just temporary for testing
                        }
                        // console.log('fieldModel.scene', entity.entityName, fieldModelId, op.i, fieldModel.scene, fieldModel.scene.rotation)
                        walkmeshScene.add(fieldModel.scene)

                        // fieldModel.boxHelper = new THREE.BoxHelper(fieldModel.scene, 0xffff00)
                        // walkmeshScene.add(fieldModel.boxHelper)

                    }
                    // break placeOperationLoop
                }
                if (op.op === 'DIR' && fieldModel) {
                    let deg = 360 * op.d / 255
                    // console.log('DIR', op, deg)
                    // TODO - Figure out how to get direction (156) into kujata-data
                    // triggers.header.controlDirection
                    fieldModel.scene.rotateY(THREE.Math.degToRad(deg)) // Is this in degrees or 0-255 range?
                    if (playableCharacter) {
                        currentPlayableCharacter = fieldModel
                        console.log('currentPlayableCharacter', fieldModel)
                    }
                    // fieldModelScene.rotateY(THREE.Math.degToRad(currentFieldData.triggers.header.controlDirection))
                    break placeOperationLoop
                }
                if (op.op === 'PC') {
                    // console.log('PC', op)
                    // if (op.c === 0) { // Cloud
                    //     console.log('cloud is playable char')
                    playableCharacter = true
                }
            }
        }
    }
}

// let playerMovementRay = new THREE.Raycaster()
const updateFieldMovement = (delta) => {
    // Get active player
    if (!currentPlayableCharacter) {
        return
    }

    let speed = 0.10 * delta// run - Need to set these from the placed character model. Maybe these can be defaults?
    let animNo = 2 // run

    if (options.debug.runByDefault === input.x) { // Adjust to walk
        speed = speed * 0.18
        animNo = 1
    }

    // console.log('speed', speed, delta, animNo, currentPlayableCharacter.animations[animNo].name)
    // Find direction that player should be facing
    // let direction = ((256 - currentFieldData.triggers.header.controlDirection) * 360 / 256) - 180 // Moved this to kujata-data
    let direction = currentFieldData.triggers.header.controlDirectionDegrees
    // console.log('Direction', currentFieldData.triggers.header.controlDirection, currentFieldData.triggers.header.controlDirectionDegrees, direction)

    let shouldMove = true
    if (input.up && input.right) { direction += 45 }
    else if (input.right && input.down) { direction += 135 }
    else if (input.down && input.left) { direction += 225 }
    else if (input.left && input.up) { direction += 315 }
    else if (input.up) { direction += 0 }
    else if (input.right) { direction += 90 }
    else if (input.down) { direction += 180 }
    else if (input.left) { direction += 270 }
    else { shouldMove = false }

    if (!shouldMove) {
        // If no movement but animation - stop animation (stand)
        currentPlayableCharacter.mixer.stopAllAction()
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[0]).play() // stand anim
        return
    }
    // Set player in direction 
    let directionRadians = THREE.Math.degToRad(direction)
    let directionVector = new THREE.Vector3(Math.sin(directionRadians), Math.cos(directionRadians), 0)
    // console.log('directionVector', directionVector, currentFieldData.triggers.header.controlDirection)
    let nextPosition = currentPlayableCharacter.scene.position.clone().addScaledVector(directionVector, speed) // Show probably factor in clock delta so its smoother
    currentPlayableCharacter.scene.lookAt(new THREE.Vector3().addVectors(currentPlayableCharacter.scene.position, directionVector)) // Doesn't work perfectly
    // walkmeshScene.add(new THREE.ArrowHelper(directionVector, currentPlayableCharacter.scene.position, 0.1, 0xff00ff))

    // currentPlayableCharacter.boxHelper.update()

    // Adjust for climbing slopes and walking off walkmesh
    // Create a ray at next position (higher z, but pointing down) to find correct z position
    let playerMovementRay = new THREE.Raycaster()
    const rayO = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z + 0.01)
    const rayD = new THREE.Vector3(0, 0, -1).normalize()
    playerMovementRay.set(rayO, rayD)
    var intersects = playerMovementRay.intersectObjects([walkmeshMesh])
    // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
    if (intersects.length === 0) {
        // Player is off walkmap
        currentPlayableCharacter.mixer.stopAllAction()
        // raycasterHelper.visible = false
        return
    } else {
        const point = intersects[0].point
        // raycasterHelper.visible = true
        // raycasterHelper.position.set(point.x, point.y, point.z)
        // Adjust nextPosition height to to adjust for any slopes
        nextPosition.z = point.z
    }

    // If walk/run is toggled, stop the existing animation
    if (animNo === 2) { // Run
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[0]).stop() // Probably a more efficient way to change these animations
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[1]).stop()
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[2]).play()
    } else if (animNo === 1) { // Walk
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[0]).stop()
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[2]).stop()
        currentPlayableCharacter.mixer.clipAction(currentPlayableCharacter.animations[1]).play()
    }

    // If movement set next position
    currentPlayableCharacter.scene.position.x = nextPosition.x
    currentPlayableCharacter.scene.position.y = nextPosition.y
    currentPlayableCharacter.scene.position.z = nextPosition.z

    // Adjust the camera offset to centre on character // TODO unless overridden by op codes?!
    let relativeToCamera = nextPosition.clone().project(debugCamera)
    relativeToCamera.x = (relativeToCamera.x + 1) * (currentFieldMetaData.assetDimensions.width * 1) / 2
    relativeToCamera.y = - (relativeToCamera.y - 1) * (currentFieldMetaData.assetDimensions.height * 1) / 2
    relativeToCamera.z = 0
    console.log('currentPlayableCharacter relativeToCamera', relativeToCamera)
    adjustViewClipping(relativeToCamera.x, relativeToCamera.y)

    let camDistance = currentPlayableCharacter.scene.position.distanceTo(walkmeshCamera.position) // Maybe should change this to distance to the normal of the camera position -> camera target line ? Looks ok so far, but there are a few maps with clipping that should therefore switch to an orthogonal camera
    // console.log(
    //     'Distance from camera',
    //     camDistance,
    //     camDistance * 1000)
}


const imageDimensions = file => new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = img
        resolve({ width, height })
    }
    img.src = file
})
const addFieldBackgroundDebug = (currentFieldMetaData) => {
    // Add debug values
    let guiToDelete = []
    if (gui.__folders['Field Data'].__controllers.length > 0) {
        // console.log('gui', gui.__folders['Field Data'].__controllers.length)
        for (let i = 0; i < gui.__folders['Field Data'].__controllers.length; i++) {
            const controller = gui.__folders['Field Data'].__controllers[i]
            // console.log('controller', controller, controller.property)
            if (controller.property !== 'field') {
                guiToDelete.push(controller)
            }
        }
    }
    for (let i = 0; i < guiToDelete.length; i++) {
        const controller = guiToDelete[i];
        gui.__folders['Field Data'].remove(controller)
        // console.log('gui - remove ->', controller.property)
    }

    gui.__folders['Field Data'].add(walkmeshCamera, 'fov').min(0).max(90).step(0.001).listen().onChange((val) => {
        // console.log('debug fov', val)
        walkmeshCamera.fov = val
        walkmeshCamera.updateProjectionMatrix()
    })
    gui.__folders['Field Data'].add(currentFieldMetaData.assetDimensions, 'width')
    gui.__folders['Field Data'].add(currentFieldMetaData.assetDimensions, 'height')
    gui.__folders['Field Data'].add(walkmeshCamera, 'aspect')
    gui.__folders['Field Data'].add(currentFieldMetaData, 'bgScale').min(0.5).max(4).step(0.001).onChange((val) => {
        // console.log('debug bgScale', val)
        walkmeshRenderer.setSize(currentFieldMetaData.assetDimensions.width * sizing.factor * currentFieldMetaData.bgScale, currentFieldMetaData.assetDimensions.height * sizing.factor * currentFieldMetaData.bgScale)
    })
    gui.__folders['Field Data'].add(currentFieldMetaData, 'cameraUnknown')
    gui.__folders['Field Data'].add(currentFieldMetaData, 'modelScale')
    gui.__folders['Field Data'].add(currentFieldMetaData, 'numModels')
    gui.__folders['Field Data'].add(currentFieldMetaData, 'scaleDownValue').step(0.00001)
    gui.__folders['Field Data'].add(currentFieldMetaData, 'layersAvailable')
}
const drawBG = async (x, y, z, distance, bgImgUrl, group) => {
    let vH = Math.tan(THREE.Math.degToRad(walkmeshCamera.getEffectiveFOV() / 2)) * distance * 2
    let vW = vH * walkmeshCamera.aspect
    // console.log('drawBG', distance, '->', vH, vW)
    var geometry = new THREE.PlaneGeometry(vW, vH, 0)
    // console.log('drawBG texture load', bgImgUrl)
    var texture = new THREE.TextureLoader().load(bgImgUrl)
    // var planeMaterial = new THREE.MeshLambertMaterial({ map: texture })
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.set(x, y, z)
    plane.lookAt(walkmeshCamera.position)
    plane.setRotationFromEuler(walkmeshCamera.rotation)
    group.add(plane)
}


const placeBG = async (cameraTarget) => {
    let assetDimensions = await imageDimensions(`${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${options.field}.png`)

    // Create meta-data
    currentFieldMetaData = {
        assetDimensions: assetDimensions,
        width: assetDimensions.width / sizing.width,
        height: assetDimensions.height / sizing.height,
        bgScale: 1, // assetDimensions.height / sizing.height,
        adjustedFOV: walkmeshCamera.fov * (assetDimensions.height / sizing.height),
        cameraUnknown: currentFieldData.cameraSection.cameras[0].unknown,
        modelScale: currentFieldData.model.header.modelScale,
        scaleDownValue: getModelScaleDownValue(),
        numModels: currentFieldData.model.header.numModels,
        layersAvailable: currentFieldBackgroundData !== undefined,
        bgZDistance: 1024
    }
    // console.log('currentFieldMetaData', currentFieldMetaData)

    // Rescale renderer and cameras for scene
    walkmeshRenderer.setSize(assetDimensions.width * sizing.factor * currentFieldMetaData.bgScale, assetDimensions.height * sizing.factor * currentFieldMetaData.bgScale)
    walkmeshCamera.aspect = assetDimensions.width / assetDimensions.height
    walkmeshCamera.fov = currentFieldMetaData.adjustedFOV
    walkmeshCamera.lookAt(cameraTarget)
    walkmeshCamera.updateProjectionMatrix()
    debugCamera.aspect = assetDimensions.width / assetDimensions.height
    debugCamera.fov = currentFieldMetaData.adjustedFOV
    walkmeshCamera.lookAt(cameraTarget)
    debugCamera.updateProjectionMatrix()



    // Draw backgrounds
    // var lookAtDistance = walkmeshCamera.position.distanceTo(cameraTarget)
    // console.log('lookAtDistance', lookAtDistance, lookAtDistance * 4096)
    let intendedDistance = 1
    backgroundLayers = new THREE.Group()
    for (let i = 0; i < currentFieldBackgroundData.length; i++) {
        const layer = currentFieldBackgroundData[i]
        if (layer.depth === 0) {
            layer.depth = 1
        }

        if (layer.z === 1) { // z = doesn't show, just set it slightly higher for now
            layer.z = 5
        }
        // const bgDistance = (intendedDistance * (layer.z / 4096)) // First attempt at ratios, not quite right but ok
        const bgDistance = layer.z / currentFieldMetaData.bgZDistance // First attempt at ratios, not quite right but ok
        // console.log('Layer', layer, bgDistance)

        let bgVector = new THREE.Vector3().lerpVectors(walkmeshCamera.position, cameraTarget, bgDistance)
        drawBG(bgVector.x, bgVector.y, bgVector.z, bgDistance, `${KUJATA_BASE}/metadata/background-layers/${options.field}/${layer.fileName}`, backgroundLayers)
    }
    walkmeshScene.add(backgroundLayers)
    addFieldBackgroundDebug(currentFieldMetaData)
}

const setupViewClipping = async () => {
    walkmeshRenderer.setSize(sizing.width * sizing.factor, sizing.height * sizing.factor)

    // Need to set a default, this is centre, should really be triggered from the player character being active on the screen
    const x = currentFieldMetaData.assetDimensions.width / 2
    const y = currentFieldMetaData.assetDimensions.height / 2
    adjustViewClipping(x, y)
    console.log('currentFieldMetaData', currentFieldMetaData)
}
const adjustViewClipping = async (x, y) => {
    let adjustedX = x - (sizing.width / 2)
    let adjustedY = y - (sizing.height / 2)
    adjustedX = Math.min(adjustedX, 2 * (currentFieldMetaData.assetDimensions.width / 2 - (sizing.width / 2)))
    adjustedY = Math.min(adjustedY, 2 * (currentFieldMetaData.assetDimensions.height / 2 - (sizing.height / 2)))
    adjustedX = Math.max(adjustedX, 0)
    adjustedY = Math.max(adjustedY, 0)
    // console.log('x', x, '->', adjustedX, 'y', y, '->', adjustedY)

    walkmeshCamera.setViewOffset(
        currentFieldMetaData.assetDimensions.width * sizing.factor,
        currentFieldMetaData.assetDimensions.height * sizing.factor,
        adjustedX * sizing.factor,
        adjustedY * sizing.factor,
        sizing.width * sizing.factor,
        sizing.height * sizing.factor,
    )
}
const initField = async (fieldName) => {
    // Reset field values 
    currentFieldData = undefined
    currentFieldBackgroundData = undefined
    currentFieldModels = undefined
    currentPlayableCharacter = undefined

    currentFieldData = await loadField(fieldName)
    currentFieldBackgroundData = await loadFieldBackground(fieldName)
    currentFieldModels = await loadModels(currentFieldData.model.modelLoaders)
    let cameraTarget = setupCamera()
    await drawWalkmesh()
    await placeModels()
    await placeBG(cameraTarget)
    await setupControls(cameraTarget)
    await setupDebugControls(cameraTarget)
    await setupRenderer()
    await setupViewClipping()
}
const setKeyPress = (keyCode, state) => {
    if (keyCode === 87) { // w -> up
        input.up = state
    } else if (keyCode === 68) { // d -> right
        input.right = state
    } else if (keyCode === 83) { // s -> down
        input.down = state
    } else if (keyCode === 65) { // a -> left
        input.left = state

    } else if (keyCode === 74) { // j -> X
        input.x = state
    } else if (keyCode === 75) { // k -> O
        input.o = state
    } else if (keyCode === 85) { // u -> Square
        input.square = state
    } else if (keyCode === 73) { // i -> Triangle
        input.triangle = state

    } else if (keyCode === 72) { // h -> L1
        input.l1 = state
    } else if (keyCode === 89) { // y -> L2
        input.l2 = state
    } else if (keyCode === 76) { // l -> R1
        input.r1 = state
    } else if (keyCode === 79) { // o -> R2
        input.r2 = state

    } else if (keyCode === 55) { // 7 -> Select
        input.select = state
    } else if (keyCode === 56) { // 8 -> Start
        input.start = state
    }
}
const setupInputs = () => {
    document.addEventListener('keydown', (e) => {
        setKeyPress(event.which, true)
    }, false)
    document.addEventListener('keyup', (e) => {
        setKeyPress(event.which, false)
    }, false)
}

const init = async () => {

    container = document.getElementById('container')
    showStats()
    await showDebug()
    setupInputs()
    // initField('cosin4')
}

init()
