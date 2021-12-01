const getPlayableCharacterId = c => {
  if (c === 'Cloud') return 0
  if (c === 'Barret') return 1
  if (c === 'Tifa') return 2
  if (c === 'Aeris') return 3
  if (c === 'RedXIII') return 4
  if (c === 'Yuffie') return 5
  if (c === 'CaitSith') return 6
  if (c === 'Vincent') return 7
  if (c === 'Cid') return 8
  if (c === 'YoungCloud') return 9
  if (c === 'Sephiroth') return 10
  if (c === 'Choco') return 11
  return 255
}

const getPlayableCharacterName = c => {
  if (c === 0) return 'Cloud'
  if (c === 1) return 'Barret'
  if (c === 2) return 'Tifa'
  if (c === 3) return 'Aeris'
  if (c === 4) return 'RedXIII'
  if (c === 5) return 'Yuffie'
  if (c === 6) return 'CaitSith'
  if (c === 7) return 'Vincent'
  if (c === 8) return 'Cid'
  if (c === 9) return 'YoungCloud'
  if (c === 10) return 'Sephiroth'
  if (c === 11 || c === 100) return 'Choco'
  return 'None'
}
const getSpecialTextName = textId => {
  return `Name ${textId}` // TODO - Doesn't look like currentField dialogStrings
}
const setCharacterNameFromSpecialText = (c, textId) => {
  // This is not really used in the game
  const characterName = getPlayableCharacterName(c)
  window.data.savemap.characters[characterName].name = getSpecialTextName(
    textId
  )
  console.log(
    'setCharacterNameFromSpecialText',
    characterName,
    window.data.savemap.characters[characterName]
  )
}
const getCharacterSaveMap = characterName => {
  if (characterName === 'Sephiroth') {
    return window.data.savemap.characters.Vincent
  } else if (characterName === 'YoungCloud') {
    return window.data.savemap.characters.CaitSith
  } else {
    return window.data.savemap.characters[characterName]
  }
}

const temporaryPHSMenuSetParty = () => {
  const newParty = []
  const characterNames = Object.keys(window.data.savemap.party.phsLocked)
  for (let i = 0; i < characterNames.length; i++) {
    const name = characterNames[i]
    if (window.data.savemap.party.phsLocked[name] === 1) {
      newParty.push(name)
    }
  }
  for (let i = 0; i < characterNames.length; i++) {
    const name = characterNames[i]
    if (
      window.data.savemap.party.phsVisibility[name] === 1 &&
      !newParty.includes(name)
    ) {
      newParty.push(name)
    }
  }
  window.data.savemap.party.members = newParty.slice(0, 3)
  console.log(
    'temporaryPHSMenuSetParty',
    newParty,
    window.data.savemap.party.members
  )
}
export {
  getPlayableCharacterName,
  getPlayableCharacterId,
  setCharacterNameFromSpecialText,
  getCharacterSaveMap,
  temporaryPHSMenuSetParty
}
