const fs = require('fs')
const path = require('path')

// Path to the kujata-data metadata directory
const metadataPath = path.join(__dirname, '../../kujata-data/metadata/background-layers')

function checkLayerShifts () {
  try {
    // Read all directories in the backgrnd-layers folder
    const directories = fs.readdirSync(metadataPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    console.log('Fields with layer shifts and offsets:')
    console.log('====================================')

    let fieldsWithShifts = 0
    let fieldsWithOffsets = 0
    let fieldsWithBoth = 0
    let fieldsWithJustOffsets = 0
    let fieldsWithJustShifts = 0
    let fieldsWithNeither = 0
    let totalFields = 0

    for (const dirName of directories) {
      const jsonFilePath = path.join(metadataPath, dirName, `${dirName}.json`)

      // Check if the JSON file exists
      if (!fs.existsSync(jsonFilePath)) {
        console.log(`Warning: ${dirName}.json not found in ${dirName} directory`)
        continue
      }

      totalFields++

      try {
        // Read and parse the JSON file
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))

        // Check if layerShifts exists and has non-zero values
        if (jsonData.shiftData.layerShifts && Array.isArray(jsonData.shiftData.layerShifts)) {
          const nonZeroShifts = jsonData.shiftData.layerShifts.filter(shift =>
            shift.x !== 0 || shift.y !== 0
          )

          const hasShifts = nonZeroShifts.length > 0
          const hasOffsets = jsonData.shiftData.offsetX !== 0 || jsonData.shiftData.offsetY !== 0

          // Count categories
          if (hasShifts) fieldsWithShifts++
          if (hasOffsets) fieldsWithOffsets++
          
          if (hasShifts && hasOffsets) {
            fieldsWithBoth++
          } else if (hasShifts && !hasOffsets) {
            fieldsWithJustShifts++
          } else if (!hasShifts && hasOffsets) {
            fieldsWithJustOffsets++
          } else {
            fieldsWithNeither++
          }

          // Display fields that have either shifts or offsets
          if (hasShifts || hasOffsets) {
            const shiftStrings = jsonData.shiftData.layerShifts.map(shift =>
              `${shift.x ? (shift.x + '').padStart(2, ' ') : '  '},${shift.y ? (shift.y + '').padStart(2, ' ') : '  '}`
            )
            const offsetInfo = `Offsets: ${jsonData.shiftData.offsetX}, ${jsonData.shiftData.offsetY}`
            const hasInfo = `[${hasShifts ? 'S' : ' '}${hasOffsets ? 'O' : ' '}]`
            console.log(`${dirName.padEnd(12, ' ')} ${hasInfo} -> Shifts: ${shiftStrings.join(' - ')} | ${offsetInfo}`)
          }
        } else {
          // No shift data structure found
          fieldsWithNeither++
        }
      } catch (parseError) {
        console.log(`Error parsing ${dirName}.json: ${parseError.message}`)
      }
    }

    console.log('====================================')
    console.log('SUMMARY:')
    console.log('====================================')
    console.log(`Total fields processed: ${totalFields}`)
    console.log(`Fields with both offsets and shifts: ${fieldsWithBoth}`)
    console.log(`Fields with just offsets: ${fieldsWithJustOffsets}`)
    console.log(`Fields with just shifts: ${fieldsWithJustShifts}`)
    console.log(`Fields with neither: ${fieldsWithNeither}`)
    console.log('------------------------------------')
    console.log(`Total fields with offsets: ${fieldsWithOffsets}`)
    console.log(`Total fields with shifts: ${fieldsWithShifts}`)
    console.log('====================================')
    
    // Verification
    const totalCounted = fieldsWithBoth + fieldsWithJustOffsets + fieldsWithJustShifts + fieldsWithNeither
    if (totalCounted !== totalFields) {
      console.log(`⚠️  Warning: Count mismatch! Total: ${totalFields}, Counted: ${totalCounted}`)
    }
  } catch (error) {
    console.error('Error reading metadata directory:', error.message)
    console.error('Make sure the kujata-data/metadata/backgrnd-layers directory exists')
  }
}

// Run the check
checkLayerShifts()
