export function readStoreProfile() {
  return {
    storeName: localStorage.getItem('store_name') ?? '',
    businessType: localStorage.getItem('store_biz_type') ?? '',
    address: localStorage.getItem('store_address') ?? '',
    latitude: localStorage.getItem('store_latitude') ?? '',
    longitude: localStorage.getItem('store_longitude') ?? '',
  }
}

export function buildStorePayload({ storeName, businessType, latitude, longitude }) {
  if (latitude === '' || longitude === '') return null

  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!storeName?.trim() || !businessType || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return {
    storeName: storeName.trim(),
    businessType,
    latitude: lat,
    longitude: lng,
  }
}

export function syncStoreProfile(store) {
  if (!store) return
  localStorage.setItem('store_name', store.storeName ?? '')
  localStorage.setItem('store_biz_type', store.businessType ?? '')
  localStorage.setItem('store_latitude', store.latitude ?? '')
  localStorage.setItem('store_longitude', store.longitude ?? '')
  window.dispatchEvent(new Event('store-profile-updated'))
}

export function clearStoreProfile() {
  localStorage.removeItem('store_name')
  localStorage.removeItem('store_address')
  localStorage.removeItem('store_biz_type')
  localStorage.removeItem('store_latitude')
  localStorage.removeItem('store_longitude')
  window.dispatchEvent(new Event('store-profile-updated'))
}
