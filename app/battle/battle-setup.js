import { battleFormationConfig } from './battle-formation.js'
import { getBattleStatsForChar } from './battle-stats.js'
import { initTimers } from './battle-timers.js'

let currentBattle = {}

const locationIdToLocationCode = i => {
  const id = i + 370
  const id2 = Math.floor(id / 26)
  const id3 = id - id2 * 26
  return String.fromCharCode(id2 + 97) + String.fromCharCode(id3 + 97) + 'aa'
}
const enemyIdToEnemyCode = i => {
  const id = i + 0
  const id2 = Math.floor(id / 26)
  const id3 = id - id2 * 26
  return String.fromCharCode(id2 + 97) + String.fromCharCode(id3 + 97) + 'aa'
}
const characterNameToModelCode = name => {
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
  return window.data.exe.battleCharacterModels.find(m => m.name === modelName)
    .hrc
}

const setupBattle = battleId => {
  const sceneId = battleId >> 2 // eg, Math.trunc(battleId / 4)
  const formationId = battleId & 3 // eg, battleId % 4
  const scene = { ...window.data.sceneData.find(s => s.sceneId === sceneId) }
  currentBattle = {
    sceneId,
    formationId,
    scene, // temp - remove after
    setup: { ...scene.battleSetup[formationId] },
    actors: [],
    attackData: [...scene.attackData.filter(a => a.id !== 0xffff)]
  }
  currentBattle.formationConfig =
    battleFormationConfig.formations[currentBattle.setup.battleLayoutType]

  // window.data.savemap.party.members[1] = 'None' // Temp
  window.debugSetEquipmentAndMateria() // Temp
  for (const [i, partyMember] of window.data.savemap.party.members.entries()) {
    if (partyMember === 'None') {
      currentBattle.actors.push({ active: false, index: i })
    } else {
      const data = structuredClone(window.data.savemap.characters[partyMember])
      if (currentBattle.formationConfig.playerRowSwap) {
        data.status.battleOrder =
          data.status.battleOrder === 'BackRow' ? 'Normal' : 'BackRow'
      }
      if (currentBattle.formationConfig.playerRowLocked) {
        data.status.battleOrder = 'Normal'
      }
      const battleStats = getBattleStatsForChar(data)

      currentBattle.actors.push({
        active: true,
        index: i,
        data,
        battleStats,
        modelCode: characterNameToModelCode(partyMember),
        type: 'player',
        targetGroup: currentBattle.formationConfig.playerTargetGroups?.[i] ?? 1
      })
    }
  }
  // TODO ?!?! Not sure yet - This is the formation type, I believe
  currentBattle.actors.push({ active: false, index: 3, type: 'formation' }) // Battle Actor that hod formation AI

  for (const [i, enemy] of scene.battleFormations[formationId].entries()) {
    if (enemy.enemyId === 0xffff) {
      currentBattle.actors.push({ active: false, index: i + 4 })
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

      currentBattle.actors.push({
        active: true,
        index: i + 4,
        initialData: enemy,
        data: enemyData,
        modelCode: enemyIdToEnemyCode(enemy.enemyId),
        script,
        type: 'enemy',
        targetGroup:
          currentBattle.formationConfig.enemyTargetGroup ??
          (enemy.initialConditionFlags.includes('SideAttackInitialDirection')
            ? 0
            : 2)
      })
    }
  }
  currentBattle.setup.targetGroups = ['enemy', 'player'] // TODO - Update based on battle type, pincer, back attack etc
  currentBattle.setup.locationCode = locationIdToLocationCode(
    currentBattle.setup.locationId
  )

  initTimers(currentBattle)

  window.currentBattle = currentBattle
  console.log('battle currentBattle', currentBattle)
  return currentBattle
}

export { setupBattle, currentBattle }
