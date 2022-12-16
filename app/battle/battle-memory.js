const variables = {
  local: Array.from({ length: 10 }, Object),
  global: {},
  actor: Array.from({ length: 10 }, Object)
}

/*
    Each address references a specific bit of memory rather than a byte which means
    individual bits can be manipulated without using BIT-wise operations in script.
    Every 8 address values is the beginning of a byte (ie. 0x0000, 0x0008, etc.).
    The code used to access an address determines whether a bit, byte, word, or dword is being read/written.

    https://stackoverflow.com/questions/6972717/how-do-i-create-bit-array-in-javascript

    Just do something very simple for now
*/

const logMemory = () => {
  console.log('battleMemory logMemory', JSON.stringify(variables, null, 2))
}
const initAllVariables = () => {
  variables.local = Array.from({ length: 10 }, Object)
  variables.global = {}
  variables.actor = Array.from({ length: 10 }, Object)
  populateInitialActorVariables()
}
const populateInitialActorVariables = () => {
  // TODO
}

const getLocalValue = (actorId, addressHex, returnType) => {
  const value = variables.local[actorId][addressHex]
  if (value === undefined) return 0b0
  // TODO - Do something with returnType?
  console.log('battleMemory getLocalValue', actorId, addressHex, returnType, value)
  return value
}
const setLocalValue = (actorId, addressHex, value) => {
  variables.local[actorId][addressHex] = value
  console.log('battleMemory setLocalValue', actorId, addressHex, value)
}
const getGlobalValue = (addressHex, returnType) => {
  let value = 0
  if (addressHex === '20a0') value = 0b0000000111
  console.log('battleMemory getGlobalValue', addressHex, returnType, value)
  return value
}
const setGlobalValue = (addressHex, value) => {
  console.log('battleMemory setGlobalValue', addressHex, value)
  variables.global[addressHex] = value
}
const getActorValueAll = (addressHex, returnType) => {
  const value = Array.from({ length: 10 }, 0)
  console.log('battleMemory getActorValueAll', addressHex, returnType, value)
  return value
}
// const getActorValue = (actorId, address, returnType) => { // Is this every specifically used?!

// }
const setActorValue = (actorId, address, value) => {

}
export {
  initAllVariables,
  logMemory,
  getLocalValue,
  setLocalValue,
  getGlobalValue,
  setGlobalValue,
  getActorValueAll,
  setActorValue
}
