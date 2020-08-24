const getPlayableCharacterId = (c) => {
    if (c == 'Cloud') return 0
    if (c == 'Barret') return 1
    if (c == 'Tifa') return 2
    if (c == 'Aeris') return 3
    if (c == 'RedXIII') return 4
    if (c == 'Yuffie') return 5
    if (c == 'CaitSith') return 6
    if (c == 'Vincent') return 7
    if (c == 'Cid') return 8
    if (c == 'YoungCloud') return 9
    if (c == 'Sephiroth') return 10
    if (c == 'Chocobo') return 11
    return 0
}

const getPlayableCharacterName = (c) => {
    if (c == 0) return 'Cloud'
    if (c == 1) return 'Barret'
    if (c == 2) return 'Tifa'
    if (c == 3) return 'Aeris'
    if (c == 4) return 'RedXIII'
    if (c == 5) return 'Yuffie'
    if (c == 6) return 'CaitSith'
    if (c == 7) return 'Vincent'
    if (c == 8) return 'Cid'
    if (c == 9) return 'YoungCloud'
    if (c == 10) return 'Sephiroth'
    if (c == 11) return 'Chocobo'
    return 'None'
}

export {
    getPlayableCharacterName,
    getPlayableCharacterId
}