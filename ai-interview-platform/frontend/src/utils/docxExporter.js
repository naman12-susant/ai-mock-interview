/**
 * DOCX Exporter — uses dynamic imports to avoid any CJS/ESM bundling issues.
 * Falls back gracefully and logs detailed errors.
 */
export const exportDOCX = async (optimizedResume, contactDetails) => {
  // Dynamic imports to guarantee Webpack resolves them correctly
  const docxModule = await import('docx');
  const fileSaverModule = await import('file-saver');

  const Document = docxModule.Document;
  const Packer = docxModule.Packer;
  const Paragraph = docxModule.Paragraph;
  const TextRun = docxModule.TextRun;
  const HeadingLevel = docxModule.HeadingLevel;
  const AlignmentType = docxModule.AlignmentType;
  const BorderStyle = docxModule.BorderStyle;
  const saveAs = fileSaverModule.saveAs || fileSaverModule.default?.saveAs;

  if (!Document || !Packer || !Paragraph || !TextRun) {
    throw new Error('docx library failed to load properly. Please refresh and try again.');
  }

  // Helper: safely convert a skill to a string
  const toSkillString = (s) => {
    if (typeof s === 'string') return s;
    if (s && typeof s === 'object' && s.name) return s.name;
    return String(s);
  };

  // Helper: create a section title paragraph
  const sectionTitle = (text) => {
    const opts = {
      children: [new TextRun({ text, bold: true, size: 26, color: '3B82F6', font: 'Calibri' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
    };
    // Only add border if BorderStyle is available
    if (BorderStyle && BorderStyle.SINGLE) {
      opts.border = { bottom: { style: BorderStyle.SINGLE, size: 1, color: '3B82F6' } };
    }
    return new Paragraph(opts);
  };

  const children = [];

  // ── Name Header ──
  children.push(new Paragraph({
    children: [new TextRun({
      text: contactDetails?.name || 'Your Name',
      bold: true,
      size: 36,
      color: '1E1E1E',
      font: 'Calibri'
    })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 }
  }));

  // ── Contact Info ──
  const contactParts = [];
  if (contactDetails?.email) contactParts.push(contactDetails.email);
  if (contactDetails?.phone) contactParts.push(contactDetails.phone);
  if (contactDetails?.linkedin) contactParts.push(contactDetails.linkedin);
  if (contactDetails?.github) contactParts.push(contactDetails.github);

  if (contactParts.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Calibri', color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));
  }

  // ── Summary ──
  if (optimizedResume?.summary) {
    children.push(sectionTitle('PROFESSIONAL SUMMARY'));
    children.push(new Paragraph({
      children: [new TextRun({ text: String(optimizedResume.summary), size: 21, font: 'Calibri', color: '3C3C3C' })],
      spacing: { after: 150 }
    }));
  }

  // ── Skills ──
  if (optimizedResume?.skills && Array.isArray(optimizedResume.skills) && optimizedResume.skills.length > 0) {
    children.push(sectionTitle('SKILLS'));
    const skillNames = optimizedResume.skills.map(toSkillString).filter(Boolean);
    children.push(new Paragraph({
      children: [new TextRun({ text: skillNames.join('  •  '), size: 21, font: 'Calibri', color: '3C3C3C' })],
      spacing: { after: 150 }
    }));
  }

  // ── Experience ──
  if (optimizedResume?.experience && Array.isArray(optimizedResume.experience) && optimizedResume.experience.length > 0) {
    children.push(sectionTitle('EXPERIENCE'));
    for (const exp of optimizedResume.experience) {
      if (!exp) continue;
      const titleRuns = [
        new TextRun({
          text: `${exp.title || 'Role'} — ${exp.company || 'Company'}`,
          bold: true,
          size: 22,
          font: 'Calibri'
        })
      ];
      if (exp.duration) {
        titleRuns.push(new TextRun({
          text: `  |  ${exp.duration}`,
          italics: true,
          size: 20,
          color: '787878',
          font: 'Calibri'
        }));
      }
      children.push(new Paragraph({
        children: titleRuns,
        spacing: { before: 100, after: 60 }
      }));
      
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      for (const bullet of bullets) {
        if (!bullet) continue;
        children.push(new Paragraph({
          children: [new TextRun({ text: String(bullet), size: 21, font: 'Calibri', color: '3C3C3C' })],
          bullet: { level: 0 },
          spacing: { after: 30 }
        }));
      }
    }
  }

  // ── Projects ──
  if (optimizedResume?.projects && Array.isArray(optimizedResume.projects) && optimizedResume.projects.length > 0) {
    children.push(sectionTitle('PROJECTS'));
    for (const proj of optimizedResume.projects) {
      if (!proj) continue;
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.title || 'Project', bold: true, size: 22, font: 'Calibri' })],
        spacing: { before: 100, after: 40 }
      }));
      if (proj.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: String(proj.description), size: 21, font: 'Calibri', color: '3C3C3C' })],
          spacing: { after: 30 }
        }));
      }
      if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: `Technologies: ${proj.technologies.join(', ')}`,
            italics: true,
            size: 20,
            color: '646464',
            font: 'Calibri'
          })],
          spacing: { after: 80 }
        }));
      }
    }
  }

  // ── Education ──
  if (optimizedResume?.education && Array.isArray(optimizedResume.education) && optimizedResume.education.length > 0) {
    children.push(sectionTitle('EDUCATION'));
    for (const edu of optimizedResume.education) {
      if (!edu) continue;
      const eduRuns = [
        new TextRun({
          text: `${edu.degree || 'Degree'} — ${edu.institution || 'Institution'}`,
          bold: true,
          size: 22,
          font: 'Calibri'
        })
      ];
      if (edu.year) {
        eduRuns.push(new TextRun({
          text: `  (${edu.year})`,
          size: 20,
          color: '787878',
          font: 'Calibri'
        }));
      }
      children.push(new Paragraph({
        children: eduRuns,
        spacing: { after: 60 }
      }));
    }
  }

  // ── Certifications ──
  if (optimizedResume?.certifications && Array.isArray(optimizedResume.certifications) && optimizedResume.certifications.length > 0) {
    children.push(sectionTitle('CERTIFICATIONS'));
    for (const cert of optimizedResume.certifications) {
      if (!cert) continue;
      const certText = typeof cert === 'string' ? cert : (cert.name || String(cert));
      children.push(new Paragraph({
        children: [new TextRun({ text: certText, size: 21, font: 'Calibri', color: '3C3C3C' })],
        bullet: { level: 0 },
        spacing: { after: 30 }
      }));
    }
  }

  // ── Generate and download ──
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  
  const fileName = `${(contactDetails?.name || 'TalentForge').replace(/\s+/g, '_')}_Optimized_Resume.docx`;

  // Use saveAs if available, otherwise use manual download
  if (typeof saveAs === 'function') {
    saveAs(blob, fileName);
  } else {
    // Manual fallback for browsers where file-saver doesn't load
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
