import { KUJATA_BASE } from './kernel-fetch-data.js'

const loadMiscData = async () => {
  const markDataRes = await fetch(`${KUJATA_BASE}/data/battle/mark.dat.json`)
  const markData = await markDataRes.json()

  window.data.battleMisc = {
    mark: markData
  }
}

export { loadMiscData }
