function fromCsvRecord(csvRecObj) {
    const file = csvRecObj.Url;
    const options = {
        public_id: csvRecObj.Id,
        unique_filename: false,
        resource_type: 'auto',
        type: 'upload',
        tags: csvRecObj.Tags,
        context: {
            caption: csvRecObj.Description,
        }
    };
    return { file, options };
}

module.exports = {
    fromCsvRecord
};