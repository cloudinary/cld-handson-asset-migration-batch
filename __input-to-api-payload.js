/**
 * @fileoverview This file contains the logic to "translate" each CSV record from input file
 * into Cloudinary Upload API payload.
 */

/**
 * Converts a CSV record from migration input file to a Cloudinary API payload.
 * 
 * 💡Customize this function to suit your needs as per the Cloudinary Upload API specs:
 * https://cloudinary.com/documentation/image_upload_api_reference#upload
 * 
 * Consider below implementation as a "starter".
 * 
 * Typically you'd customize this module to:
 *  - Define which field from the input CSV record to use for the asset URL
 *  - Define how to pass the input CSV record fields with Cloudinary Upload API as the asset's taxonomy (tags, metadata, DAM folder etc.)
 * 
 * @param {Object} csvRec - CSV record from the migration input file
 * @returns {Object} - parameters for Cloudinary API call
 *  - file: the URL to obtain the asset from
 *  - options: options for the Cloudinary Upload API call
 */
exports.input2ApiPayload = function(csvRec) {
    // Pass value from 'Url' column with the asset URLs or paths
    const file = csvRec['Url'];
    
    // Optional parameters for the Cloudinary API
    const options = {                       
        public_id:       csvRec['Id'],            // Pass value from 'Id' column to be used as public_id
        unique_filename: false,                   // Do not add random suffix to the public_id
        resource_type:   'auto',                  // Let Cloudinary determine the resource type
        overwrite:       false,                   // Do not overwrite the asset with same public_id if it already exists
        type:            'upload',                // Explicitly set delivery type
        tags:            csvRec['Tags'],          // Pass value from 'Tags' column as tags

        context: {
            caption: csvRec['Description'],       // Pass value from 'Description' column as contextual metadata
        },

        metadata: {
            sample_field: csvRec['SampleField'],  // Pass value from 'SampleField' column into the structured metadata field
                                                  // with external_id of 'sample_field'
        },
    };

    return { file, options };
}
