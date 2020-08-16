import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js'
import { getDialogTextures, getDialogLetter } from './field-fetch-data.js'


let scene
let camera
let dialogs

let EDGE_SIZE = 8
let DIALOG_BG_COLORS = ['rgb(0,88,176)', 'rgb(0,0,80)', 'rgb(0,0,128)', 'rgb(0,0,32)']

const createTextureMesh = (w, h, texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    material.map.minFilter = THREE.LinearFilter
    return new THREE.Mesh(
        new THREE.PlaneBufferGeometry(w, h),
        material)
}
const adjustDialogExpandPos = (mesh, step, stepTotal, z) => {
    mesh.position.set(
        mesh.userData.posSmall.x - ((mesh.userData.posSmall.x - mesh.userData.posExpand.x) / stepTotal * step),
        mesh.userData.posSmall.y - ((mesh.userData.posSmall.y - mesh.userData.posExpand.y) / stepTotal * step),
        z)
}
const adjustDialogExpandSize = (mesh, step, stepTotal, bgGeo) => {
    mesh.geometry = new THREE.PlaneBufferGeometry(
        mesh.userData.sizeSmall.w - ((mesh.userData.sizeSmall.w - mesh.userData.sizeExpand.w) / stepTotal * step),
        mesh.userData.sizeSmall.h - ((mesh.userData.sizeSmall.h - mesh.userData.sizeExpand.h) / stepTotal * step))
    // mesh.geometry.colorsNeedUpdate = true
    bgGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(4 * 3), 3))
    for (let i = 0; i < DIALOG_BG_COLORS.length; i++) {
        // This is not a smooth blend, but instead changes the vertices of the two triangles
        // This is how they do it in the game
        const color = new THREE.Color(DIALOG_BG_COLORS[i])
        bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
    }
}
const createClippingPlanes = (w, h, z, t, b, l, r) => {
    let bgClipPlanes = []
    const bgClipDatas = [
        { w: w + EDGE_SIZE, h: 10, mesh: t, x: 0, h: 2, rotateX: true, flip: false },
        { w: w + EDGE_SIZE, h: 10, mesh: b, x: 0, h: -2, rotateX: true, flip: true },
        { w: 10, h: h + EDGE_SIZE, mesh: l, x: -2, h: 0, rotateX: false, flip: false },
        { w: 10, h: h + EDGE_SIZE, mesh: r, x: 2, h: 0, rotateX: false, flip: true },
    ]
    for (let i = 0; i < bgClipDatas.length; i++) {
        const bgClipData = bgClipDatas[i]
        const normal = new THREE.Vector3()
        if (bgClipData.rotateX && bgClipData.flip) {
            normal.y = 1
        } else if (bgClipData.rotateX && !bgClipData.flip) {
            normal.y = -1
        } else if (!bgClipData.rotateX && !bgClipData.flip) {
            normal.x = 1
        } else if (!bgClipData.rotateX && bgClipData.flip) {
            normal.x = -1
        }
        const bgClipPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
            normal,
            new THREE.Vector3(bgClipData.mesh.position.x + bgClipData.x, bgClipData.mesh.position.y + bgClipData.h, z))
        // const bgClipPlaneHelper = new THREE.PlaneHelper(bgClipPlane, 1000, 0xff00ff)
        // scene.add(bgClipPlaneHelper)
        bgClipPlanes.push(bgClipPlane)
    }
    return bgClipPlanes
}
const createDialogBox = async (x, y, w, h, z) => {

    const dialogBox = new THREE.Group()
    const dialogTextures = getDialogTextures()
    const bgGeo = new THREE.PlaneBufferGeometry(w - EDGE_SIZE + 3, h - EDGE_SIZE + 3)
    bgGeo.colorsNeedUpdate = true

    bgGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(4 * 3), 3))
    for (let i = 0; i < DIALOG_BG_COLORS.length; i++) {
        // This is not a smooth blend, but instead changes the vertices of the two triangles
        // This is how they do it in the game
        const color = new THREE.Color(DIALOG_BG_COLORS[i])
        bgGeo.getAttribute('color').setXYZ(i, color.r, color.g, color.b)
    }
    const bg = new THREE.Mesh(bgGeo, new THREE.MeshBasicMaterial({ transparent: true, vertexColors: THREE.VertexColors }))
    bg.userData.sizeSmall = { w: (EDGE_SIZE * 2) - 3, h: (EDGE_SIZE * 2) - 3 }
    bg.userData.sizeExpand = { w: w - EDGE_SIZE + 3, h: h - EDGE_SIZE + 3 }
    bg.userData.posSmall = { x: x + (w / 2), y: window.config.sizing.height - y - (h / 2), z: z }
    bg.userData.posExpand = { x: x + (w / 2), y: window.config.sizing.height - y - (h / 2), z: z }
    bg.position.set(bg.userData.posSmall.x, bg.userData.posSmall.y, z)
    dialogBox.add(bg)

    const tl = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.tl)
    tl.userData.posSmall = { x: x + (w / 2) - (EDGE_SIZE / 2), y: window.config.sizing.height - y - (h / 2) + (EDGE_SIZE / 2), z: z }
    tl.userData.posExpand = { x: x + (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2), z: z }
    tl.position.set(tl.userData.posSmall.x, tl.userData.posSmall.y, z)
    dialogBox.add(tl)

    const tr = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.tr)
    tr.userData.posSmall = { x: x + (w / 2) + (EDGE_SIZE / 2), y: window.config.sizing.height - y - (h / 2) + (EDGE_SIZE / 2), z: z }
    tr.userData.posExpand = { x: x + (EDGE_SIZE / 2) + w - EDGE_SIZE, y: window.config.sizing.height - y - (EDGE_SIZE / 2), z: z }
    tr.position.set(tr.userData.posSmall.x, tr.userData.posSmall.y, z)
    dialogBox.add(tr)

    const bl = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.bl)
    bl.userData.posSmall = { x: x + (w / 2) - (EDGE_SIZE / 2), y: window.config.sizing.height - y - (h / 2) - (EDGE_SIZE / 2), z: z }
    bl.userData.posExpand = { x: x + (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2) - h + EDGE_SIZE, z: z }
    bl.position.set(bl.userData.posSmall.x, bl.userData.posSmall.y, z)
    dialogBox.add(bl)

    const br = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.br)
    br.userData.posSmall = { x: x + (w / 2) + (EDGE_SIZE / 2), y: window.config.sizing.height - y - (h / 2) - (EDGE_SIZE / 2), z }
    br.userData.posExpand = { x: x + (EDGE_SIZE / 2) + w - EDGE_SIZE, y: window.config.sizing.height - y - (EDGE_SIZE / 2) - h + EDGE_SIZE, z: z }
    br.position.set(br.userData.posSmall.x, br.userData.posSmall.y, z)
    dialogBox.add(br)

    const l = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.l)
    l.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
    l.userData.sizeExpand = { w: EDGE_SIZE, h: h - EDGE_SIZE * 2 }
    l.userData.posSmall = { x: x + (w / 2) - (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2) - (h / 2) + (EDGE_SIZE / 2), z: z }
    l.userData.posExpand = { x: x + (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2) - (h / 2) + (EDGE_SIZE / 2), z: z }
    l.position.set(l.userData.posSmall.x, l.userData.posSmall.y, z)
    dialogBox.add(l)

    const r = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.r)
    r.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
    r.userData.sizeExpand = { w: EDGE_SIZE, h: h - EDGE_SIZE * 2 }
    r.userData.posSmall = { x: x + (w / 2) + (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2) - (h / 2) + (EDGE_SIZE / 2), z }
    r.userData.posExpand = { x: x + (EDGE_SIZE / 2) + w - EDGE_SIZE, y: window.config.sizing.height - y - (EDGE_SIZE / 2) - (h / 2) + (EDGE_SIZE / 2), z }
    r.position.set(r.userData.posSmall.x, r.userData.posSmall.y, z)
    dialogBox.add(r)

    const t = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.t)
    t.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
    t.userData.sizeExpand = { w: w - EDGE_SIZE * 2, h: EDGE_SIZE }
    t.userData.posSmall = { x: x + (w / 2), y: window.config.sizing.height - y - (h / 2) + (EDGE_SIZE / 2), z: z }
    t.userData.posExpand = { x: x + (EDGE_SIZE / 2) + (w / 2) - (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2), z: z }
    t.position.set(t.userData.posSmall.x, t.userData.posSmall.y, z)
    dialogBox.add(t)

    const b = createTextureMesh(EDGE_SIZE, EDGE_SIZE, dialogTextures.b)
    b.userData.sizeSmall = { w: EDGE_SIZE, h: EDGE_SIZE }
    b.userData.sizeExpand = { w: w - EDGE_SIZE * 2, h: EDGE_SIZE }
    b.userData.posSmall = { x: x + (w / 2), y: window.config.sizing.height - y - (h / 2) - (EDGE_SIZE / 2), z: z }
    b.userData.posExpand = { x: x + (EDGE_SIZE / 2) + (w / 2) - (EDGE_SIZE / 2), y: window.config.sizing.height - y - (EDGE_SIZE / 2) - h + EDGE_SIZE, z: z }
    b.position.set(b.userData.posSmall.x, b.userData.posSmall.y, z)
    dialogBox.add(b)




    bg.material.clippingPlanes = createClippingPlanes(w, h, z, t, b, l, r)

    console.log('bg', bg)


    dialogs.add(dialogBox)
    scene.add(dialogBox)
    // scene.add(dialogBox)

    console.log('go')

    // step 1
    const posAdjustList = [tl, tr, bl, br, l, r, t, b]
    const sizeAdjustList = [l, r, t, b]
    const speed = 15
    const stepTotal = 6

    // 1/3
    for (let step = 1; step <= stepTotal; step++) {
        await sleep(speed)
        posAdjustList.map(mesh => adjustDialogExpandPos(mesh, step, stepTotal, z))
        sizeAdjustList.map(mesh => adjustDialogExpandSize(mesh, step, stepTotal, bgGeo))
        // bg.material.clippingPlanes.map(p => p.destroy())
        bg.material.clippingPlanes = createClippingPlanes(w, h, z, t, b, l, r)
    }
}

