const fs = require('fs')

const dec2hex = (dec, padding, rawWithSpaces) => {
  const h = parseInt(dec).toString(16)
  return `${!rawWithSpaces ? '0x' : ''}${
    padding ? h.padStart(padding, '0') : h
  }`
}
const dec2bin = dec => {
  // For debug only
  return (dec >>> 0).toString(2).padStart(8, '0')
}

const r = Buffer.from(
  fs.readFileSync(
    `C:\\Program Files (x86)\\Steam\\steamapps\\common\\FINAL FANTASY VII\\ff7_en.exe`
  )
)
const lines = []
const allSame = arr => arr.every(val => val === arr[0])
const missingNumbers = (arr, min, max) =>
  Array.from({ length: max - min + 1 }, (_, i) => i + min).filter(
    n => !arr.includes(n)
  )

const findRepeatedValue = values => {
  const max = Math.max(...values)
  const between = missingNumbers(values, values[0], max)
  console.log('values', values)
  console.log('between', between)
  lines.push(`Repeated Values - ${values}\n----------------------`)
  for (let i = 0; i < r.length - max; i++) {
    const val = values.map(v => r.at(i + v))
    if (val[0] === 0 || val[0] > 16 || val[0] === 255 || !allSame(val)) continue // Continue if pattern doesn't match
    // console.log(dec2hex(i), val)
    const betweenVal = missingNumbers(values, val[0], max).map(v => r.at(i + v))
    if (betweenVal.includes(val[0])) continue // Continue if the values between are the same as the target

    lines.push(
      `${dec2hex(i)} ${val} ${betweenVal} ${betweenVal.includes(val[0])}`
    )
  }
  fs.writeFileSync(
    './output/byte-pattern-find-repeated-value.txt',
    lines.join('\n'),
    'utf-8'
  )
}
const findPatternWithUnknownNumber = arr => {
  const arrLength = arr.length
  for (let i = 0; i < r.length - arrLength; i++) {
    // for (let i = 0; i < 500; i++) {
    r.byteOffset = i
    r.readInt8()
    const a = []
    const root = r.readInt8(i)
    for (let ia = 1; ia < arrLength; ia++) {
      const next = r.readInt8(i + ia)
      a.push(next)
      // r.byteOffset++
      if (next !== root + arr[ia]) {
        break
      }
    }
    if (a.length > 4) {
      console.log(i, a, r.byteOffset)
    }
  }
}
const init = async () => {
  // findRepeatedValue([0, 3, 8, 11, 14])
  findPatternWithUnknownNumber([0, 1, 2, 3, 2, 2, 2])
}

init()
