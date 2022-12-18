import { getBattleStatsForChar } from './battle-stats.js'

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
const calculateATBInitial = (currentBattle) => {
  // Calcuate Initial ATB Values
  // https://forums.qhimm.com/index.php?topic=7853.0
  const battleLayoutType = currentBattle.setup.battleLayoutType
  const actors = currentBattle.actors
  actors.forEach(a => {
    if (a.active) {
      a.atbRandom = Math.floor(Math.random() * 0xFFFF)
    }
  })
  const maxRandom = Math.max(...actors.filter(a => a.active).map(a => a.atbRandom))

  if (battleLayoutType === 'Preemptive' || battleLayoutType === 'SideAttack1') {
    // Player advantage
    actors.forEach(a => {
      if (a.type === 'player') {
        a.atb = { initial: 0xFFFE }
      } else {
        a.atb = { initial: Math.floor(a.atbRandom / 8) }
      }
      delete a.atbRandom
    })
  } else if (battleLayoutType === 'BackAttack' || battleLayoutType === 'PincerAttack') {
    // Enemy advantage
    actors.forEach(a => {
      if (a.type === 'player') {
        a.atb = { initial: 0x0 }
      } else {
        a.atb = { initial: Math.min(0xFFFE, a.atbRandom + 0xF000) }
      }
      delete a.atbRandom
    })
  } else {
    // battleLayoutType === 'Normal' || battleLayoutType === 'SideAttack2' // Normal Attack
    // battleLayoutType === 'SideAttack3' || battleLayoutType === 'SideAttack4' || battleLayoutType === 'NormalLockFrontRow'  // Unknown, ignore now

    // Normal
    actors.forEach(a => {
      if (a.active) {
        a.atb = { initial: Math.max(0, a.atbRandom + 0xe000 - maxRandom) }
        delete a.atbRandom
      }
    })
    console.log('actors', actors)
  }

  // Calcuate ATB Increment Values
  const numInParty = currentBattle.actors.filter(a => a.type === 'player').length
  const partyDexterty = 100// currentBattle.actors.filter(a => a.type === 'player').map(a => a.data.stats.dexterity).reduce((tot, a) => tot + a, 0)
  currentBattle.setup.atb = {
    battleSpeed: 0x10000 / (((window.data.savemap.config.battleSpeed * 0x1e0 / 0x100) + 0x78) * 2),
    maxRandom,
    numInParty,
    partyDexterty
  }
  for (const actor of actors) {
    if (!actor.active) continue
    calculateATBIncrementValue(currentBattle, actor)
  }
}
const calculateATBIncrementValue = (currentBattle, actor) => {
  const actorSpeedModifier = 2 // [1-slow|2-normal|4-haste]
  const dexterityWithBonuses = actor.type === 'player'
    ? 50 + 0x32 // actor.battleStats.dexterity + 0x32 // player
    : actor.data.dexterity // enemy

  const incrementValue = currentBattle.setup.atb.battleSpeed * actorSpeedModifier * dexterityWithBonuses /
  (((currentBattle.setup.atb.partyDexterty - 1 + currentBattle.setup.atb.numInParty) / currentBattle.setup.atb.numInParty + 32)) // this 32?!

  actor.atb.incrementValue = incrementValue

  // const battleSpeed = asds
}
const setupBattle = (battleId) => {
  const sceneId = Math.floor(battleId / 4)
  const formationId = battleId % 4
  const scene = { ...window.data.sceneData.find(s => s.sceneId === sceneId) }
  currentBattle = {
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
      currentBattle.actors.push({ active: false })
    } else {
      const data = { ...window.data.savemap.characters[partyMember] }
      const battleStats = getBattleStatsForChar(data)

      currentBattle.actors.push({
        active: true,
        data,
        battleStats,
        modelCode: characterNameToModelCode(partyMember),
        type: 'player'
      })
    }
  }
  currentBattle.actors.push({ active: false }) // Battle Actor that hod formation AI

  for (const enemy of scene.battleFormations[formationId]) {
    if (enemy.enemyId === 0xFFFF) {
      currentBattle.actors.push({ active: false })
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
        initialData: enemy,
        data: enemyData,
        modelCode: enemyIdToEnemyCode(enemy.enemyId),
        script,
        type: 'enemy'
      })
    }
  }

  currentBattle.setup.locationCode = locationIdToLocationCode(currentBattle.setup.locationId)

  calculateATBInitial(currentBattle)

  window.currentBattle = currentBattle
  console.log('battle currentBattle', currentBattle)
  return currentBattle
}

export { setupBattle, currentBattle }
