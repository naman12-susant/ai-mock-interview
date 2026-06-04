const pdf = require('pdf-parse');
const pdfjs = require('pdfjs-dist/legacy/build/pdf');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;

class ResumeService {
  // ===========================
  // TEXT EXTRACTION PIPELINE
  // ===========================

  /**
   * Main extraction method with fallback system
   * Try: PDF Parse → PDF.js → OCR → Fail
   */
  async extractText(fileBuffer, originalFileName, mimetype) {
    console.log(`[EXTRACTION] Starting extraction for ${originalFileName} (${mimetype})`);

    // Determine file type
    const isDocx = mimetype?.includes('wordprocessingml') || originalFileName?.endsWith('.docx');
    const isDoc = mimetype?.includes('msword') && !isDocx;
    const isPdf = mimetype?.includes('pdf') || originalFileName?.endsWith('.pdf');

    try {
      // DOCX/DOC extraction
      if (isDocx || isDoc) {
        console.log('[EXTRACTION] Attempting DOCX extraction...');
        return await this.extractFromDOCX(fileBuffer);
      }

      // PDF extraction with fallbacks
      if (isPdf) {
        try {
          console.log('[EXTRACTION] Attempting PDF-Parse extraction...');
          return await this.extractFromPDFParse(fileBuffer);
        } catch (error) {
          console.warn('[EXTRACTION] PDF-Parse failed, trying PDF.js...', error.message);
          try {
            return await this.extractFromPDFJs(fileBuffer);
          } catch (pdfJsError) {
            console.warn('[EXTRACTION] PDF.js failed, trying OCR...', pdfJsError.message);
            return await this.extractFromOCR(fileBuffer);
          }
        }
      }

      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('[EXTRACTION] All extraction methods failed:', error);
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text using pdf-parse
   */
  async extractFromPDFParse(fileBuffer) {
    try {
      const data = await pdf(fileBuffer);
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF-Parse returned empty text');
      }
      console.log('[EXTRACTION] PDF-Parse successful');
      return data.text;
    } catch (error) {
      throw new Error(`PDF-Parse failed: ${error.message}`);
    }
  }

  /**
   * Extract text using PDF.js (handles more PDF types)
   */
  async extractFromPDFJs(fileBuffer) {
    try {
      const doc = await pdfjs.getDocument({ data: fileBuffer }).promise;
      let text = '';

      for (let i = 0; i < doc.numPages; i++) {
        const page = await doc.getPage(i + 1);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }

      if (!text || text.trim().length === 0) {
        throw new Error('PDF.js returned empty text');
      }
      console.log('[EXTRACTION] PDF.js successful');
      return text;
    } catch (error) {
      throw new Error(`PDF.js failed: ${error.message}`);
    }
  }

  /**
   * Extract text using OCR (Tesseract.js)
   * Handles scanned PDFs and image-based resumes
   */
  async extractFromOCR(fileBuffer) {
    try {
      console.log('[EXTRACTION] Starting OCR extraction (this may take 10-30 seconds)...');
      
      // Convert buffer to base64 for Tesseract
      const base64 = fileBuffer.toString('base64');
      const result = await Tesseract.recognize(
        `data:image/png;base64,${base64}`,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const text = result.data.text;
      if (!text || text.trim().length === 0) {
        throw new Error('OCR returned empty text');
      }
      console.log('[EXTRACTION] OCR successful');
      return text;
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX files
   */
  async extractFromDOCX(fileBuffer) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX extraction returned empty text');
      }
      console.log('[EXTRACTION] DOCX extraction successful');
      return result.value;
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  // ===========================
  // TEXT PROCESSING
  // ===========================

  /**
   * Clean and format extracted text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  // ===========================
  // RESUME VALIDATION
  // ===========================

  /**
   * Validate extracted text has sufficient content
   */
  validateExtractionQuality(text) {
    const minLength = 150; // Minimum characters for a valid resume
    
    if (!text || text.trim().length < minLength) {
      const extracted = text?.length || 0;
      throw new Error(
        `Insufficient content extracted (${extracted} characters). The document may be empty or corrupted. Try uploading a text-based PDF or DOCX file.`
      );
    }

    return true;
  }

  /**
   * Detect if extracted text is actually a resume
   * Uses keyword matching + optional AI validation
   */
  async validateIsResume(text, useAIValidation = true) {
    // Keyword-based detection
    const resumeKeywords = [
      'education',
      'experience',
      'skills',
      'projects',
      'certifications',
      'internship',
      'summary',
      'objective',
      'achievements',
      'contact',
      'employment',
      'technical',
      'qualification',
      'profile',
      'work experience',
      'java',
      'python',
      'javascript',
      'react',
      'node',
      'developer',
      'engineer',
      'manager',
      'analyst'
    ];

    const lowerText = text.toLowerCase();
    let keywordMatchCount = 0;

    resumeKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        keywordMatchCount++;
      }
    });

    // If keyword match is strong, it's likely a resume
    if (keywordMatchCount >= 5) {
      console.log(`[VALIDATION] Resume detected (${keywordMatchCount} keywords matched)`);
      return {
        isResume: true,
        confidence: Math.min(95, 50 + keywordMatchCount * 5),
        reason: `Detected ${keywordMatchCount} resume-related keywords`
      };
    }

    // If AI validation is enabled, use OpenAI for classification
    if (useAIValidation) {
      console.log('[VALIDATION] Using AI to validate resume...');
      return await this.validateResumeWithAI(text);
    }

    // Keyword match failed and no AI validation
    if (keywordMatchCount >= 2) {
      return {
        isResume: true,
        confidence: 50 + keywordMatchCount * 10,
        reason: `Detected ${keywordMatchCount} resume-related keywords (weak match)`
      };
    }

    return {
      isResume: false,
      confidence: 0,
      reason: 'Document does not appear to be a resume. No relevant keywords found.'
    };
  }

