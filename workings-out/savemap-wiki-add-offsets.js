const fs = require('fs')
const path = require('path')

// Define bank boundaries and bank names
const bankRanges = [
  { offset: 0x0ba4, bankName: '1' }, // 1/2
  { offset: 0x0ca4, bankName: '3' }, // 3/4
  { offset: 0x0da4, bankName: '11' }, // 11/12
  { offset: 0x0ea4, bankName: '13' }, // 13/14
  { offset: 0x0fa4, bankName: '7' } // 7/15
]

// File paths
const inputFile = path.join(__dirname, 'savemap.orig.md')
const outputFile = path.join(__dirname, 'savemap.md')

// Helper function to get offset and bank name for a hex value
function getBankInfo (hexValue, bankIndex) {
  const bank = bankRanges[bankIndex]
  const offset = hexValue - bank.offset
  return `''B[${bank.bankName}][${offset}]''`
}

// Process content
function processContent (lines) {
  let bankIndex = -1 // No bank selected initially
  return lines.map(line => {
    // Update bankIndex based on line content
    if (line.includes('==  Save Memory Bank')) bankIndex++
    else if (line.includes('==  Character Reco')) bankIndex = -1

    // Replace hex values in the current line
    return line.replace(/\|\s(0x[0-9A-Fa-f]+)/g, (match, hexString) => {
      const hexValue = parseInt(hexString, 16)
      return bankIndex >= 0
        ? `| ${hexString}<br/>${getBankInfo(hexValue, bankIndex)}`
        : `| ${hexString}`
    })
  })
}

// Read the file, process content, and write output
try {
  const fileContent = fs.readFileSync(inputFile, 'utf8').split('\n')
  const modifiedContent = processContent(fileContent)
  fs.writeFileSync(outputFile, modifiedContent.join('\n'))
  console.log('File processed and saved as savemap.md')
} catch (err) {
  console.error('Error processing file:', err)
}
