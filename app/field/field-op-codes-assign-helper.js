const bitTest = (num, bit) => {
  return (num >> bit - 1) % 2 !== 0
}
window.bitTest = bitTest
const setBitOn = (num, bit) => {
  return num | (1 << bit - 1)
}

const setBitOff = (num, bit) => {
  return num & ~(1 << bit - 1)
}
const toggleBit = (num, bit) => {
  return bitTest(num, bit) ? setBitOff(num, bit) : setBitOn(num, bit)
}

export { setBitOn, setBitOff, toggleBit, bitTest }
