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
        const file = fs.createWriteStream(destPath, { flags: 'w' });

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
            if (error) {
                if (error.code === 'ENOENT') return resolve();  // File didn't exist
                return reject(error);
            }
            resolve();
        });
    });
};


/**
 * Deletes the specified folder and all files in it.
 * If the folder contains any sub-folders, an exception is raised.
 * 
 * @param {string} folderPath - The path to the folder.
 */
const deleteFolderIfNoSubfolders = (folderPath) => {
    // Exit if the folder doesn't exist
    if (!fs.existsSync(folderPath)) {
        return;
    }

    // Read the contents of the folder
    const contents = fs.readdirSync(folderPath);

    for (const item of contents) {
        const itemPath = path.join(folderPath, item);
        const itemStat = fs.statSync(itemPath);

        // Check if the item is a directory (sub-folder)
        if (itemStat.isDirectory()) {
            throw new Error(`Folder '${folderPath}' contains sub-folders.`);
        }
    }

    // At this point, we've ensured there are no sub-folders. 
    // Now, we can safely delete all files and then the folder itself.
    for (const file of contents) {
        fs.unlinkSync(path.join(folderPath, file));
    }

    fs.rmdirSync(folderPath);
}


const getAssetPathRelativeToAppRoot = (assetFileName) => {
    return path.join('./test/', ASSETS_FOLDER_NAME, assetFileName);
}


const getAssetFullPath = (assetFileName) => {
    return path.join(__dirname, ASSETS_FOLDER_NAME, assetFileName);
}


module.exports = {
   deleteFile_Async,
   deleteFolderIfNoSubfolders,
   getAssetPathRelativeToAppRoot,
   getAssetFullPath,
   createLargeVideoTestAsset_Async : async () => { await downloadFile_Async(LARGE_VIDEO_FILE_DOWNLOAD_URL, LARGE_VIDEO_FILE_DEST_PATH); },
   cleanupLargeVideoTestAsset_Async : async () => { await deleteFile_Async(LARGE_VIDEO_FILE_DEST_PATH); },
   LARGE_VIDEO_FILE_FULLPATH: LARGE_VIDEO_FILE_DEST_PATH,
};
