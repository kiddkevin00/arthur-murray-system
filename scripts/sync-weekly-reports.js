#!/usr/bin/env node

const axios = require('axios');

const arthurMurrayUrl = 'https://api.arthurmurrayfranchisee.com';
const arthurMurrayHttpClient = axios.create({
  baseURL: arthurMurrayUrl,
});
const fetchReportsFromOfficialSource = async () => {
  const { data: { access_token: accessToken } } = await arthurMurrayHttpClient.get('/oauth/v2/token', {
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
      week_number: 1, // to current
      week_year: 2019,
      access_token: accessToken,
    },
  });
};

const syncStudios = async () => {
  const { data: reportsResData } = await fetchReportsFromOfficialSource();

  console.log(reportsResData.sps[0][0].report);
  // all 300+ franchisees and its weekly reports should store in one collection
  // add three more column: franchsee name, week number, year
};

syncStudios();
