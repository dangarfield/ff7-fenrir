import { KUJATA_BASE } from './kernel-fetch-data.js'

const loadExeData = async () => {
  const exeDataRes = await fetch(`${KUJATA_BASE}/data/exe/ff7.exe.json`)
  const exeData = await exeDataRes.json()
  window.data.exe = exeData
}

export { loadExeData }
