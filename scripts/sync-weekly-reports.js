#!/usr/bin/env node

const storage = require('../src/lib/storage/');
const constants = require('../src/lib/constants/');

const axios = require('axios');
const Promise = require('bluebird');

const { ConnectionPool, RepoFactory } = storage;
const conn = new ConnectionPool(constants.STORE.TYPES.MONGO_DB);
const repo = RepoFactory.manufacture(constants.STORE.TYPES.MONGO_DB);

const tableName = 'financeReport';

const arthurMurrayUrl = 'https://api.arthurmurrayfranchisee.com';
const arthurMurrayHttpClient = axios.create({
  baseURL: arthurMurrayUrl,
});

repo.on(conn, 'connect').then(() => {
  console.log('Connection established successfully.');
});

repo.on(conn, 'error').then(printErrorMsg);

const fetchReportsFromOfficialSource = async week => {
  const currentTime = new Date();
  const yearNumber = currentTime.getFullYear();
  const {
    data: { access_token: accessToken },
  } = await arthurMurrayHttpClient.get('/oauth/v2/token', {
    params: {
      client_id: '5cb9f3803b7750216d34f772_4pfk2m5bhyuccc48kc4c8ooow04sscgsc0s4cggk88kkw8g00s',
      client_secret: '52963dmdve88ow4o8ggk0g80k000k0g4s0k00k0kso8coswssw',
      grant_type: 'password',
      username: 'info@dancecomp.org',
      password: 'dance1',
    },
  });

  return arthurMurrayHttpClient.get('/api/v1/statistics/sps', {
    params: {
      frozen: true,
      week_number: week,
      week_year: yearNumber,
      access_token: accessToken,
    },
  });
};

const syncStudios = async () => {
  const today = new Date();
  const weekNumber = today.getWeek();
  const weeks = [];

  for (let i = 1; i <= weekNumber; i += 1) {
    weeks.push(i);
  }

  let allWeeksData = await Promise.all(
    weeks.map(async week => {
      const { data: reportsResData } = await fetchReportsFromOfficialSource(week);

      reportsResData.weekNumber = week;

      return reportsResData;
    })
  );

  allWeeksData = allWeeksData.filter(week => week.sps.length);

  Promise.try(() => {
    const promises = [];

    for (let i = 0; i < allWeeksData.length; i += 1) {
      for (let j = 0; j < allWeeksData[i].sps.length; j += 1) {
        for (let k = 0; k < allWeeksData[i].sps[j].length; k += 1) {
          const current = allWeeksData[i].sps[j][k];

          if (current) {
            const flattenCurrent = flattenObject(current);

            promises.push(
              repo.upsert(
                conn,
                tableName,
                { name: flattenCurrent.name, submitted_weeks: flattenCurrent.submitted_weeks },
                flattenCurrent
              )
            );
          }
        }
      }
    }

    console.log(`${promises.length} rows detected`);

    return Promise.all(promises);
  })
    .then(() => {
      console.log('Successfully insert all the datas');

      repo.close(conn);
      console.log('Closed connection');
    })
    .catch(printErrorMsg);
};

// eslint-disable-next-line no-extend-native
Date.prototype.getWeek = () => {
  const onejan = new Date(this.getFullYear(), 0, 1);

  return Math.ceil(((this - onejan) / 86400000 + onejan.getDay() + 1) / 7);
};

//function validateResult(type, rows) {
//  console.log(`Validate ${type} result - ${JSON.stringify(rows, null, 2)}.`);
//}
function printErrorMsg(err) {
  console.log(`Something breaks - ${err}`);
}

function flattenObject(obj) {
  const flattened = {};

  Object.keys(obj).forEach(key => {
    if (key !== 'historical') {
      if (Array.isArray(obj[key]) && key === 'submitted_weeks') {
        [flattened[key]] = obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, flattenObject(obj[key]));
      } else {
        flattened[key] = obj[key];
      }
    }
  });

  return flattened;
}

syncStudios();
