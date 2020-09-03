import * as THREE from '../../assets/threejs-r118/three.module.js'

const isCharacterTheLeader = (characterName) => {
    // A lot of logic / assumptions to look at here, for now, just check if it's cloud
    if (characterName === 'Cloud') {
        return true
    }
    return false
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

const getModelByEntityName = (entityName) => {
    return window.currentField.models.filter(m => m.userData.entityName === entityName)[0]
}

const setModelAsEntity = (entityName, modelId) => {
    // console.log('setModelAsEntity', entityName, modelId)
    const model = window.currentField.models[modelId]
    model.userData.entityName = entityName
    const scaleDownValue = getModelScaleDownValue()
    model.scene.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
    // model.scene.position.set(op.x / 4096, op.y / 4096, op.z / 4096)
    model.scene.rotation.x = THREE.Math.degToRad(90)
    model.scene.up.set(0, 0, 1)
    // console.log('setModelAsEntity: END', entityName, modelId, model)
    window.currentField.fieldScene.add(model.scene)
}
const setModelAsPlayableCharacter = (entityName, characterName) => {
    const model = getModelByEntityName(entityName)
    model.userData.isPlayableCharacter = true
    model.userData.isLeader = isCharacterTheLeader(characterName)
    model.userData.characterName = characterName
    console.log('setModelAsPlayableCharacter', entityName, model)
}

const placeModel = (entityName, x, y, z, triangleId) => {
    console.log('placeModel: START', entityName, x, y, z, triangleId)
    const model = getModelByEntityName(entityName)

    // TODO - Potentially to do a little more, like use x, y, get z from triangle etc

    if (triangleId !== undefined) {
        // Get the central point on the triangleId
        const triangle = window.currentField.data.walkmeshSection.triangles[triangleId].vertices
        const triangleX = (triangle[0].x + triangle[1].x + triangle[2].x) / 3
        const triangleY = (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        const triangleZ = (triangle[0].z + triangle[1].z + triangle[2].z) / 3
        model.scene.position.set(
            triangleX / 4096,
            triangleY / 4096,
            triangleZ / 4096)
        console.log('placeModel: triangleId', triangleId, triangle, '->', x, y, z)
    } else {
        model.scene.position.set(
            x / 4096,
            y / 4096,
            z / 4096)
        console.log('placeModel: xyz', x, y, z)
    }
}
const setModelVisibility = (entityName, isVisible) => {
    console.log('setModelVisibility', entityName, isVisible)
    const model = getModelByEntityName(entityName)
    model.scene.visible = isVisible
}
const setModelDirection = (entityName, direction) => {
    console.log('setModelVisibility', entityName, direction)
    const model = getModelByEntityName(entityName)
    model.scene.rotateY(THREE.Math.degToRad(direction))
}


export {
    setModelAsEntity,
    setModelAsPlayableCharacter,
    placeModel,
    setModelVisibility,
    setModelDirection
}