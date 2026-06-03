// CommonJS helper to force Webpack to resolve to the pre-transpiled CommonJS build of docx
const docx = require('docx');
const { saveAs } = require('file-saver');

export const exportDOCX = async (optimizedResume, contactDetails) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

  const sectionTitle = (text) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: '3B82F6', font: 'Calibri' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '3B82F6' } }
  });

  const children = [];

  // Name Header
  children.push(new Paragraph({
    children: [new TextRun({ text: contactDetails.name || 'Your Name', bold: true, size: 36, color: '1E1E1E', font: 'Calibri' })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 }
  }));

  // Contact Info
  const contactParts = [];
  if (contactDetails.email) contactParts.push(contactDetails.email);
  if (contactDetails.phone) contactParts.push(contactDetails.phone);
  if (contactDetails.linkedin) contactParts.push(contactDetails.linkedin);
  if (contactDetails.github) contactParts.push(contactDetails.github);

  children.push(new Paragraph({
    children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Calibri', color: '555555' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  }));

  // Summary
  if (optimizedResume.summary) {
    children.push(sectionTitle('PROFESSIONAL SUMMARY'));
    children.push(new Paragraph({
      children: [new TextRun({ text: optimizedResume.summary, size: 21, font: 'Calibri', color: '3C3C3C' })],
      spacing: { after: 150 }
    }));
  }

  // Skills
  if (optimizedResume.skills?.length > 0) {
    children.push(sectionTitle('SKILLS'));
    children.push(new Paragraph({
      children: [new TextRun({ text: optimizedResume.skills.join('  •  '), size: 21, font: 'Calibri', color: '3C3C3C' })],
      spacing: { after: 150 }
    }));
  }

  // Experience
  if (optimizedResume.experience?.length > 0) {
    children.push(sectionTitle('EXPERIENCE'));
    optimizedResume.experience.forEach(exp => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${exp.title || 'Role'} — ${exp.company || 'Company'}`, bold: true, size: 22, font: 'Calibri' }),
          ...(exp.duration ? [new TextRun({ text: `  |  ${exp.duration}`, italics: true, size: 20, color: '787878', font: 'Calibri' })] : [])
        ],
        spacing: { before: 100, after: 60 }
      }));
      (exp.bullets || []).forEach(bullet => {
        children.push(new Paragraph({
          children: [new TextRun({ text: bullet, size: 21, font: 'Calibri', color: '3C3C3C' })],
          bullet: { level: 0 },
          spacing: { after: 30 }
        }));
      });
    });
  }

  // Projects
  if (optimizedResume.projects?.length > 0) {
    children.push(sectionTitle('PROJECTS'));
    optimizedResume.projects.forEach(proj => {
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.title || 'Project', bold: true, size: 22, font: 'Calibri' })],
        spacing: { before: 100, after: 40 }
      }));
      if (proj.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: proj.description, size: 21, font: 'Calibri', color: '3C3C3C' })],
          spacing: { after: 30 }
        }));
      }
      if (proj.technologies?.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, italics: true, size: 20, color: '646464', font: 'Calibri' })],
          spacing: { after: 80 }
        }));
      }
    });
  }

  // Education
  if (optimizedResume.education?.length > 0) {
    children.push(sectionTitle('EDUCATION'));
    optimizedResume.education.forEach(edu => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${edu.degree || 'Degree'} — ${edu.institution || 'Institution'}`, bold: true, size: 22, font: 'Calibri' }),
          ...(edu.year ? [new TextRun({ text: `  (${edu.year})`, size: 20, color: '787878', font: 'Calibri' })] : [])
        ],
        spacing: { after: 60 }
      }));
    });
  }

  // Certifications
  if (optimizedResume.certifications?.length > 0) {
    children.push(sectionTitle('CERTIFICATIONS'));
    optimizedResume.certifications.forEach(cert => {
      children.push(new Paragraph({
        children: [new TextRun({ text: cert, size: 21, font: 'Calibri', color: '3C3C3C' })],
        bullet: { level: 0 },
        spacing: { after: 30 }
      }));
    });
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'TalentForge_Optimized_Resume.docx');
};
