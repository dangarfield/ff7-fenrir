const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const uuid = () => {
  // from https://github.com/TylerGarlick/simple-uuid/blob/master/lib/uuid-node.js
  let lut = []
  for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16)
  }
  let d0 = (Math.random() * 0xffffffff) | 0
  let d1 = (Math.random() * 0xffffffff) | 0
  let d2 = (Math.random() * 0xffffffff) | 0
  let d3 = (Math.random() * 0xffffffff) | 0
  return (
    lut[d0 & 0xff] +
    lut[(d0 >> 8) & 0xff] +
    lut[(d0 >> 16) & 0xff] +
    lut[(d0 >> 24) & 0xff] +
    '-' +
    lut[d1 & 0xff] +
    lut[(d1 >> 8) & 0xff] +
    '-' +
    lut[((d1 >> 16) & 0x0f) | 0x40] +
    lut[(d1 >> 24) & 0xff] +
    '-' +
    lut[(d2 & 0x3f) | 0x80] +
    lut[(d2 >> 8) & 0xff] +
    '-' +
    lut[(d2 >> 16) & 0xff] +
    lut[(d2 >> 24) & 0xff] +
    lut[d3 & 0xff] +
    lut[(d3 >> 8) & 0xff] +
    lut[(d3 >> 16) & 0xff] +
    lut[(d3 >> 24) & 0xff]
  )
}
const dec2bin = (dec) => {
  return (dec >>> 0).toString(2)
}
window.dec2bin = dec2bin
const dec2hex = (dec) => {
  return `0x${parseInt(dec).toString(16)}`
}
window.dec2hex = dec2hex
const dec2hexPairs = (dec) => {
  let s = parseInt(dec).toString(16)
  if (s.length % 2) { s = '0' + s }
  s = s.match(/.{1,2}/g).join(' ')
  return s
}
window.dec2hexPairs = dec2hexPairs

export { sleep, uuid, dec2bin, dec2hexPairs }
