import * as THREE from '../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';
// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js';

import Stats from '../assets/threejs-r118/jsm/libs/stats.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/stats.module.js';
import { GUI } from '../assets/threejs-r118/jsm/libs/dat.gui.module.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../assets/threejs-r118/jsm/controls/OrbitControls.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../assets/threejs-r118/jsm/loaders/GLTFLoader.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/loaders/GLTFLoader.js'
import { SkeletonUtils } from '../assets/threejs-r118/jsm/utils/SkeletonUtils.js' //'https://raw.githack.com/mrdoob/three.js/dev/examples/jsm/utils/SkeletonUtils.js'

import { setupInputs, getActiveInputs } from './inputs.js'

// Global Objects
let currentField // Contains field data

let anim = {
    container: undefined,
    stats: undefined,
    gui: undefined,
    clock: undefined,
    renderer: undefined,
    axesHelper: undefined
}

let config = {
    sizing: {
        width: 320,
        height: 240,
        factor: 2
    },
    debug: {
        showDebugCamera: false,
        showWalkmeshMesh: false,
        showWalkmeshLines: true,
        showBackgroundLayers: true,
        showAxes: false,
        runByDefault: true
    },
    raycast: {
        active: false,
        raycaster: undefined,
        mouse: undefined,
        raycasterHelper: undefined
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

const setupFieldCamera = () => {
    let ffCamera = currentField.data.cameraSection.cameras[0] // TODO: Support multiple cameras
    let baseFOV = (2 * Math.atan(240.0 / (2.0 * ffCamera.zoom))) * 57.29577951
    anim.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    anim.renderer.setSize(config.sizing.width * config.sizing.factor, config.sizing.height * config.sizing.factor)
    anim.renderer.autoClear = false
    currentField.fieldScene = new THREE.Scene()
    currentField.fieldScene.background = new THREE.Color(0x000000)
    currentField.fieldCamera = new THREE.PerspectiveCamera(baseFOV, config.sizing.width / config.sizing.height, 0.001, 1000); // near and far is 0.001 / 4096, 100000 / 4096 in makou reactor
    anim.clock = new THREE.Clock();

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

    currentField.fieldCamera.position.x = tx;
    currentField.fieldCamera.position.y = ty;
    currentField.fieldCamera.position.z = tz;
    currentField.fieldCamera.up.set(camAxisYx, camAxisYy, camAxisYz)
    // console.log('up', camAxisYx, camAxisYy, camAxisYz)
    currentField.fieldCamera.lookAt(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz)

    currentField.fieldCamera.updateProjectionMatrix()
    currentField.fieldScene.add(currentField.fieldCamera);
    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 50).normalize();
    currentField.fieldScene.add(light);
    let ambientLight = new THREE.AmbientLight(0x404040); // 0x404040 = soft white light
    currentField.fieldScene.add(ambientLight)

    let cameraTarget = new THREE.Vector3(tx + camAxisZx, ty + camAxisZy, tz + camAxisZz)

    setupFieldDebugCamera()
    currentField.fieldCameraHelper = new THREE.CameraHelper(currentField.fieldCamera)
    currentField.fieldCameraHelper.visible = true
    currentField.fieldScene.add(currentField.fieldCameraHelper)
    currentField.fieldScene.add(currentField.fieldCamera)


    return cameraTarget
}


const activateDebugCamera = () => {
    if (currentField.debugCamera) {
        currentField.debugCamera.visible = config.debug.showDebugCamera
        currentField.fieldCameraHelper.visible = config.debug.showDebugCamera

        currentField.debugCameraControls.enableZoom = true //config.debug.showDebugCamera
        currentField.debugCameraControls.enableRotate = true //config.debug.showDebugCamera
        currentField.debugCameraControls.enablePan = true //config.debug.showDebugCamera
    }
}

const setupFieldDebugCamera = () => {
    currentField.debugCamera = currentField.fieldCamera.clone()
}

const drawWalkmesh = () => {

    // Draw triangles for walkmesh
    let triangles = currentField.data.walkmeshSection.triangles;
    let numTriangles = triangles.length;

    let walkmeshPositions = []
    currentField.walkmeshLines = new THREE.Group()
    for (let i = 0; i < numTriangles; i++) {
        let triangle = currentField.data.walkmeshSection.triangles[i];
        let accessor = currentField.data.walkmeshSection.accessors[i];
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
            currentField.walkmeshLines.add(line)
        }
        addLine(currentField.fieldScene, v0, v1, accessor[0]);
        addLine(currentField.fieldScene, v1, v2, accessor[1]);
        addLine(currentField.fieldScene, v2, v0, accessor[2]);

        // positions for mesh buffergeo
        walkmeshPositions.push(triangle.vertices[0].x / 4096, triangle.vertices[0].y / 4096, triangle.vertices[0].z / 4096)
        walkmeshPositions.push(triangle.vertices[1].x / 4096, triangle.vertices[1].y / 4096, triangle.vertices[1].z / 4096)
        walkmeshPositions.push(triangle.vertices[2].x / 4096, triangle.vertices[2].y / 4096, triangle.vertices[2].z / 4096)
    }
    currentField.fieldScene.add(currentField.walkmeshLines)


    // Draw mesh for walkmesh
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(walkmeshPositions, 3))
    let material = new THREE.MeshBasicMaterial({ color: 0x2194CE, opacity: 0.2, transparent: true, side: THREE.DoubleSide })
    currentField.walkmeshMesh = new THREE.Mesh(geometry, material)
    currentField.walkmeshMesh.visible = config.debug.showWalkmeshMesh
    currentField.fieldScene.add(currentField.walkmeshMesh)

    // Draw gateways
    currentField.gatewayLines = new THREE.Group()
    for (let gateway of currentField.data.triggers.gateways) {
        let lv0 = gateway.exitLineVertex1;
        let lv1 = gateway.exitLineVertex2;
        let v0 = new THREE.Vector3(lv0.x / 4096, lv0.y / 4096, lv0.z / 4096);
        let v1 = new THREE.Vector3(lv1.x / 4096, lv1.y / 4096, lv1.z / 4096);
        let material1 = new THREE.LineBasicMaterial({ color: 0xff0000 });
        let geometry1 = new THREE.Geometry();
        geometry1.vertices.push(v0);
        geometry1.vertices.push(v1);
        let line = new THREE.Line(geometry1, material1);
        currentField.gatewayLines.add(line);
    }
    currentField.fieldScene.add(currentField.gatewayLines)

    // Draw triggers / doors
    currentField.triggerLines = new THREE.Group()
    currentField.data.triggers.triggers = currentField.data.triggers.triggers.filter(t => !(t.cornerVertex1.x === 0 && t.cornerVertex1.y === 0 && t.cornerVertex1.z === 0)) // for some reason there are a lots of 0,0,0 triggers, remove them for now
    for (let trigger of currentField.data.triggers.triggers) {
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
        currentField.triggerLines.add(line);
        if (lv0.x !== 0) {
            // console.log('Door', lv0, v0, '&', lv1, v1)
        }
    }
    currentField.fieldScene.add(currentField.triggerLines)
}
const setupDebugControls = (cameraTarget) => {
    currentField.debugCameraControls = new OrbitControls(currentField.debugCamera, anim.renderer.domElement);
    currentField.debugCameraControls.target = cameraTarget
    currentField.debugCameraControls.panSpeed = 1 / 4;
    currentField.debugCameraControls.rotateSpeed = 1 / 4;
    currentField.debugCameraControls.zoomSpeed = 1 / 4;
    currentField.debugCameraControls.update()

    // if (config.debug.showDebugCamera) {
    currentField.debugCameraControls.enableZoom = config.debug.showDebugCamera
    currentField.debugCameraControls.enableRotate = config.debug.showDebugCamera
    currentField.debugCameraControls.enablePan = config.debug.showDebugCamera
    // }
    activateDebugCamera()
}
const setupRaycasting = async () => {
    if (config.raycast.active) {
        raycaster = new THREE.Raycaster()
        mouse = new THREE.Vector2()
        let geometry = new THREE.SphereGeometry(0.002, 32, 32)
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
        config.raycast.raycasterHelper = new THREE.Mesh(geometry, material)
        config.raycast.raycasterHelper.visible = false
        currentField.fieldScene.add(config.raycast.raycasterHelper)
        window.addEventListener('mousemove', function (event) {
            let canvasBounds = anim.renderer.getContext().canvas.getBoundingClientRect();
            config.raycast.mouse.x = ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
            config.raycast.mouse.y = - ((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        }, false)
    }
}
const raycasterFieldRendering = (camera) => {
    config.raycast.raycaster.setFromCamera(config.raycast.mouse, camera)
    let intersects = config.raycast.raycaster.intersectObjects([currentField.walkmeshMesh])//currentField.walkmeshMesh//currentField.fieldScene.children
    // console.log('currentField.walkmeshMesh', currentField.walkmeshMesh)
    if (intersects.length === 0) {
        config.raycast.raycasterHelper.visible = false
    } else {
        config.raycast.raycasterHelper.visible = true
    }
    for (let i = 0; i < intersects.length; i++) {
        // intersects[i].object.material.color.set(0xff0000)
        const point = intersects[i].point
        // config.raycast.raycasterHelper.visible = true
        config.raycast.raycasterHelper.position.set(point.x, point.y, point.z)
        console.log('intersect point', point, config.raycast.raycasterHelper.position)
    }
}
const startFieldRenderLoop = () => {
    // let anim.container = document.getElementById("container");


    // if this is not our first time here, remove the previous walkmesh display
    while (anim.container.firstChild) {
        anim.container.removeChild(anim.container.firstChild);
    }

    anim.container.appendChild(anim.renderer.domElement);
    setupRaycasting()
    anim.renderer.render(currentField.fieldScene, currentField.fieldCamera);

    let walkmeshTick = function () {
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
        let delta = anim.clock.getDelta();
        if (currentField.debugCameraControls) {
            currentField.debugCameraControls.update(delta);
        }
        if (currentField.models) {
            for (let i = 0; i < currentField.models.length; i++) {
                let model = currentField.models[i]
                model.mixer.update(delta) // Render character animations
            }
        }

        updateFieldMovement(delta) // Ideally this should go in a separate loop
        if (anim.renderer && currentField.fieldScene && currentField.fieldCamera) {
            // console.log('render')
            let activeCamera = config.debug.showDebugCamera === true ? currentField.debugCamera : currentField.fieldCamera
            if (config.raycast.active) {
                raycasterFieldRendering(activeCamera)
            }
            anim.renderer.clear()
            anim.renderer.render(currentField.fieldScene, activeCamera)
            anim.renderer.clearDepth()
            // anim.renderer.render(bgScene, bgCamera)
        }
        anim.stats.update();
        if (currentField.fieldCameraHelper) {
            currentField.fieldCameraHelper.update()
        }
    }

    walkmeshTick();

}
const showStats = () => {
    anim.stats = new Stats()
    anim.stats.dom.style.cssText = 'position:fixed;top:0;right:270px;cursor:pointer;opacity:0.9;z-index:10000';

    document.querySelector('.stats').appendChild(anim.stats.dom)
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
const initDebug = () => {
    anim.gui = new GUI({ width: 250, hideable: false })
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
    let gltf1 = JSON.parse(JSON.stringify(modelGLTF)); // clone
    let gltf2 = JSON.parse(JSON.stringify(animGLTF));  // clone
    let numModelBuffers = gltf1.buffers.length;
    let numModelBufferViews = gltf1.bufferViews.length;
    let numModelAccessors = gltf1.accessors.length;
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
        // console.log('modelLoader', modewlLoader)
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
        gltf.scene.userData.closeToTalk = false
        gltf.scene.userData.closeToCollide = false
        // console.log('Loaded GLTF', gltf, modelLoader)
        // modelLoader.gltf = gltf
        // currentField.fieldScene.add(gltf)

        fieldModels.push(gltf)
    }
    return fieldModels
}
const getModelScaleDownValue = () => {
    // const scaleDownValue = 1 / (currentField.data.model.header.modelScale * 0.5)
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

    let factor = ((currentField.data.model.header.modelScale - 768) * -1) + 768
    if (currentField.data.model.header.modelScale >= 1024) {
        factor = (Math.pow(2, (Math.log2(currentField.data.model.header.modelScale) * -1) + 19))
    }

    const scaleDownValue = 1 / factor
    // console.log('getModelScaleDownValue', factor, scaleDownValue, currentField.data.model.header.modelScale)
    return scaleDownValue
}
const placeModels = (mode) => {
    console.log('currentField.data', currentField.data)
    // console.log('currentField.data.script.entities', currentField.data.script.entities)
    // console.log('currentField.models', currentField.models)

    // let sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1)
    // sphere.position.set(0, 0, 0)
    // let geometry = new THREE.SphereGeometry(50, 32, 32);
    // let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    // let sphere = new THREE.Mesh(geometry, material);
    // sphere.position.set(0.2745535969734192, -0.2197556495666504, 0.0959818959236145)
    // currentField.fieldScene.add(sphere);

    anim.axesHelper = new THREE.AxesHelper(0.1);
    anim.axesHelper.visible = false
    currentField.fieldScene.add(anim.axesHelper);

    for (let entity of currentField.data.script.entities) {
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
                    fieldModel = currentField.models[fieldModelId]

                    const scaleDownValue = getModelScaleDownValue()
                    if (fieldModelId !== undefined) {
                        // console.log('ops', entity, op, fieldModelId, fieldModel, fieldModelScene)
                        fieldModel.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
                        fieldModel.scene.position.set(op.x / 4096, op.y / 4096, op.z / 4096)
                        fieldModel.scene.rotation.x = THREE.Math.degToRad(90)
                        fieldModel.scene.up.set(0, 0, 1)


                        if (fieldModel.animations.length > 0) {
                            currentField.fieldScene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), fieldModel.scene.position, 0.1, 0xffff00))
                            // console.log('Place model with animation', fieldModel.animations[fieldModel.animations.length - 1], fieldModel.mixer)
                            fieldModel.mixer.clipAction(fieldModel.animations[fieldModel.animations.length - 1]).play() // Just temporary for testing
                        }
                        // console.log('fieldModel.scene', entity.entityName, fieldModelId, op.i, fieldModel.scene, fieldModel.scene.rotation)
                        currentField.fieldScene.add(fieldModel.scene)

                        // fieldModel.boxHelper = new THREE.BoxHelper(fieldModel.scene, 0xffff00)
                        // currentField.fieldScene.add(fieldModel.boxHelper)

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
                        currentField.playableCharacter = fieldModel
                        console.log('currentField.playableCharacter', fieldModel)
                        setPlayableCharacterMovability(true)
                    }
                    // fieldModelScene.rotateY(THREE.Math.degToRad(currentField.data.triggers.header.controlDirection))
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

const gatewayTriggered = (i) => {
    console.log('gatewayTriggered', i)
    // Should probably disable movement after this has been hit
    // currentField.playableCharacter = undefined
}

const triggerTriggered = (i, isOn) => {
    let trigger = currentField.data.triggers.triggers[i]
    // console.log('triggerTriggered', i, isOn, trigger)
    switch (trigger.behavior) {
        case 5:
            let paramBGs = currentField.backgroundLayers.children.filter(bg => bg.userData.param === trigger.bgGroupId_param)
            for (let i = 0; i < paramBGs.length; i++) {
                const paramBG = paramBGs[i]
                if (paramBG.userData.state === trigger.bgFrameId_state) {
                    paramBG.visible = !isOn
                }
            }
            // console.log('Change background', trigger.bgGroupId_param, trigger.bgFrameId_state, paramBGs)
            break;

        default:
            window.alert('Unknown trigger triggered', i, isOn, trigger)
            break;
    }
}

const modelCollisionTriggered = (i) => {
    console.log('modelCollisionTriggered', i)
}

const initiateTalk = (i, fieldModel) => {
    console.log('initiateTalk', i, fieldModel)
    setPlayableCharacterMovability(false)
}
const setPlayableCharacterMovability = (canMove) => {
    currentField.playableCharacter.scene.userData.playableCharacterMovability = canMove
}
const updateFieldMovement = (delta) => {
    // Get active player
    if (!currentField.playableCharacter) {
        return
    }

    // Can player move?
    if (!currentField.playableCharacter.scene.userData.playableCharacterMovability) {
        return
    }

    let speed = 0.10 * delta// run - Need to set these from the placed character model. Maybe these can be defaults?
    let animNo = 2 // run

    if (config.debug.runByDefault === getActiveInputs().x) { // Adjust to walk
        speed = speed * 0.18
        animNo = 1
    }

    // Check talk request
    if (getActiveInputs().o) {
        for (let i = 0; i < currentField.models.length; i++) {
            if (currentField.models[i].scene.userData.closeToTalk === true) {
                initiateTalk(i, currentField.models[i])
            }
        }
    }

    // console.log('speed', speed, delta, animNo, currentField.playableCharacter.animations[animNo].name)
    // Find direction that player should be facing
    // let direction = ((256 - currentField.data.triggers.header.controlDirection) * 360 / 256) - 180 // Moved this to kujata-data
    let direction = currentField.data.triggers.header.controlDirectionDegrees
    // console.log('Direction', currentField.data.triggers.header.controlDirection, currentField.data.triggers.header.controlDirectionDegrees, direction)

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
        // If no movement but animation - stop animation (stand)
        currentField.playableCharacter.mixer.stopAllAction()
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[0]).play() // stand anim
        return
    }
    // Set player in direction 
    let directionRadians = THREE.Math.degToRad(direction)
    let directionVector = new THREE.Vector3(Math.sin(directionRadians), Math.cos(directionRadians), 0)
    // console.log('directionVector', directionVector, currentField.data.triggers.header.controlDirection)
    let nextPosition = currentField.playableCharacter.scene.position.clone().addScaledVector(directionVector, speed) // Show probably factor in anim.clock delta so its smoother
    currentField.playableCharacter.scene.lookAt(new THREE.Vector3().addVectors(currentField.playableCharacter.scene.position, directionVector)) // Doesn't work perfectly
    // currentField.fieldScene.add(new THREE.ArrowHelper(directionVector, currentField.playableCharacter.scene.position, 0.1, 0xff00ff))

    // currentField.playableCharacter.boxHelper.update()

    // Adjust for climbing slopes and walking off walkmesh
    // Create a ray at next position (higher z, but pointing down) to find correct z position
    let playerMovementRay = new THREE.Raycaster()
    const rayO = new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z + 0.01)
    const rayD = new THREE.Vector3(0, 0, -1).normalize()
    playerMovementRay.set(rayO, rayD)
    let intersects = playerMovementRay.intersectObjects([currentField.walkmeshMesh])
    // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
    if (intersects.length === 0) {
        // Player is off walkmap
        currentField.playableCharacter.mixer.stopAllAction()
        // config.raycast.raycasterHelper.visible = false
        return
    } else {
        const point = intersects[0].point
        // config.raycast.raycasterHelper.visible = true
        // config.raycast.raycasterHelper.position.set(point.x, point.y, point.z)
        // Adjust nextPosition height to to adjust for any slopes
        nextPosition.z = point.z
    }



    // Detect gateways
    for (let i = 0; i < currentField.gatewayLines.children.length; i++) {
        const gatewayLine = currentField.gatewayLines.children[i]
        const closestPointOnLine = new THREE.Line3(gatewayLine.geometry.vertices[0], gatewayLine.geometry.vertices[1]).closestPointToPoint(nextPosition, true, new THREE.Vector3())
        const distance = nextPosition.distanceTo(closestPointOnLine)
        if (distance < 0.005) {
            console.log('gateway hit')
            if (animNo === 2) { // Run
                currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[2]).paused = true
            } else if (animNo === 1) { // Walk
                currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[1]).paused = true
            }
            // Should probably also pause ALL animations including screen background loops like in the game
            gatewayTriggered(i)
            return
        }
    }

    // Detect triggers
    for (let i = 0; i < currentField.triggerLines.children.length; i++) {
        const triggerLine = currentField.triggerLines.children[i]
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
    for (let i = 0; i < currentField.models.length; i++) {
        const fieldModel = currentField.models[i]

        if (fieldModel === currentField.playableCharacter) {
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
            currentField.playableCharacter.mixer.stopAllAction()
            return
        } else {
            if (fieldModel.scene.userData.closeToCollide === true) { // Is this needed to keep collision state??
                fieldModel.scene.userData.closeToCollide = false
                // console.log('Close to collide', i, fieldModel.scene.userData.closeToCollide, fieldModel.userData)
            }
        }
    }



    // If walk/run is toggled, stop the existing animation
    if (animNo === 2) { // Run
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[0]).stop() // Probably a more efficient way to change these animations
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[1]).stop()
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[2]).play()
    } else if (animNo === 1) { // Walk
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[0]).stop()
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[2]).stop()
        currentField.playableCharacter.mixer.clipAction(currentField.playableCharacter.animations[1]).play()
    }

    // There is movement, set next position
    currentField.playableCharacter.scene.position.x = nextPosition.x
    currentField.playableCharacter.scene.position.y = nextPosition.y
    currentField.playableCharacter.scene.position.z = nextPosition.z

    // Adjust the camera offset to centre on character // TODO unless overridden by op codes?!
    let relativeToCamera = nextPosition.clone().project(currentField.debugCamera)
    relativeToCamera.x = (relativeToCamera.x + 1) * (currentField.metaData.assetDimensions.width * 1) / 2
    relativeToCamera.y = - (relativeToCamera.y - 1) * (currentField.metaData.assetDimensions.height * 1) / 2
    relativeToCamera.z = 0
    // console.log('currentField.playableCharacter relativeToCamera', relativeToCamera)
    adjustViewClipping(relativeToCamera.x, relativeToCamera.y)


    let camDistance = currentField.playableCharacter.scene.position.distanceTo(currentField.fieldCamera.position) // Maybe should change this to distance to the normal of the camera position -> camera target line ? Looks ok so far, but there are a few maps with clipping that should therefore switch to an orthogonal camera
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
const initFieldDebug = async () => {
    console.log('initFieldDebug')
    // Clear all existing debug info
    if (anim.gui) {
        anim.gui.destroy()
    }
    initDebug()



    let fieldGUI = anim.gui.addFolder('Field Data')
    // if (currentField === undefined) { currentField = { name: 'cosin4' } } // Just set this like this, it will be overridden on init
    let fields = await getFieldList()
    fieldGUI.add(currentField, 'name', fields).onChange((val) => {
        console.log('currentField.name ->', val)
        initField(val)
    }).listen()

    fieldGUI.add(currentField.fieldCamera, 'fov').min(0).max(90).step(0.001).listen().onChange((val) => {
        // console.log('debug fov', val)
        currentField.fieldCamera.fov = val
        currentField.fieldCamera.updateProjectionMatrix()
    })
    fieldGUI.add(currentField.metaData.assetDimensions, 'width')
    fieldGUI.add(currentField.metaData.assetDimensions, 'height')
    fieldGUI.add(currentField.fieldCamera, 'aspect')
    fieldGUI.add(currentField.metaData, 'bgScale').min(0.5).max(4).step(0.001).onChange((val) => {
        // console.log('debug bgScale', val)
        anim.renderer.setSize(currentField.metaData.assetDimensions.width * config.sizing.factor * currentField.metaData.bgScale, currentField.metaData.assetDimensions.height * config.sizing.factor * currentField.metaData.bgScale)
    })
    fieldGUI.add(currentField.metaData, 'cameraUnknown')
    fieldGUI.add(currentField.metaData, 'modelScale')
    fieldGUI.add(currentField.metaData, 'numModels')
    fieldGUI.add(currentField.metaData, 'scaleDownValue').step(0.00001)
    fieldGUI.add(currentField.metaData, 'layersAvailable')
    fieldGUI.add(currentField.metaData.fieldCoordinates, 'x').min(0).max(currentField.metaData.assetDimensions.width).step(1).listen().onChange((val) => adjustViewClipping(val, currentField.metaData.fieldCoordinates.y))
    fieldGUI.add(currentField.metaData.fieldCoordinates, 'y').min(0).max(currentField.metaData.assetDimensions.height).step(1).listen().onChange((val) => adjustViewClipping(currentField.metaData.fieldCoordinates.x, val))
    fieldGUI.open()

    let debugGUI = anim.gui.addFolder('Debug')
    // debugGUI.add(config.sizing, 'factor').min(1).max(3).step(1).onChange((val) => {
    //     console.log('config.sizing.factor', config.sizing.factor, currentField.name)
    //     initField(currentField.name)
    //     if (config.sizing.factor !== val) {
    //         console.log('config.sizing.factor', val)
    //     }
    // })
    debugGUI.add(config.debug, 'showDebugCamera').onChange(function () {
        activateDebugCamera()
    }).setValue(config.debug.showDebugCamera)
    debugGUI.add(config.debug, 'showWalkmeshMesh').onChange(function () {
        currentField.walkmeshMesh.visible = config.debug.showWalkmeshMesh
    })
    debugGUI.add(config.debug, 'showWalkmeshLines').onChange(function () {
        currentField.walkmeshLines.visible = config.debug.showWalkmeshLines
    })
    debugGUI.add(config.debug, 'showBackgroundLayers').onChange(function () {
        currentField.backgroundLayers.visible = config.debug.showBackgroundLayers
    })
    debugGUI.add(config.debug, 'showAxes').onChange(() => {
        anim.axesHelper.visible = config.debug.showAxes
    })
    debugGUI.open()

    let inputsGUI = anim.gui.addFolder('Inputs')
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
const drawBG = async (x, y, z, distance, bgImgUrl, group, visible, userData) => {
    let vH = Math.tan(THREE.Math.degToRad(currentField.fieldCamera.getEffectiveFOV() / 2)) * distance * 2
    let vW = vH * currentField.fieldCamera.aspect
    // console.log('drawBG', distance, '->', vH, vW)
    let geometry = new THREE.PlaneGeometry(vW, vH, 0)
    // console.log('drawBG texture load', bgImgUrl)
    let texture = new THREE.TextureLoader().load(bgImgUrl)
    // let planeMaterial = new THREE.MeshLambertMaterial({ map: texture })
    let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    let plane = new THREE.Mesh(geometry, material);
    plane.position.set(x, y, z)
    plane.lookAt(currentField.fieldCamera.position)
    plane.setRotationFromEuler(currentField.fieldCamera.rotation)
    plane.visible = visible
    plane.userData = userData
    group.add(plane)
}

const placeBG = async (cameraTarget, fieldName) => {
    let assetDimensions = await imageDimensions(`${KUJATA_BASE}/metadata/makou-reactor/backgrounds/${fieldName}.png`)

    // Create meta-data
    currentField.metaData = {
        assetDimensions: assetDimensions,
        width: assetDimensions.width / config.sizing.width,
        height: assetDimensions.height / config.sizing.height,
        bgScale: 1, // assetDimensions.height / config.sizing.height,
        adjustedFOV: currentField.fieldCamera.fov * (assetDimensions.height / config.sizing.height),
        cameraUnknown: currentField.data.cameraSection.cameras[0].unknown,
        modelScale: currentField.data.model.header.modelScale,
        scaleDownValue: getModelScaleDownValue(),
        numModels: currentField.data.model.header.numModels,
        layersAvailable: currentField.backgroundData !== undefined,
        bgZDistance: 1024,
        fieldCoordinates: { x: 0, y: 0 } // Defaults, will be updated

    }
    // console.log('currentField.metaData', currentField.metaData)

    // Rescale renderer and cameras for scene
    anim.renderer.setSize(assetDimensions.width * config.sizing.factor * currentField.metaData.bgScale, assetDimensions.height * config.sizing.factor * currentField.metaData.bgScale)
    currentField.fieldCamera.aspect = assetDimensions.width / assetDimensions.height
    currentField.fieldCamera.fov = currentField.metaData.adjustedFOV
    currentField.fieldCamera.lookAt(cameraTarget)
    currentField.fieldCamera.updateProjectionMatrix()
    currentField.debugCamera.aspect = assetDimensions.width / assetDimensions.height
    currentField.debugCamera.fov = currentField.metaData.adjustedFOV
    currentField.fieldCamera.lookAt(cameraTarget)
    currentField.debugCamera.updateProjectionMatrix()



    // Draw backgrounds
    // let lookAtDistance = currentField.fieldCamera.position.distanceTo(cameraTarget)
    // console.log('lookAtDistance', lookAtDistance, lookAtDistance * 4096)
    let intendedDistance = 1
    currentField.backgroundLayers = new THREE.Group()
    for (let i = 0; i < currentField.backgroundData.length; i++) {
        const layer = currentField.backgroundData[i]
        if (layer.depth === 0) {
            layer.depth = 1
        }


        if (layer.z <= 10) { // z = doesn't show, just set it slightly higher for now
            layer.z = layer.z + 10
        }
        // If layer containers a param, make sure it sits infront of its default background
        if (layer.param > 0) {
            layer.z = layer.z - 1
        }
        let visible = layer.param === 0 // By default hide all non zero params, field op codes will how them

        // const bgDistance = (intendedDistance * (layer.z / 4096)) // First attempt at ratios, not quite right but ok
        const bgDistance = layer.z / currentField.metaData.bgZDistance // First attempt at ratios, not quite right but ok
        // console.log('Layer', layer, bgDistance)

        const userData = {
            z: layer.z,
            param: layer.param,
            state: layer.state
        }
        let bgVector = new THREE.Vector3().lerpVectors(currentField.fieldCamera.position, cameraTarget, bgDistance)
        drawBG(bgVector.x, bgVector.y, bgVector.z, bgDistance, `${KUJATA_BASE}/metadata/background-layers/${fieldName}/${layer.fileName}`, currentField.backgroundLayers, visible, userData)
    }
    currentField.fieldScene.add(currentField.backgroundLayers)
}

const setupViewClipping = async () => {
    anim.renderer.setSize(config.sizing.width * config.sizing.factor, config.sizing.height * config.sizing.factor)

    // Need to set a default, this is centre, should really be triggered from the player character being active on the screen
    const x = currentField.metaData.assetDimensions.width / 2
    const y = currentField.metaData.assetDimensions.height / 2
    adjustViewClipping(x, y)
    console.log('currentField.metaData', currentField.metaData)
}
const adjustViewClipping = async (x, y) => {
    currentField.metaData.fieldCoordinates.x = x
    currentField.metaData.fieldCoordinates.y = y
    let adjustedX = x - (config.sizing.width / 2)
    let adjustedY = y - (config.sizing.height / 2)
    adjustedX = Math.min(adjustedX, 2 * (currentField.metaData.assetDimensions.width / 2 - (config.sizing.width / 2)))
    adjustedY = Math.min(adjustedY, 2 * (currentField.metaData.assetDimensions.height / 2 - (config.sizing.height / 2)))
    adjustedX = Math.max(adjustedX, 0)
    adjustedY = Math.max(adjustedY, 0)
    // console.log('x', x, '->', adjustedX, 'y', y, '->', adjustedY)

    currentField.fieldCamera.setViewOffset(
        currentField.metaData.assetDimensions.width * config.sizing.factor,
        currentField.metaData.assetDimensions.height * config.sizing.factor,
        adjustedX * config.sizing.factor,
        adjustedY * config.sizing.factor,
        config.sizing.width * config.sizing.factor,
        config.sizing.height * config.sizing.factor,
    )
}
const initField = async (fieldName) => {
    // Reset field values
    currentField = {
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
        backgroundLayers: undefined
    }

    currentField.data = await loadField(fieldName)
    currentField.backgroundData = await loadFieldBackground(fieldName)
    currentField.models = await loadModels(currentField.data.model.modelLoaders)
    let cameraTarget = setupFieldCamera()
    drawWalkmesh()
    placeModels()
    await placeBG(cameraTarget, fieldName)
    setupDebugControls(cameraTarget)
    startFieldRenderLoop()
    await setupViewClipping()
    await initFieldDebug()
}

const init = () => {
    anim.container = document.getElementById('container')
    showStats()
    setupInputs()
    initDebug()
    initField('mrkt2')
}

init()
