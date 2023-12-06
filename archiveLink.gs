/*init*/
  var serviceAccountEmail = ''; // Replace with the email address of the service account
  var privateKey = "-----BEGIN PRIVATE KEY-----\n
  \n-----END PRIVATE KEY-----\n"; // Replace with the private key content from the JSON key file

//archives any shortcuts that are linked in your drive by creating a copy

function archiveLink() {    //main
  //var top = "1-1WcFyVTzJRo1nEpN2fImsS6Gyo-fnoP"; //top level folder to start recursive search in
  //processFolder(top);
  processFolder(DriveApp.getRootFolder().getId()); // root folder is My Drive
}

function aprogress(id) {  //prints out progression of search, current location 
  var folder = DriveApp.getFolderById(id);
  var folderName = folder.getName();
  Logger.log("Current Position: " + folderName);
}

function processFolder(folderId) {
  aprogress(folderId);
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    aprogress(file.getId())
    var isShortcut = file.getMimeType() === "application/vnd.google-apps.shortcut";
    if (isShortcut) {
      var shortcutId = file.getId();
      Logger.log("Shortcut Detected: " + file.getName());
      var parentFolder = file.getParents().next().getId();
      copyDocumentFromShortcut(shortcutId, parentFolder);
    }
  }
  var subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    var subfolder = subfolders.next();
    processFolder(subfolder.getId());
  }
}

function copyDocumentFromShortcut(shortcutId, parentFolderId) {
  var parentFolder = DriveApp.getFolderById(parentFolderId);
  var resource = {
    name: 'Copied Document',
    parents: [parentFolderId]
  };
  
  var accessToken = getAccessToken(serviceAccountEmail, privateKey);
  var url = 'https://www.googleapis.com/drive/v3/files/' + shortcutId + '?supportsAllDrives=true';
  var headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  };
  
  var options = {
    method: 'GET',
    headers: headers
  };
  
  try {
    var originalDocumentId = DriveApp.getFileById(shortcutId).getTargetId();
    var originalDocument = DriveApp.getFileById(originalDocumentId);
    var originalName = originalDocument.getName();
    var copiedName = "(Archived) " + originalName;
    var copiedDocument = originalDocument.makeCopy(copiedName, parentFolder);
    Logger.log("Copied document: " + copiedDocument.getName());
    deleteShortcut(shortcutId);
  } 
  catch (error) { // Handle the error when the file or shortcut is not found
    Logger.log("File not found. Deleting the shortcut.");
    deleteShortcut(shortcutId);
  }
}


function deleteShortcut(shortcutId) {
  var file = DriveApp.getFileById(shortcutId);
  if (file) {
    try {
      file.setTrashed(true);
      Logger.log("Shortcut deleted: " + shortcutId);
    }
    catch (error) {
      Logger.log("Error deleting shortcut: " + shortcutId);
      Logger.log(error);
    }
  } 
  else {
    Logger.log("File not found for shortcut: " + shortcutId);
  }
}

function getAccessToken(serviceAccountEmail, privateKey) {
  var scope = 'https://www.googleapis.com/auth/drive';
  var service = getService(serviceAccountEmail, privateKey, scope);
  if (service.hasAccess()) {
    return service.getAccessToken();
  } 
  else {
    throw new Error('Unable to obtain access token.');
  }
}

function getService(serviceAccountEmail, privateKey, scope) {
  var service = OAuth2.createService('my-service')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setPrivateKey(privateKey)
    .setIssuer(serviceAccountEmail)
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope(scope);
  return service;
}