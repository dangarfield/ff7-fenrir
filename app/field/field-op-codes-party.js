import { getPlayableCharacterName, getPlayableCharacterId } from "./field-op-codes-party-helper"
import { setBankData, getBankData } from '../data/savemap.js'

const SPTYE = async (op) => {
    console.log('SPTYE', op)
    const partyMember1 = getPlayableCharacterId(window.data.savemap.party.members[0])
    const partyMember2 = getPlayableCharacterId(window.data.savemap.party.members[1])
    const partyMember3 = getPlayableCharacterId(window.data.savemap.party.members[2])
    console.log('SPTYE result', partyMember1, partyMember2, partyMember3)
    setBankData(op.b1, op.a1, partyMember1)
    setBankData(op.b2, op.a2, partyMember2)
    setBankData(op.b3, op.a3, partyMember3)
    return {}
}
const GTPYE = async (op) => {
    console.log('GTPYE', op)
    const partyMember1 = getBankData(op.b1, op.a1)
    const partyMember2 = getBankData(op.b2, op.a2)
    const partyMember3 = getBankData(op.b3, op.a3)
    window.data.savemap.party.members = [
        getPlayableCharacterName(partyMember1),
        getPlayableCharacterName(partyMember2),
        getPlayableCharacterName(partyMember3)
    ]
    console.log('GTPYE result', window.data.savemap.party.members)
    return {}
}

const GETPC = async (op) => {
    console.log('GETPC', op)
    const partyMember = getPlayableCharacterId(window.data.savemap.party.members[p])
    console.log('GETPC result', partyMember)
    setBankData(op.b, op.a, partyMember)
    return {}
}
const PRTYP = async (op) => {
    console.log('PRTYP', op)
    const opCharacterName = getPlayableCharacterName(op.c)
    const members = window.data.savemap.party.members
    if (members[0] === 'None') {
        members[0] = opCharacterName
    } else if (members[1] === 'None') {
        members[1] = opCharacterName
    } else {
        members[2] = opCharacterName // Occupy last slot if not party is already full
    }

    console.log('PRTYP result', window.data.savemap.party.members)
    return {}
}
const PRTYM = async (op) => {
    console.log('PRTYM', op)
    const opCharacterName = getPlayableCharacterName(op.c)
    const members = window.data.savemap.party.members
    for (let i = 0; i < members.length; i++) {
        if (members[i] === opCharacterName) {
            members[i] === 'None'
        }
    }
    console.log('PRTYM result', window.data.savemap.party.members)
    return {}
}
const PRTYE = async (op) => {
    console.log('PRTYE', op)
    window.data.savemap.party.members[
        getPlayableCharacterName(op.c1),
        getPlayableCharacterName(op.c2),
        getPlayableCharacterName(op.c3)
    ]
    console.log('PRTYE result', window.data.savemap.party.members)
    return {}
}
const MMBud = async (op) => {
    console.log('MMBud', op)
    const opCharacterName = getPlayableCharacterName(op.c)
    window.data.savemap.party.characterAvailability[op.c] = op.s
    console.log('MMBud', window.data.savemap.party.characterAvailability)
    return {}
}
const MMBLK = async (op) => {
    console.log('MMBLK', op)
    const opCharacterName = getPlayableCharacterName(op.c)
    window.data.savemap.party.phsLocked[op.c] = 1
    console.log('MMBLK', window.data.savemap.party.phsLocked)
    return {}
}
const MMBUK = async (op) => {
    console.log('MMBUK', op)
    const opCharacterName = getPlayableCharacterName(op.c)
    window.data.savemap.party.phsLocked[op.c] = 0
    console.log('MMBUK', window.data.savemap.party.phsLocked)
    return {}
}

export {
    SPTYE,
    GTPYE,
    GETPC,
    PRTYP,
    PRTYM,
    PRTYE,
    MMBud,
    MMBLK,
    MMBUK
}