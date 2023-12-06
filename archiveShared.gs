/*init*/
  var serviceAccountEmail = ''; // Replace with the email address of the service account
  var privateKey = "-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----\n"; // Replace with the private key content from the JSON key file

//makes and saves a copy of any files that are shared with you

function archiveShared() {    //main
  var sharedWithMeFiles = getSharedWithMeFiles();
  Logger.log("Shared files ready for copying--------------------------------------------------------------------------------------------------------------" + sharedWithMeFiles.length);
  var archiveFolder = createArchiveFolder();
  Logger.log("Archive folder created");
  processFiles(sharedWithMeFiles, archiveFolder);
} 

function getSharedWithMeFiles() {
  var files = DriveApp.getFiles();
  var sharedWithMeFiles = [];
  Logger.log("Begin adding shared files");
  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    var owner = file.getOwner();
    if (!owner || !owner.getEmail()) {
      continue; // Skip files owned by organizations with no specific email
    }
    if (!(file.getOwner().getEmail().toLowerCase() === Session.getActiveUser().getEmail().toLowerCase())) {
      Logger.log("Adding file: " + name);
      sharedWithMeFiles.push(file);
    }
  }
  return sharedWithMeFiles;
}

function createArchiveFolder() {
  var rootFolder = DriveApp.getRootFolder();
  var archiveFolder;
  var folders = rootFolder.getFoldersByName("Archived Shared Files");
  if (folders.hasNext()) {
    archiveFolder = folders.next();
  } 
  else {
    archiveFolder = rootFolder.createFolder("Archived Shared Files");
  }
  return archiveFolder;
}

function processFiles(files, archiveFolder) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    Logger.log("Copying file: " + file.getName());
    copyFile(file.getId(), archiveFolder.getId());
  }
}

function copyFile(fileId, parentFolderId) {
  var file = DriveApp.getFileById(fileId);
  var parentFolder = DriveApp.getFolderById(parentFolderId);
  var copiedName = "(Archived) " + file.getName();
  file.makeCopy(copiedName, parentFolder);
  Logger.log("Saved File: " + copiedName);
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
