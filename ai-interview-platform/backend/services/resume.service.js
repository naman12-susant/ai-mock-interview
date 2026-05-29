const pdf = require('pdf-parse');
const fs = require('fs').promises;

class ResumeService {
  // Extract text from PDF
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Clean and format extracted text
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  // Validate resume content
  validateResumeContent(text) {
    const minLength = 50; // Reduced minimum characters
    
    if (!text || text.trim().length < minLength) {
      throw new Error(`Resume content is too short. Extracted ${text?.length || 0} characters. Please ensure your PDF contains readable text.`);
    }

    // Check for common resume sections (optional warning)
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
    const hasPhone = /\b\d{10}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(text);
    
    if (!hasEmail && !hasPhone) {
      console.warn('Resume may be missing contact information');
    }

    return true;
  }
}

module.exports = new ResumeService();
