const bitTest = (num, bit) => {
  return (num >> bit) % 2 !== 0
}
window.bitTest = bitTest
const setBitOn = (num, bit) => {
  return num | (1 << bit)
}

const setBitOff = (num, bit) => {
  return num & ~(1 << bit)
}
const toggleBit = (num, bit) => {
  return bitTest(num, bit) ? setBitOff(num, bit) : setBitOn(num, bit)
}

export { setBitOn, setBitOff, toggleBit, bitTest }
