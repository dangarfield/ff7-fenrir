import * as THREE from '../../assets/threejs-r118/three.module.js' //'https://cdnjs.cloudflare.com/ajax/libs/three.js/r118/three.module.min.js'
import { getDialogTextures, getDialogLetter, getPointRight } from './field-fetch-data.js'
import { getActiveInputs } from '../interaction/inputs.js'


let scene
let camera
let dialogBoxes = []

let EDGE_SIZE = 8
let CONFIG_WINDOW_COLOR = ['rgb(0,88,176)', 'rgb(0,0,80)', 'rgb(0,0,128)', 'rgb(0,0,32)']
let CONFIG_FIELD_MESSAGE = 0 // 0-255 slow - fast

let CHARACTER_NAMES = [
    { id: 'Cloud', name: 'Cloud' },
    { id: 'BARRET', name: 'Barret' },
    { id: 'TIFA', name: 'TIFA' },
    { id: 'AERIS', name: 'Aeris' },
    { id: 'RED XIII', name: 'Red XIII' },
    { id: 'YUFFIE', name: 'Yuffie' },
    { id: 'CAIT SITH', name: 'Cait Sith' },
    { id: 'YOUNG CLOUD', name: 'Young Cloud' },
    { id: 'VINCENT', name: 'Vincent' },
    { id: 'SEPHROTH', name: 'Sephiroth' },
    { id: 'CID', name: 'Cid' },
]

const DIALOG_APPEAR_SPEED = 15
const DIALOG_APPEAR_STEP_TOTAL = 6

const createTextureMesh = (w, h, texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
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
    bgGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(4 * 3), 3))
    for (let i = 0; i < CONFIG_WINDOW_COLOR.length; i++) {
        // This is not a smooth blend, but instead changes the vertices of the two triangles
        // This is how they do it in the game
        const color = new THREE.Color(CONFIG_WINDOW_COLOR[i])
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
        bgClipPlanes.push(bgClipPlane)
    }
    return bgClipPlanes
}
const createDialogBox = async (id, x, y, w, h, z) => {

    const dialogBox = new THREE.Group()
    const dialogTextures = getDialogTextures()
    const bgGeo = new THREE.PlaneBufferGeometry(w - EDGE_SIZE + 3, h - EDGE_SIZE + 3)
    bgGeo.colorsNeedUpdate = true

    bgGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(4 * 3), 3))
    for (let i = 0; i < CONFIG_WINDOW_COLOR.length; i++) {
        // This is not a smooth blend, but instead changes the vertices of the two triangles
        // This is how they do it in the game
        const color = new THREE.Color(CONFIG_WINDOW_COLOR[i])
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

    // All this metadata isn't nice, but would like to keep to createWindow and showWindowWithDialog methods
    dialogBox.userData.id = id
    dialogBox.userData.state = 'opening'
    dialogBox.userData.x = x
    dialogBox.userData.y = y
    dialogBox.userData.w = w
    dialogBox.userData.h = h
    dialogBox.userData.z = z
    dialogBox.userData.posAdjustList = [tl, tr, bl, br, l, r, t, b]
    dialogBox.userData.sizeAdjustList = [t, b, l, r]
    dialogBox.userData.bg = bg
    dialogBox.userData.bgGeo = bgGeo

    bg.material.clippingPlanes = createClippingPlanes(w, h, z, t, b, l, r)

    dialogBoxes[id] = dialogBox
    dialogBox.visible = false
    scene.add(dialogBox)
}