  /**
   * Use OpenAI to validate if document is a resume
   */
  async validateResumeWithAI(text) {
    try {
      const openaiService = require('./openai.service');
      
      // Use first 1500 characters for validation
      const sampleText = text.substring(0, 1500);
      
      const response = await openaiService.makeRequest(
        `You are a document classifier. Determine whether this document is a professional resume/CV.

Return JSON only (no markdown, no extra text):
{
  "isResume": true/false,
  "confidence": 0-100,
  "reason": "brief explanation"
}

Document:
${sampleText}`,
        'gpt-3.5-turbo',
        0.3
      );

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('[VALIDATION] AI validation result:', result);
      return result;
    } catch (error) {
      console.warn('[VALIDATION] AI validation failed, falling back to keyword match:', error.message);
      return {
        isResume: true,
        confidence: 60,
        reason: 'AI validation unavailable, using keyword matching'
      };
    }
  }

  /**
   * Validate resume content (existing logic)
   */
  validateResumeContent(text) {
    // Check for common resume sections (optional warning)
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
    const hasPhone = /\b\d{10}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(text);
    
    if (!hasEmail && !hasPhone) {
      console.warn('[VALIDATION] Resume may be missing contact information');
    }

    return true;
  }

  // ===========================
  // RESUME PREVIEW
  // ===========================

  /**
   * Extract preview data from resume text
   */
  extractPreviewData(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract potential name (usually first line with proper case)
    const nameLine = lines.find(line => {
      const words = line.split(' ');
      return words.length <= 4 && words.some(w => w[0] === w[0].toUpperCase());
    });

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);

    // Extract skills (look for common skill keywords)
    const skillKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'typescript', 'angular', 'vue', 'aws', 'docker', 'git', 'mongodb', 'firebase'];
    const skills = [];
    skillKeywords.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    return {
      name: nameLine?.trim() || 'Name not found',
      email: emailMatch ? emailMatch[0] : 'Email not found',
      skills: skills.slice(0, 5), // First 5 detected skills
      preview: lines.slice(0, 8).join('\n') // First 8 lines as preview
    };
  }
}

module.exports = new ResumeService();
