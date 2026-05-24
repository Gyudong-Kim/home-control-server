const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const smartthings = require('../../services/smartthings');
const { success } = require('../../util/response');
const MESSAGE = require('../../util/message');
const devicesRouter = require('./devices');

const DEVICES_FILE = path.join(__dirname, '../../../data/devices.json');

async function readDevices() {
  const raw = await fs.readFile(DEVICES_FILE, 'utf-8');
  return JSON.parse(raw).devices;
}

router.use('/devices', devicesRouter);

router.post('/all/on', async (req, res, next) => {
  try {
    const devices = await readDevices();
    await Promise.all(devices.map((d) => smartthings.sendCommand(d.id, 'on')));
    return success(res, 200, MESSAGE.ALL_ON_SUCCESS, { count: devices.length });
  } catch (err) {
    return next(err);
  }
});

router.post('/all/off', async (req, res, next) => {
  try {
    const devices = await readDevices();
    await Promise.all(devices.map((d) => smartthings.sendCommand(d.id, 'off')));
    return success(res, 200, MESSAGE.ALL_OFF_SUCCESS, { count: devices.length });
  } catch (err) {
    return next(err);
  }
});

router.get('/status', async (req, res, next) => {
  try {
    const devices = await readDevices();
    const result = await Promise.all(
      devices.map(async (d) => {
        const status = await smartthings.getDeviceStatus(d.id);
        return { id: d.id, name: d.name, status };
      })
    );
    return success(res, 200, MESSAGE.STATUS_SUCCESS, result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
