const AWS = require('aws-sdk');
const fs = require('fs');

// Utility function to print results and pass along the data
const printRet = label => data => {
  console.log('=== ' + label + ' ===');
  console.log(data);
  console.log();
  return data;
};

// Utility function to get just the data key from a response
const justData = response => response.data;

// Utility function to print error and exit
const errExit = label => data => {
  console.error('EEE ' + label + ' EEE');
  console.error(data);
  console.error();
  process.exit();
};


const error = e => {
  console.log(e);
};


// Create repository
const makeRepository = (client, id) => {
  return client.createRepository({
    'name': 'Repository_' + id,
    'raw_storage': 'Destroy'
  })
  .then(printRet('Create Repository'))
  .then(justData)
  .catch(errExit('Create Repository'));
};

// Create an import
const makeImport = (client, repo, id) => {
  return repo
    .then(data => {
      return client.createImport({
        'name': 'Import_' + id,
        'repository_uuid': data.uuid
      });
    })
    .then(printRet('Create Import'))
    .then(justData)
    .catch(errExit('Create Import'));
};

// List imports in repository
const listImports = (client, repo, impo) => {
  return Promise.all([repo, impo])
    .then(([data]) => {
      return client.listImportsInRepository(data.uuid);
    })
    .then(printRet('List Imports in Repository'))
    .catch(errExit('List Imports in Repository'));
};

// Get the import credentials
const getTempCredentials = (client, impo) => {
  return impo
    .then(data => {
      return client.getImportCredentials(data.uuid);
    })
    .then(printRet('Get Import Credentials'))
    .then(justData)
    .catch(errExit('Get Import Credentials'));
};

// Use the temporary credentials to upload a file
const uploadFile = (tempCredentials, filepath, awspath) => {
  return tempCredentials
    .then(data => {
      const credentials = new AWS.Credentials(
        data.credentials.AccessKeyId,
        data.credentials.SecretAccessKey,
        data.credentials.SessionToken
      );
      const s3 = new AWS.S3({
        credentials
      });
      const r = /^s3:\/\/([A-z0-9\-]+)\/([A-z0-9\-]+\/)$/;
      const m = r.exec(data.url);
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
      });
    })
    .then(printRet('Upload file'))
    .catch(errExit('Upload file'));
};

// Use the temporary credentials to list the import prefix
const listContent = (tempCredentials, upload) => {
  return Promise.all([tempCredentials, upload])
    .then(([data]) => {
      const credentials = new AWS.Credentials(
        data.credentials.AccessKeyId,
        data.credentials.SecretAccessKey,
        data.credentials.SessionToken
      );
      const s3 = new AWS.S3({
        credentials
      });
      const r = /^s3:\/\/([A-z0-9\-]+)\/([A-z0-9\-]+\/)$/;
      const m = r.exec(data.url);
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
 };

// Set the import complete
const completeImport = (client, impo, uplo) => {
  return Promise.all([impo, uplo])
    .then(([data]) => {
      return client.updateImport(data.uuid, {'complete': true});
    })
    .then(printRet('Set Import Complete'))
    .then(justData)
    .catch(errExit('Set Import Complete'));
};

// Wait for the import to be processed and have a BFU
const getBfu = (client, impo, complete) => {
  return Promise.all([impo, complete])
    .then(([data]) => {
      return new Promise((resolve, reject) => {
        const wait_for_a_bfu = () => {
          client.listBFUsInImport(data.uuid)
            .then(data => {
              if (data.length > 0 && data[0].complete === true) {
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
};

// Get an image associated with the BFU
const getImage = (client, bfu) => {
  return bfu
    .then(data => {
      return client.listImagesInBFU(data.uuid);
    })
    .then(justData)
    .then(data => data[0])
    .then(printRet('Get Image'))
    .catch(errExit('Get Image'));
};

// Get the image credentials
const getImageCredentials = (client, image) => {
  return image
    .then(data => {
      return client.getImageCredentials(data.uuid);
    })
    .then(printRet('Get Image Credentials'))
    .then(justData)
    .catch(errExit('Get Image Credentials'));
};

const getImageDimensions = (client, image) => {
  return image
    .then(data => {
      return client.getImageDimensions(data.uuid);
    })
    .then(printRet('Get Image Dimensions'))
    .then(justData)
    .catch(errExit('Get Image Dimensions'));
};

module.exports = {
  printRet,
  justData,
  errExit,
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
};
