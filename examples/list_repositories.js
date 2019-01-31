global.fetch = require('node-fetch')
global.navigator = {};

const readYaml = require('read-yaml');
const { CognitoUserPool,
         CognitoUserAttribute,
         CognitoUser,
         AuthenticationDetails } = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const fs = require('fs');
const { Client } = require('minerva-client');

const config = readYaml.sync(process.argv[2]);

// Utility function to print results and pass along the response
const printRet = label => response => {
  console.log('=== ' + label + ' ===');
  console.log(response);
  console.log();
  return response;
};

const errExit = label => data => {
  console.error('EEE ' + label + ' EEE');
  console.error(data);
  console.error();
  process.exit();
};

const client = new Client(
  config['PoolId'],
  config['AppClientId'],
  config['ApiBaseUrl']
);
client.authenticate(config['Username'], config['Password'])
  .catch(errExit('Authenticating'));

client.listRepositories()
  .then(printRet('List Repositories'))
  .catch(errExit('List Repositories'));
