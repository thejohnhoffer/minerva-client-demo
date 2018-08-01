global.fetch = require('node-fetch');
global.navigator = {};
require('dotenv').load();

const { CognitoUserPool,
             CognitoUserAttribute,
             CognitoUser,
             AuthenticationDetails } = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const fs = require('fs');
const { Client } = require('minerva-client');

const poolid = process.env.MINERVA_POOL; 
const baseurl = process.env.MINERVA_BASE; 
const user = process.env.MINERVA_USERNAME;
const pass = process.env.MINERVA_PASSWORD;
const clientid = process.env.MINERVA_CLIENT; 

const client = new Client(poolid, clientid, baseurl);
client.authenticate(user, pass);

const {
  printRet,
  getImageDimensions
} = require('./helper.js');


const args = process.argv.slice(2);
if (args.length > 0) {
  const uuid = args[0];
  console.log(uuid);
  const impo = Promise.resolve({
    uuid: uuid
  });
  impo.then((data) => {
    return client.listImagesInBFU(data.uuid);
  }).then(printRet('Get Image'));
}
