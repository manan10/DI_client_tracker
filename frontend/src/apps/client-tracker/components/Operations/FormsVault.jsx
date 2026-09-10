import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../../shared/hooks/useApi"; // Corrected Shared Import Signature

import VaultHeader from "./FormsVault/VaultHeader";
import FolderShelf from "./FormsVault/FolderShelf";
import DocumentLedger from "./FormsVault/DocumentLedger";
import AddDocumentModal from "./FormsVault/AddDocumentModal";
import AddFolderModal from "./FormsVault/AddFolderModal";

const FormsVault = () => {
  const { request, loading } = useApi();

  const [activeSection, setActiveSection] = useState("AMC");
  const [folders, setFolders] = useState([]);
  const [formsList, setFormsList] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modals & Form States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editingFormId, setEditingFormId] = useState(null);

  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [formState, setFormState] = useState({
    section: "AMC",
    folderId: "",
    title: "",
    code: "",
    officialUrl: "",
    fallbackUrl: "",
    tags: "",
    description: "",
  });

  // 1. Fetch Folders and Forms
  const loadVaultData = useCallback(async () => {
    try {
      const [foldersRes, formsRes] = await Promise.all([
        request("/forms-vault/folders", "GET"),
        request("/forms-vault/forms", "GET"),
      ]);

      if (foldersRes?.success) {
        const fetchedFolders = (foldersRes.data || []).map((f) => ({
          ...f,
          id: f._id || f.id,
        }));
        setFolders(fetchedFolders);

        if (!selectedFolderId && fetchedFolders.length > 0) {
          const firstInSec = fetchedFolders.find((f) => f.section === activeSection);
          if (firstInSec) {
            setSelectedFolderId(firstInSec.id);
          }
        }
      }

      if (formsRes?.success) {
        const fetchedForms = (formsRes.data || []).map((doc) => ({
          ...doc,
          id: doc._id || doc.id,
          folderId:
            typeof doc.folderId === "object" && doc.folderId !== null
              ? doc.folderId._id
              : doc.folderId,
          updatedAt: new Date(doc.updatedAt || doc.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          }),
        }));
        setFormsList(fetchedForms);
      }
    } catch (err) {
      console.error("Failed to load FormsVault data:", err);
      toast.error("Failed to load Forms Vault from server");
    } finally {
      setIsInitialLoading(false);
    }
  }, [request, activeSection, selectedFolderId]);

  useEffect(() => {
    loadVaultData();
  }, []);

  // 2. Derived Views
  const sectionFolders = useMemo(() => {
    return folders.filter((f) => f.section === activeSection);
  }, [folders, activeSection]);

  const activeFolder = useMemo(() => {
    const found = sectionFolders.find((f) => String(f.id) === String(selectedFolderId));
    if (found) return found;
    return sectionFolders[0] || null;
  }, [sectionFolders, selectedFolderId]);

  const currentFolderForms = useMemo(() => {
    if (!activeFolder) return [];
    return formsList.filter((form) => {
      const matchFolder = String(form.folderId) === String(activeFolder.id);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        form.title?.toLowerCase().includes(q) ||
        form.code?.toLowerCase().includes(q) ||
        (form.tags && form.tags.some((t) => t.toLowerCase().includes(q)));

      return matchFolder && matchSearch;
    });
  }, [formsList, activeFolder, searchQuery]);

  // 3. Folder Handlers
  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const res = await request("/forms-vault/folders", "POST", {
        name: newFolderName.trim(),
        section: activeSection,
      });

      if (res?.success && res.data) {
        const created = { ...res.data, id: res.data._id || res.data.id };
        setFolders((prev) => [...prev, created]);
        setSelectedFolderId(created.id);
        setNewFolderName("");
        setIsAddFolderModalOpen(false);
        toast.success("Folder created", { description: created.name });
      } else {
        toast.error(res?.message || "Failed to create folder");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create folder");
    }
  };

  const handleDeleteFolder = async (folderToDelete) => {
    const formsCount = formsList.filter(
      (f) => String(f.folderId) === String(folderToDelete.id)
    ).length;

    if (
      !window.confirm(
        `Delete folder "${folderToDelete.name}"? This will permanently delete ${formsCount} indexed form(s) inside it.`
      )
    ) {
      return;
    }

    try {
      const res = await request(`/forms-vault/folders/${folderToDelete.id}`, "DELETE");

      if (res?.success) {
        setFolders((prev) => prev.filter((f) => f.id !== folderToDelete.id));
        setFormsList((prev) =>
          prev.filter((f) => String(f.folderId) !== String(folderToDelete.id))
        );

        const remaining = folders.filter(
          (f) => f.section === activeSection && f.id !== folderToDelete.id
        );
        setSelectedFolderId(remaining.length > 0 ? remaining[0].id : null);
        toast.success("Folder and indexed forms removed");
      } else {
        toast.error(res?.message || "Failed to delete folder");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete folder");
    }
  };

  // 4. Form Actions
  const handleOpenAddModal = () => {
    if (sectionFolders.length === 0) {
      toast.error("Create at least one folder before adding documents.");
      setIsAddFolderModalOpen(true);
      return;
    }
    setIsEditingForm(false);
    setEditingFormId(null);
    setFormState({
      section: activeSection,
      folderId: activeFolder?.id || sectionFolders[0]?.id || "",
      title: "",
      code: "",
      officialUrl: "",
      fallbackUrl: "",
      tags: "",
      description: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (formToEdit) => {
    const targetId = formToEdit._id || formToEdit.id;
    setIsEditingForm(true);
    setEditingFormId(targetId);
    setFormState({
      section: formToEdit.section || activeSection,
      folderId:
        typeof formToEdit.folderId === "object" && formToEdit.folderId !== null
          ? formToEdit.folderId._id
          : formToEdit.folderId,
      title: formToEdit.title || "",
      code: formToEdit.code || "",
      officialUrl: formToEdit.officialUrl || "",
      fallbackUrl: formToEdit.fallbackUrl || "",
      tags: Array.isArray(formToEdit.tags) ? formToEdit.tags.join(", ") : formToEdit.tags || "",
      description: formToEdit.description || "",
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formState.title || !formState.folderId || !formState.officialUrl) {
      toast.error("Folder, Title, and Official URL are required");
      return;
    }

    try {
      const payload = {
        title: formState.title.trim(),
        code: formState.code.trim() || undefined,
        section: formState.section,
        folderId: formState.folderId,
        officialUrl: formState.officialUrl.trim(),
        fallbackUrl: formState.fallbackUrl ? formState.fallbackUrl.trim() : "",
        tags: formState.tags
          ? formState.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : ["Operational"],
        description:
          formState.description?.trim() || "Official regulatory and operational dispatch form.",
      };

      if (isEditingForm && editingFormId) {
        const res = await request(`/forms-vault/forms/${editingFormId}`, "PUT", payload);
        if (res?.success && res.data) {
          const updatedRecord = {
            ...res.data,
            id: res.data._id || res.data.id,
            folderId:
              typeof res.data.folderId === "object" && res.data.folderId !== null
                ? res.data.folderId._id
                : res.data.folderId,
            updatedAt: new Date(res.data.updatedAt || res.data.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            }),
          };

          setFormsList((prev) =>
            prev.map((f) =>
              String(f.id || f._id) === String(editingFormId) ? updatedRecord : f
            )
          );
          toast.success("Form updated", { description: updatedRecord.title });
          setIsFormModalOpen(false);
        } else {
          toast.error(res?.message || "Failed to update form");
        }
      } else {
        const res = await request("/forms-vault/forms", "POST", payload);
        if (res?.success && res.data) {
          const createdRecord = {
            ...res.data,
            id: res.data._id || res.data.id,
            folderId:
              typeof res.data.folderId === "object" && res.data.folderId !== null
                ? res.data.folderId._id
                : res.data.folderId,
            updatedAt: new Date(res.data.updatedAt || res.data.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            }),
          };

          setFormsList((prev) => [createdRecord, ...prev]);
          setSelectedFolderId(createdRecord.folderId);
          toast.success("Form indexed to directory", { description: createdRecord.title });
          setIsFormModalOpen(false);
        } else {
          toast.error(res?.message || "Failed to index form");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to process form request");
    }
  };

  // 5. Open Direct Official Links
  const handleOpenSource = (form) => {
    if (!form?.officialUrl) {
      toast.error("Official URL missing for this document");
      return;
    }
    const target = form.officialUrl.startsWith("http")
      ? form.officialUrl
      : `https://${form.officialUrl}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const handleOpenFallback = (form) => {
    if (!form?.fallbackUrl) {
      toast.error("No fallback downloads hub URL configured for this form");
      return;
    }
    const target = form.fallbackUrl.startsWith("http")
      ? form.fallbackUrl
      : `https://${form.fallbackUrl}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  if (isInitialLoading) {
    return (
      <div className="p-24 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <span className="text-xs font-mono font-semibold uppercase tracking-wider">
          Opening Forms Vault...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans text-left">
      {/* 1. Header & Category Tabs */}
      <VaultHeader
        activeSection={activeSection}
        onSelectSection={(secId) => {
          setActiveSection(secId);
          const firstOfSec = folders.find((f) => f.section === secId);
          setSelectedFolderId(firstOfSec ? firstOfSec.id : null);
        }}
        folders={folders}
        onOpenUpload={handleOpenAddModal}
      />

      {/* 2. Folders Shelf */}
      <FolderShelf
        sectionFolders={sectionFolders}
        activeFolder={activeFolder}
        formsList={formsList}
        onSelectFolder={(id) => setSelectedFolderId(id)}
        onDeleteFolder={handleDeleteFolder}
        onOpenNewFolderModal={() => setIsAddFolderModalOpen(true)}
      />

      {/* 3. Open Physical Folder Workspace View */}
      {sectionFolders.length > 0 ? (
        <DocumentLedger
          activeFolder={activeFolder}
          currentFolderForms={currentFolderForms}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSource={handleOpenSource}
          onOpenFallback={handleOpenFallback}
          onEditForm={handleOpenEditModal}
        />
      ) : (
        <div className="p-16 text-center bg-white dark:bg-white/1 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center">
          <FolderPlus size={32} className="text-slate-300 dark:text-slate-600 mb-2.5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            No Folders in {activeSection}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Create an institution folder (e.g. HDFC, SBI, Axis) to begin indexing forms.
          </p>
          <button
            type="button"
            onClick={() => setIsAddFolderModalOpen(true)}
            className="mt-4 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
          >
            Create First Folder
          </button>
        </div>
      )}

      {/* Modals */}
      <AddDocumentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        folders={folders}
        formState={formState}
        setFormState={setFormState}
        onSubmit={handleSubmitForm}
        isEditing={isEditingForm}
        loading={loading}
      />

      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        activeSection={activeSection}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onSubmit={handleAddFolder}
        loading={loading}
      />
    </div>
  );
};

export default FormsVault;