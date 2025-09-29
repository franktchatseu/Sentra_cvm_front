import { useCallback } from 'react';

interface UseFileDownloadReturn {
  downloadFile: (url: string, filename: string) => Promise<void>;
  downloadBlob: (blob: Blob, filename: string) => void;
  isDownloading: boolean;
}

export const useFileDownload = (): UseFileDownloadReturn => {
  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      const blob = await response.blob();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }, [downloadBlob]);

  return {
    downloadFile,
    downloadBlob,
    isDownloading: false, 
  };
};

export default useFileDownload;