const replaceCharacterNames = (text) => {
    for (let i = 0; i < CHARACTER_NAMES.length; i++) {
        const characterName = CHARACTER_NAMES[i]
        text = text.replace(new RegExp(`{${characterName.id}}`, 'g'), characterName.name)
    }
    return text
}
const showWindowWithDialog = async (windowId, text) => {
    console.log('showWindowWithDialog', windowId, text, dialogBoxes, dialogBoxes[windowId])
    const dialogBox = dialogBoxes[windowId]



    // Show dialog
    dialogBox.visible = true

    for (let step = 1; step <= DIALOG_APPEAR_STEP_TOTAL; step++) {
        await sleep(DIALOG_APPEAR_SPEED)
        dialogBox.userData.posAdjustList.map(mesh => adjustDialogExpandPos(mesh, step, DIALOG_APPEAR_STEP_TOTAL, dialogBox.userData.z))
        dialogBox.userData.sizeAdjustList.map(mesh => adjustDialogExpandSize(mesh, step, DIALOG_APPEAR_STEP_TOTAL, dialogBox.userData.bgGeo))

        dialogBox.userData.bg.material.clippingPlanes = createClippingPlanes(
            dialogBox.userData.w, dialogBox.userData.h, dialogBox.userData.z,
            dialogBox.userData.sizeAdjustList[0], dialogBox.userData.sizeAdjustList[1], dialogBox.userData.sizeAdjustList[2], dialogBox.userData.sizeAdjustList[3])
    }
    dialogBox.userData.state = 'writing-text'

    // Configure text
    let offsetX = 0
    let offsetY = 0
    const LINE_HEIGHT = 16
    text = text.replace(/\t/, '    ')
    text = replaceCharacterNames(text)
    // TODO - Colours, eg <fe>{PURPLE}
    // TODO - Buttons, eg [CANCEL]
    // TODO - Choices, eg {CHOICE}

    const letters = []
    let choiceLines = []


    let textLines = text.split('<br/>')

    for (let i = 0; i < textLines.length; i++) {
        let textLine = textLines[i]

        if (textLine.includes('{CHOICE}')) { choiceLines.push(i) }
        textLine = textLine.replace(/\{CHOICE\}/g, '         ')

        for (let j = 0; j < textLine.length; j++) {
            const letter = textLine[j]
            const textureLetter = getDialogLetter(letter)
            // console.log('letter', letter, textureLetter, textureLetter.w, textureLetter.h)
            if (textureLetter !== null) {
                const mesh = createTextureMesh(textureLetter.w, textureLetter.h, textureLetter.texture)
                const posX = dialogBox.userData.x + 8 + offsetX + (textureLetter.w / 2)
                const posY = window.config.sizing.height - dialogBox.userData.y - 12 - offsetY
                mesh.material.clippingPlanes = dialogBox.userData.bg.material.clippingPlanes
                // console.log('pox', posX, '+', textureLetter.w, '->', posX + textureLetter.w, '.', posY, '-', textureLetter.h, '->', posY - textureLetter.h)
                // console.log('letter', letter, mesh.material)
                mesh.userData.isText = true
                mesh.position.set(posX, posY, dialogBox.userData.z)
                offsetX = offsetX + textureLetter.w
                letters.push(mesh)
            } else {
                console.log('no char found', letter)
            }
        }
        offsetX = 0
        offsetY = offsetY + LINE_HEIGHT
    }
    // Show text
    let speedUpHoldLetter = -1
    for (let i = 0; i < letters.length; i++) {
        dialogBox.add(letters[i])
        // This speeding up logic isn't completly accurate to the game but I think it is a little more usable
        // Eg, game, requires you to let go and then press again, this only requires you to keep holding
        // Game, when you le go, it stops going fast, this keeps it going fast for this dialog
        if (speedUpHoldLetter === -1 && getActiveInputs().o) {
            speedUpHoldLetter = i
        }
        let speed = Math.floor((CONFIG_FIELD_MESSAGE / (255 / 52)) + 3)
        if (speedUpHoldLetter !== -1 && (speedUpHoldLetter + 7) < i) {
            speed = Math.floor(speed / 3)
        }
        // console.log('speedUpHoldLetter', speedUpHoldLetter, i, speed)
        await sleep(speed)
    }
    // console.log('choiceLines', choiceLines, text)
    if (choiceLines.length > 0) {
        const pointRight = getPointRight()
        const pointerMesh = createTextureMesh(pointRight.w, pointRight.h, pointRight.texture)

        let pointerPositions = []
        for (let i = 0; i < choiceLines.length; i++) {
            const choiceLine = choiceLines[i]
            pointerPositions.push({ id: i, x: dialogBox.userData.x + 19, y: window.config.sizing.height - dialogBox.userData.y - 12 - (LINE_HEIGHT * choiceLine), z: dialogBox.userData.z })
        }
        pointerMesh.userData.choices = pointerPositions
        dialogBox.userData.currentChoice = 0
        pointerMesh.userData.totalChoices = choiceLines.length
        // console.log('pointerPositions', pointerPositions)
        pointerMesh.position.set(pointerPositions[0].x, pointerPositions[0].y, pointerPositions[0].z)
        dialogBox.userData.state = 'choice'
        dialogBox.add(pointerMesh)
    } else {
        dialogBox.userData.state = 'done'
    }

    // TODO - Multiple Pages, choices ?!

    // Wait for closing ?!
    await waitForDialogToClose(windowId)
}

