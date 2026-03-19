import { storage } from "../firebase";
import { ref, listAll, getDownloadURL, deleteObject, uploadBytes, getMetadata } from "firebase/storage";
import JSZip from "jszip";
import { saveAs } from "file-saver";


export const moveStorageItem = async (oldPath, newPath) => {
  const oldRef = ref(storage, oldPath);
  const newRef = ref(storage, newPath);

  // 1. Get the file data
  const url = await getDownloadURL(oldRef);
  const response = await fetch(url);
  const blob = await response.blob();

  // 2. Upload to new location
  await uploadBytes(newRef, blob);

  // 3. Delete old location
  await deleteObject(oldRef);
};

// Helper to format bytes to human-readable string
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const uploadFile = async (file, path = "") => {
  const storageRef = ref(storage, path ? `${path}/${file.name}` : file.name);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { name: file.name, url, fullPath: snapshot.ref.fullPath };
};

export const getFolderContents = async (path = "") => {
  const listRef = ref(storage, path);
  const res = await listAll(listRef);
  
  const folders = res.prefixes.map(p => ({ 
    id: p.fullPath, 
    name: p.name, 
    type: 'folder' 
  }));

  const files = await Promise.all(res.items.map(async (i) => {
    const url = await getDownloadURL(i);
    const metadata = await getMetadata(i); // Fetching size from Firebase
    return { 
      id: i.fullPath, 
      name: i.name, 
      type: 'file', 
      url, 
      size: formatBytes(metadata.size),
      updated: metadata.updated
    };
  }));

  return [...folders, ...files];
};

export const deleteFolderRecursive = async (folderPath) => {
  const folderRef = ref(storage, folderPath);
  const res = await listAll(folderRef);
  const fileDeletions = res.items.map((item) => deleteObject(item));
  const folderDeletions = res.prefixes.map((prefix) => deleteFolderRecursive(prefix.fullPath));
  await Promise.all([...fileDeletions, ...folderDeletions]);
};

export const deleteFileFromStorage = async (fullPath) => {
  const fileRef = ref(storage, fullPath);
  await deleteObject(fileRef);
};

export const downloadFolderAsZip = async (folderPath, folderName = "Vault_Download") => {
  const zip = new JSZip();
  const folderRef = ref(storage, folderPath);
  const fetchFiles = async (currentRef, currentZip) => {
    const res = await listAll(currentRef);
    for (const item of res.items) {
      if (item.name === ".placeholder") continue;
      const url = await getDownloadURL(item);
      const response = await fetch(url);
      const blob = await response.blob();
      currentZip.file(item.name, blob);
    }
    for (const prefix of res.prefixes) {
      const newFolder = currentZip.folder(prefix.name);
      await fetchFiles(prefix, newFolder);
    }
  };
  await fetchFiles(folderRef, zip);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${folderName}.zip`);
};

// Add this to your storage.js
export const scanStorageRecursively = async (path = "") => {
  const listRef = ref(storage, path);
  const res = await listAll(listRef);
  
  let allFiles = [];
  
  // 1. Get files in current folder
  const files = await Promise.all(res.items.map(async (i) => {
    const url = await getDownloadURL(i);
    const metadata = await getMetadata(i);
    return {
      name: i.name,
      type: 'file',
      storagePath: i.fullPath,
      downloadUrl: url,
      size: formatBytes(metadata.size),
      parentPath: path
    };
  }));
  allFiles = [...allFiles, ...files];

  // 2. Recurse into folders
  for (const prefix of res.prefixes) {
    const subFiles = await scanStorageRecursively(prefix.fullPath);
    allFiles = [...allFiles, { 
      name: prefix.name, 
      type: 'folder', 
      storagePath: prefix.fullPath, 
      parentPath: path 
    }, ...subFiles];
  }

  return allFiles;
};