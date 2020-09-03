const SETX = (op) => {
    console.log('SETX', op)
    // Not used
    return {}
}
const GETX = (op) => {
    console.log('GETX', op)
    // Kujata says its used, I can't see it in makou reactor
    return {}
}
const SEARCHX = (op) => {
    console.log('SEARCHX', op)
    // Not used
    return {}
}
const PMJMP = (op) => {
    console.log('PMJMP', op)
    // No need to do anything, could consider preloading maybe, but all is taken care of in MAPJUMP
    return {}
}
const PMJMP2 = (op) => {
    console.log('PMJMP2', op)
    // No need to do anything, could consider preloading maybe, but all is taken care of in MAPJUMP
    return {}
}
export {
    SETX,
    GETX,
    SEARCHX,
    PMJMP,
    PMJMP2
}