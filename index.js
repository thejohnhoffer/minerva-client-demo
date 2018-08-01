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
  makeRepository,
  makeImport,
  listImports,
  getTempCredentials,
  uploadFile,
  listContent,
  completeImport,
  getBfu,
  getImage,
  getImageCredentials,
  getImageDimensions
} = require('./helper.js');


const getShortPath = (longpath) => {
    return '/' + longpath.split('/').slice(-2).join('/');
};
const filepath = '/Volumes/imstor/sorger/data/RareCyte/YC_02180801_minerva_test/TMA0809.ome.tif';
const awspath = getShortPath(filepath);
const id = (+new Date()).toString(36);

console.log(id);
console.log(awspath);
console.log(filepath);


const repo = makeRepository(client, id);
const impo = makeImport(client, repo, id);

listImports(client, repo, impo);
const tempCreds = getTempCredentials(client, impo);
const uplo = uploadFile(tempCreds, filepath, awspath);

listContent(tempCreds, uplo);
const complete = completeImport(client, impo, uplo);
const bfu = getBfu(client, impo, complete);

const image = getImage(client, bfu);
const imageCreds = getImageCredentials(client, image);
const imageShape = getImageDimensions(client, image);
