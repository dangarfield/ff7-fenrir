const getPlayableCharacterName = (c) => {
    if (c == 0) return "Cloud"
    if (c == 1) return "Barret"
    if (c == 2) return "Tifa"
    if (c == 3) return "Aeris"
    if (c == 4) return "RedXIII"
    if (c == 5) return "Yuffie"
    if (c == 6) return "CaitSith"
    if (c == 7) return "Vincent"
    if (c == 8) return "Cid"
    if (c == 9) return "YoungCloud"
    if (c == 10) return "Sephiroth"
    if (c == 11) return "Chocobo"
    return 'None'
}

export {
    getPlayableCharacterName
}