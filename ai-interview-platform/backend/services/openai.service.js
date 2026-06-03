'use strict';
/**
 * AI Service — Groq (free, fast, OpenAI-compatible)
 * Real resume text → Real AI analysis. Zero mock data.
 */

const Groq = require('groq-sdk');

let _groq = null;
function getGroq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. Get a free key at https://console.groq.com');
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const MODEL = 'llama-3.3-70b-versatile';

function stripJSON(raw) {
  let s = raw.trim();
  if (s.startsWith('```json')) s = s.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (s.startsWith('```')) s = s.replace(/^```/, '').replace(/```$/, '').trim();
  return s;
}

function safeParseJSON(raw, context) {
  try {
    return JSON.parse(stripJSON(raw));
  } catch (e) {
    console.error('JSON parse failed in [' + context + ']:', e.message);
    console.error('Raw (first 400):', raw.substring(0, 400));
    throw new Error('AI returned invalid JSON in ' + context + '. Please try again.');
  }
}

// Salvage a truncated JSON array — extract all complete objects
function salvageArray(raw) {
  const start = raw.indexOf('[');
  if (start === -1) return null;

  const end = raw.lastIndexOf(']');
  if (end > start) {
    try { return JSON.parse(raw.substring(start, end + 1)); } catch {}
  }

  // Truncated — collect complete {...} objects
  const partial = raw.substring(start);
  const objects = [];
  let depth = 0, inStr = false, escape = false, objStart = -1;

  for (let i = 0; i < partial.length; i++) {
    const c = partial[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inStr) { escape = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') { if (depth === 0) objStart = i; depth++; }
    else if (c === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try {
          objects.push(JSON.parse(partial.substring(objStart, i + 1)));
        } catch {}
        objStart = -1;
      }
    }
  }
  return objects.length > 0 ? objects : null;
}

class AIService {

