// Standard ESC/POS command to trigger a cash drawer connected to the printer's kick port.
const DRAWER_KICK_COMMAND = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa])

export function isWebSerialSupported() {
  return 'serial' in navigator
}

let cachedPort = null

export async function openCashDrawer() {
  if (!isWebSerialSupported()) {
    throw new Error('Cash drawer control requires Chrome or Edge on a desktop computer.')
  }

  try {
    let port = cachedPort
    if (!port) {
      port = await navigator.serial.requestPort()
      cachedPort = port
    }

    await port.open({ baudRate: 9600 })
    const writer = port.writable.getWriter()
    await writer.write(DRAWER_KICK_COMMAND)
    writer.releaseLock()
    await port.close()
    return { success: true }
  } catch (err) {
    cachedPort = null
    if (err.name === 'NotFoundError') {
      throw new Error('No printer selected. Please choose your USB receipt printer.')
    }
    throw new Error('Could not open the cash drawer. Check that your printer is connected via USB.')
  }
}