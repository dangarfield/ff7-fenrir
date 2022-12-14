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

  console.log('battleData', battleData)
  return battleData
}

export { getBattleConfig }
