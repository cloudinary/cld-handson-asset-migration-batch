const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');


const ENV_FILE_PATH = path.resolve(__dirname, '.env');
const RESOURCES_DIR = path.resolve(__dirname, '../.resources');

const cloudinary = require('cloudinary').v2;


async function setupNewSandboxCloud_Async() {
  if (fs.existsSync(ENV_FILE_PATH)) {
    console.log(`${ENV_FILE_PATH} already exists.`);
    console.log(`Skipping sandbox cloud creation...`);
  } else {
    console.log(`Creating sandbox cloud...`);
    await _createSandboxCloud_Async();
  }
  await _testSandboxCloud_Async();
}

async function _createSandboxCloud_Async() {
  return new Promise((resolve, reject) => {
    let req = https.request({
      method: 'POST',
      hostname: 'sub-account-testing.cloudinary.com',
      path: '/create_sub_account',
      port: 443
    }, (res) => {
      let data = '';
      res.on('data', (d) => {
        data += d;
      });

      res.on('end', () => {
        let cloudData = JSON.parse(data);
        let { payload: { cloudApiKey, cloudApiSecret, cloudName, id } } = cloudData;
        let URL = `CLOUDINARY_URL=cloudinary://${cloudApiKey}:${cloudApiSecret}@${cloudName}`;

        fs.writeFileSync(ENV_FILE_PATH, URL); // This is needed for local develoepr tests

        resolve(cloudData);
      });
    });

    req.on('error', (e) => {
      console.error(e);
      reject(e);
    });

    req.end();
  });
}

async function _testSandboxCloud_Async() {
  dotenv.config({ path: ENV_FILE_PATH });

  const cldConfig = cloudinary.config(true);

  try {
    const res = await cloudinary.uploader.upload(path.join(RESOURCES_DIR, 'sample.jpg'), {
      public_id: 'sample'
    });
    console.log(`Sandbox product environment OK: ${cldConfig.cloud_name}`);
  } catch (e) {
    throw 'FATAL - Failed to test sandbox product environment';
  }
}

function teardown() {
  if (fs.existsSync(ENV_FILE_PATH)) { // Remove the .env file
    fs.unlinkSync(ENV_FILE_PATH);
    console.log(`'${ENV_FILE_PATH}' removed.`);
  }
}

module.exports = {
  setupNewSandboxCloud_Async,
  teardown,
  ENV_FILE_PATH,
  RESOURCES_DIR
}