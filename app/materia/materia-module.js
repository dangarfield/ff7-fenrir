import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'

const getMateriaData = () => { return window.data.kernel.materiaData }

const setMateriaToInventory = (position, id, ap) => {
    const materia = {
        id: id,
        ap: ap,
        name: getMateriaData()[id].name,
        description: getMateriaData()[id].description
    }
    window.data.savemap.materias[position] = materia
}
const debugFillMateria = () => {
    const materias = window.data.savemap.materias
    for (let i = 0; i < materias.length; i++) {
        const materia = materias[i]
        if (materia.id === 255) {
            const randomMateria = getMateriaData()[Math.floor(Math.random() * getMateriaData().length)]
            setMateriaToInventory(i, randomMateria.index, 0)
        }
    }
    console.log('debugFillMateria - window.data.savemap', window.data.savemap)
}

const addMateriaToInventory = (materiaId, ap) => {
    console.log('addMateriaToInventory', materiaId, ap)
    const materias = window.data.savemap.materias
    for (let i = 0; i < materias.length; i++) {
        const materia = materias[i]
        if (materia.id === 0xFF) {
            materia.id = materiaId
            materia.ap = ap
            materia.name = window.data.kernel.materiaData[materiaId].name
            materia.description = window.data.kernel.materiaData[materiaId].description
            break
        }
    }
}
const deleteMateriaFromInventory = (materiaId) => {
    console.log('deleteMateriaFromInventory', materiaId)
    const materias = window.data.savemap.materias
    for (let i = 0; i < materias.length; i++) {
        const materia = materias[i]
        if (materia.id === materiaId) {
            materia.id = 0xFF
            materia.ap = 0xFFFFFF
            delete materia.name
            delete materia.description
        }
    }
}

const yuffieStealMateriaAll = () => {
    console.log('yuffieStealMateriaAll')
    // TODO
}
const yuffieRestoreMateriaAll = () => {
    console.log('yuffieRestoreMateriaAll')
    // TODO
}
const unequipMateriaCharX = (charId) => {
    const charName = getPlayableCharacterName(charId)
    console.log('unequipMateriaCharX: START', charId, charName)
    const materiaKeys = Object.keys(window.data.savemap.characters[charName].materia)
    const materias = []
    for (let i = 0; i < materiaKeys.length; i++) {
        const materiaKey = materiaKeys[i]
        const materia = window.data.savemap.characters[charName].materia[materiaKey]
        if (materia.id !== 255) {
            materias.push(materia)
            window.data.savemap.characters[charName].materia[materiaKey] = { id: 0xFF, ap: 0xFFFFFF }
        }
    }
    for (let i = 0; i < materias.length; i++) {
        const materiaToAddToInventory = materias[i]
        for (let j = 0; j < window.data.savemap.materias.length; j++) {
            const potentialMateriaToReplace = window.data.savemap.materias[j]
            if (potentialMateriaToReplace.id === 255) {
                window.data.savemap.materias[j] = materiaToAddToInventory
                break
            }
        }
    }
    console.log('unequipMateriaCharX: END', materias, window.data.savemap.characters[charName].materia, window.data.savemap.materias)
}
const temporarilyHideMateriaCloud = () => {
    window.data.savemap.characters.Cloud.materiaTemp = JSON.stringify(window.data.savemap.characters.Cloud.materia)
    const materiaKeys = Object.keys(window.data.savemap.characters.Cloud.materia)
    for (let i = 0; i < materiaKeys.length; i++) {
        const materiaKey = materiaKeys[i]
        const materia = window.data.savemap.characters.Cloud.materia[materiaKey]
        materia.id = 0xFF
        materia.ap = 0xFFFFFF
        delete materia.name
        delete materia.description
    }
    console.log('temporarilyHideMateriaCloud', window.data.savemap.characters.Cloud)
}
const reinstateMateriaCloud = () => {
    window.data.savemap.characters.Cloud.materia = JSON.parse(window.data.savemap.characters.Cloud.materiaTemp)
    delete window.data.savemap.characters.Cloud.materiaTemp
    console.log('reinstateMateriaCloud', window.data.savemap.characters.Cloud)
}
export {
    debugFillMateria,
    addMateriaToInventory,
    deleteMateriaFromInventory,
    yuffieStealMateriaAll,
    yuffieRestoreMateriaAll,
    unequipMateriaCharX,
    temporarilyHideMateriaCloud,
    reinstateMateriaCloud
}