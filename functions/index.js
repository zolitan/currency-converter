const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const moment = require('moment');

const express = require('express');
const app = express();

const URL_EXCHANGE_RATES = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
let currencyXChange;


app.get('/convert/reference_date/:reference_date/src_currency/:src_currency/amount/:amount/dest_currency/:dest_currency', async (req, res, next) => {
  const { reference_date, src_currency, dest_currency, amount } = req.params;

  // fetch it only once upon initialization
  if (!currencyXChange) {
    try {
      const response = await fetch(URL_EXCHANGE_RATES);
      if (!response.ok) throw new Error("Error downloading xml file with currency exchange rates");
      const xml = await response.text();
      const data = await parseStringPromise(xml);
      currencyXChange =
        data['gesmes:Envelope'].Cube[0].Cube.reduce(
          (allEntries, entry) => ({
            ...allEntries,
            [entry['$'].time]: entry.Cube.reduce(
              (allXChanges, xchange) => ({
                ...allXChanges,
                [xchange['$'].currency]: Number(xchange['$'].rate)
              }),
              { EUR: 1.0 }
            )
          }),
          {}
        );
    } catch (error) {
      return next(error);
    }
  }

  // check if present and is in the right format
  if (reference_date && reference_date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {

    const refDate = moment(reference_date, "YYYY-MM-DD");
    const dates = Object.keys(currencyXChange);
    const start_date = dates[dates.length - 1];
    const startDate = moment(start_date, "YYYY-MM-DD");
    const end_date = dates[0];
    const endDate = moment(end_date, "YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");

    // check if between the correct bounds
    if (!refDate.isBefore(startDate) && !refDate.isAfter(today)) {

      // check if reference_date is present in the database
      if (currencyXChange[reference_date]) {

        // check if present and is a valid number
        if (amount && !isNaN(Number(amount))) {

          const currencyCodes = Object.keys(Object.values(currencyXChange)[0]);

          // check if a valid currency code
          if (src_currency && currencyCodes.includes(src_currency)) {

            // check if a valid currency code
            if (dest_currency && currencyCodes.includes(dest_currency)) {

              const rates = currencyXChange[reference_date];

              res.status(200).json({
                amount: amount * rates[dest_currency] / rates[src_currency],
                currency: dest_currency
              });

            } else {
              res.status(400).json({
                status: "fail",
                message: `dest_currency should be a valid ISO currency code (one of ${currencyCodes.join(', ')})`
              });
            }
          } else {
            res.status(400).json({
              status: "fail",
              message: `src_currency should be a valid ISO currency code (one of ${currencyCodes.join(', ')})`
            });
          }
        } else {
          res.status(400).json({
            status: "fail",
            message: "amount parameter is missing or is not a number (NaN)"
          });
        }
      } else {
        res.status(400).json({
          status: "fail",
          message: `${reference_date} is not present in the database; try something in between ${startDate.format("YYYY-MM-DD")} and ${endDate.format("YYYY-MM-DD")}`
        });
      }
    } else {
      res.status(400).json({
        status: "fail",
        message: `reference_date parameter should fall in the range ${start_date} and ${end_date}`
      });
    }
  } else {
    res.status(400).json({
      status: "fail",
      message: "reference_date parameter is missing or isn't in the right format (should be YYYY-MM-DD)"
    });
  }

  return next();

});


// for handling exceptions propagated from the API
app.use((error, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: error.message
  })
});


exports.app = functions.https.onRequest(app);