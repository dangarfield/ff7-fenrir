import { getPlayableCharacterName } from '../field/field-op-codes-party-helper.js'

const getMateriaData = () => {
  return window.data.kernel.materiaData
}

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
  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max)
  }
  for (let i = 0; i < window.data.kernel.materiaData.length; i++) {
    const materiaData = window.data.kernel.materiaData[i]
    const maxAP = materiaData.apLevels[materiaData.apLevels.length - 1]
    if (materiaData.name !== '') {
      setMateriaToInventory((i * 2), materiaData.index, maxAP)
      setMateriaToInventory((i * 2) + 1, materiaData.index, getRandomInt(maxAP))
    }
  }
  console.log('debugFillMateria - window.data.savemap', window.data.savemap)
}
window.debugFillMateria = debugFillMateria
const addMateriaToInventory = (materiaId, ap) => {
  console.log('shop addMateriaToInventory', materiaId, ap)
  const materias = window.data.savemap.materias
  for (let i = 0; i < materias.length; i++) {
    const materia = materias[i]
    if (materia.id === 0xff) {
      materia.id = materiaId
      materia.ap = ap
      materia.name = window.data.kernel.materiaData[materiaId].name
      materia.description =
        window.data.kernel.materiaData[materiaId].description
      break
    }
  }

  // TODO - There are some kernel based callbacks for summon and enemy skills that appear to be hijacking save bank changes, but it'd be better to do them here
  // See savemap alias - save 1,48 (0x0BD4), kernel sets 1,75 bit 8 (0x0BEF) if bit 4 is on etc
}
const deleteMateriaFromInventory = materiaId => {
  console.log('deleteMateriaFromInventory', materiaId)
  const materias = window.data.savemap.materias
  for (let i = 0; i < materias.length; i++) {
    const materia = materias[i]
    if (materia.id === materiaId) {
      materia.id = 0xff
      materia.ap = 0xffffff
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
const unequipMateria = (char, slotName) => {
  if (char.materia[slotName].id !== 0xFF) {
    addMateriaToInventory(char.materia[slotName].id, char.materia[slotName].ap) // Add materia to inventory
    char.materia[slotName] = { id: 0xFF, ap: 0xFFFFFF } // Set slot to empty
  }
}
const unequipAllMateriaCharX = charId => {
  const charName = getPlayableCharacterName(charId)
  console.log('unequipAllMateriaCharX: START', charId, charName)
  const materiaKeys = Object.keys(
    window.data.savemap.characters[charName].materia
  )
  const materias = []
  for (let i = 0; i < materiaKeys.length; i++) {
    const materiaKey = materiaKeys[i]
    const materia = window.data.savemap.characters[charName].materia[materiaKey]
    if (materia.id !== 255) {
      materias.push(materia)
      window.data.savemap.characters[charName].materia[materiaKey] = {
        id: 0xff,
        ap: 0xffffff
      }
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
  console.log(
    'unequipAllMateriaCharX: END',
    materias,
    window.data.savemap.characters[charName].materia,
    window.data.savemap.materias
  )
}
const temporarilyHideMateriaCloud = () => {
  window.data.savemap.characters.Cloud.materiaTemp = JSON.stringify(
    window.data.savemap.characters.Cloud.materia
  )
  const materiaKeys = Object.keys(window.data.savemap.characters.Cloud.materia)
  for (let i = 0; i < materiaKeys.length; i++) {
    const materiaKey = materiaKeys[i]
    const materia = window.data.savemap.characters.Cloud.materia[materiaKey]
    materia.id = 0xff
    materia.ap = 0xffffff
    delete materia.name
    delete materia.description
  }
  console.log(
    'temporarilyHideMateriaCloud',
    window.data.savemap.characters.Cloud
  )
}
const reinstateMateriaCloud = () => {
  window.data.savemap.characters.Cloud.materia = JSON.parse(
    window.data.savemap.characters.Cloud.materiaTemp
  )
  delete window.data.savemap.characters.Cloud.materiaTemp
  console.log('reinstateMateriaCloud', window.data.savemap.characters.Cloud)
}
const arrangeMateria = () => {
  // TODO - Not sure about materia ordering, need to validate with game behaviour
  const magicTypeOrder = ['Magic', 'Support', 'Command', 'Independent', 'Summon', 'None']
  window.data.savemap.materias.sort((a, b) => {
    const aType = a.id === 0xFF ? 'None' : window.data.kernel.materiaData[a.id].type
    const bType = b.id === 0xFF ? 'None' : window.data.kernel.materiaData[b.id].type
    // const aMaster = a.id === 0xFF ? 0 : (window.data.kernel.materiaData[a.id].attributes.master ? 1 : 0)
    // const bMaster = b.id === 0xFF ? 0 : (window.data.kernel.materiaData[b.id].attributes.master ? 1 : 0)
    // if (a.id === 73) {
    //   console.log('materia arrangeMateria', a, a.id, aMaster, '-', b, bMaster)
    // }
    return magicTypeOrder.indexOf(aType) - magicTypeOrder.indexOf(bType) || b.id - a.id
  })
}
const trashMateria = (index) => {
  window.data.savemap.materias[index] = { id: 0xFF, ap: 0xFFFFFF }
}
export {
  debugFillMateria,
  addMateriaToInventory,
  deleteMateriaFromInventory,
  yuffieStealMateriaAll,
  yuffieRestoreMateriaAll,
  unequipAllMateriaCharX,
  temporarilyHideMateriaCloud,
  reinstateMateriaCloud,
  unequipMateria,
  arrangeMateria,
  trashMateria
}
