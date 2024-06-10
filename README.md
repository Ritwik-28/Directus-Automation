<h1 align="center">Directus Interface for Google Sheets</h1>

<p align="justified">This project provides an interface within Google Sheets to upload data to a Directus instance. It includes functionality for uploading both "Shareable Assets" and "Success Stories". The interface is built using Google Apps Script and an HTML file for the user interface.</p>

## Features

- **Single Menu Item**: Opens a dialog for Directus login and subsequent data upload.
- **Data Upload**: Uploads data from Google Sheets to Directus, handling both "Shareable Assets" and "Success Stories".
- **Image Upload**: Uploads images from Google Drive to Directus.
- **Logs**: Displays logs of the upload process within the dialog.

## Prerequisites

- A Directus instance.
- A Google Sheet with the appropriate data structure.
- Images stored in Google Drive.

## Google Sheet Structure

### Sheet: `shareable_assets`

- **Column A**: Link to the image in Google Drive.
- **Column B**: Asset message.
- **Column C**: Program name (can be "Both" to indicate multiple programs).
- **Columns D-K**: Checkboxes indicating transition types.
- **Column L**: Directus ID (to be updated after upload).
- **Column M**: Status (to be marked as "Done" after successful upload).

### Sheet: `success_stories`

- **Column A**: Link to the learner image in Google Drive.
- **Column B**: Program detail.
- **Column C**: Date.
- **Column D**: Company name.
- **Column E**: Directus ID (to be updated after upload).
- **Column F**: Status (to be marked as "Done" after successful upload).

## Setup

1. Open your Google Sheet.
2. Go to `Extensions` > `Apps Script`.

### Apps Script

1. Create a new script file and add the provided code.

### HTML File

2. Create a new HTML file and name it `login.html`, then add the provided code.

## Usage

1. Open your Google Sheet.
2. Go to `Extensions` > `Directus` > `Open Directus Upload Dialog`.
3. In the dialog that appears, enter your Directus email and password.
4. Select either "Shareable Assets" or "Success Stories" to start the upload process.
5. The logs will be displayed in the dialog to show the progress and any errors encountered.

## Notes

- Ensure that your Directus instance URL and Google Sheet structure match the setup described above.
- Update the folder ID in the script where images are to be uploaded in Directus.
- This setup assumes you have appropriate permissions set up in Directus for the API operations.
- To check for the directus schema use: [schema_collection_details.py](schema_collection_details.py)

## Troubleshooting

- If authentication fails, check your Directus credentials and URL.
- Ensure that the Google Sheet has the correct structure and data.
- Verify that the images in Google Drive are accessible and the URLs are correct.
- Check the logs displayed in the dialog for specific error messages and troubleshoot accordingly.
