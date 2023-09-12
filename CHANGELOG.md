# CHANGELOG

[2.0.0] / 2023-08-28
====================

### Added
- Introduced unit tests (with Jest as a dev dependency)
- Implemented end-to-end tests
- Support for uploading local files larger than 100MB (using `upload_large` from Cloudinary SDK)

### Changed
- Renamed the tool to `cld-bulk`
- Introduced concept of sub-commands by using `commander` for parsing CLI arguments
- Extracted the async CSV input processing loop to a re-usable module


[1.0.0] / 2023-08-04
====================

### Added
- Initial release with limited migration flow support (local files only under 100MB supported)

