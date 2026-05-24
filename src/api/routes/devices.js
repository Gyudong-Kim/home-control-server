const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const smartthings = require('../../services/smartthings');
const { success, fail } = require('../../util/response');
const MESSAGE = require('../../util/message');

const DEVICES_FILE = path.join(__dirname, '../../../data/devices.json');

async function readDevices() {
  const raw = await fs.readFile(DEVICES_FILE, 'utf-8');
  return JSON.parse(raw).devices;
}

async function findDevice(deviceId) {
  const devices = await readDevices();
  return devices.find((d) => d.id === deviceId) || null;
}

router.post('/:deviceId/toggle', async (req, res, next) => {
  try {
    const device = await findDevice(req.params.deviceId);
    if (!device) return fail(res, 404, MESSAGE.DEVICE_NOT_FOUND);

    const current = await smartthings.getDeviceStatus(device.id);
    const command = current === 'on' ? 'off' : 'on';
    await smartthings.sendCommand(device.id, command);
    return success(res, 200, MESSAGE.TOGGLE_SUCCESS, { id: device.id, name: device.name, status: command });
  } catch (err) {
    return next(err);
  }
});

router.post('/:deviceId/on', async (req, res, next) => {
  try {
    const device = await findDevice(req.params.deviceId);
    if (!device) return fail(res, 404, MESSAGE.DEVICE_NOT_FOUND);

    await smartthings.sendCommand(device.id, 'on');
    return success(res, 200, MESSAGE.ON_SUCCESS, { id: device.id, name: device.name });
  } catch (err) {
    return next(err);
  }
});

router.post('/:deviceId/off', async (req, res, next) => {
  try {
    const device = await findDevice(req.params.deviceId);
    if (!device) return fail(res, 404, MESSAGE.DEVICE_NOT_FOUND);

    await smartthings.sendCommand(device.id, 'off');
    return success(res, 200, MESSAGE.OFF_SUCCESS, { id: device.id, name: device.name });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
