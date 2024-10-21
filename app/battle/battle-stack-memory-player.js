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
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.attack || a?.battleStats?.attack || 0)
    case 0x4070: // Magic Attack Power
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.magicAttack || a?.battleStats?.magicAttack || 0)
    case 0x4078: // Physical Evade
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.dexterity || a?.battleStats?.dexterity || 0)
    case 0x4080: // Idle Animation ID
      return m(a => a?.model?.userData?.idleAnimation || 0)
    case 0x4088: // Damaged Animation ID
      return m(a => a?.model?.userData?.damageAnimation || 0)
    case 0x4090: // Back Damage Multiplier
      return m(a => 2) // TODO - Is this always 2? Or is it updated based on the current actor
    case 0x4098: // Model Size (default is 16)
      return m(a => a?.model?.scene?.scale.x * 16 || 0)
    case 0x40a0: // Dexterity
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.dexterity || a?.battleStats?.dexterity || 0)
    case 0x40a8: // Luck
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.luck || a?.battleStats?.luck || 0)
    case 0x40b0: // Related to Idle Animations
      return m(a => 0) // TODO - Unknown
    case 0x40b8: // Character that was just covered. (Character index +10h)
      return m(a => 0) // TODO - Need to implement
    case 0x40c0: // Target(s) of last action performed by actor
      return m(a => 0) // TODO - Need to implement
    case 0x40d0: // Previous Attacker
      return m(a => 0) // TODO - Need to implement
    case 0x40e0: // Previous Physical Attacker
      return m(a => 0) // TODO - Need to implement
    case 0x40f0: // Previous Magical Attacker
      return m(a => 0) // TODO - Need to implement

    case 0x4100: // Physical Defense Rating
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.vitality || a?.battleStats?.vitality || 0)
    case 0x4110: // Magical Defense Rating
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.spirit || a?.battleStats?.spirit || 0)
    case 0x4120: // Index of actor
      return m(a => a.index)
    case 0x4130: // Absorbed Elements
      return m(a => 0) // TODO - Need to implement

    case 0x4140: // Current MP
      return m(a => a?.battleStats?.mp?.current || 0) // TODO - Enemies need battleStats or something similar
    case 0x4150: // Max MP
      return m(a => a?.battleStats?.mp?.max || 0) // TODO - Enemies need battleStats or something similar
    case 0x4160: // Current HP
      return m(a => a?.battleStats?.hp?.current || 0) // TODO - Enemies need battleStats or something similar
    case 0x4180: // Max HP
      return m(a => a?.battleStats?.hp?.max || 0) // TODO - Enemies need battleStats or something similar
    case 0x41a0: // Unknown (Used by Schizo's heads to tell the other head that it is dead. Maybe elsewhere?)
      return m(a => 0)
    case 0x4220: // Initial Statuses
      // TODO - Assume that this is called in the beginning...
      return m(a => getBitMaskFromEnums(Enums.Statuses, a?.data?.status || []))
    case 0x4268: // Magic Evade
      // TODO - Do this properly with derived stats from equipment, boosts, statuses etc
      return m(a => a?.data?.spirit || a?.battleStats?.spirit || 0)
    case 0x4270: // Row
      // TODO - Guess for players
      return m(a => a?.data?.battleOrder === 'Normal' ? 1 : 0 || a?.initialData?.row || 0) // prettier-ignore
    case 0x4278: // Unknown (something to do with the camera?)
      return m(a => 0)
    case 0x4280: // Gil stolen (Enemies only)
      return m(a => a?.data?.gilStolen || 0) // TODO - Ensure this is set
    case 0x4290: // Item stolen (Enemies only)
      return m(a => a?.data?.itemStolen || 0) // TODO - Ensure this is set
    case 0x42a0: // Nullified Elements?
      return m(a => getBitMaskFromEnums(Enums.Elements, a?.battleStats?.elements?.invalid || [])) // prettier-ignore
    case 0x42b0: // AP actor is worth
      return m(a => a?.data?.ap || 0)
    case 0x42c0: // Gil actor is worth
      return m(a => a?.data?.gil || 0)
    case 0x42e0: // EXP actor is worth
      return m(a => a?.data?.exp || 0)
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
