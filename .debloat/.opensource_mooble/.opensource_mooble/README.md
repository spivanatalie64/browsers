# .opensource_mooble

This directory contains auxiliary files for the Mooble project, including a small optional Firefox WebExtension used for onboarding a local Mooble server.

## Firefox extension (optional)

A minimal WebExtension is provided in .opensource_mooble/firefox-extension. It offers an alternative onboarding flow that integrates with a locally-running Mooble server on 127.0.0.1:5000.

To load the extension temporarily in Firefox for testing:

1. Open about:debugging -> This Firefox -> Load Temporary Add-on
2. Select the file .opensource_mooble/firefox-extension/manifest.json

If you prefer to run it with web-ext (developer helper):

    web-ext run --source-dir .opensource_mooble/firefox-extension

To package the extension for distribution or permanent install, see Mozilla's documentation on packaging and signing WebExtensions: https://extensionworkshop.com/documentation/publish/package/ (Firefox requires signing for release installs).
