# AI Interviewer Avatar Update Guide

## Quick Steps to Replace the Avatar Image

### 1. Get Your New Avatar Image
You can either:
- Use an AI image generator (recommended)
- Use a stock photo
- Use your own image

**Recommended AI Generator:**
- Go to: https://www.myaiart.io/features/ai-professional-woman-generator/
- Or: https://leonardo.ai (free tier)

**Prompt to use:**
```
Professional Indian woman AI interviewer, age 25-30, warm friendly smile, 
brown eyes, long dark wavy hair, wearing black blazer over white shirt, 
modern office background with soft lighting, looking at camera, 
headshot portrait, photorealistic, high quality, professional photography, 
centered composition
```

### 2. Image Requirements
- **Format:** PNG or JPG
- **Size:** At least 800x800 pixels (1024x1024 recommended)
- **Aspect Ratio:** Square (1:1) for best results
- **Quality:** High resolution for crisp display

### 3. Replace the File
**Location:** 
```
ai-interview-platform/frontend/src/assets/ai_interviewer_avatar.png
```

**Steps:**
1. Save your new image as `ai_interviewer_avatar.png`
2. Navigate to the folder above
3. Delete or rename the old `ai_interviewer_avatar.png`
4. Paste your new image with the exact same name
5. Refresh your browser (Ctrl + F5 to clear cache)

### 4. Verify the Change
1. Start your frontend: `npm start` (in frontend folder)
2. Navigate to Live AI Interview mode
3. The new avatar should appear with:
   - ✨ Animated gradient border ring
   - 💎 Glassmorphism status badge
   - 🌟 Glowing effects based on AI state
   - 🎯 Smooth animations

## Current Enhancements Applied

Your AI avatar now includes:
- **Rotating gradient border** (changes color with AI state)
- **Premium glass effect badge** showing "Listening", "Speaking", etc.
- **Glow effects** that pulse based on activity
- **Scale animations** when listening
- **Professional styling** that works with any portrait image

## Need Help?

If the avatar doesn't update:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Restart the development server
4. Check console for errors (F12)

## Free Stock Photo Sites

If you prefer stock photos:
- **Pexels:** https://www.pexels.com/search/professional%20woman%20portrait/
- **Unsplash:** https://unsplash.com/s/photos/business-woman
- **Freepik:** https://www.freepik.com/free-photos-vectors/professional-woman

Search terms: "professional woman portrait", "business woman headshot", "corporate woman"

---

**Note:** The image file must be named exactly `ai_interviewer_avatar.png` for it to work!
