let logs = [];
let uploadType = '';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Directus')
    .addItem('Open Directus Upload Dialog', 'showLoginDialog')
    .addToUi();
}

function showLoginDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('login')
      .setWidth(400)
      .setHeight(400); // Adjust height to avoid scroll
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Directus Interface'); // Change the title here
}

function uploadShareableAssets(email, password) {
  const DIRECTUS_URL = 'http://directus.crio.do';
  logs = [];  // Reset logs for this session

  function log(message) {
    logs.push(message);
    Logger.log(message);
  }

  log("Starting upload process...");
  
  const token = authenticate(DIRECTUS_URL, email, password, log);
  if (!token) {
    log("Authentication failed");
    return logs;
  }
  
  log("Authenticated successfully. Token: " + token);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('shareable_assets');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) { // Assuming the first row is headers
    const row = data[i];
    log(`Checking row ${i + 1}: ${JSON.stringify(row)}`);
    
    if (row[0] === "" && row[1] === "" && row[2] === "") { // Skip completely empty rows
      log(`Skipping completely empty row ${i + 1}`);
      continue;
    }
    
    if (row[12] && row[12].toLowerCase() === "done") { // Skip rows marked as done in Col M (index 12)
      log(`Row ${i + 1} is already marked as done. Skipping.`);
      continue;
    }

    const assetImageUrl = row[0];
    const assetMessage = row[1];
    let programNameCell = row[2];
    const transitionTypes = [];
    for (let j = 3; j <= 10; j++) { // Col D to Col K are the checkboxes (index 3 to 10)
      if (row[j] === true) {
        transitionTypes.push(sheet.getRange(1, j + 1).getValue());
      }
    }

    log(`Processing row ${i + 1}`);
    log(`Asset Image: ${assetImageUrl}`);
    log(`Asset Message: ${assetMessage}`);
    log(`Program Name: ${programNameCell}`);
    log(`Transition Types: ${transitionTypes}`);

    // Handle program_name condition
    if (programNameCell.toLowerCase() === "all") {
      programNameCell = ["Fellowship Program in Software Development", "Fellowship Program in QA Automation", "Fellowship Program in System Design"];
    } else {
      programNameCell = [programNameCell];
    }

    // Upload image to Directus
    const imageId = uploadImageFromDrive(DIRECTUS_URL, token, assetImageUrl, programNameCell.join(','), log);
    if (!imageId) {
      log(`Failed to upload image for row ${i + 1}`);
      continue;
    }

    const payload = {
      "asset_image": imageId,
      "asset_message": assetMessage,
      "program_name": programNameCell, // Send as JSON array
      "transition_type": transitionTypes, // Send as a JSON array
      "status": "published"
    };

    log(`Payload for Directus: ${JSON.stringify(payload)}`);

    const directusResponse = uploadToDirectus(DIRECTUS_URL, token, 'shareable_assets', payload, log);

    if (directusResponse) {
      log(`Shareable asset uploaded. DirectUs ID: ${directusResponse.id}`);
      sheet.getRange(i + 1, 12).setValue(directusResponse.id); // Update DirectUs Id in column L (index 12)
      sheet.getRange(i + 1, 13).setValue("Done"); // Update Status in column M to "Done" (index 13)
    } else {
      log(`Failed to upload shareable asset for row ${i + 1}`);
    }
  }

  log("Upload process completed.");
  return logs;
}

