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
    // Where to load the asset from 
    // Any source supported by Cloudinary Upload API: https://cloudinary.com/documentation/upload_parameters#required_file_parameter
    const file = csvRec['File_Path_or_URL_ColumnName'];
    
    // Optional parameters for the Cloudinary API
    const options = {                       
        public_id:       csvRec['Asset_Public_Id_ColumnName'],     // Pass value to be used as public_id (addressed by column name from the input CSV file)
        unique_filename: false,                                    // Do not add random suffix to the public_id
        resource_type:   'auto',                                   // Let Cloudinary determine the resource type
        overwrite:       false,                                    // Do not overwrite the asset with same public_id if it already exists
        type:            'upload',                                 // Explicitly set delivery type
        tags:            csvRec['Asset_Tags_ColumnName'],          // Pass value to be set as tags on the uploaded asset (addressed by column name from the input CSV file)


        // Example: Assigning contextual metadata
        // See specs at https://cloudinary.com/documentation/contextual_metadata
        context: {
            caption: csvRec['Asset_Description_ColumnName'],       // Pass value to be set as caption field in contextual metadata (addressed by column name from the input CSV file)
        },

        
        // Example: Assigning structured metadata
        // See specs at https://cloudinary.com/documentation/structured_metadata
        metadata: {
            sample_field: csvRec['SampleField_Value_ColumnName'],  // Pass value to the structured metadata field with external_id of 'sample_field' (addressed by column name from the input CSV file)
        },
    };

    return { file, options };
}
