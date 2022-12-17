let currentBattle = {}

const locationIdToLocationCode = (i) => {
  const id = i + 370
  const id2 = Math.floor(id / 26)
  const id3 = id - (id2 * 26)
  return String.fromCharCode(id2 + 97) + String.fromCharCode(id3 + 97) + 'aa'
}
const enemyIdToEnemyCode = (i) => {
  const id = i + 0
  const id2 = Math.floor(id / 26)
  const id3 = id - (id2 * 26)
  return String.fromCharCode(id2 + 97) + String.fromCharCode(id3 + 97) + 'aa'
}
const characterNameToModelCode = (name) => {
  let modelName = 'CLOUD'
  if (name === 'Cloud') modelName = 'CLOUD'
  if (name === 'Barret') modelName = 'BARRETT'
  if (name === 'Tifa') modelName = 'TIFA'
  if (name === 'Aeris') modelName = 'EARITH'
  if (name === 'RedXIII') modelName = 'RED13'
  if (name === 'Yuffie') modelName = 'YUFI'
  if (name === 'Cid') modelName = 'CID1'
  if (name === 'CaitSith') modelName = 'KETCY'
  if (name === 'Vincent') modelName = 'VINSENT'
  // TODO - Othe chars, special frog, vincent limits, sephiroth, weapons, multiple barret?
  return window.data.exe.battleCharacterModels.find(m => m.name === modelName).hrc
}
const setupBattle = (battleId) => {
  const sceneId = Math.floor(battleId / 4)
  const formationId = battleId % 4
  const scene = { ...window.data.sceneData.find(s => s.sceneId === sceneId) }
  const battleData = {
    sceneId,
    formationId,
    scene, // temp - remove after
    setup: { ...scene.battleSetup[formationId] },
    actors: [],
    attackData: [...scene.attackData.filter(a => a.id !== 0xFFFF)]
  }
  // window.data.savemap.party.members[1] = 'None' // Temp
  for (const partyMember of window.data.savemap.party.members) {
    if (partyMember === 'None') {
      battleData.actors.push({ active: false })
    } else {
      battleData.actors.push({
        active: true,
        data: { ...window.data.savemap.characters[partyMember] },
        modelCode: characterNameToModelCode(partyMember),
        type: 'player'
      })
    }
  }
  battleData.actors.push({ active: false }) // Battle Actor that hod formation AI

  for (const enemy of scene.battleFormations[formationId]) {
    if (enemy.enemyId === 0xFFFF) {
      battleData.actors.push({ active: false })
    } else {
      let enemyData
      let script
      if (scene.enemyId1 === enemy.enemyId) {
        enemyData = { ...scene.enemyData1 }
        script = { ...scene.enemyScript1 }
      }
      if (scene.enemyId2 === enemy.enemyId) {
        enemyData = { ...scene.enemyData2 }
        script = { ...scene.enemyScript1 }
      }
      if (scene.enemyId3 === enemy.enemyId) {
        enemyData = { ...scene.enemyData3 }
        script = { ...scene.enemyScript1 }
      }
      battleData.actors.push({
        active: true,
        initialData: enemy,
        data: enemyData,
        modelCode: enemyIdToEnemyCode(enemy.enemyId),
        script,
        type: 'enemy'
      })
    }
  }

  battleData.setup.locationCode = locationIdToLocationCode(battleData.setup.locationId)

  currentBattle = battleData
  window.currentBattle = battleData
  console.log('battle battleData', battleData)
  return battleData
}

export { setupBattle, currentBattle }
