const express = require('express');
const morgan = require('morgan');
const auth = require('../api/middlewares/auth');
const router = require('../api/routes');
const { fail } = require('../util/response');
const MESSAGE = require('../util/message');

module.exports = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));
  app.use(auth);
  app.use('/', router);

  app.use((req, res) => {
    fail(res, 404, 'Not found');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    fail(res, 500, MESSAGE.INTERNAL_ERROR);
  });
};