  // ── Resume Analysis ──────────────────────────────────────────
  async analyzeResume(resumeText) {
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume text is too short. Please upload a valid PDF resume.');
    }

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert resume parser. Extract structured data accurately. Return ONLY valid JSON. Do NOT invent information.' },
        { role: 'user', content: 'Parse this resume.\n\nRESUME:\n' + resumeText + '\n\nReturn ONLY this JSON (no markdown):\n{"skills":[{"name":"<skill>","category":"technical|soft|language|tool|framework"}],"experience":{"years":<number>,"level":"fresher|junior|mid-level|senior|expert"},"education":[{"degree":"<degree>","institution":"<institution>","year":"<year>"}],"projects":[{"title":"<title>","description":"<description>","technologies":["<tech>"]}],"certifications":["<cert>"],"summary":"<2-3 sentence summary>"}' }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    return safeParseJSON(res.choices[0].message.content, 'analyzeResume');
  }

  // ── Interview Questions ──────────────────────────────────────
  async generateInterviewQuestions(resumeAnalysis, role, count, type, difficulty, attempts = 0, weakAreas = []) {
    count = count || 10;
    type = type || 'mixed';
    difficulty = difficulty || 'intermediate';

    const skills = (resumeAnalysis.skills || []).map(function(s) { return s.name; }).join(', ');
    const projects = (resumeAnalysis.projects || []).map(function(p) { return p.title; }).join(', ');
    const level = (resumeAnalysis.experience || {}).level || 'junior';

    const typeNote = type === 'technical' ? 'All technical questions.' : type === 'behavioral' ? 'All behavioral questions.' : '60% technical, 40% behavioral.';
    
    // Attempt-driven progressive difficulty and mental pressure guidelines
    const diffNote = difficulty === 'easy' || difficulty === 'beginner'
      ? 'Entry-level difficulty. Focus on fundamentals, conceptual questions, supportive tone.'
      : difficulty === 'hard' || difficulty === 'advanced'
      ? 'Senior-level difficulty. Deep technical questions, system design, optimization, edge cases, pressure-based follow-ups.'
      : difficulty === 'faang'
      ? 'FAANG-style difficulty. FAANG-level grilling, algorithms, deep technical performance trade-offs, architecture discussions, high interview pressure.'
      : difficulty === 'startup'
      ? 'Startup-style. Practical, fast-paced, full-stack thinking, MVP building.'
      : 'Mid-level difficulty. Design patterns, debugging, architecture, practical scenarios.';

    let prompt = 'You are a senior technical interviewer.\n\n' +
      'Generate ' + count + ' interview questions STRICTLY based on:\n\n' +
      'Role:\n' + role + '\n\n' +
      'Interview Type:\n' + typeNote + '\n\n' +
      'Candidate Skills:\n' + (skills || 'General industry skills') + '\n\n' +
      'Projects:\n' + (projects || 'none') + '\n\n' +
      'Experience Level:\n' + level + '\n\n' +
      'Difficulty Level:\n' + difficulty.toUpperCase() + ' (' + diffNote + ')\n\n';

    if (attempts > 0) {
      prompt += 'Candidate Previous Attempts for this Role: ' + attempts + '\n' +
        '- Increase interview pressure and technical depth based on their attempts.\n' +
        '- Since they have attempted this ' + attempts + ' time(s) before, challenge them with deeper reasoning.\n\n';
    }

    if (weakAreas && weakAreas.length > 0) {
      prompt += 'Candidate Previous Weak Areas (Target these dynamically to see if they improved):\n' +
        '- ' + weakAreas.slice(0, 5).join('\n- ') + '\n\n';
    }

    prompt += 'IMPORTANT RULES:\n' +
      '- NEVER assume React unless candidate skills include React\n' +
      '- Questions MUST match selected role\n' +
      '- Questions MUST use candidate skills\n' +
      '- Avoid unrelated technologies\n' +
      '- Avoid repetitive questions\n' +
      '- Ask realistic industry-level questions\n' +
      '- Adapt difficulty dynamically\n\n' +
      'CRITICAL: Keep each expectedAnswer under 8 words.\n' +
      'Return ONLY a JSON array, nothing else:\n' +
      '[{"question":"...","difficulty":"easy|medium|hard","category":"technical|behavioral","expectedAnswer":"..."}]';

    const systemMessage = 'You are a professional interviewer.\n\n' +
      'ONLY ask questions relevant to:\n' +
      '- selected role\n' +
      '- candidate skills\n' +
      '- interview type\n\n' +
      'NEVER default to React questions unless React exists in candidate skills.\n' +
      'Return ONLY a valid JSON array. No markdown. No text outside the array.';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 6000
    });

    const raw = res.choices[0].message.content.trim();

    // Try full parse first
    let parsed = null;
    try {
      parsed = safeParseJSON(raw, 'generateInterviewQuestions');
    } catch (e) {
      // Try salvage
      parsed = salvageArray(raw);
      if (!parsed || parsed.length === 0) {
        throw new Error('Failed to generate interview questions. Please try again.');
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI returned empty question list. Please try again.');
    }

    return parsed.slice(0, count).map(function(q) {
      return {
        question: String(q.question || 'Tell me about your experience with ' + role),
        difficulty: ['easy','medium','hard'].indexOf(q.difficulty) !== -1 ? q.difficulty : 'medium',
        category: ['technical','behavioral'].indexOf(q.category) !== -1 ? q.category : 'technical',
        expectedAnswer: String(q.expectedAnswer || '')
      };
    });
  }

  // ── Answer Evaluation ────────────────────────────────────────
  async evaluateAnswer(question, userAnswer, expectedAnswer) {
    // Pre-validate locally
    const localCheck = this.classifyAnswerLocally(userAnswer);
    if (localCheck === 'EMPTY' || localCheck === 'RANDOM') {
      return {
        score: 0,
        classification: localCheck,
        isCorrect: false,
        confidenceLevel: 'NONE',
        strengths: [],
        weaknesses: [localCheck === 'EMPTY' ? 'No answer provided' : 'Answer appears to be random text'],
        suggestions: ['Please provide a thoughtful, relevant answer to the question'],
        improvedAnswer: '',
        communicationScore: 0,
        technicalScore: 0,
        confidenceScore: 0
      };
    }

    const prompt = 'Evaluate this interview answer STRICTLY and HONESTLY.\n\n' +
      'Question: "' + question + '"\n' +
      (expectedAnswer ? 'Expected: "' + expectedAnswer + '"\n' : '') +
      'Answer: "' + userAnswer + '"\n\n' +
      'RULES:\n' +
      '- Do NOT give fake praise\n' +
      '- If the answer is wrong, say so clearly\n' +
      '- If the answer is vague or incomplete, identify what is missing\n' +
      '- Detect random text, off-topic responses, and "I don\'t know"\n' +
      '- Be specific in strengths and weaknesses — mention actual technical concepts\n\n' +
      'Classification guide:\n' +
      'STRONG (9-10): Technically accurate, complete, shows deep understanding\n' +
      'GOOD (7-8): Mostly correct with minor gaps\n' +
      'PARTIAL (5-6): Some correct elements but key parts missing\n' +
      'WEAK (3-4): Vague, very incomplete\n' +
      'INCORRECT (1-2): Factually wrong\n' +
      'NO_KNOWLEDGE (0): "I don\'t know" or blank\n' +
      'RANDOM (0): Gibberish or completely off-topic\n\n' +
      'Return ONLY this JSON (no markdown):\n' +
      '{"score":<0-10>,"classification":"STRONG|GOOD|PARTIAL|WEAK|INCORRECT|NO_KNOWLEDGE|RANDOM","isCorrect":<bool>,"confidenceLevel":"HIGH|MEDIUM|LOW|NONE","strengths":["<specific strength>"],"weaknesses":["<specific weakness>"],"suggestions":["<actionable suggestion>"],"improvedAnswer":"<what a strong answer includes>","communicationScore":<0-10>,"technicalScore":<0-10>,"confidenceScore":<0-10>}';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a strict professional technical interviewer. Evaluate answers HONESTLY and CRITICALLY. Do NOT give fake praise. Do NOT say "great answer" unless the answer truly deserves it. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1200
    });

    const result = safeParseJSON(res.choices[0].message.content, 'evaluateAnswer');

    // Ensure classification exists
    if (!result.classification) {
      if (result.score >= 9) result.classification = 'STRONG';
      else if (result.score >= 7) result.classification = 'GOOD';
      else if (result.score >= 5) result.classification = 'PARTIAL';
      else if (result.score >= 3) result.classification = 'WEAK';
      else if (result.score >= 1) result.classification = 'INCORRECT';
      else result.classification = 'NO_KNOWLEDGE';
    }

    if (result.isCorrect === undefined) result.isCorrect = result.score >= 6;
    if (!result.confidenceLevel) result.confidenceLevel = result.score >= 7 ? 'HIGH' : result.score >= 4 ? 'MEDIUM' : 'LOW';

    return result;
  }

  // ── Interview Feedback ───────────────────────────────────────
  async generateInterviewFeedback(questions, scores) {
    const answered = questions.filter(function(q) { return q.userAnswer; });
    const avg = answered.reduce(function(s, q) { return s + (q.score || 0); }, 0) / Math.max(answered.length, 1);

    const qSummary = answered.slice(0, 5).map(function(q, i) {
      return 'Q' + (i+1) + ': ' + q.question + '\nA: ' + (q.userAnswer || '').substring(0, 100) + '\nScore: ' + (q.score || 0) + '/10';
    }).join('\n\n');

    const prompt = 'Generate interview feedback.\n\n' +
      'Stats: ' + answered.length + ' questions, avg ' + avg.toFixed(1) + '/10, technical ' + scores.technical + '/10, communication ' + scores.communication + '/10\n\n' +
      'Sample Q&A:\n' + qSummary + '\n\n' +
      'Return ONLY this JSON (no markdown):\n' +
      '{"summary":"<honest assessment>","strengths":["<genuine strength>"],"areasOfImprovement":["<specific area>"],"recommendations":["<actionable recommendation>"]}';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a strict professional interviewer giving post-interview feedback. Be honest and direct. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    return safeParseJSON(res.choices[0].message.content, 'generateInterviewFeedback');
  }

  // ── Gap Analysis ─────────────────────────────────────────────
  async performGapAnalysis(resumeText, resumeAnalysis, targetRole) {
    if (!resumeText || resumeText.trim().length < 50) throw new Error('Resume text is too short.');
    if (!targetRole || !targetRole.trim()) throw new Error('Target role is required.');

    const skills = (resumeAnalysis.skills || []).map(function(s) { return s.name; }).join(', ');
    const projects = (resumeAnalysis.projects || []).map(function(p) { return p.title + ' (' + (p.technologies || []).join(', ') + ')'; }).join('; ');

    const prompt = 'Perform a comprehensive gap analysis for this resume targeting ' + targetRole + '.\n\n' +
      'RESUME TEXT:\n' + resumeText + '\n\n' +
      'PARSED DATA:\nSkills: ' + skills + '\nLevel: ' + ((resumeAnalysis.experience || {}).level || 'unknown') + '\nProjects: ' + (projects || 'none') + '\n\n' +
      'RULES:\n' +
      '- Base ALL feedback on the actual resume text\n' +
      '- Mention SPECIFIC skills, projects, sections from the resume\n' +
      '- Be strict and honest\n' +
      '- Do NOT give generic advice\n\n' +
      'Return ONLY this JSON (no markdown):\n' +
      '{"overallScore":<0-100>,"categoryScores":{"technicalSkills":<0-10>,"projects":<0-10>,"experience":<0-10>,"atsOptimization":<0-10>,"education":<0-10>},"skillMatchPercentage":<0-100>,"presentSkills":[{"skill":"<skill>","proficiency":"beginner|intermediate|advanced|expert"}],"missingSkills":[{"skill":"<skill>","importance":"critical|important|nice-to-have","reason":"<specific reason>"}],"strengths":["<specific strength>"],"weaknesses":["<specific weakness>"],"aiSuggestions":[{"category":"skills|projects|experience|education|ats|wording","priority":"high|medium|low","suggestion":"<specific suggestion>","impact":"<expected impact>"}],"atsAnalysis":{"score":<0-100>,"keywords":{"present":["<keyword>"],"missing":["<keyword>"]},"formatting":{"score":<0-10>,"issues":["<issue>"]},"actionVerbs":{"count":<number>,"examples":["<verb>"],"suggestions":["<better verb>"]},"readability":{"score":<0-10>,"issues":["<issue>"]}}}';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a senior technical recruiter and ATS specialist. Analyze resumes honestly and specifically. Base all feedback on actual resume content. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 4000
    });

    const analysis = safeParseJSON(res.choices[0].message.content, 'performGapAnalysis');
    analysis.analyzedAt = new Date();
    analysis.targetRole = targetRole;
    return analysis;
  }

  // ── One-Click Optimization ───────────────────────────────────
  async optimizeResumeOneClick(resumeText, resumeAnalysis, targetRole) {
    if (!resumeText || resumeText.trim().length < 50) throw new Error('Resume text is too short.');

    const skills = (resumeAnalysis.skills || []).map(function(s) { return s.name; }).join(', ');
    const projects = (resumeAnalysis.projects || []).map(function(p) { return p.title; }).join(', ');

    const prompt = 'You are a professional ATS resume writer.\n\n' +
      'Current Resume:\n' + resumeText + '\n\n' +
      'Target Role: ' + targetRole + '\n\n' +
      'Parsed Skills: ' + (skills || 'none') + '\n' +
      'Parsed Projects: ' + (projects || 'none') + '\n\n' +
      'RULES:\n' +
      '- Keep truthful information. Do NOT invent fake experience.\n' +
      '- Improve wording with strong action verbs: Engineered, Architected, Spearheaded, Optimized\n' +
      '- Highlight transferable skills relevant to ' + targetRole + '\n' +
      '- Add ATS-friendly keywords for ' + targetRole + '\n' +
      '- Improve project descriptions with quantifiable metrics where implied\n' +
      '- Optimize the summary section for ' + targetRole + '\n' +
      '- Add quantifiable metrics where reasonable (e.g. "Reduced load time by 40%")\n\n' +
      'Return ONLY this JSON (no markdown):\n' +
      '{\n' +
      '  "optimizedResume": {\n' +
      '    "summary": "<2-3 sentence professional summary optimized for ' + targetRole + '>",\n' +
      '    "skills": ["<skill1>", "<skill2>"],\n' +
      '    "experience": [{"title": "<job title>", "company": "<company>", "duration": "<duration>", "bullets": ["<achievement bullet>"]}],\n' +
      '    "projects": [{"title": "<project title>", "description": "<ATS-optimized description>", "technologies": ["<tech>"]}],\n' +
      '    "education": [{"degree": "<degree>", "institution": "<institution>", "year": "<year>"}],\n' +
      '    "certifications": ["<cert>"]\n' +
      '  },\n' +
      '  "improvedSections": [{"section": "Summary|Experience|Skills|Projects|Education", "original": "<original text>", "improved": "<rewritten version>", "reason": "<why better>"}],\n' +
      '  "atsScore": {"before": <0-100>, "after": <0-100>},\n' +
      '  "keyChanges": ["<key change>"],\n' +
      '  "overallImprovements": ["<improvement>"]\n' +
      '}';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert resume writer and ATS specialist. Rewrite resumes into a structured JSON format optimized for ATS systems and the target role. Keep all information truthful. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 6000
    });

    return safeParseJSON(res.choices[0].message.content, 'optimizeResumeOneClick');
  }

  // ── Section Rewriter ─────────────────────────────────────────
  async rewriteResumeSection(sectionText, sectionType, targetRole) {
    const prompt = 'Rewrite this ' + sectionType + ' section for a ' + targetRole + ' position.\n\n' +
      'ORIGINAL:\n' + sectionText + '\n\n' +
      'Requirements: strong action verbs, ATS keywords, truthful, concise.\n\n' +
      'Return ONLY this JSON (no markdown):\n' +
      '{"improved":"<rewritten version>","changes":["<change made>"],"reasoning":"<why better>"}';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert resume writer. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    return safeParseJSON(res.choices[0].message.content, 'rewriteResumeSection');
  }

  // ── Industry Skills ──────────────────────────────────────────
  async getIndustrySkills(role) {
    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a technical recruiter. Return ONLY valid JSON.' },
        { role: 'user', content: 'List industry-standard skills for ' + role + ' in 2025.\n\nReturn ONLY this JSON (no markdown):\n{"critical":["<skill>"],"important":["<skill>"],"niceToHave":["<skill>"]}' }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    return safeParseJSON(res.choices[0].message.content, 'getIndustrySkills');
  }

  // ── Conversational Interview (AIRA) ─────────────────────────
  // Full architecture: Pre-validate → Build Memory → Decision Engine → Strict Analysis → Dynamic Follow-up

  // Enhanced local pre-validator — catches garbage BEFORE calling LLM
  classifyAnswerLocally(userAnswer) {
    if (!userAnswer || userAnswer.trim().length === 0) return 'EMPTY';
    
    const text = userAnswer.trim();
    
    // Too short to be meaningful
    if (text.length < 3) return 'EMPTY';
    if (text.length < 10) return 'TOO_SHORT';

    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    // "I don't know" variants
    const noKnowledgePatterns = [
      /^(i\s+don'?t\s+know)/,
      /^(no\s+idea)/,
      /^(not\s+sure)/,
      /^(idk)/,
      /^(dunno)/,
      /^(i\s+have\s+no\s+idea)/,
      /^(no\s+clue)/,
      /^(i\s+can'?t\s+(answer|explain|remember))/,
      /^(pass)/,
      /^(skip)/,
      /^(i\s+don'?t\s+remember)/,
      /^(i'?m\s+not\s+sure)/
    ];
    for (const pattern of noKnowledgePatterns) {
      if (pattern.test(lower)) return 'NO_KNOWLEDGE';
    }

    // Gibberish detection — words with no vowels and length > 3
    const gibberish = words.filter(function(w) { return !/[aeiou]/i.test(w) && w.length > 3; });
    if (gibberish.length / Math.max(words.length, 1) > 0.5) return 'RANDOM';

    // Repeated character patterns (e.g., "aaaaaaa", "asdasdasd")
    if (/^(.)\1{4,}$/.test(text.replace(/\s/g, ''))) return 'RANDOM';
    if (/^(.{1,3})\1{3,}/.test(text.replace(/\s/g, ''))) return 'RANDOM';

    // Single word that's not a common valid short answer
    if (words.length === 1 && text.length < 15) return 'TOO_SHORT';

    return null; // Valid — needs LLM evaluation
  }

  async generateInterviewGreeting(userName, role, interviewType) {
    const prompt = 'Generate a realistic professional interviewer greeting.\n\n' +
      'Candidate Name: ' + (userName || 'Candidate') + '\n' +
      'Role: ' + role + '\n' +
      'Interview Type: ' + interviewType + '\n\n' +
      'RULES:\n' +
      '- Sound human, confident, and professional\n' +
      '- Introduce yourself as AIRA\n' +
      '- Mention the role and type of interview\n' +
      '- Ask if they are ready to begin\n' +
      '- Keep it to 3-4 natural sentences\n\n' +
      'Return ONLY a JSON object:\n' +
      '{"greeting": "<the spoken text>"}';

    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are AIRA, a professional enterprise interviewer. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return safeParseJSON(res.choices[0].message.content, 'generateInterviewGreeting');
  }

  async generateConversationalReply(role, difficulty, currentQuestion, userAnswer, conversationHistory, interviewRound = 'Technical Round') {
    conversationHistory = conversationHistory || [];

    // ── STEP 1: Pre-validate answer locally ──
    const localClassification = this.classifyAnswerLocally(userAnswer);

    if (localClassification === 'EMPTY') {
      return {
        classification: 'EMPTY',
        score: 0,
        isRelevant: false,
        needsRetry: true,
        confidenceLevel: 'NONE',
        feedback: 'No answer provided.',
        response: "I didn't receive an answer. Please take a moment to think about the question and provide your response. Even a partial answer helps me understand your thought process.",
        followUpQuestionOnly: currentQuestion
      };
    }

    if (localClassification === 'RANDOM') {
      return {
        classification: 'RANDOM',
        score: 0,
        isRelevant: false,
        needsRetry: true,
        confidenceLevel: 'NONE',
        feedback: 'Random or gibberish text detected.',
        response: "I couldn't understand your response. It appears to be random text. Could you please answer the interview question clearly? I'm looking for a thoughtful response related to the question.",
        followUpQuestionOnly: currentQuestion
      };
    }

    if (localClassification === 'TOO_SHORT') {
      return {
        classification: 'WEAK',
        score: 1,
        isRelevant: false,
        needsRetry: true,
        confidenceLevel: 'LOW',
        feedback: 'Answer too short to evaluate meaningfully.',
        response: "Your answer is quite brief. In a real interview, you'd want to elaborate more. Could you expand on your response? Try to explain your reasoning or give a specific example.",
        followUpQuestionOnly: currentQuestion
      };
    }

    if (localClassification === 'NO_KNOWLEDGE') {
      // Still call LLM but with a specific instruction to simplify
      // Fall through to LLM with special handling below
    }

    // ── STEP 2: Build rich conversation memory ──
    const recentHistory = conversationHistory.slice(-8);
    
    // Extract structured metadata from history
    const scoreHistory = conversationHistory
      .filter(function(e) { return e.score !== undefined; })
      .map(function(e) { return e.score; });
    const classificationHistory = conversationHistory
      .filter(function(e) { return e.classification; })
      .map(function(e) { return e.classification; });
    const detectedSkills = conversationHistory
      .filter(function(e) { return e.detectedSkills; })
      .reduce(function(acc, e) { return acc.concat(e.detectedSkills); }, []);
    const weakAreas = conversationHistory
      .filter(function(e) { return e.weakAreas; })
      .reduce(function(acc, e) { return acc.concat(e.weakAreas); }, []);

    // Format history as structured conversation
    const historyText = recentHistory.map(function(e) {
      let line = e.role + ': ' + e.content;
      if (e.score !== undefined) line += ' [Score: ' + e.score + '/10]';
      if (e.classification) line += ' [Classification: ' + e.classification + ']';
      return line;
    }).join('\n');

    // ── STEP 3: Adaptive difficulty from score trend ──
    const avg = scoreHistory.length
      ? scoreHistory.reduce(function(a, b) { return a + b; }, 0) / scoreHistory.length
      : 5;
    const recentScores = scoreHistory.slice(-3);
    const recentAvg = recentScores.length
      ? recentScores.reduce(function(a, b) { return a + b; }, 0) / recentScores.length
      : 5;
    const trend = recentAvg >= 8 ? 'EXCELLING' : recentAvg >= 6 ? 'PERFORMING_WELL' : recentAvg >= 4 ? 'AVERAGE' : recentAvg >= 2 ? 'STRUGGLING' : 'NEEDS_SUPPORT';

    // Count classifications for pattern detection
    const strongCount = classificationHistory.filter(function(c) { return c === 'STRONG' || c === 'GOOD'; }).length;
    const weakCount = classificationHistory.filter(function(c) { return c === 'WEAK' || c === 'INCORRECT' || c === 'NO_KNOWLEDGE'; }).length;

    // ── STEP 4: Role-specific topic domains ──
    // Use generic topics so we don't force specific frameworks (like React) unless the user brings them up
    const roleTopics = {
      'Frontend Developer':       'frontend architecture, JavaScript/TypeScript fundamentals, UI/UX implementation, state management, performance, accessibility, browser APIs',
      'Backend Developer':        'backend architecture, APIs, databases, authentication, caching, microservices, system design, security, scalability',
      'Full Stack Developer':     'frontend and backend architecture, databases, REST/GraphQL APIs, deployment, CI/CD, authentication, system design',
      'Data Scientist':           'machine learning principles, statistics, data manipulation, data visualization, model evaluation, feature engineering',
      'Machine Learning Engineer':'model training pipelines, data preprocessing, deep learning architectures, MLOps, model deployment',
      'DevOps Engineer':          'containerization, orchestration, CI/CD pipelines, cloud infrastructure, monitoring, Linux, scripting, networking',
      'Mobile Developer':         'mobile UI architecture, state management, native APIs, app deployment, mobile performance optimization',
      'UI/UX Designer':           'user research, wireframing, prototyping, design systems, accessibility, usability testing',
      'Product Manager':          'product roadmap, user stories, prioritization, metrics, stakeholder management, agile methodologies, go-to-market strategy',
      'Software Architect':       'system design, scalability, microservices, design patterns, trade-offs, distributed systems, API design',
      'Software Engineer':        'data structures, algorithms, object-oriented programming, system design, testing, debugging, software principles'
    };

    const topics = roleTopics[role] || (role + ' specific technical concepts, tools, and best practices');

    const difficultyInstruction =
      difficulty === 'faang'    ? 'FAANG-level: ask about scalability, edge cases, system design, algorithmic complexity.' :
      difficulty === 'startup'  ? 'Startup-style: practical, fast-paced, full-stack thinking, real-world problem solving.' :
      difficulty === 'advanced' ? 'Advanced: deep technical questions, optimization, architecture decisions.' :
      difficulty === 'beginner' ? 'Beginner-friendly: focus on fundamentals and basic concepts.' :
      'Mid-level: design patterns, debugging, architecture, best practices.';

    // ── STEP 5: AI Personality & Decision Engine ──
    const personalityMap = {
      'faang': 'Strict FAANG Interviewer (deep technical grilling, pressure-focused)',
      'startup': 'Startup Founder (practical fast questioning, pragmatic)',
      'beginner': 'Friendly HR (supportive, encouraging)',
      'advanced': 'Senior Architect (focuses on trade-offs, architecture)',
      'intermediate': 'Corporate Hiring Manager (balanced, behavioral-heavy)'
    };
    const personality = personalityMap[difficulty] || 'Professional Interviewer';

    let decisionContext = '\nInterview Round: ' + interviewRound + '\n';
    
    // Modify behavior based on Round and Performance
    if (interviewRound === 'Warm-up') {
      decisionContext += 'Context: This is the warm-up round. Keep questions straightforward. Be encouraging.\n';
    } else if (interviewRound === 'Pressure Round') {
      decisionContext += 'Context: This is the PRESSURE ROUND. Challenge their confidence ("Are you sure?"). Ask how it scales. Be skeptical of simple answers. Push for depth.\n';
    } else if (interviewRound === 'Closing Round') {
      decisionContext += 'Context: This is the closing round. Ask reflective or broader architectural questions.\n';
    }

    if (localClassification === 'NO_KNOWLEDGE') {
      decisionContext += '\nIMPORTANT: The candidate said they don\'t know. DO NOT criticize them. Instead:\n' +
        '1. Be supportive ("That\'s okay, interviews can be tough.")\n' +
        '2. Simplify the problem or approach it step-by-step\n' +
        '3. Score MUST be 0-1\n';
    } else if (trend === 'EXCELLING') {
      decisionContext += '\nCandidate is excelling (avg ' + recentAvg.toFixed(1) + '/10). Escalate difficulty immediately. Ask edge cases.\n';
    } else if (trend === 'STRUGGLING' || trend === 'NEEDS_SUPPORT') {
      decisionContext += '\nCandidate is struggling (avg ' + recentAvg.toFixed(1) + '/10). Demonstrate emotional intelligence. Be supportive: "That\'s alright, let\'s simplify this." Ask easier fundamentals.\n';
    }
    
    if (weakCount > 2 && strongCount === 0) {
      decisionContext += '\nPattern: Multiple weak answers. Pivot to a different fundamental topic within ' + role + '.\n';
    }

    // ── STEP 6: Strict system prompt ──
    const systemPrompt =
      'You are AIRA, acting as a ' + personality + ' conducting a live interview for a ' + role + ' position.\n\n' +
      'ABSOLUTE RULES — NEVER BREAK:\n' +
      '1. Behave like a REAL human interviewer, not a chatbot. Use natural speech ("Interesting approach", "Let\'s think deeper about that", "I\'m not fully convinced").\n' +
      '2. NEVER give fake praise. NEVER say "great answer" unless score is 9-10.\n' +
      '3. If they struggle, be professional but realistic. If they excel, escalate difficulty.\n' +
      '4. ALL follow-ups MUST be about ' + role + ' topics: ' + topics + '\n' +
      '5. Follow-ups must relate to the current topic OR dive deeper into technologies they just mentioned.\n' +
      '6. Return ONLY valid JSON. No markdown. No text outside the JSON object.';

    // ── STEP 7: Strict analysis prompt with full context ──
    const prompt =
      'INTERVIEW CONTEXT:\n' +
      'Role: ' + role + '\n' +
      'Difficulty: ' + difficulty + ' — ' + difficultyInstruction + '\n' +
      'Candidate Performance Trend: ' + trend + ' (recent avg: ' + recentAvg.toFixed(1) + '/10, overall avg: ' + avg.toFixed(1) + '/10)\n' +
      (detectedSkills.length > 0 ? 'Detected Strong Skills: ' + [...new Set(detectedSkills)].join(', ') + '\n' : '') +
      (weakAreas.length > 0 ? 'Identified Weak Areas: ' + [...new Set(weakAreas)].join(', ') + '\n' : '') +
      '\n' +
      'CONVERSATION HISTORY (last 8 turns):\n' + (historyText || 'This is the first question.') + '\n\n' +
      'CURRENT QUESTION: "' + currentQuestion + '"\n' +
      'CANDIDATE ANSWER: "' + userAnswer + '"\n\n' +
      decisionContext + '\n' +
      'STEP 1 — Classify the answer STRICTLY:\n' +
      'STRONG (9-10): Technically accurate, deep understanding — deserves genuine praise\n' +
      'GOOD (7-8): Mostly correct — acknowledge what was right, point out gaps\n' +
      'PARTIAL (5-6): Some correct elements — ask for missing parts\n' +
      'WEAK (3-4): Vague — ask simpler version or give hint\n' +
      'INCORRECT (1-2): Factually wrong — correct mistake professionally\n' +
      'NO_KNOWLEDGE (0): "I don\'t know" — simplify question\n' +
      'RANDOM (0): Gibberish — ask to answer seriously\n\n' +
      'STEP 2 — Generate follow-up question:\n' +
      '- STRONG/GOOD → Ask a HARDER follow-up that goes deeper\n' +
      '- PARTIAL → Ask them to clarify the missing part specifically\n' +
      '- WEAK/INCORRECT → Ask a simpler related question to help them recover\n' +
      '- NO_KNOWLEDGE → Rephrase simply or ask about their practical experience with the topic\n' +
      '- RANDOM → Firmly redirect to the question\n' +
      '- The follow-up MUST be about relevant ' + role + ' topics, or dive deeper into the specific technologies the candidate just mentioned\n\n' +
      'STEP 3 — Generate spoken response (2-3 sentences, natural interviewer tone, no lists, no markdown):\n' +
      '- Speak as a ' + personality + '\n' +
      '- Be specific about what was right or wrong\n' +
      '- Sound like a real human interviewer (e.g., "Earlier you mentioned X... How does that relate to Y?")\n\n' +
      'STEP 4 — Detect skills and gaps:\n' +
      '- List any technical skills demonstrated in this answer\n' +
      '- List any weak areas revealed\n\n' +
      'Return ONLY this JSON:\n' +
      '{"classification":"STRONG|GOOD|PARTIAL|WEAK|INCORRECT|NO_KNOWLEDGE|RANDOM","score":<0-10>,"isRelevant":<bool>,"isCorrect":<bool>,"needsRetry":<bool>,"confidenceLevel":"HIGH|MEDIUM|LOW|NONE","feedback":"<internal evaluation with specific technical details>","response":"<2-3 sentence spoken response as AIRA — be specific, natural human phrasing>","followUpQuestionOnly":"<follow-up question strictly about ' + role + ' topics>","detectedSkills":["<skill shown>"],"weakAreas":["<gap identified>"]}';

    // ── STEP 8: Call LLM ──
    const res = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 700
    });

    const parsed = safeParseJSON(res.choices[0].message.content, 'generateConversationalReply');

    // ── STEP 9: Post-process and validate response ──
    if (!parsed.response) throw new Error('AI response missing required field: response');
    if (!parsed.followUpQuestionOnly) parsed.followUpQuestionOnly = currentQuestion;
    if (!parsed.detectedSkills) parsed.detectedSkills = [];
    if (!parsed.weakAreas) parsed.weakAreas = [];
    if (parsed.isCorrect === undefined) parsed.isCorrect = parsed.score >= 6;

    // Guard against LLM giving fake praise for low scores
    if (parsed.score <= 3) {
      const praisePatterns = /\b(great|excellent|amazing|fantastic|wonderful|impressive|brilliant|perfect|outstanding)\b/i;
      if (praisePatterns.test(parsed.response)) {
        // LLM gave praise for a bad answer — override
        parsed.response = parsed.response.replace(praisePatterns, 'noted');
      }
    }

    return parsed;
  }
}

module.exports = new AIService();
