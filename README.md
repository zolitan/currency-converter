# Currency Converter API

API endpoint implementing a currency converter. The converter consults [the latest exchange rates](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml) from the European Central Bank.

## Usage

```
GET /convert/reference_date/DATE/src_currency/FROM_CURRENCY/amount/SUM/dest_currency/TO_CURRENCY
```
or the less unwieldy way
```
GET /convert/DATE/FROM_CURRENCY/SUM/TO_CURRENCY
```
where

**DATE** should be one of the last 90 days in the format YYYY-MM-DD

**FROM_CURRENCY** and **TO_CURRENCY** should be one of EUR, USD, JPY, BGN, CZK, DKK, GBP, HUF, PLN, RON, SEK, CHF, ISK, NOK, HRK, RUB, TRY, AUD, BRL, CAD, CNY, HKD, IDR, ILS, INR, KRW, MXN, MYR, NZD, PHP, SGD, THB, ZAR

**SUM** should be a floating point number, e.g. 123.4


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

As a prerequisite, make sure to have [Node.js](https://nodejs.org/en/download/) installed on your machine.
```
mkdir proj
cd proj
git clone https://github.com/zolitan/currency-converter.git
```
We now have the code downloaded in our local  directory `proj`. 

Now head over to [Firebase](https://firebase.google.com/) and sign up for an account. By the end of the process, you'll have `YOUR_FIREBASE_PROJECT_ID`. Afterwards, install the Firebase command line tool:
```
npm install -g firebase-tools
```
Run `firebase login` to log in via the browser and authenticate the firebase tool, and then run `firebase use YOUR_FIREBASE_PROJECT_ID`.

Back in our local `proj` directory, make sure to replace the placeholder for your actual project id in your Firebase configuration file

**.firebaserc**:

	  {
		  "projects": {
			  "default": YOUR_FIREBASE_PROJECT_ID
		  }
	  }
We can now install the project itself locally:
```
cd functions
npm install
cd ..
npm install
```
And we're done.

## Running the project locally
To run the project on the localhost, use the following command:

    firebase serve
    
This exposes the API through the following localhost link:

    http://localhost:5001/YOUR_FIREBASE_PROJECT_ID/us-central1/app/convert

You can check that it indeed works with the following command:

    curl -i "http://localhost:5001/YOUR_FIREBASE_PROJECT_ID/us-central1/app/convert/2020-02-05/EUR/233.8/USD"

[More details](https://firebase.google.com/docs/hosting/deploying) on that.

## Running the tests

We can run the unit tests from the `functions` directory with the command

    npm test


## Deployment

From our `proj` directory, simply call

    firebase deploy
This will deploy the code on the Firebase servers and exposes the API accessible for the outside world via the link:

    https://us-central1-YOUR_FIREBASE_PROJECT_ID.cloudfunctions.net/app/convert

You can check that it indeed works with the following command:

    curl -i "https://us-central1-YOUR_FIREBASE_PROJECT_ID.cloudfunctions.net/app/convert/2020-02-05/EUR/233.8/USD"

## Built With

* **[Node.js](https://nodejs.org/)** - the language for implementing the backend
* **[npm](https://www.npmjs.com/)** - package manager for Node.js
* **[Firebase](https://firebase.google.com/)** - web application development platform with [Cloud Functions](https://firebase.google.com/docs/functions), a serverless backend capabilities
* **[Express](https://expressjs.com/)** - a middleware framework for Node.js
* **[Mocha.js](https://mochajs.org/)** - a JavaScript test framework running on Node.js
* **[Supertest](https://github.com/visionmedia/supertest)** - for testing Node.js HTTP servers