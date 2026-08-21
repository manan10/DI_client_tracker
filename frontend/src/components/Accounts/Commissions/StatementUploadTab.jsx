import React, { useState, useMemo } from 'react';
import UploadDropzone from './StatementUploadForm/UploadDropzone';
import RawMappingList from './StatementUploadForm/RawMappingList';
import MergedLedgerPreview from './StatementUploadForm/MergedLedgerPreview';

const StatementUploadTab = ({
  fileInputRef,
  selectedFiles = [],
  onFileSelect,
  onRemoveFile,
  onProcess,
  isProcessing,
  extractedResults, 
  onAcceptResults,   
  onDiscardResults,
  onUpdateMapping, 
  onToggleExclude,
  sortedAmcList = []   
}) => {
  const [isReviewingMerged, setIsReviewingMerged] = useState(false);

  // Grouping Engine for Step 2
  const mergedLedgers = useMemo(() => {
    if (!extractedResults) return [];
    
    const active = extractedResults.filter(r => !r.isExcluded);
    const grouped = {};

    active.forEach(r => {
      const amc = r.amcName;
      if (!amc) return;

      if (!grouped[amc]) {
        grouped[amc] = { amcName: amc, amount: r.amount, date: r.date, count: 1 };
      } else {
        grouped[amc].amount += r.amount;
        grouped[amc].count += 1;
        // Keep the earliest date
        if (new Date(r.date) < new Date(grouped[amc].date)) {
          grouped[amc].date = r.date;
        }
      }
    });

    return Object.values(grouped).sort((a, b) => b.amount - a.amount);
  }, [extractedResults]);

  const handleSafeDiscard = () => {
    setIsReviewingMerged(false);
    onDiscardResults();
  };

  // Step Routing: Merged Review -> Raw Mapping -> Dropzone
  if (extractedResults && extractedResults.length > 0) {
    if (isReviewingMerged) {
      return (
        <MergedLedgerPreview 
          mergedLedgers={mergedLedgers}
          onBack={() => setIsReviewingMerged(false)}
          onConfirm={() => {
            setIsReviewingMerged(false);
            onAcceptResults(mergedLedgers);
          }}
        />
      );
    }

    return (
      <RawMappingList 
        extractedResults={extractedResults}
        sortedAmcList={sortedAmcList}
        onUpdateMapping={onUpdateMapping}
        onToggleExclude={onToggleExclude}
        onDiscard={handleSafeDiscard}
        onMergePreview={() => setIsReviewingMerged(true)}
      />
    );
  }

  return (
    <UploadDropzone 
      fileInputRef={fileInputRef}
      selectedFiles={selectedFiles}
      onFileSelect={onFileSelect}
      onRemoveFile={onRemoveFile}
      onProcess={onProcess}
      isProcessing={isProcessing}
      onDiscard={handleSafeDiscard}
    />
  );
};

export default StatementUploadTab;