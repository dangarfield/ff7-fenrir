import { KUJATA_BASE } from './kernel-fetch-data.js'

const loadCDData = async () => {
  const creditsRes = await fetch(`${KUJATA_BASE}/metadata/credits-assets/credits.json`)
  const credits = await creditsRes.json()
  window.data.cd = {
    credits
  }
}

export { loadCDData }