const navigateChoice = (navigateDown) => {
    for (let i = 0; i < dialogBoxes.length; i++) {
        if (dialogBoxes[i] !== null && dialogBoxes[i] !== undefined) {
            if (dialogBoxes[i].userData.state === 'choice') {
                const dialogBox = dialogBoxes[i]
                // console.log('navigate choice for dialogBox', dialogBox)
                for (let j = 0; j < dialogBox.children.length; j++) {
                    if (dialogBox.children[j].userData.choices) {
                        const pointerMesh = dialogBox.children[j]
                        const currentChoice = dialogBox.userData.currentChoice
                        const pointerPositions = pointerMesh.userData.choices
                        let nextChoice = navigateDown ? currentChoice + 1 : currentChoice - 1
                        if (nextChoice < 0) { nextChoice = pointerMesh.userData.totalChoices - 1 }
                        else if (nextChoice >= pointerMesh.userData.totalChoices) { nextChoice = 0 }
                        // console.log('navigateChoice', currentChoice, nextChoice)

                        dialogBox.userData.currentChoice = nextChoice
                        pointerMesh.position.set(pointerPositions[nextChoice].x, pointerPositions[nextChoice].y, pointerPositions[nextChoice].z)
                    }
                }
            }
        }
    }
}
const waitForDialogToClose = async (id) => {
    console.log('waitForDialogToClose: START')
    let currentChoice = dialogBoxes[id].currentChoice
    while (dialogBoxes[id] !== null) {
        await sleep(50)
        currentChoice = dialogBoxes[id].currentChoice
    }
    // TODO - Return this choice in a synchronous manner to initiator
    console.log('waitForDialogToClose: END', currentChoice)
    return currentChoice
}
const closeActiveDialog = async (id) => {
    const dialogBox = dialogBoxes[id]
    console.log('closeActiveDialog', id, dialogBox, dialogBox.userData.state)

    if (dialogBox.userData.state === 'done') {
        for (let step = DIALOG_APPEAR_STEP_TOTAL - 1; step >= 0; step--) {

            dialogBox.userData.posAdjustList.map(mesh => adjustDialogExpandPos(mesh, step, DIALOG_APPEAR_STEP_TOTAL, dialogBox.userData.z))
            dialogBox.userData.sizeAdjustList.map(mesh => adjustDialogExpandSize(mesh, step, DIALOG_APPEAR_STEP_TOTAL, dialogBox.userData.bgGeo))
            const clippingPlanes = createClippingPlanes(
                dialogBox.userData.w, dialogBox.userData.h, dialogBox.userData.z,
                dialogBox.userData.sizeAdjustList[0], dialogBox.userData.sizeAdjustList[1], dialogBox.userData.sizeAdjustList[2], dialogBox.userData.sizeAdjustList[3])

            dialogBox.userData.bg.material.clippingPlanes = clippingPlanes
            for (let i = 0; i < dialogBox.children.length; i++) {
                if (dialogBox.children[i].userData.isText) {
                    dialogBox.children[i].material.clippingPlanes = clippingPlanes
                }
            }
            await sleep(DIALOG_APPEAR_SPEED)
        }
        dialogBox.userData.state = 'closed'
        scene.remove(dialogBox)
        dialogBoxes[id] = null
    }

}

const closeActiveDialogs = async () => {
    console.log('closeActiveDialogs: START', dialogBoxes)
    for (let i = 0; i < dialogBoxes.length; i++) {
        if (dialogBoxes[i] !== null && dialogBoxes[i] !== undefined) {
            await closeActiveDialog(dialogBoxes[i].userData.id)
        }
    }
    console.log('closeActiveDialogs: END', dialogBoxes)
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

    // const textGeo = new THREE.TextGeometry('ORTHO TEST', {
    //     font: font,
    //     size: 5,
    //     height: 1,
    //     curveSegments: 10,
    //     bevelEnabled: false
    // })
    // const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true })
    // const text = new THREE.Mesh(textGeo, material)
    // text.position.y = 4
    // scene.add(text)

    console.log('setupOrthoCamera: END')
}

export {
    setupOrthoCamera,
    scene,
    camera,
    createDialogBox,
    showWindowWithDialog,
    waitForDialogToClose,
    closeActiveDialogs,
    navigateChoice
}