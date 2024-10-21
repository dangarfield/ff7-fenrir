import { Enums } from '../data/enums.js'
import { ACTION_DATA } from './battle-actions.js'
import { hasOneOfStatuses } from './battle-damage-calc.js'

const nonActiveStatuses = ['Death', 'Petrify', 'Imprisoned']

// TODO - attack statuses if there are 0xFF, they have 'all' rather than 'none' fix this so that it is empty

// const getBitMaskFromValue = (list, value) => 1 << list.indexOf(value)
const getBitMaskFromCriteria = (list, criteria) =>
  list.reduce((mask, item, i) => mask | (criteria(item) << i), 0)
const getBitMaskFromEnums = (enumList, items) =>
  items.reduce((mask, item) => mask | enumList[item], 0)
const getObjectByBitmask = (array, bitmask) =>
  array.find((_, i) => (bitmask & (1 << i)) !== 0)
const getObjectsByBitmask = (array, bitmask) =>
  array.filter((_, i) => (bitmask & (1 << i)) !== 0)

const isActive = actor => {
  //github.com/Akari1982/q-gears_reverse/blob/55ee4f4c4578aa771dc9956bfb0983ffb1c3b152/ffvii/documents/final_fantasy_vii_battle_mech.txt#L3041
  // TODO - active !== Death (0 mp), Stop, Petrify, Imprisoned, Escaped (eg, knocked out of battle)
  return actor.active && hasOneOfStatuses(actor.data, nonActiveStatuses)
}
const getGlobalValueFromAlias = (global, actorIndex, addressHex) => {
  // https://wiki.ffrtt.ru/index.php/FF7/Battle/Battle_Scenes/Battle_AI_Addresses
  // https://github.com/petfriendamy/ff7-scarlet/blob/e6cf116b5567d2e450ed861ece69d8ecbdeb5ff4/src/AIEditor/CommonVars.cs#L15
  // Should I set this once or programmatically query it every time and update it on actor script change or something else?
  // I think for the time being, I'll see if it exists in the global memory already and return if it is does
  // But I'll only populate that IF the setGlobalValue method is triggered, eg, it'll mostly be real time alias calls
  const setVariable = global[addressHex]
  if (setVariable != null) {
    // console.log('getGlobalValueFromAlias', addressHex, 'already set')
    return setVariable || 0
  }
  const addressHexValue = parseInt(addressHex, 16)
  const enemyType = window.currentBattle.actors[actorIndex].type === 'player' ? 'enemy' : 'player' // prettier-ignore
  const allyType = window.currentBattle.actors[actorIndex].type
  switch (addressHexValue) {
    case 0x2000: // Last Command Index - Command Index of last action performed
      return ACTION_DATA.previousQueueItem.commandId // TODO - Is this enemy too? eg 0x23
    case 0x2008: // Last Action Index - Action Index of last action performed
      return ACTION_DATA.previousQueueItem.attack.index // TODO - hmm, really not good..
    case 0x2010: // Global Var - Memory 1/2 Bank access value
      return 0 // TODO Not really sure what to do here. Need to investigate
    case 0x2018: // Dummy - Used in one script in a test enemy.
      return 0
    case 0x2020: // Battle Formation - (side, pincer, pre-emptive, etc.)
      return getBitMaskFromEnums(Enums.Battle.Layout, window.currentBattle.setup.battleLayoutType) // prettier-ignore
    case 0x2038: // Limit Level - Only used by Vincent during transformation.
      return window.currentBattle.actors[actorIndex].data.limit.level
    case 0x2050: // Active Actors - A bit mask of all active (scripts enabled) actors.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.active)
    case 0x2060: // Self - Single bit indicating which actor owns the script that is currently executing. Changes as scripts are triggered.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.index === actorIndex) // prettier-ignore
    case 0x2070: // Target - Bit mask of actors indicating targets of the current action. Should be set prior to any action.
      return global[addressHex] || 0 // Should be set in scripts
    case 0x2080: // Allies - Bit mask of actors indicating actors the current actor considers as allies. Changes as scripts are triggered.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.type === allyType) // prettier-ignore
    case 0x2090: // Active Allies - Bit mask of active actors indicating actors the current actor considers as allies. Changes as scripts are triggered.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.type === allyType && isActive(a)) // prettier-ignore
    case 0x20a0: // Enemies - Bit mask of actors indicating actors the current actor considers as enemies. Changes as scripts are triggered.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.type === enemyType) // prettier-ignore
    case 0x20b0: //	Active Enemies - Bit mask of active actors indicating actors the current actor considers as enemies. Changes as scripts are triggered.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.type === enemyType && isActive(a)) // prettier-ignore
    case 0x20c0: // Active Characters - Bit mask of active player's characters
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.type === 'player' && isActive(a)) // prettier-ignore
    case 0x20e0: // Actors - Bit mask of all active and inactive actors present in the battle.
      return getBitMaskFromCriteria(window.currentBattle.actors, a => a.type === 'player' || a.type === 'enemy') // prettier-ignore
    case 0x2110: // Battle Rewards - Set of flags indicating battle rewards (some functions unknown; most won't be set until end of battle).
      // TODO - Implement this or just leave it?! There might need to be defaults set, assuming return of 0 will suffice for now
      // 0x2111	End battle; Marked as Escaped
      // 0x2112	End battle; Pose for Victory (if 0x2116 is unset)
      // 0x2113	End battle; No Reward
      // 0x2114	End battle (unsets 0x2113 unless escaped, unsets 0x2111 in that case)
      // 0x2115	(unsets 0x2112)
      // 0x2116	No Victory Pose (unsets 0x2115)
      return global[addressHex] || 0
    case 0x2120: // Elements - Elements of last performed action.
      const attackData = ACTION_DATA.previousQueueItem.attack.data
        ? ACTION_DATA.previousQueueItem.attack.data
        : ACTION_DATA.previousQueueItem.attack
      return getBitMaskFromEnums(Enums.Elements, attackData.elements)
    case 0x2140: // Formation Index - Formation Index of the current battle.
      return window.currentBattle.formationId
    case 0x2150: // Last Action Index 2 - Index of last performed action.
      return ACTION_DATA.previousQueueItem.attack.index // TODO - hmm, really not good..
    case 0x2160: // Misc Flags - Some sort of flags (unknown effect).
      // TODO - Implement this or just leave it?!
      //   0x2160
      //   0x2161	Don't apply poison/regen?
      //   0x2162	Other battles in sequence
      //   0x2163	Empty all players' Limit Bars (and other things)
      //   0x2164	Players can learn limits (never unset?)
      //   0x2165	No reward screen?
      return global[addressHex] || 0
    case 0x2170: // Special Attack Flags
      // TODO - Access to this is in the AI script BEFORE an action is selected, so how can it have a special attack flag
      // If there is no attack set yet? Need to look
      if (ACTION_DATA.attack) {
        const attackData = ACTION_DATA.attack.data
          ? ACTION_DATA.attack.data
          : ACTION_DATA.attack
        return getBitMaskFromEnums(Enums.SpecialEffects, attackData.specialAttack) // prettier-ignore
      } else {
        return 0
      }
    case 0x2180: // Unknown - (divisor of some sort related to limits)
      return global[addressHex] || 0
    case 0x21a0: // Eyes - During Emerald Weapon battle, keeps track of how many eyes are active. (Possible use in other battles, too)
      return global[addressHex] || 0
    case 0x21c0: // Gil - Party's Gil
      return window.data.savemap.gil
    default:
      return 0
  }
}
const setGlobalValueFromAlias = (global, addressHex, value) => {
  const addressHexValue = parseInt(addressHex, 16)
  switch (addressHexValue) {
    case 0x2110: // Battle Rewards - Set of flags indicating battle rewards (some functions unknown; most won't be set until end of battle).
      // TODO - Need to implement this
      //   0x2111	End battle; Marked as Escaped
      //   0x2112	End battle; Pose for Victory (if 0x2116 is unset)
      //   0x2113	End battle; No Reward
      //   0x2114	End battle (unsets 0x2113 unless escaped, unsets 0x2111 in that case)
      //   0x2115	(unsets 0x2112)
      //   0x2116	No Victory Pose (unsets 0x2115)
      global[addressHex] = value
      break
    case 0x2160: // Misc Flags - Some sort of flags (unknown effect).
      // TODO - Need to implement this
      //   0x2161	Don't apply poison/regen?
      //   0x2162	Other battles in sequence
      //   0x2163	Empty all players' Limit Bars (and other things)
      //   0x2164	Players can learn limits (never unset?)
      //   0x2165	No reward screen?
      global[addressHex] = value
    default:
      global[addressHex] = value
      break
  }
}
export {
  getGlobalValueFromAlias,
  setGlobalValueFromAlias,
  getObjectByBitmask,
  getObjectsByBitmask
}
