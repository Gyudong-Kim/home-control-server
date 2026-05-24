const config = require('../../config');
const { fail } = require('../../util/response');
const MESSAGE = require('../../util/message');

module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== config.apiKey) {
    return fail(res, 401, MESSAGE.UNAUTHORIZED);
  }
  next();
};
