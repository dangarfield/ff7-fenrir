import * as THREE from '../../assets/threejs-r118/three.module.js'
import { orthoScene } from './world-scene.js'

import { loadField } from '../field/field-module.js'
import { getWorldToFieldTransitionData, getSceneGraph } from '../data/world-fetch-data.js'

// NOTE: This is only here to allow easier navigation before implementing the main world map

let metadata
let font
let destinationGroup
let currentNavigation = 0
const WHITE = new THREE.Color(0xFFFFFF)
const GREY = new THREE.Color(0x333333)
let readyForNavigation = false

const loadFont = async () => {
    return new Promise((resolve, reject) => {
        new THREE.FontLoader().load('../../assets/threejs-r118/fonts/helvetiker_regular.typeface.json', (font) => {
            resolve(font)
        })
    })
}
const loadMetadata = async () => {
    const transitionData = await getWorldToFieldTransitionData()
    const sceneGraph = await getSceneGraph()

    metadata = []
    const wmIds = Object.keys(transitionData)
    for (let i = 0; i < wmIds.length; i++) {
        const wmId = wmIds[i]
        metadata.push({
            wmId: wmId,
            section: 'sectionA',
            data: transitionData[wmId].sectionA,
            fieldId: transitionData[wmId].sectionA.fieldId,
            fieldName: sceneGraph.nodes[transitionData[wmId].sectionA.fieldId].fieldName,
            fieldDescription: sceneGraph.nodes[transitionData[wmId].sectionA.fieldId].mapNames.length > 0 ? sceneGraph.nodes[transitionData[wmId].sectionA.fieldId].mapNames[0] : sceneGraph.nodes[transitionData[wmId].sectionA.fieldId].fieldName
        })
        if (transitionData[wmId].sectionB.fieldId > 0) {
            metadata.push({
                wmId: wmId,
                section: 'sectionB',
                data: transitionData[wmId].sectionB,
                fieldId: transitionData[wmId].sectionB.fieldId,
                fieldName: sceneGraph.nodes[transitionData[wmId].sectionB.fieldId].fieldName,
                fieldDescription: (sceneGraph.nodes[transitionData[wmId].sectionB.fieldId].mapNames.length > 0 ? sceneGraph.nodes[transitionData[wmId].sectionB.fieldId].mapNames[0] : sceneGraph.nodes[transitionData[wmId].sectionB.fieldId].fieldName) + ' B'
            })
        }

    }
}

const addDestinationText = (text, row, col) => {
    const textGeo = new THREE.TextBufferGeometry(text, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false
    })
    const material = new THREE.MeshBasicMaterial({ color: GREY, transparent: true })
    const mesh = new THREE.Mesh(textGeo, material)
    mesh.position.y = 240 - 8 - (row * 9)
    mesh.position.x = 4 + (col * 110)
    destinationGroup.add(mesh)
    return mesh
}
const highlightCurrentDestination = () => {
    for (let i = 0; i < metadata.length; i++) {
        if (i === currentNavigation) {
            metadata[i].scene.material.color = WHITE
        } else {
            metadata[i].scene.material.color = GREY
        }
    }
}
const getLastFieldIndex = (lastWMFieldReference) => {
    for (let i = 0; i < metadata.length; i++) {
        if (metadata[i].wmId === lastWMFieldReference) {
            return i
        }
    }
    return 0
}
const tempLoadDestinationSelector = async (lastWMFieldReference) => {
    console.log('tempLoadDestinationSelector LOADING META', lastWMFieldReference)
    if (metadata === undefined) {
        await loadMetadata()
    }
    console.log('tempLoadDestinationSelector LOADING FONT', metadata)
    font = await loadFont()
    destinationGroup = new THREE.Group()
    orthoScene.add(destinationGroup)
    console.log('tempLoadDestinationSelector ADDING TEXT')
    for (let i = 0; i < metadata.length; i++) {
        const destination = metadata[i]
        // console.log('tempLoadDestinationSelector destination', destination)
        destination.selected = false
        const row = Math.floor(i / 3)
        const col = i - row * 3
        destination.scene = addDestinationText(destination.fieldDescription, row, col)
    }
    console.log('tempLoadDestinationSelector HIGHLIGHTING')
    currentNavigation = getLastFieldIndex(lastWMFieldReference)
    highlightCurrentDestination()
    readyForNavigation = true
    console.log('tempLoadDestinationSelector DONE')
}
const navigateAndHighlight = (change) => {
    if (readyForNavigation) {
        currentNavigation = currentNavigation + change
        currentNavigation = Math.max(0, currentNavigation)
        currentNavigation = Math.min(metadata.length, currentNavigation)
        console.log('tempLoadDestinationSelector navigateAndHighlight', change, currentNavigation, metadata[currentNavigation])
        highlightCurrentDestination()
    }

}
const navigateUp = () => {
    navigateAndHighlight(-3)
}
const navigateDown = () => {
    navigateAndHighlight(3)
}
const navigateLeft = () => {
    navigateAndHighlight(-1)
}
const navigateRight = () => {
    navigateAndHighlight(+1)
}
const navigateSelect = () => {
    if (readyForNavigation) {
        const destination = metadata[currentNavigation]
        console.log('tempLoadDestinationSelector navigateSelect', currentNavigation, destination)

        // const { fieldName, playableCharacterInitData } = setupFieldTransitionData(destination.wmId, destination.section, destination.fieldName)
        const playableCharacterInitData = {
            triangleId: destination.data.triangleId,
            position: {
                x: destination.data.x,
                y: destination.data.y
            },
            direction: destination.data.direction,
            characterName: 'Cloud' // This can be remove though
        }
        console.log('tempLoadDestinationSelector loadField', destination.fieldName, playableCharacterInitData)
        loadField(destination.fieldName, playableCharacterInitData)
    }
}

export {
    tempLoadDestinationSelector,
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight,
    navigateSelect
}