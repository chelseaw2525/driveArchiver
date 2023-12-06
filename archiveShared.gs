/*init*/
  var serviceAccountEmail = 'mysteriouspresence@liquid-receiver-386602.iam.gserviceaccount.com'; // Replace with the email address of the service account
  var privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDG/NChnD8YnozH\njOJTei3zae4AD04oZwEJ9iFNQViX2XKl9tgcRzWML5DxsLFxmKX+DDZa/OVuBBUB\n5u8nFmdKkz6jjsw7tLuycwPKyOtYthCdPevYN9/2E13+lD/dGvbXv0usDDpiV+15\nVw8as1oBu1LOGPbXSHBa2vABMH+YgQhEIoCN2GnSEzLctr7rGiFcnLiJ77KgKKCf\nB3YvOm/DRWEUy7vMl9OQqv7/cMDA39r4x6fgJYKiBs9CKCBULjAa/9AAGRum6eIl\nyszqKdXo2QATB4iKCYUIB4W/i9W9JyFk9UbafebOJRhbb/ppafFhLSoA/43aElQP\nOybLw1Z5AgMBAAECggEAD3IKQ7EcGK4d4VNnMfGW5YEAb1LAz1QHeZ14QkXjOY4w\nXv+FENTaLDJ4/rmnXFjr8YdDJNbifCKm+snRIGiVxe0d/JYV9kB2HUjeL3xfADjJ\nm1r2Fodnw/MG5b7eIix4opB/sDAWzBFlJnkCfCEVyHKg38yCRH2j8vlxjbYVAWJH\ncCTYshO2yrohdwGTqJrvqFSSTFRuFxa+WMwiTHo0gEerlb4DDhn+wcFwjV1tlr9C\nTpwuurHh3iaUh/yBlfsctpXtpgIuONtnLE8G+DefeSuYvcZAHsRAujs9PycY5SXz\nzkZFnGBK3RgdMU9FKvixm7YO2GhQVjeb4BUGQZgn3QKBgQD3wAR7J4mGdU8KCJBg\nMHV/Oem9y8tI4rj2hUwBzC99UAMfdxvBl1xPp+p41yJ8JynUoZDjogMb5Nm8qfa+\nEN4PcAyyizNRKJUyr+uZaBehVQPCA3cEWtzG63DQbcZHiKAmupauyfMam4py8tFw\nS59faXv2Bex3c2VTPI/ssdYxowKBgQDNnR05VpYai8XpQxztCYWR6u2gQ7d9cOa1\nv6CgfZay6p6bueOrsjxT3KoQW6M3wke2B5N/TfStsdSeURUsZDCj1AhKMrrNaQ/9\nurSc3/8yxrUW8KpwTifi+Z1tfKF4c+SveDE1C0NTMs53PWru2oO8EZNiDfAs3o0X\nyVBGGP/xMwKBgQCA6JRsUCIqqBc8LUCSDCTW0hdg/g0EG5QKEUl/FfMPzPYTBTKY\nBF2vxLsnrSjwWKBXVsnA56eed/EjTXxpYPVqKu8wZ2WIMQmQmiCIbbT96PJPnOXs\niiqeBhtpF/U3e0t5W1TUFZg8m/np3ZZES9TdHFG3rVVgwdZS/QwWKGI+6QKBgQCe\n4461xGdyVBi4TRiJRBZn0DeY5TtiQGDIijDCVMqjsBKpHFkHUVC1LYxt36KdcBCi\nZfBhLAisQQOg49+M0k+UCkHttI4ONeYZmLIBmEdJIazG8WuEJaFFEMfK18ifoE9U\nGXlNGEsKe/R4yIld0paCOsK9vy+ePMyjWPojcSY3aQKBgQCHIMLEUEo9JUnfK/Q5\ncWtV1akQL6vw6E/CVCEkNvVVBfKNdtVHpDz2GfmgRuvoXwApHDQMc9A6bY3MNNH7\nJEb1nUfrYB0AjhfALgUdO6UuVGG4y7msrmdJk0aXtaBUaNDvYxhRVBdKnZxG+drd\nhNCm8ovBITMAJn7Lz1X6ovxPNQ==\n-----END PRIVATE KEY-----\n"; // Replace with the private key content from the JSON key file

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
