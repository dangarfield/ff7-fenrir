import { allowPlayerToSelectAction, addScriptActionToQueue } from './battle-queue.js'

const globalTimerCallback = function () {
//   console.log('battleTimer globalTimerCallback')
}
const cTimerCallback = function () {
//   console.log('battleTimer cTimerCallback', this.getActor())
}
const vTimerCallback = function () {
//   console.log('battleTimer vTimerCallback', this.getActor())
}
const turnTimerCallback = function () {
  const actor = this.getActor()
  console.log('battleTimer turnTimerCallback', actor.data.name)
  if (actor.type === 'player') {
    allowPlayerToSelectAction(actor.index)
  } else if (actor.type === 'enemy') {
    addScriptActionToQueue(actor.index)
  }
  // If player, allow player to select an action
  // If enemy, directly set enemy action to queue (main script)
}
const resetTurnTimer = (actorIndex) => {
  console.log('battleTimer resetTurnTimer', actorIndex)
  window.currentBattle.actors[actorIndex].timers.turnTimerFull = false
  window.currentBattle.actors[actorIndex].timers.turnTimerProgress = 0
}

const setTimerData = (actors) => {
  const configSpeed = 127
  const timers = {
    tick: 0,
    speedValue: Math.trunc(32768 / (120 + Math.trunc(configSpeed * 15 / 8))),
    globalTimerMark: 8192,
    globalTimerProgress: 0,
    globalTimer: 0,
    globalTimerCallback,
    cTimerMark: 8192,
    vTimerMark: 8192,
    turnTimersMark: 0xFFFF,
    totalBasePartyDex: actors.filter(a => a.type === 'player').map(a => a.data.stats.dexterity).reduce((tot, a) => tot + a, 0),
    numberInParty: actors.filter(a => a.type === 'player').length,
    maxTurnTimerRandom: Math.max(...actors.filter(a => a.active).map(a => a.timers.turnTimerRandom))
  }
  timers.normalSpeed = Math.ceil(timers.totalBasePartyDex / 2) + 50
  return timers
}

const recalculateActorTimerIncrementValues = (timers, actor) => {
  let cTimerModifier = 1
  let vTimerModifier = 1
  let turnTimeModifier = 1
  // TODO - Think abot Statuses
  if (actor.status.includes('Death') || actor.status.includes('Stop')) { vTimerModifier = 0; cTimerModifier = 0 }
  if (actor.status.includes('Slow')) { vTimerModifier = 0.5; cTimerModifier = 0.5 }
  if (actor.status.includes('Haste')) { vTimerModifier = 2; cTimerModifier = 2 }
  if (actor.status.includes('Paralysed') || actor.status.includes('Petrify') || actor.status.includes('Sleep')) { turnTimeModifier = 0 }
  actor.timers.vTimerIncrement = timers.speedValue * 2 * vTimerModifier
  const totalDex = actor.type === 'player' ? actor.battleStats.dexterity + 50 : actor.data.dexterity
  actor.timers.turnTimerIncrement = Math.trunc(totalDex * actor.timers.vTimerIncrement / timers.normalSpeed) * turnTimeModifier
  actor.timers.cTimerIncrement = 136 * cTimerModifier
//   console.log('turn', actor.timers.turnTimerIncrement, 'turnTime', 0xFFFF / (actor.timers.turnTimerIncrement * 30), 'v', actor.timers.vTimerIncrement, 'c', actor.timers.cTimerIncrement)
}

