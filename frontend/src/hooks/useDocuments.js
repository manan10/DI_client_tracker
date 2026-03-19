import { useState, useCallback, useMemo } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useApi } from "./useApi";
import { deleteFileFromStorage, deleteFolderRecursive, scanStorageRecursively } from "../firebase/storage";

export const useDocuments = (currentPath) => {
  const [items, setItems] = useState([]);
  const [allFolders, setAllFolders] = useState([]); 
  const [activities, setActivities] = useState([]);
  const [totalSizeMB, setTotalSizeMB] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadQueue, setUploadQueue] = useState({ current: 0, total: 0 });
  const [activeUploadName, setActiveUploadName] = useState("");
  const [loadingStates, setLoadingStates] = useState({});

  const { request } = useApi();
  const storagePath = currentPath.join("/");

  const setLocalLoading = (id, state) => {
    setLoadingStates(prev => ({ ...prev, [id]: state }));
  };

  const fetchFilesAndActivity = useCallback(async (searchQuery = "") => {
    try {
      const queryParam = searchQuery 
        ? `search=${encodeURIComponent(searchQuery)}` 
        : `parentPath=${encodeURIComponent(storagePath)}`;

      const [fileData, activityData, allItems] = await Promise.all([
        request(`/vault/items?${queryParam}`, 'GET'),
        request('/vault/activity', 'GET'),
        request('/vault/items?all=true', 'GET')
      ]);

      const totalBytes = (allItems || []).reduce((acc, curr) => {
        if (curr.type === 'file' && curr.size) {
          const numeric = parseFloat(curr.size);
          const unit = curr.size.split(' ')[1];
          if (unit === 'KB') return acc + (numeric * 1024);
          if (unit === 'MB') return acc + (numeric * 1024 * 1024);
          if (unit === 'GB') return acc + (numeric * 1024 * 1024 * 1024);
          return acc + numeric;
        }
        return acc;
      }, 0);

      setTotalSizeMB(totalBytes / (1024 * 1024));

      // --- PRETTIFY FOLDER NAMES ---
      const processedItems = (fileData || []).map(item => {
        let displayName = item.name;
        // If it's a folder and looks like "NAME_ID" (24 char hex ID at end)
        if (item.type === 'folder' && /_[a-f\d]{24}$/i.test(item.name)) {
            displayName = item.name.replace(/_[a-f\d]{24}$/i, '').replace(/_/g, ' ');
        }
        return { ...item, id: item.storagePath, displayName };
      });

      setItems(processedItems);
      setActivities(activityData || []);
    } catch (error) { console.error("Fetch error:", error); }
  }, [storagePath, request]);

  const fetchAllFolders = useCallback(async () => {
    try {
      const data = await request('/vault/folders/all', 'GET');
      setAllFolders(data || []);
    } catch (error) {
      console.error("Failed to fetch folder tree", error);
    }
  }, [request]);

  const folderTree = useMemo(() => {
    const root = { name: "Main Folder (Root)", storagePath: "", children: [] };
    const map = { "": root };
    
    allFolders.forEach(f => {
      // Prettify name in tree view too
      let treeName = f.name;
      if (/_[a-f\d]{24}$/i.test(f.name)) {
        treeName = f.name.replace(/_[a-f\d]{24}$/i, '').replace(/_/g, ' ');
      }
      map[f.storagePath] = { ...f, name: treeName, children: [] };
    });

    allFolders.forEach(f => {
      const parent = f.parentPath || "";
      if (map[parent]) {
        map[parent].children.push(map[f.storagePath]);
      }
    });

    return root;
  }, [allFolders]);

  const handleDownload = async (item) => {
    if (!item) return;
    setLocalLoading(item.id, true);
    try {
      const response = await fetch(item.downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(item.downloadUrl, '_blank');
    } finally {
      setLocalLoading(item.id, false);
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      const blob = new Blob([""], { type: "text/plain" });
      const file = new File([blob], ".placeholder");
      const path = storagePath ? `${storagePath}/${folderName}` : folderName;
      await uploadBytesResumable(ref(storage, `${path}/.placeholder`), file);
      await request('/vault/sync', 'POST', { name: folderName, type: 'folder', storagePath: path, parentPath: storagePath });
      await fetchFilesAndActivity();
      return true;
    } catch { return false; }
  };

  const handleRename = async (item, newName) => {
    setLocalLoading(item.id, true);
    try {
      await request('/vault/rename', 'PATCH', { storagePath: item.storagePath, newName });
      await fetchFilesAndActivity();
    } finally { setLocalLoading(item.id, false); }
  };

  const handleMove = async (itemsToMove, targetPath) => {
    itemsToMove.forEach(i => setLocalLoading(i.id, true));
    try {
      await request('/vault/move', 'POST', { itemPaths: itemsToMove.map(i => i.storagePath), targetPath });
      await fetchFilesAndActivity();
    } finally {
      itemsToMove.forEach(i => setLocalLoading(i.id, false));
    }
  };

  const handleDeleteItem = async (item) => {
    setLocalLoading(item.id, true);
    try {
      if (item.type === 'folder') await deleteFolderRecursive(item.storagePath);
      else await deleteFileFromStorage(item.storagePath);
      await request(`/vault/item?storagePath=${item.storagePath}`, 'DELETE');
      await fetchFilesAndActivity();
    } finally { setLocalLoading(item.id, false); }
  };

  const startBatchUpload = async (files) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadQueue({ current: i + 1, total: files.length });
      setActiveUploadName(file.name);
      const targetPath = storagePath ? `${storagePath}/${file.name}` : file.name;
      const uploadTask = uploadBytesResumable(ref(storage, targetPath), file);
      await new Promise((resolve) => {
        uploadTask.on('state_changed', 
          (s) => setUploadProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
          null,
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await request('/vault/sync', 'POST', { 
              name: file.name, 
              type: 'file', 
              storagePath: targetPath, 
              downloadUrl: url, 
              size: (file.size / 1024).toFixed(1) + " KB", 
              parentPath: storagePath 
            });
            resolve();
          }
        );
      });
    }
    setUploading(false);
    await fetchFilesAndActivity();
  };

  const handleReSync = async () => {
    if (!window.confirm("Scan storage and fix list?")) return;
    try {
      const allCloudItems = await scanStorageRecursively("");
      for (const item of allCloudItems) await request('/vault/sync', 'POST', item);
      await fetchFilesAndActivity();
    } catch { alert("Refresh failed."); }
  };

  return {
    items, activities, totalSizeMB, uploading, uploadProgress, uploadQueue, activeUploadName, loadingStates,
    fetchFilesAndActivity, fetchAllFolders, folderTree, handleCreateFolder, handleRename, handleMove, 
    handleDeleteItem, startBatchUpload, handleReSync, handleDownload
  };
};