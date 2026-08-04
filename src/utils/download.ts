import { DocumentRecord } from '../types';

/**
 * Downloads a single document record, including its contents, metadata, and attachment details.
 */
export function downloadRecord(record: DocumentRecord, decryptedText?: string) {
  // If the record has an attachment with a preview/data URL, attempt to trigger direct file download first
  if (record.attachment && record.attachment.previewUrl && record.attachment.previewUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = record.attachment.previewUrl;
    link.download = record.attachment.name || `${record.subject}_Attachment`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate formatted text export
  const contentToExport = decryptedText || record.description || '';
  const fileLines = [
    `==================================================`,
    `PERSONAL DATA BANK - DOCUMENT RECORD EXPORT`,
    `==================================================`,
    `Subject:           ${record.subject}`,
    `Category:          ${record.category}`,
    `Security Level:    ${record.encryptionLevel} (${record.isEncrypted ? 'Encrypted Payload' : 'Standard'})`,
    `Created Date:      ${new Date(record.createdAt).toLocaleString()}`,
    `Updated Date:      ${new Date(record.updatedAt).toLocaleString()}`,
    `Tags:              ${record.tags?.join(', ') || 'None'}`,
    record.attachment?.videoUrl ? `Video URL:         ${record.attachment.videoUrl}` : null,
    record.attachment?.name ? `Attachment Name:   ${record.attachment.name}` : null,
    `--------------------------------------------------`,
    `RECORD DETAILS & CONTENT:`,
    `--------------------------------------------------`,
    contentToExport,
    `--------------------------------------------------`,
    `Downloaded from Personal Data Bank - Safe Storage`,
    `Timestamp: ${new Date().toISOString()}`,
    `==================================================`
  ].filter(Boolean).join('\n');

  const blob = new Blob([fileLines], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeFilename = record.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  link.href = url;
  link.download = `${safeFilename}_record.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all records in a category (or all categories) as a JSON/TXT file.
 */
export function downloadCategoryRecords(categoryName: string, records: DocumentRecord[], format: 'json' | 'txt' = 'txt') {
  const filtered = categoryName === 'ALL' 
    ? records 
    : records.filter(r => r.category.toLowerCase() === categoryName.toLowerCase());

  if (filtered.length === 0) {
    alert(`No records found in category "${categoryName}" to download.`);
    return;
  }

  const safeCategory = categoryName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dateStr = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    const jsonContent = JSON.stringify({
      category: categoryName,
      exportDate: new Date().toISOString(),
      totalRecords: filtered.length,
      records: filtered
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `databank_${safeCategory}_records_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Format TXT Summary report
  const reportLines = [
    `==================================================`,
    `PERSONAL DATA BANK - CATEGORY EXPORT REPORT`,
    `Category Filter:   ${categoryName}`,
    `Total Records:     ${filtered.length}`,
    `Export Date:       ${new Date().toLocaleString()}`,
    `==================================================\n`
  ];

  filtered.forEach((r, idx) => {
    reportLines.push(
      `--- ITEM #${idx + 1} ---`,
      `Subject:      ${r.subject}`,
      `Category:     ${r.category}`,
      `Encryption:   ${r.encryptionLevel}`,
      `Updated:      ${new Date(r.updatedAt).toLocaleDateString()}`,
      r.attachment?.videoUrl ? `Video Link:   ${r.attachment.videoUrl}` : '',
      `Tags:         ${r.tags?.join(', ') || 'N/A'}`,
      `Description:  ${r.description}`,
      `--------------------------------------------------\n`
    );
  });

  const blob = new Blob([reportLines.filter(line => line !== null).join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `databank_${safeCategory}_records_${dateStr}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
