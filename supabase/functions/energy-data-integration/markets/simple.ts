// NOTE: SPP and IESO markets do not have publicly available real-time APIs
// These functions return null to indicate no data is available
// The application should handle this gracefully by not displaying these markets
// or showing a "Data unavailable" message

export async function fetchSPPData() {
  console.log('⚠️ SPP: No public API available - returning null');
  return null;
}

export async function fetchIESOData() {
  console.log('⚠️ IESO: No public API available - returning null');
  return null;
}
