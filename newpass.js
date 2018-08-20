global.fetch = require('node-fetch')
global.navigator = {};
const fs = require('fs');
require('dotenv').config();
const { Client } = require('minerva-client');

const username = process.env.MINERVA_USERNAME;
const newPassword = process.env.MINERVA_PASSWORD;

const client = new Client(
  'us-east-1_ecLW78ap5',
  '7gv29ie4pak64c63frt93mv8lq',
  'https://ba7xgutvbc.execute-api.us-east-1.amazonaws.com/dev'
);

const oldPassword = 'zclvjO@2^76i';
const preferredUsername = username;
const name = 'John Hoffer';

console.log(username, oldPassword)

/*
const token = client.authenticate(username, oldPassword)
  .catch(err => {
    console.error(err);
    console.error('---');
    return client.completeNewPasswordChallenge(
      username,
      oldPassword,
      newPassword,
      {
        preferred_username: preferredUsername,
        name
      }
    )
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
      });
  });
*/
