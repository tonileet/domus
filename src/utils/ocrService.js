import Tesseract from 'tesseract.js';

/**
 * OCR Service for extracting text from receipt/invoice images
 * Uses Tesseract.js for client-side OCR processing
 */

/**
 * Extract text from an image file
 * @param {File|Blob|string} image - Image file, blob, or URL
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} Extracted text
 */
export const extractText = async (image, onProgress) => {
  const result = await Tesseract.recognize(image, 'eng+deu', {
    logger: onProgress ? (m) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    } : undefined
  });

  return result.data.text;
};

/**
 * Parse extracted text to find cost-related data
 * @param {string} text - Raw OCR text
 * @returns {object} Parsed cost data
 */
export const parseCostData = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  const result = {
    name: '',
    description: '',
    amount: '',
    date: '',
    confidence: {
      amount: false,
      date: false
    }
  };

  // Try to extract amount (looking for currency patterns)
  const amountPatterns = [
    // Euro patterns: €123.45, 123,45€, EUR 123.45, 123.45 EUR
    /(?:€|EUR)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:€|EUR)/gi,
    // Total/Summe patterns
    /(?:total|summe|gesamt|betrag|amount|sum)[\s:]*(?:€|EUR)?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,
    // Generic decimal numbers that could be amounts
    /(\d{1,3}(?:\.\d{3})*,\d{2})/g,  // German format: 1.234,56
    /(\d{1,3}(?:,\d{3})*\.\d{2})/g,  // US format: 1,234.56
  ];

  // Find amounts and pick the largest (likely the total)
  const amounts = [];
  for (const pattern of amountPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let amountStr = match[1];
      // Normalize to standard format
      // If contains both . and ,, determine which is decimal separator
      if (amountStr.includes('.') && amountStr.includes(',')) {
        // Check position: last separator is decimal
        const lastDot = amountStr.lastIndexOf('.');
        const lastComma = amountStr.lastIndexOf(',');
        if (lastComma > lastDot) {
          // German format: 1.234,56
          amountStr = amountStr.replace(/\./g, '').replace(',', '.');
        } else {
          // US format: 1,234.56
          amountStr = amountStr.replace(/,/g, '');
        }
      } else if (amountStr.includes(',')) {
        // Could be decimal comma (German) or thousands separator
        // If 2 digits after comma, treat as decimal
        if (/,\d{2}$/.test(amountStr)) {
          amountStr = amountStr.replace(',', '.');
        } else {
          amountStr = amountStr.replace(/,/g, '');
        }
      }

      const num = parseFloat(amountStr);
      if (!isNaN(num) && num > 0 && num < 1000000) {
        amounts.push(num);
      }
    }
  }

  if (amounts.length > 0) {
    // Pick the largest amount (usually the total)
    result.amount = Math.max(...amounts).toFixed(2);
    result.confidence.amount = true;
  }

  // Try to extract date
  const datePatterns = [
    // DD.MM.YYYY or DD/MM/YYYY
    /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/g,
    // YYYY-MM-DD (ISO format)
    /(\d{4})-(\d{2})-(\d{2})/g,
    // Written dates: 15. Januar 2024, January 15, 2024
    /(\d{1,2})\.?\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})/gi,
  ];

  const monthMap = {
    'januar': '01', 'january': '01',
    'februar': '02', 'february': '02',
    'märz': '03', 'march': '03',
    'april': '04',
    'mai': '05', 'may': '05',
    'juni': '06', 'june': '06',
    'juli': '07', 'july': '07',
    'august': '08',
    'september': '09',
    'oktober': '10', 'october': '10',
    'november': '11',
    'dezember': '12', 'december': '12'
  };

  for (const pattern of datePatterns) {
    const match = pattern.exec(text);
    if (match) {
      let day, month, year;

      if (match[0].includes('-') && match[1].length === 4) {
        // ISO format: YYYY-MM-DD
        year = match[1];
        month = match[2];
        day = match[3];
      } else if (monthMap[match[2]?.toLowerCase()]) {
        // Written month
        day = match[1].padStart(2, '0');
        month = monthMap[match[2].toLowerCase()];
        year = match[3];
      } else {
        // DD.MM.YYYY or DD/MM/YYYY
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        year = match[3];
      }

      // Validate date parts
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (dayNum >= 1 && dayNum <= 31 &&
          monthNum >= 1 && monthNum <= 12 &&
          yearNum >= 2000 && yearNum <= 2100) {
        result.date = `${year}-${month}-${day}`;
        result.confidence.date = true;
        break;
      }
    }
  }

  // Try to extract vendor/company name (usually at the top)
  // Look for lines that might be company names
  const companyIndicators = ['gmbh', 'ag', 'kg', 'ohg', 'inc', 'ltd', 'llc', 'co.'];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip very short lines or lines that are just numbers
    if (line.length < 3 || /^\d+$/.test(line)) continue;

    // Check if line contains company indicators
    const lowerLine = line.toLowerCase();
    if (companyIndicators.some(ind => lowerLine.includes(ind))) {
      result.name = line;
      break;
    }

    // Use first substantial line as name if nothing else found
    if (!result.name && line.length > 5 && !/^\d/.test(line)) {
      result.name = line;
    }
  }

  // Build description from the text (cleaned up)
  const descriptionLines = lines
    .slice(0, 10)
    .filter(line =>
      line.length > 3 &&
      line.length < 100 &&
      !/^[\d.,€$]+$/.test(line)
    )
    .slice(0, 3);

  result.description = descriptionLines.join(' | ');

  return result;
};

/**
 * Process a receipt image and extract cost data
 * @param {File|Blob|string} image - Image to process
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} Extracted cost data
 */
export const processReceipt = async (image, onProgress) => {
  const text = await extractText(image, onProgress);
  const costData = parseCostData(text);

  return {
    ...costData,
    rawText: text
  };
};

export default {
  extractText,
  parseCostData,
  processReceipt
};