function uploadSuccessStories(email, password) {
  const DIRECTUS_URL = 'http://directus.crio.do';
  logs = [];  // Reset logs for this session

  function log(message) {
    logs.push(message);
    Logger.log(message);
  }

  log("Starting upload process...");
  
  const token = authenticate(DIRECTUS_URL, email, password, log);
  if (!token) {
    log("Authentication failed");
    return logs;
  }
  
  log("Authenticated successfully. Token: " + token);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('success_stories');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) { // Assuming the first row is headers
    const row = data[i];
    log(`Checking row ${i + 1}: ${JSON.stringify(row)}`);
    
    if (row[0] === "" && row[1] === "" && row[2] === "" && row[3] === "") { // Skip completely empty rows
      log(`Skipping completely empty row ${i + 1}`);
      continue;
    }
    
    if (row[5] && row[5].toLowerCase() === "done") { // Skip rows marked as done in Col F (index 5)
      log(`Row ${i + 1} is already marked as done. Skipping.`);
      continue;
    }

    const learnerImage = row[0];
    const programDetail = row[1];
    const date = row[2];
    const companyName = row[3];
    const directusId = row[4];
    const status = row[5];

    log(`Processing row ${i + 1}`);
    log(`Learner Image: ${learnerImage}`);
    log(`Program Detail: ${programDetail}`);
    log(`Date: ${date}`);
    log(`Company Name: ${companyName}`);
    log(`DirectUs Id: ${directusId}`);
    log(`Status: ${status}`);

    const imageUrl = uploadImageFromDrive(DIRECTUS_URL, token, learnerImage, "learner_image", log);

    if (!imageUrl) {
      log(`Failed to upload image for row ${i + 1}`);
      continue;
    }

    log(`Image uploaded. URL: ${imageUrl}`);

    const successStory = {
      status: "published",
      learner_image: imageUrl,
      program_detail: programDetail,
      date: date, // Add the new date field
      company_name: companyName
    };
    
    const directusResponse = uploadToDirectus(DIRECTUS_URL, token, 'success_stories', successStory, log);
    
    if (directusResponse) {
      log(`Success story uploaded. DirectUs ID: ${directusResponse.id}`);
      sheet.getRange(i + 1, 5).setValue(directusResponse.id); // Update DirectUs Id in column E
      sheet.getRange(i + 1, 6).setValue("Done"); // Update Status in column F to "Done"
    } else {
      log(`Failed to upload success story for row ${i + 1}`);
    }
  }

  log("Upload process completed.");
  return logs;
}

function authenticate(url, email, password, log) {
  const response = UrlFetchApp.fetch(`${url}/auth/login`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      email: email,
      password: password
    })
  });
  
  if (response.getResponseCode() === 200) {
    const data = JSON.parse(response.getContentText());
    return data.data.access_token;
  } else {
    log(`Failed to authenticate. Status code: ${response.getResponseCode()}`);
    log(response.getContentText());
    return null;
  }
}

function extractFileIdFromUrl(url) {
  var match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

function uploadImageFromDrive(directusUrl, token, imageUrl, name, log) {
  try {
    var fileId = extractFileIdFromUrl(imageUrl);
    if (!fileId) {
      throw new Error('Invalid Google Drive URL');
    }
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var originalFileName = file.getName();
    var newFileName = name + "_" + originalFileName;

    var boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    var folderId = '1fb05214-5dff-467b-8500-1e5150ba8973'; // Specify the folder ID here
    
    var payload = Utilities.newBlob(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${newFileName}"\r\n` +
      `Content-Type: ${blob.getContentType()}\r\n\r\n`
    ).getBytes().concat(blob.getBytes()).concat(
      Utilities.newBlob(
        `\r\n--${boundary}\r\n` +
        `Content-Disposition: form-data; name="folder"\r\n\r\n${folderId}\r\n` +
        `--${boundary}--`
      ).getBytes()
    );

    var options = {
      method: 'post',
      contentType: `multipart/form-data; boundary=${boundary}`,
      payload: payload,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      muteHttpExceptions: true
    };

    var uploadResponse = UrlFetchApp.fetch(`${directusUrl}/files`, options);
    if (uploadResponse.getResponseCode() === 200) {
      var responseJson = JSON.parse(uploadResponse.getContentText());
      return responseJson.data.id; // Adjust this according to the actual response structure
    } else {
      log(`Failed to upload image. Status code: ${uploadResponse.getResponseCode()}`);
      log(uploadResponse.getContentText());
      return null;
    }
  } catch (e) {
    log('Error uploading image from Drive: ' + e.message);
    return null;
  }
}

function uploadToDirectus(url, token, collection, item, log) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(item),
    headers: {
      'Authorization': `Bearer ${token}`
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(`${url}/items/${collection}`, options);
  
  if (response.getResponseCode() === 200) {
    const data = JSON.parse(response.getContentText());
    return data.data;
  } else {
    log(`Failed to upload to collection ${collection}. Status code: ${response.getResponseCode()}`);
    log(response.getContentText());
    return null;
  }
}

function getLogs() {
  return logs;
}
