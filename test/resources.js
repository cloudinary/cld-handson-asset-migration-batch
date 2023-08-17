/**
 * @filedescription This module provides utilities for dynamically creating and cleaning up a local file. 
 * The module facilitates downloading a file from a given URL into a `.resources` directory and subsequently removing it.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS_FOLDER_NAME = '.resources';

const LARGE_VIDEO_FILE_DOWNLOAD_URL = 'https://res.cloudinary.com/cld-sol-demo/video/upload/waterfall-video-107mb.mp4'; // File over 100MB threshold to enforce & test upload_large
const LARGE_VIDEO_FILE_DEST_PATH = path.join(__dirname, ASSETS_FOLDER_NAME, path.basename(LARGE_VIDEO_FILE_DOWNLOAD_URL));

const downloadFile_Async = (url, destPath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath, { flags: 'wx' });

        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download '${url}'. Status Code: ${response.statusCode}`));
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', error => {
            fs.unlink(DEST_PATH, () => reject(error));
        });
    });
};

const deleteFile_Async = (destPath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(destPath, error => {
            if (error) reject(error);
            resolve();
        });
    });
};

module.exports = {
   createLargeVideoTestAsset_Async : async () => { await downloadFile_Async(LARGE_VIDEO_FILE_DOWNLOAD_URL, LARGE_VIDEO_FILE_DEST_PATH); },
   cleanupLargeVideoTestAsset_Async : async () => { await deleteFile_Async(LARGE_VIDEO_FILE_DEST_PATH); }
};
