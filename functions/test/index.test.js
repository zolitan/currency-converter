const request = require('supertest');
const moment = require('moment');

const api = require(path.resolve('functions', 'index.js')).app

const when = {
  // Note: an entry corresponding to 'ninetyDaysAgo' is always present in the database
  ninetyDaysAgo: moment().subtract(90, 'days').format("YYYY-MM-DD"),
  ninetyTwoDaysAgo: moment().subtract(92, 'days').format("YYYY-MM-DD"),
  tomorrow: moment().add(1, 'days').format("YYYY-MM-DD")
};


describe('GET /convert', () => {

  it('reference_date is in a bad format', done => {
    request(api)
      .get(`/convert/reference_date/2020-feb-05/src_currency/EUR/amount/1/dest_currency/EUR`)
      .expect(400, done);
  });

  it('reference_date is out of bounds (92 days ago)', done => {
    request(api)
      .get(`/convert/reference_date/${when.ninetyTwoDaysAgo}/src_currency/EUR/amount/1/dest_currency/EUR`)
      .expect(400, done);
  });

  it('reference_date is out of bounds (tomorrow)', done => {
    request(api)
      .get(`/convert/reference_date/${when.tomorrow}/src_currency/EUR/amount/1/dest_currency/EUR`)
      .expect(400, done);
  });

  it('amount is not a valid number', done => {
    request(api)
      .get(`/convert/reference_date/${when.ninetyDaysAgo}/src_currency/EUR/amount/100k/dest_currency/EUR`)
      .expect(400, done);
  });

  it('src_currency is not a valid ISO currency code', done => {
    request(api)
      .get(`/convert/reference_date/${when.ninetyDaysAgo}/src_currency/euro/amount/1/dest_currency/EUR`)
      .expect(400, done);
  });

  it('dest_currency is not a valid ISO currency code', done => {
    request(api)
      .get(`/convert/reference_date/${when.ninetyDaysAgo}/src_currency/EUR/amount/1/dest_currency/dollar`)
      .expect(400, done);
  });

  it('EUR correctly converts to EUR', done => {
    request(api)
      .get(`/convert/reference_date/${when.ninetyDaysAgo}/src_currency/EUR/amount/1/dest_currency/EUR`)
      .expect({ currency: "EUR", amount: 1 })
      .expect(200, done);
  });

  it('USD correctly converts to USD', done => {
    request(api)
      .get(`/convert/reference_date/${when.ninetyDaysAgo}/src_currency/USD/amount/1/dest_currency/USD`)
      .expect({ currency: "USD", amount: 1 })
      .expect(200, done);
  });

});