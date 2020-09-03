import * as fieldModels from './field-models.js'
import { getPlayableCharacterName } from './field-op-codes-party-helper.js'
import { createNanoEvents } from '../../assets/nanoevents.js'
const CHAR = async (entityName, op) => {
    console.log('CHAR', entityName, op)
    fieldModels.setModelAsEntity(entityName, op.n)
    // Don't need to explicitly do anything as the window.currentField.models has loaded these already
    return {}
}
const PC = async (entityName, op) => {
    console.log('PC', entityName, op)
    fieldModels.setModelAsPlayableCharacter(entityName, getPlayableCharacterName(op.c))
    return {}
}
const XYZI = async (entityName, op) => {
    console.log('XYZI', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const z = op.b3 == 0 ? op.z : getBankData(op.b3, op.z)
    const triangleId = op.b4 == 0 ? op.i : getBankData(op.b4, op.i)
    fieldModels.placeModel(entityName, x, y, z, triangleId)
    return {}
}
const XYI = async (entityName, op) => {
    console.log('XYI', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const triangleId = op.b3 == 0 ? op.i : getBankData(op.b3, op.i)
    fieldModels.placeModel(entityName, x, y, undefined, triangleId)
    return {}
}
const XYZ = async (entityName, op) => {
    console.log('XYZ', entityName, op)
    const x = op.b1 == 0 ? op.x : getBankData(op.b1, op.x)
    const y = op.b2 == 0 ? op.y : getBankData(op.b2, op.y)
    const z = op.b3 == 0 ? op.z : getBankData(op.b3, op.z)
    fieldModels.placeModel(entityName, x, y, z, undefined)
    return {}
}

const VISI = async (entityName, op) => {
    console.log('VISI', entityName, op)
    fieldModels.setModelVisibility(entityName, op.s === 1)
    return {}
}
const DIR = async (entityName, op) => {
    console.log('DIR', entityName, op)
    const direction = op.b == 0 ? op.d : getBankData(op.b, op.d)
    fieldModels.setModelDirection(entityName, direction)
    return {}
}
export {

    PC,
    CHAR,
    VISI,
    XYZI,
    XYI,
    XYZ,
    DIR

}