/*init*/

  var serviceAccountEmail = ''; // Replace with the email address of the service account
  var privateKey = "-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----\n"; // Replace with the private key content from the JSON key file


//gets rid of loose-leaf files by moving them into appropriate misc folder

function moveFilesToFolder() {
  var rootFolder = DriveApp.getRootFolder();
  var destinationFolder = getOrCreateFolder("Miscellaneous Files");
  var files = rootFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    mprogress(file.getId());
    destinationFolder.addFile(file);
    rootFolder.removeFile(file);
  }
}

function mprogress(id) {  //prints out progression of search, current location 
  var folder = DriveApp.getFolderById(id);
  var folderName = folder.getName();
  Logger.log("Now moving: " + folderName);
}

function getOrCreateFolder(folderName) {
  var rootFolder = DriveApp.getRootFolder();
  var folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } 
  else {
    return rootFolder.createFolder(folderName);
  }
}

function getAccessToken(serviceAccountEmail, privateKey) {
  var scope = 'https://www.googleapis.com/auth/drive';
  var service = getService(serviceAccountEmail, privateKey, scope);
  if (service.hasAccess()) {
    return service.getAccessToken();
  } else {
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