const addDialogText = async (x, y, w, h, z, text) => {
    console.log('addDialogText', text)

    let offsetX = 0
    let offsetY = 0
    for (let i = 0; i < text.length; i++) {
        const letter = text[i]
        console.log('letter', letter)
        const textureLetter = getDialogLetter(letter)
        console.log('textureLetter', textureLetter)

        const mesh = createTextureMesh(textureLetter.w, textureLetter.h, textureLetter.texture)
        mesh.position.set(x + 12 + offsetX, window.config.sizing.height - y - 12 - offsetY, z)
        offsetX = offsetX + textureLetter.w
        scene.add(mesh)
    }

}
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const loadFont = async () => {
    return new Promise((resolve, reject) => {
        new THREE.FontLoader().load('../../assets/threejs-r118/fonts/helvetiker_regular.typeface.json', (font) => {
            resolve(font)
        })
    })
}
const setupOrthoCamera = async () => {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x000000)
    const font = await loadFont()

    camera = new THREE.OrthographicCamera(
        0,
        window.config.sizing.width,
        window.config.sizing.height,
        0,
        0, 10000)
    camera.position.z = 1

    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true })


    dialogs = new THREE.Group()

    // await sleep(2500)

    const textGeo = new THREE.TextGeometry('ORTHO TEST', {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false
    })
    const text = new THREE.Mesh(textGeo, material)
    text.position.y = 4
    scene.add(text)

    console.log('setupOrthoCamera: END')
}

export {
    setupOrthoCamera,
    scene,
    camera,
    createDialogBox,
    addDialogText
}