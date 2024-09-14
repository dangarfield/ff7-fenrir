import { KUJATA_BASE } from './kernel-fetch-data.js'

const loadExeData = async () => {
  const exeDataRes = await fetch(`${KUJATA_BASE}/data/exe/ff7.exe.json`)
  const exeData = await exeDataRes.json()
  for (let i = 0; i < exeData.limitData.limits.length; i++) {
    const limit = exeData.limitData.limits[i]
    limit.name = window.data.kernel.magicNames[i + 128].replace(
      /^\{COLOR\(\d+\)\}/,
      ''
    )
    limit.description = window.data.kernel.magicDescriptions[i + 128].replace(
      /^\{COLOR\(\d+\)\}/,
      ''
    )
  }
  window.data.exe = exeData
}

export { loadExeData }