const setActorTurnTimerInitialValue = (timers, actor, battleLayoutType) => {
  actor.timers.turnTimerProgress = actor.timers.turnTimerRandom + 0xE000 - timers.maxTurnTimerRandom

  if (battleLayoutType === 'Preemptive' || battleLayoutType === 'SideAttack1') {
    actor.timers.turnTimerProgress = actor.type === 'player'
      ? 65534
      : Math.trunc(actor.timers.turnTimer / 8)
  } else if (battleLayoutType === 'BackAttack' || battleLayoutType === 'PincerAttack') {
    actor.timers.turnTimerProgress = actor.type === 'player'
      ? 0
      : actor.timers.turnTimerRandom + 0xF000 - timers.maxTurnTimerRandom
  }
  delete actor.timers.turnTimerRandom
  // TODO - Special case for Sephiroth etc
}
const initTimers = (currentBattle) => {
  currentBattle.actors.forEach(a => {
    if (a.active) {
      a.timers = {
        cTimerIncrement: 0,
        cTimerProgress: 0,
        cTimer: 0,
        cTimerCallback,
        vTimerIncrement: 0,
        vTimerProgress: 0,
        vTimer: 0,
        vTimerCallback,
        turnTimerRandom: Math.floor(Math.random() * 0x7FFF),
        turnTimerIncrement: 0,
        turnTimerProgress: 0,
        turnTimer: 0,
        turnTimerFull: false,
        turnTimerCallback,
        getActor: () => { return a }
      }
      a.status = [] // temp
    }
  })

  const timers = setTimerData(currentBattle.actors)
  // console.log('speedValue', timers.speedValue)
  // console.log('global frames', timers.globalTimerMark / timers.speedValue, 'global seconds', timers.globalTimerMark / timers.speedValue / 30)
  // console.log('normalSpeed', timers.normalSpeed)
  currentBattle.timers = timers
  for (const actor of currentBattle.actors) {
    if (!actor.active) continue
    recalculateActorTimerIncrementValues(timers, actor)
    setActorTurnTimerInitialValue(timers, actor, currentBattle.setup.battleLayoutType)
    console.log('battleTimers', actor.data.name, 'turn', actor.timers.turnTimerIncrement, 'turnTime', 0xFFFF / (actor.timers.turnTimerIncrement * 30),
      'v', actor.timers.vTimerIncrement, 'c', actor.timers.cTimerIncrement,
      'initial', actor.timers.turnTimerProgress, `${Math.round(actor.timers.turnTimerProgress / 0xFFFF * 100 * 10) / 10}%`)
  }
}
const incrementTick = () => {
  // TODO - How do the Active / Wait / Recommended settings affect these timers
  // Also, all of these timers reset when they get past the limit, this always keeps the 'progress' numbers low, but it's not right, just a placeholder for now
  const timers = window.currentBattle.timers
  timers.tick++
  timers.globalTimerProgress += timers.speedValue
  if (timers.globalTimerProgress > timers.globalTimerMark) {
    timers.globalTimerProgress = 0
    timers.globalTimer++
    // console.log('battleTimers globalTimer', timers.globalTimer)
    timers.globalTimerCallback()
  }
  for (const actor of window.currentBattle.actors) {
    if (!actor.active) continue
    actor.timers.cTimerProgress += actor.timers.cTimerIncrement
    actor.timers.vTimerProgress += actor.timers.vTimerIncrement

    // Only increment this if actor does not have an active turn in progress, or has one queued
    if (actor.timers.turnTimerProgress < timers.turnTimersMark && !actor.timers.turnTimerFull) {
      actor.timers.turnTimerProgress = Math.min(actor.timers.turnTimerProgress + actor.timers.turnTimerIncrement, timers.turnTimersMark)
    }

    if (actor.timers.cTimerProgress > timers.cTimerMark) {
      actor.timers.cTimerProgress = 0
      actor.timers.cTimer++
      //   console.log('battleTimers cTimer', actor.data.name, actor.timers.cTimer)
      actor.timers.cTimerCallback()
    }
    if (actor.timers.vTimerProgress > timers.vTimerMark) {
      actor.timers.vTimerProgress = 0
      actor.timers.vTimer++
      //   console.log('battleTimers vTimer', actor.data.name, actor.timers.vTimer)
      actor.timers.vTimerCallback()
    }

    if (actor.timers.turnTimerProgress >= timers.turnTimersMark) {
      actor.timers.turnTimerFull = true
      actor.timers.turnTimer++
      //   console.log('battleTimers turnTimer', actor.data.name, actor.timers.turnTimer)
      actor.timers.turnTimerCallback()
    }
  }

  if (timers.tick % 30 === 0) {
    console.log('battleTimers tick', timers.tick, '-', timers.globalTimer, window.currentBattle.actors.filter(a => a.active).map(a => `${a.timers.cTimer},${a.timers.vTimer},${a.timers.turnTimer}`))
  }
}
export {
  initTimers,
  incrementTick,
  resetTurnTimer
}
