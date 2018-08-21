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
  printRet,
  errExit,
  justData,
  getImageCredentials,
  getImageDimensions
} = require('./helper.js');


const getShortPath = (longpath) => {
    return '/' + longpath.split('/').slice(-2).join('/');
};
const filepath = '/n/imstor/sorger/data/RareCyte/JEREMY/JEREMY_GRID_40X-Scan_20180717_135433_01x1x00008.rcpnl';
const awspath = getShortPath(filepath);
const id = (+new Date()).toString(36);

console.log(id);
console.log(awspath);
console.log(filepath);

const repository = client.createRepository({
  'name': 'Repository' + id,
  'raw_storage': 'Destroy'
})
  .then(printRet('Create Repository'))
  .then(justData)
  .catch(errExit('Create Repository'))

// Create an import
const import_ = repository
  .then(data => {
    return client.createImport({
      'name': 'Import' + id,
      'repository_uuid': data['uuid']
    });
  })
  .then(printRet('Create Import'))
  .then(justData)
  .catch(errExit('Create Import'));

// List imports in repository
Promise.all([repository, import_])
  .then(([data]) => {
    return client.listImportsInRepository(data['uuid']);
  })
  .then(printRet('List Imports in Repository'))
  .catch(errExit('List Imports in Repository'));

// Get the import credentials
const importCredentials = import_
  .then(data => {
    return client.getImportCredentials(data['uuid']);
  })
  .then(printRet('Get Import Credentials'))
  .then(justData)
  .catch(errExit('Get Import Credentials'));

// Use the temporary credentials to upload a file
const importUpload = importCredentials
  .then(data => {
    const credentials = new AWS.Credentials(
      data['credentials']['AccessKeyId'],
      data['credentials']['SecretAccessKey'],
      data['credentials']['SessionToken']
    );
    const s3 = new AWS.S3({
      credentials
    });
    const r = /^s3:\/\/([A-z0-9\-]+)\/([A-z0-9\-]+\/)$/;
    const m = r.exec(data['url'])
    const bucket = m[1];
    const prefix = m[2];

    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filepath);
      fileStream.on('error', reject);

      s3.putObject(
        {
          Body: fileStream,
          Bucket: bucket,
          Key: prefix + awspath
        },
        (err, data) => err ? reject(err) : resolve(data)
      );
    })
  })
  .then(printRet('Upload file'))
  .catch(errExit('Upload file'));

// Use the temporary credentials to list the import prefix
const importContents = Promise.all([importCredentials, importUpload])
  .then(([data]) => {
    const credentials = new AWS.Credentials(
      data['credentials']['AccessKeyId'],
      data['credentials']['SecretAccessKey'],
      data['credentials']['SessionToken']
    );
    const s3 = new AWS.S3({
      credentials
    });
    const r = /^s3:\/\/([A-z0-9\-]+)\/([A-z0-9\-]+\/)$/;
    const m = r.exec(data['url'])
    const bucket = m[1];
    const prefix = m[2];
    return new Promise((resolve, reject) => {
      s3.listObjectsV2(
        {
          Bucket: bucket,
          Prefix: prefix
        },
        (err, data) => err ? reject(err) : resolve(data)
      );
    });

  })
  .then(printRet('List Import Bucket'))
  .catch(errExit('List Import Bucket'));

// Set the import complete
const importComplete = Promise.all([import_, importUpload])
  .then(([data]) => {
    return client.updateImport(data['uuid'], {'complete': true});
  })
  .then(printRet('Set Import Complete'))
  .then(justData)
  .catch(errExit('Set Import Complete'));

// Wait for the import to be processed and have a BFU
const bfu = Promise.all([import_, importComplete])
  .then(([data]) => {
    return new Promise((resolve, reject) => {
      const wait_for_a_bfu = () => {
        client.listBFUsInImport(data['uuid'])
          .then(justData)
          .then(data => {
            if (data.length > 0
                && data[0]['complete'] === true) {
              resolve(data[0]);
            } else {
              setTimeout(wait_for_a_bfu, 30000);
            }
          });
      };
      wait_for_a_bfu();
    });
  })
  .then(printRet('Wait for BFU'))
  .catch(errExit('Wait for BFU'));

// Get an image associated with the BFU
const image = bfu
  .then(data => {
    return client.listImagesInBFU(data['uuid'])
  })
  .then(justData)
  .then(data => data[0])
  .then(printRet('Get Image'))
  .catch(errExit('Get Image'));

// Get the image credentials
const imageCredentials = image
  .then(data => {
    return client.getImageCredentials(data['uuid']);
  })
  .then(printRet('Get Image Credentials'))
  .then(justData)
  .catch(errExit('Get Image Credentials'));

// Get the image dimensions
const imageDimensions = image
  .then(data => {
    return client.getImageDimensions(data['uuid']);
  })
  .then(printRet('Get Image Dimensions'))
  .then(justData)
  .catch(errExit('Get Image Dimensions'));

/*
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
*/
