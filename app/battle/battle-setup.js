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
const getBattleConfig = (battleId) => {
  const sceneId = Math.floor(battleId / 4)
  const formationId = battleId % 4
  const scene = window.data.sceneData.find(s => s.sceneId === sceneId)
  const battleData = {
    sceneId,
    formationId,
    scene, // temp - remove after
    setup: scene.battleSetup[formationId],
    enemies: scene.battleFormations[formationId].filter(e => e.enemyId < 0xFFFF).map(e => {
      for (const i of [1, 2, 3]) {
        console.log('battleData is', i, `enemyId${i}`, scene[`enemyId${i}`], e.enemyId)
        if (scene[`enemyId${i}`] === e.enemyId) {
          e.enemyData = { ...scene[`enemyData${i}`] }
          e.enemyCode = enemyIdToEnemyCode(e.enemyId)
        }
      }
      return e
    })
  }
  battleData.setup.locationCode = locationIdToLocationCode(battleData.setup.locationId)

  // TODO - Temp Cloud only
  const party = window.data.savemap.party.members.filter(m => m !== 'None').filter(m => m === 'Cloud').map(m => {
    const char = { ...window.data.savemap.characters[m] }
    char.modelCode = characterNameToModelCode(m)
    return char
  })
  battleData.party = party

  console.log('battleData', battleData)
  return battleData
}

export { getBattleConfig }
