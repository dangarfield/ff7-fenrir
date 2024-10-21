import { Enums } from '../data/enums.js'
import { getPlayableCharacterId } from '../field/field-op-codes-party-helper.js'
import { ACTION_DATA } from './battle-actions.js'
import {
  calcDamage,
  hasOneOfStatuses,
  hasStatus
} from './battle-damage-calc.js'
import {
  getPlayerAttackPower,
  getPlayerMagicAttackPower
} from './battle-damage-stats.js'
import { getBitMaskFromEnums } from './battle-stack-memory.js'

const m = criteria => window.currentBattle.actors.map(criteria)

/*
TODO: Test this:
"pushFromAddress(0x2060, 02);",  - This is the 'self' value
"pushFromAddress(0x4080, 01);",  - This is the idle animations value (returned is an array from all actors) 
"maskSet();",                    - This applies the self 'mask' to the idle animation values and returns the one for the 'self' actor
*/
const getPlayerValueFromAlias = (actorIndex, memoryActors, addressHex) => {
  // Note: this always queries all actors, and returns an 'array' to be pushed on to the stack for ALL actors (although, in game, it's a bit mask)

  const addressHexValue = parseInt(addressHex, 16)
  const enemyType = window.currentBattle.actors[actorIndex].type === 'player' ? 'enemy' : 'player' // prettier-ignore
  const allyType = window.currentBattle.actors[actorIndex].type
  switch (addressHexValue) {
    case 0x4000: // Bitmask of current Statuses
      return m(a => getBitMaskFromEnums(Enums.Statuses, a?.data?.status || []))
    // 0x4020	Set of flags relating to situation.
    case 0x4021: // Ally of current actor
      return m(a => a.type === allyType && a.index !== actorIndex) // Note: Include self in this?
    case 0x4025: // Defending
      return m(a => a?.data?.defend || false)
    case 0x4026: // Back row
      // TODO: Is this right for enemies?
      return m(a => a?.data?.battleOrder === 'BackRow' || a?.initialData?.row > 1 || false) // prettier-ignore
    case 0x4025: // Attack connects
      // TODO: Don't really know what this means. Something to do with previous attacks? Can't see it in scene.bin
      return m(a => 0)
    case 0x4028: // Immune to physical damage
      // TODO: Need to implement - Can't see it in scene.bin though
      return m(a => 0)
    case 0x4029: // Immune to magical damage
      // TODO: Need to implement - Can't see it in scene.bin though
      return m(a => 0)
    case 0x402b: // Was covered / Defers damage
      // TODO: Need to implement - Can't see it in scene.bin though
      return m(a => 0)
    case 0x402c: // Immune to Death
      // TODO: Is this right?!
      return m(a => hasOneOfStatuses(a?.data?.status, ['Peerless', 'DeathForce']) || false) // prettier-ignore
    case 0x402d: // Actor is dead
      return m(a => hasStatus(a?.data?.status, 'Death') || false)
    case 0x402e: // Actor is invisible
      return m(a => a?.model?.scene?.visible === false) // TODO - Not sure if this is good enough yet
    case 0x4040: // Actor Index
      return m(a => a.index)
    // 0x4048	Level
    case 0x4048: // Level
      return m(a => a?.data?.level?.current || a?.data?.level || 0)
    case 0x4058: // Greatest Elemental Damage modifier (No damage, half, normal, etc.)
      // TODO: Need to implement - Can't see it in scene.bin though, not sure what should be returned here
      return m(a => 0)
    case 0x4060: // Character ID (+10h) for playable Characters, Instance for enemies
      return m(a => a?.initialData?.enemyId || getPlayableCharacterId(window.data.savemap.party.members[a.index] || 'Cloud')) // prettier-ignore

    case 0x4068: // Physical Attack Power
      // return m(a => a?.data?.attack || getPlayerAttackPower(a) || 0) //
      return m(a => a?.data?.attack || a?.battleStats?.attack || 0) // Then add other factors, equipment etc, deal with this later
    case 0x4070: // Magic Attack Power
      return m(a => a?.data?.magicAttack || a?.battleStats?.magicAttack || 0)
    // 0x4078	Physical Evade
    // 0x4080	Idle Animation ID
    // 0x4088	Damaged Animation ID
    // 0x4090	Back Damage Multiplier
    // 0x4098	Model Size (default is 16)
    // 0x40A0	Dexterity
    // 0x40A8	Luck
    // 0x40B0	Related to Idle Animations
    // 0x40B8	Character that was just covered. (Character index +10h)
    // 0x40C0	Target(s) of last action performed by actor
    // 0x40D0	Previous Attacker
    // 0x40E0	Previous Physical Attacker
    // 0x40F0	Previous Magical Attacker
    // 0x4100	Physical Defense Rating
    // 0x4110	Magical Defense Rating
    // 0x4120	Index of actor
    // 0x4130	Absorbed Elements
    // 0x4140	Current MP
    // 0x4150	Max MP
    // 0x4160	Current HP
    // 0x4180	Max HP
    // 0x41A0	Unknown (Used by Schizo's heads to tell the other head that it is dead. Maybe elsewhere?)
    // 0x4220	Initial Statuses
    // 0x4268	Magic Evade
    // 0x4270	Row
    // 0x4278	Unknown (something to do with the camera?)
    // 0x4280	Gil stolen (Enemies only)
    // 0x4290	Item stolen (Enemies only)
    // 0x42A0	Nullified Elements?
    // 0x42B0	AP actor is worth
    // 0x42C0	Gil actor is worth
    // 0x42E0	EXP actor is worth
    default:
      return m(a => 0)
  }
}
const setPlayerValueFromAlias = (player, addressHex, value) => {
  const addressHexValue = parseInt(addressHex, 16)
  switch (addressHexValue) {
    case 0x4000: // Battle Rewards - Set of flags indicating battle rewards (some functions unknown; most won't be set until end of battle).
      // TODO - Need to implement this
      //   0x2111	End battle; Marked as Escaped
      //   0x2112	End battle; Pose for Victory (if 0x2116 is unset)
      //   0x2113	End battle; No Reward
      //   0x2114	End battle (unsets 0x2113 unless escaped, unsets 0x2111 in that case)
      //   0x2115	(unsets 0x2112)
      //   0x2116	No Victory Pose (unsets 0x2115)
      player[addressHex] = value
      break
    default:
      player[addressHex] = value
      break
  }
}
export { getPlayerValueFromAlias, setPlayerValueFromAlias }
