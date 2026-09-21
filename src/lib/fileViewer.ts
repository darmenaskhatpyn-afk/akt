/**
 * File helpers for reliable cross-user opening and downloading
 */

export function isDataUrl(url?: string): boolean {
  return Boolean(url && url.startsWith('data:'));
}

export function isBlobUrl(url?: string): boolean {
  return Boolean(url && url.startsWith('blob:'));
}

/**
 * Downloads a base64 DataURL or remote file reliably in all browsers
 */
export function downloadFile(url: string, fileName: string) {
  if (!url || url === '#') return;

  if (isDataUrl(url)) {
    try {
      const arr = url.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'task-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    } catch (e) {
      console.warn('Failed to convert base64 to blob for download:', e);
    }
  }

  // Standard link download
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'task-file';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens a task file or document in a safe, viewer-compatible way:
 * - Data URLs: converted into a clean window or download
 * - Office documents (docx, pptx, xlsx): opens through Office Online / Google Viewer if public URL
 * - Web links / PDFs: opened directly in a new tab
 */
export function openTaskFile(task: {
  link?: string;
  fileUrl?: string;
  fileName?: string;
  format?: string;
  title?: string;
}) {
  const targetUrl = task.fileUrl || task.link;
  if (!targetUrl || targetUrl === '#') {
    return;
  }

  // If it's a Data URL (saved directly into cloud DB)
  if (isDataUrl(targetUrl)) {
    try {
      const arr = targetUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      // For PDF or images or text, we can preview in new window
      if (mime.includes('pdf') || mime.includes('image') || mime.includes('text')) {
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          downloadFile(targetUrl, task.fileName || `${task.title || 'file'}.${task.format || 'bin'}`);
        }
      } else {
        // Office docs, zip, etc. - trigger download
        downloadFile(targetUrl, task.fileName || `${task.title || 'file'}.${task.format || 'bin'}`);
      }
      return;
    } catch (e) {
      console.warn('Failed to parse data URL:', e);
      downloadFile(targetUrl, task.fileName || 'file');
      return;
    }
  }

  // If it is a web URL and an Office document, offer Google Docs Viewer or direct
  const lowerUrl = targetUrl.toLowerCase();
  const isOfficeDoc =
    task.format === 'word' ||
    task.format === 'pptx' ||
    lowerUrl.endsWith('.docx') ||
    lowerUrl.endsWith('.doc') ||
    lowerUrl.endsWith('.pptx') ||
    lowerUrl.endsWith('.ppt') ||
    lowerUrl.endsWith('.xlsx');

  if (isOfficeDoc && targetUrl.startsWith('http') && !targetUrl.includes('drive.google.com')) {
    // If it is a public URL, Microsoft Office online viewer or Google Viewer can render it in browser
    const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}&embedded=false`;
    window.open(googleViewer, '_blank', 'noopener,noreferrer');
    return;
  }

  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}
