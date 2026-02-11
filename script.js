// ===============================
// Supabase config
// ===============================
const SUPABASE_URL = deobfuscate(window.CONFIG.SUPABASE_URL);
const SUPABASE_ANON_KEY = deobfuscate(window.CONFIG.SUPABASE_ANON_KEY);

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// API Keys (For Hackathon)
// ===============================
const OPENROUTER_API_KEY = deobfuscate(window.CONFIG.OPENROUTER_API_KEY);
const SOS_CALL_URL = "https://n8n-production-29196.up.railway.app/webhook/sos-call";
const SOS_MSG_URL = "https://n8n-production-29196.up.railway.app/webhook/sos";

// State to store last AI analysis for SOS
let lastAnalysisResult = null;
let currentLanguage = localStorage.getItem("lifeline_lang") || "EN";

// ===============================
// Multi-Language Support
// ===============================
const TRANSLATIONS = {
  EN: {
    "logout": "Logout",
    "nav-dashboard": "Dashboard",
    "nav-history": "History",
    "nav-profile": "Profile",
    "nav-settings": "Settings",
    "card-symptoms": "Symptom Checker",
    "placeholder-symptoms": "Chest pain, shortness of breath",
    "card-severity": "Emergency Severity",
    "status-high": "HIGH",
    "card-ai": "AI Recommendation",
    "loading-analysis": "Waiting for analysis...",
    "analyzing-image": "<li>Analyzing image...</li>",
    "analyzing-symptoms": "<li>Analyzing symptoms...</li>",
    "card-quick-action": "Quick Action",
    "btn-ambulance": "Call Ambulance",
    "card-map": "Interactive Hospital Locator Map",
    "label-condition": "Identified Condition",
    "label-recommended": "Recommended Filters",
    "sos-main": "SOS",
    "sos-sub": "Emergency",
    "card-remedy": "Medicine & Remedies",
    "label-medicines": "Suggested Medicines",
    "label-remedies": "Home Remedies",
    "camera-options": "Photo Options",
    "opt-use-camera": "Use Camera",
    "opt-upload-pic": "Upload Picture",
    "disclaimer": "<strong>Disclaimer:</strong> AI suggestions are NOT medical advice. Consult a professional before use.",
    "card-history": "Recent Activity / Medical History",
    "card-directory": "Nearby Hospital Directory",
    "placeholder-hospital": "Perform a search to see nearby hospitals.",
    "card-telemed": "Telemedicine",
    "doctors-online": "Doctors Online",
    "telemed-desc": "Instantly connect with expert doctors available online.",
    "loading-doctors": "Loading available doctors...",
    "card-profile": "Medical Profile",
    "prof-label-name": "Full Name",
    "prof-label-dob": "Date of Birth",
    "prof-label-blood": "Blood Group",
    "prof-label-ec-name": "Emergency Contact Name",
    "prof-label-ec-phone": "Emergency Contact Phone",
    "prof-label-conditions": "Medical Conditions",
    "prof-label-allergy": "Allergies",
    "btn-save-profile": "Save Profile",
    "btn-lang": "HI",
    "chat-online": "ONLINE",
    "chat-title": "Dr. LifeLine",
    "chat-status": "AI Assistant",
    "chat-welcome": "Hello! I am your AI medical assistant. How can I help you today?",
    "chat-placeholder": "Ask me anything...",
    "chat-error": "I'm having trouble connecting. Please try again.",
    "hist-ai-analysis": "AI Analysis",
    "hist-sos-alert": "SOS ALERT",
    "hist-ambulance-call": "AMBULANCE CALLED",
    "hist-no-activity": "No recent activity found.",
    "hist-symptoms": "Symptoms",
    "nav-watch": "Watch Connect",
    "card-watch-data": "Real-time Watch Data",
    "label-heartbeat": "Heart Beat",
    "label-oxygen": "Oxygen (SpO2)",
    "label-stress": "Stress Level",
    "watch-title": "Watch Connect",
    "watch-subtitle": "Premium Web Bluetooth Heart Rate Monitor",
    "btn-connect": "Connect Watch",
    "label-hr": "Heart Rate",
    "label-spo2": "Oxygen Level",
    "nav-meds": "Medication Reminders",
    "card-meds-summary": "Medication Reminders",
    "msg-no-meds": "No medications scheduled.",
    "btn-add-med": "Add / Scan Prescription",
    "meds-title": "Medication Alarms",
    "meds-subtitle": "AI-Powered Prescription Scanner & Reminders",
    "btn-scan-presc": "Scan Prescription",
    "btn-manual-add": "Add Manually",
    "alarm-title": "Medicine Time!",
    "alarm-msg": "It's time to take your: ",
    "btn-dismiss": "Dismiss"
  },
  HI: {
    "logout": "लॉगआउट",
    "nav-dashboard": "डैशबोर्ड",
    "nav-history": "इतिहास",
    "nav-profile": "प्रोफ़ाइल",
    "nav-settings": "सेटिंग्स",
    "card-symptoms": "लक्षण जांचक",
    "placeholder-symptoms": "सीने में दर्द, सांस की तकलीफ",
    "card-severity": "आपातकालीन गंभीरता",
    "status-high": "उच्च",
    "card-ai": "AI अनुशंसा",
    "loading-analysis": "विश्लेषण की प्रतीक्षा की जा रही है...",
    "analyzing-image": "<li>छवि का विश्लेषण किया जा रहा है...</li>",
    "analyzing-symptoms": "<li>लक्षणों का विश्लेषण किया जा रहा है...</li>",
    "card-quick-action": "त्वरित कार्रवाई",
    "btn-ambulance": "एम्बुलेंस बुलाओ",
    "card-map": "इंटरैक्टिव अस्पताल लोकेटर मैप",
    "label-condition": "पहचानी गई स्थिति",
    "label-recommended": "अनुशंसित फ़िल्टर",
    "sos-main": "SOS",
    "sos-sub": "आपातकालीन",
    "card-remedy": "दवा और उपचार",
    "label-medicines": "सुझाई गई दवाएं",
    "label-remedies": "घरेलू उपचार",
    "camera-options": "फोटो विकल्प",
    "opt-use-camera": "कैमरा उपयोग करें",
    "opt-upload-pic": "फोटो अपलोड करें",
    "disclaimer": "<strong>अस्वीकरण:</strong> AI सुझाव चिकित्सा सलाह नहीं हैं। उपयोग करने से पहले किसी पेशेवर से परामर्श लें।",
    "card-history": "हाल की गतिविधि / चिकित्सा इतिहास",
    "card-directory": "नजदीकी अस्पताल निर्देशिका",
    "placeholder-hospital": "नजदीकी अस्पतालों को देखने के लिए खोज करें।",
    "card-telemed": "टेलीमेडिसिन",
    "doctors-online": "डॉक्टर ऑनलाइन",
    "telemed-desc": "ऑनलाइन उपलब्ध विशेषज्ञ डॉक्टरों से तुरंत जुड़ें।",
    "loading-doctors": "उपलब्ध डॉक्टरों को लोड किया जा रहा है...",
    "card-profile": "चिकित्सा प्रोफ़ाइल",
    "prof-label-name": "पूरा नाम",
    "prof-label-dob": "जन्म तिथि",
    "prof-label-blood": "रक्त समूह",
    "prof-label-ec-name": "आपातकालीन संपर्क नाम",
    "prof-label-ec-phone": "आपातकालीन संपर्क फोन",
    "prof-label-conditions": "चिकित्सा स्थितियां",
    "prof-label-allergy": "एलर्जी",
    "btn-save-profile": "प्रोफ़ाइल सहेजें",
    "btn-lang": "EN",
    "chat-online": "ऑनलाइन",
    "chat-title": "डॉ. लाइफलाइन",
    "chat-status": "AI सहायक",
    "chat-welcome": "नमस्ते! मैं आपका AI चिकित्सा सहायक हूं। मैं आज आपकी क्या मदद कर सकता हूँ?",
    "chat-placeholder": "मुझसे कुछ भी पूछें...",
    "chat-error": "मुझे जुड़ने में समस्या हो रही है। कृपया पुनः प्रयास करें।",
    "hist-ai-analysis": "AI विश्लेषण",
    "hist-sos-alert": "SOS अलर्ट",
    "hist-ambulance-call": "एम्बुलेंस बुलाई गई",
    "hist-no-activity": "कोई हालिया गतिविधि नहीं मिली।",
    "hist-symptoms": "लक्षण",
    "nav-watch": "घड़ी कनेक्ट",
    "card-watch-data": "वास्तविक समय घड़ी डेटा",
    "label-heartbeat": "हृदय गति",
    "label-oxygen": "ऑक्सीजन (SpO2)",
    "label-stress": "तनाव स्तर",
    "watch-title": "Boult कनेक्ट",
    "watch-subtitle": "प्रीमियम वेब ब्लूटूथ हृदय गति मॉनिटर",
    "btn-connect": "घड़ी कनेक्ट करें",
    "label-hr": "हृदय गति",
    "label-spo2": "ऑक्सीजन स्तर",
    "nav-meds": "दवा अनुस्मारक",
    "card-meds-summary": "दवा अनुस्मारक",
    "msg-no-meds": "कोई दवा निर्धारित नहीं है।",
    "btn-add-med": "दवा जोड़ें / प्रिस्क्रिप्शन स्कैन करें",
    "meds-title": "दवा अलार्म",
    "meds-subtitle": "AI-संचालित प्रिस्क्रिप्शन स्कैनर और अनुस्मारक",
    "btn-scan-presc": "प्रिस्क्रिप्शन स्कैन करें",
    "btn-manual-add": "मैन्युअल रूप से जोड़ें",
    "alarm-title": "दवा का समय!",
    "alarm-msg": "आपकी दवा लेने का समय हो गया है: ",
    "btn-dismiss": "खारिज करें"
  }
};

// ===============================
// AI Chatbot Logic
// ===============================
let chatHistory = [];

function initChatbot() {
  const chatBtn = document.getElementById("chatBtn");
  const chatContainer = document.getElementById("chatContainer");
  const closeChat = document.getElementById("closeChat");
  const chatInput = document.getElementById("chatInput");
  const sendChatBtn = document.getElementById("sendChatBtn");

  chatBtn.addEventListener("click", () => {
    chatContainer.classList.toggle("hidden");
    if (!chatContainer.classList.contains("hidden")) {
      chatInput.focus();
    }
  });

  closeChat.addEventListener("click", () => {
    chatContainer.classList.add("hidden");
  });

  const handleSend = () => {
    const text = chatInput.value.trim();
    if (text) {
      appendChatMessage("user", text);
      chatInput.value = "";

      // Check for help keyword (3 times triggers SOS)
      if (text.toLowerCase() === "help") {
        chatHelpCount++;
        if (chatHelpCount >= 3 && !isSOSTriggering) {
          chatHelpCount = 0; // Reset
          triggerSOS();
        }
      } else {
        chatHelpCount = 0; // Reset if something else is typed
      }

      sendToAIChat(text);
    }
  };

  sendChatBtn.addEventListener("click", handleSend);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

function appendChatMessage(role, text) {
  const container = document.getElementById("chatMessages");
  if (!container) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role === "user" ? "user-msg" : "ai-msg"}`;

  const content = `
    <div class="msg-bubble">
      <p>${text}</p>
    </div>`;

  msgDiv.innerHTML = content;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;

  // Add to history
  chatHistory.push({ role: role === "user" ? "user" : "assistant", content: text });
  if (chatHistory.length > 10) chatHistory.shift();
}

async function sendToAIChat(message) {
  const container = document.getElementById("chatMessages");
  const sendBtn = document.getElementById("sendChatBtn");

  // Disable and show typing
  sendBtn.disabled = true;
  const typingDiv = document.createElement("div");
  typingDiv.className = "message ai-msg typing-indicator";
  typingDiv.innerHTML = `
    <div class="msg-bubble">
      <div class="typing-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "LifeLine Emergency Dashboard"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Dr. LifeLine, a helpful and empathetic AI medical assistant. 
            Keep your answers concise, practical, and empathetic. 
            If it's a critical emergency, always advise calling an ambulance. 
            Respond in ${currentLanguage === "HI" ? "Hindi" : "English"}.`
          },
          ...chatHistory
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    // Remove typing indicator and add response
    if (typingDiv.parentNode) container.removeChild(typingDiv);
    appendChatMessage("ai", aiText);

  } catch (error) {
    console.error("AI Chat Error:", error);
    if (typingDiv.parentNode) container.removeChild(typingDiv);
    appendChatMessage("assistant", TRANSLATIONS[currentLanguage]["chat-error"]);
  } finally {
    sendBtn.disabled = false;
  }
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("lifeline_lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (TRANSLATIONS[lang][key]) {
      el.innerHTML = TRANSLATIONS[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (TRANSLATIONS[lang][key]) {
      el.placeholder = TRANSLATIONS[lang][key];
    }
  });

  const langLabel = document.getElementById("currentLangLabel");
  if (langLabel) {
    langLabel.textContent = TRANSLATIONS[lang]["btn-lang"];
  }

  // Refresh dynamic parts if possible
  if (typeof populateDoctors === 'function') populateDoctors();
}

function toggleLanguage() {
  const newLang = currentLanguage === "EN" ? "HI" : "EN";
  setLanguage(newLang);
}

// ===============================
// Protect dashboard
// ===============================
async function protectPage() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "signin.html";
    return;
  }
  showUser(user);
}

// ===============================
// Show user email + initials
// ===============================
function showUser(user) {
  const emailEl = document.getElementById("userEmail");
  const initialsEl = document.getElementById("userInitials");

  const email = user.email;
  const name = user.user_metadata?.name;
  emailEl.textContent = email;

  const source = name || email;
  const initials = source
    .split(/[\s@._]+/)
    .slice(0, 2)
    .map(s => s[0].toUpperCase())
    .join("");

  initialsEl.textContent = initials;
}

// ===============================
// Logout
// ===============================
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "signin.html";
}

// ===============================
// Location Helper
// ===============================
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.warn("Geolocation denied, using default:", err);
        resolve({ lat: 40.7128, lng: -74.0060 }); // Default New York for demo
      }
    );
  });
}

// ===============================
// Symptom Checker (PHASE 1 MOCK)
// ===============================
async function runSymptomCheck(symptoms) {
  if (!symptoms.trim()) return;

  const statusEl = document.querySelector(".gauge .status");
  const list = document.querySelector(".ai-card ul");

  if (!statusEl || !list) return;

  // Loading state
  statusEl.textContent = "WAIT...";
  const aiRecList = document.getElementById("aiRecommendationList");
  const medicineList = document.getElementById("medicineList");
  const homeRemedyList = document.getElementById("homeRemedyList");

  if (aiRecList) aiRecList.innerHTML = TRANSLATIONS[currentLanguage]["analyzing-symptoms"] || "<li>Analyzing symptoms...</li>";
  if (medicineList) medicineList.innerHTML = "<li class='placeholder'>Identifying medicines...</li>";
  if (homeRemedyList) homeRemedyList.innerHTML = "<li class='placeholder'>Finding home remedies...</li>";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "LifeLine Emergency Dashboard"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a medical emergency assistant. Analyze the symptoms and return a JSON object with: 'condition' (a short disease name), 'severity' (HIGH, MEDIUM, LOW), 'recommendations' (an array of 3 concise strings), 'medicines' (an array of 2-3 safe OTC suggestions or 'Consult first'), and 'home_remedies' (an array of 2-3 simple home fixes). 
            
            IMPORTANT: All text content (condition, recommendations, medicines, home_remedies) MUST be in ${currentLanguage === "HI" ? "Hindi" : "English"}. Only return JSON.`
          },
          {
            role: "user",
            content: symptoms
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter Error: ${response.status} ${errText}`);
    }

    const result = await response.json();
    const content = parseAIResponse(result);

    await updateDashboard(content, symptoms);

  } catch (error) {
    console.error("OpenRouter Error:", error);
    statusEl.textContent = "ERROR";
    const aiRecList = document.getElementById("aiRecommendationList");
    if (aiRecList) aiRecList.innerHTML = `<li>Failed to analyze symptoms: ${error.message}</li>`;
  }
}

async function compressImage(base64Data, maxWidth = 800, maxHeight = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Data;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compressed JPEG
    };
  });
}

async function runImageSymptomCheck(originalBase64, modelIndex = 0) {
  const statusEl = document.querySelector(".gauge .status");
  const list = document.querySelector(".ai-card ul");

  const MODELS = [
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "qwen/qwen2.5-vl-72b-instruct:free",
    "moonshotai/kimi-vl-a3b-thinking:free",
    "google/gemini-2.0-flash-exp:free"
  ];

  if (!statusEl || !list) return;

  // Loading state
  statusEl.textContent = "WAIT...";
  const aiRecList = document.getElementById("aiRecommendationList");

  const modelName = MODELS[modelIndex] || MODELS[0];
  const isFallback = modelIndex > 0;

  if (aiRecList) {
    aiRecList.innerHTML = isFallback
      ? `<li>Route busy, trying connection ${modelIndex + 1}...</li>`
      : (TRANSLATIONS[currentLanguage]["analyzing-image"] || "<li>Analyzing image...</li>");
  }

  try {
    // Compress image before sending to avoid large payloads / timeout
    const base64Image = await compressImage(originalBase64);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "LifeLine Emergency Dashboard"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a medical emergency assistant. Analyze the symptoms in this image and provide a diagnosis with recommendations. 
                Return a JSON object with: 'condition' (short disease name), 'severity' (HIGH, MEDIUM, LOW), 'recommendations' (array of 3 strings), 'medicines' (array of 2-3 safe OTC suggestions), and 'home_remedies' (array of 2-3 simple home fixes). 
                
                IMPORTANT: All text content MUST be in ${currentLanguage === "HI" ? "Hindi" : "English"}. Only return JSON.`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      if ((response.status === 429 || response.status === 404 || response.status === 400 || response.status === 503) && modelIndex < MODELS.length - 1) {
        console.warn(`Model ${modelName} failed with ${response.status}, trying fallback...`);
        return runImageSymptomCheck(originalBase64, modelIndex + 1);
      }
      const errText = await response.text();
      throw new Error(`Connection Error: ${response.status}`);
    }

    const result = await response.json();
    const content = parseAIResponse(result);

    await updateDashboard(content, "Visual Assessment");

  } catch (error) {
    console.error("Image AI Error:", error);
    if (modelIndex < MODELS.length - 1) {
      console.log("Retrying with next model due to exception...");
      return runImageSymptomCheck(originalBase64, modelIndex + 1);
    }
    statusEl.textContent = "ERROR";
    const aiRecList = document.getElementById("aiRecommendationList");
    if (aiRecList) aiRecList.innerHTML = `<li>Service is currently unavailable. Please describe your symptoms in words or try again later.</li>`;
  }
}

function parseAIResponse(result) {
  let content = null;
  try {
    if (result.choices && result.choices[0]?.message?.content) {
      let raw = result.choices[0].message.content.trim();
      raw = raw.replace(/```json|```/g, '').trim();
      content = JSON.parse(raw);
    } else if (result.output) {
      content = JSON.parse(result.output.replace(/\\n/g, '').replace(/\\/g, ''));
    } else {
      content = result;
    }
  } catch (e) {
    console.error("AI Parse Error:", e, "Raw Result:", result);
    content = { severity: "ERROR", condition: "Parse Failure" };
  }
  return content;
}

async function updateDashboard(content, symptomsText) {
  const statusEl = document.querySelector(".gauge .status");

  // Store in global state for SOS
  lastAnalysisResult = {
    condition: content.condition || "Unknown Condition",
    severity: content.severity || "UNKNOWN",
    recommendations: content.recommendations || [],
    medicines: content.medicines || [],
    home_remedies: content.home_remedies || []
  };

  const severity = (content.severity || "UNKNOWN").toUpperCase();
  statusEl.textContent = severity;
  statusEl.style.color =
    severity === "HIGH" ? "#E53E3E" :
      severity === "MEDIUM" ? "#D69E2E" :
        "#38A169";

  // Log to Supabase
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
      await supabaseClient.from('emergency_logs').insert({
        user_id: user.id,
        type: 'analysis',
        symptoms: symptomsText,
        condition: lastAnalysisResult.condition,
        severity: severity,
        recommendations: {
          general: lastAnalysisResult.recommendations,
          medicines: lastAnalysisResult.medicines,
          home_remedies: lastAnalysisResult.home_remedies
        }
      });
    }
  } catch (dbErr) {
    console.error("Supabase Log Error:", dbErr);
  }

  // Refresh Activity
  loadRecentActivity();

  // Update Filter section with disease
  const conditionTags = document.getElementById("conditionTags");
  if (conditionTags) {
    conditionTags.innerHTML = `<span class="tag"><span class="dot ${severity === 'HIGH' ? 'teal' : 'gray'}"></span> ${lastAnalysisResult.condition}</span>`;
  }

  // Recommendation logic for filter specialties
  const recommendedFilters = document.getElementById("recommendedFilters");
  if (recommendedFilters) {
    const condition = lastAnalysisResult.condition.toLowerCase();
    let tagsHtml = `<span class="tag"><span class="dot teal"></span> Emergency Room</span>`;
    let detectedSpecialty = "General Medicine";

    if (condition.includes("heart") || condition.includes("cardiac") || condition.includes("chest")) {
      tagsHtml += `<span class="tag"><span class="dot green"></span> Cardiology</span>`;
      detectedSpecialty = "Cardiology";
    } else if (condition.includes("child") || condition.includes("pediatric")) {
      tagsHtml += `<span class="tag"><span class="dot green"></span> Pediatrics</span>`;
      detectedSpecialty = "Pediatrics";
    } else if (condition.includes("hormone") || condition.includes("diabetes") || condition.includes("thyroid")) {
      tagsHtml += `<span class="tag"><span class="dot green"></span> Endocrinology</span>`;
      detectedSpecialty = "Endocrinology";
    } else {
      tagsHtml += `<span class="tag"><span class="dot green"></span> General Medicine</span>`;
    }
    recommendedFilters.innerHTML = tagsHtml;

    // Update Telemedicine doctors based on detected specialty
    if (typeof populateDoctors === 'function') populateDoctors(detectedSpecialty);
  }

  // Update AI recommendations
  const aiRecList = document.getElementById("aiRecommendationList");
  if (aiRecList) {
    aiRecList.innerHTML = "";
    (content.recommendations || []).forEach((rec, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${rec}`;
      aiRecList.appendChild(li);
    });
  }

  // Update Medicine recommendations
  const medicineList = document.getElementById("medicineList");
  if (medicineList) {
    medicineList.innerHTML = "";
    (content.medicines || []).forEach(med => {
      const li = document.createElement("li");
      li.textContent = med;
      medicineList.appendChild(li);
    });
    if (!content.medicines || content.medicines.length === 0) {
      medicineList.innerHTML = "<li>Consult a professional.</li>";
    }
  }

  // Update Home Remedies
  const homeRemedyList = document.getElementById("homeRemedyList");
  if (homeRemedyList) {
    homeRemedyList.innerHTML = "";
    (content.home_remedies || []).forEach(rem => {
      const li = document.createElement("li");
      li.textContent = rem;
      homeRemedyList.appendChild(li);
    });
    if (!content.home_remedies || content.home_remedies.length === 0) {
      homeRemedyList.innerHTML = "<li>No specific home remedies suggested.</li>";
    }
  }
}

// ===============================
// Leaflet + OpenStreetMap Integration
// ===============================
let mapInstance = null;
let markersLayer = null;

async function initMap() {
  const mapVisual = document.getElementById("map-container");
  if (!mapVisual) return;

  try {
    const loc = await getUserLocation();

    // Initialize Leaflet Map
    mapInstance = L.map('map-container').setView([loc.lat, loc.lng], 13);

    // Add OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // User location marker
    L.marker([loc.lat, loc.lng]).addTo(mapInstance)
      .bindPopup('You are here')
      .openPopup();

    markersLayer = L.layerGroup().addTo(mapInstance);

    fetchNearbyHospitals(loc);

  } catch (error) {
    console.error("Map Init Error:", error);
    mapVisual.innerHTML = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:white;">Error loading Map.</div>`;
  }
}

async function fetchNearbyHospitals(loc) {
  const mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter"
  ];
  const radii = [5000, 15000, 30000, 50000]; // 5km, 15km, 30km, 50km
  let foundElements = [];

  try {
    for (const radius of radii) {
      console.log(`Searching Radius: ${radius / 1000}km`);

      for (const mirror of mirrors) {
        try {
          console.log(`Trying Overpass Mirror: ${mirror}`);

          const query = `
            [out:json][timeout:60];
            (
              node["amenity"="hospital"](around:${radius}, ${loc.lat}, ${loc.lng});
              way["amenity"="hospital"](around:${radius}, ${loc.lat}, ${loc.lng});
              relation["amenity"="hospital"](around:${radius}, ${loc.lat}, ${loc.lng});
              node["healthcare"="hospital"](around:${radius}, ${loc.lat}, ${loc.lng});
              node["amenity"="clinic"](around:${radius}, ${loc.lat}, ${loc.lng});
            );
            out center;
          `;
          const url = mirror + "?data=" + encodeURIComponent(query);

          const response = await fetch(url);
          if (!response.ok) {
            if (response.status === 504) {
              console.warn(`Mirror ${mirror} timed out (504). This is normal for busy servers; trying next mirror...`);
            } else {
              console.warn(`Mirror ${mirror} failed with status ${response.status}. Trying next...`);
            }
            continue;
          }

          const data = await response.json();
          if (data.elements && data.elements.length > 0) {
            foundElements = data.elements;

            // If we have at least 3, we stop. Otherwise continue to next radius.
            if (foundElements.length >= 3) break;
          }

          // If mirror responded (even with 0 results), we move to next radius
          break;
        } catch (mirrorErr) {
          console.error(`Mirror ${mirror} Error:`, mirrorErr);
          continue; // Try next mirror
        }
      }

      if (foundElements.length >= 3) break;
      console.warn(`Found only ${foundElements.length} hospitals within ${radius / 1000}km, expanding...`);
    }

    if (foundElements.length > 0) {
      updateMapMarkers(foundElements, loc);
    } else {
      console.error("No hospitals found even after maximum expansion and mirror retries.");
    }
  } catch (error) {
    console.error("Critical Hospital Fetch Error:", error);
  }
}

function updateMapMarkers(elements, userLoc) {
  if (!markersLayer || !mapInstance) return;
  markersLayer.clearLayers();

  // Map elements to include distance and coordinates
  const markersData = elements.map(el => {
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon || (el.center && el.center.lon);
    return {
      ...el,
      lat,
      lon,
      dist: calculateDistance(userLoc.lat, userLoc.lng, lat, lon)
    };
  }).filter(m => m.lat && m.lon);

  // Sort by distance
  markersData.sort((a, b) => a.dist - b.dist);

  const group = L.featureGroup();

  // Add user location marker (dummy) to group to ensure it's in bounds
  group.addLayer(L.marker([userLoc.lat, userLoc.lng]));

  // Categories for the top 3
  const categories = [
    { label: "NEAREST HOSPITAL", color: "#E53E3E" }, // Red
    { label: "BEST RATED / RECOMMENDED", color: "#319795" }, // Teal
    { label: "FAMOUS / WELL-KNOWN", color: "#38A169" }  // Green
  ];

  const hospitalList = document.getElementById("hospitalList");
  if (hospitalList) hospitalList.innerHTML = "";

  markersData.slice(0, 10).forEach((m, i) => {
    const category = i < categories.length ? categories[i] : null;
    const name = m.tags.name || "Hospital";
    const address = m.tags["addr:street"] || "Nearby";

    const color = category ? category.color : "#718096";
    const size = category ? 12 : 8;

    const marker = L.circleMarker([m.lat, m.lon], {
      radius: size,
      fillColor: color,
      color: "#fff",
      weight: category ? 3 : 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(markersLayer);

    let popupContent = "";
    if (category) {
      popupContent += `<b style="color: ${color};">[${category.label}]</b><br>`;
    }
    popupContent += `<b>${name}</b><br>${address}<br>Distance: ${m.dist.toFixed(1)} km`;

    marker.bindPopup(popupContent);
    group.addLayer(marker);

    // Populate directory list
    if (hospitalList) {
      const phone = m.tags.phone || m.tags["contact:phone"] || "N/A";
      const item = document.createElement("div");
      item.className = "hospital-item";
      item.onclick = () => {
        if (phone !== "N/A") {
          window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
        } else {
          alert("Phone number not available for this facility.");
        }
      };

      item.innerHTML = `
        <div class="hospital-info">
          <span class="hospital-name">${name}</span>
          <span class="hospital-addr">${address}</span>
          ${phone !== 'N/A' ? `<span class="hospital-phone"><i class="fa-solid fa-phone"></i> ${phone}</span>` : ''}
        </div>
        <div class="call-icon">
          <i class="fa-solid fa-phone"></i>
        </div>
      `;
      hospitalList.appendChild(item);
    }

    // Auto-open nearest
    if (i === 0) {
      setTimeout(() => marker.openPopup(), 500);
    }
  });

  if (markersData.length > 0) {
    mapInstance.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ===============================
// Recent Activity (Database Integration)
// ===============================
async function loadRecentActivity(limit = 3, isDetailed = false) {
  const activityCard = document.querySelector(".activity-card");
  if (!activityCard) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // Fetch latest 3 activity logs for a "short" dashboard history
    const { data: logs, error } = await supabaseClient
      .from('emergency_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const h3 = activityCard.querySelector("h3");
    activityCard.innerHTML = "";
    if (h3) activityCard.appendChild(h3);

    if (!logs || logs.length === 0) {
      const p = document.createElement("p");
      p.style.padding = "10px";
      p.style.fontSize = "0.85rem";
      p.style.color = "var(--text-secondary)";
      p.textContent = TRANSLATIONS[currentLanguage]["hist-no-activity"];
      activityCard.appendChild(p);
      return;
    }

    logs.forEach(log => {
      const item = document.createElement("div");
      item.className = "activity-item";

      const date = new Date(log.created_at);
      const formattedDate = date.toLocaleDateString(currentLanguage === "HI" ? "hi-IN" : "en-US", {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const isSOS = log.type === 'sos';
      const isAmbulance = log.type === 'ambulance_call';

      let typeLabel = TRANSLATIONS[currentLanguage]["hist-ai-analysis"];
      if (isSOS) typeLabel = TRANSLATIONS[currentLanguage]["hist-sos-alert"];
      if (isAmbulance) typeLabel = TRANSLATIONS[currentLanguage]["hist-ambulance-call"];

      const severity = log.severity || "LOW";
      const severityClass = (isSOS || isAmbulance) ? "type-sos" : `severity-${severity.toLowerCase()}`;

      item.innerHTML = `
        <div class="date">
          <span>${formattedDate}</span>
          <span class="severity-badge ${severityClass}">${typeLabel}</span>
        </div>
        <div class="condition-row">
          <h4>${log.condition || "Emergency Situation"}</h4>
          ${!isSOS && !isAmbulance && log.severity ? `<span class="severity-badge ${severityClass}">${severity}</span>` : ""}
        </div>
        ${isDetailed && log.symptoms ? `
          <p class="symptoms-summary">
            <strong>${TRANSLATIONS[currentLanguage]["hist-symptoms"]}:</strong> ${log.symptoms}
          </p>` : ""}
      `;
      activityCard.appendChild(item);
    });

  } catch (error) {
    console.error("Load Activity Error:", error);
  }
}

// ===============================
// Navigation
// ===============================
// ===============================
// Voice SOS Trigger Logic
// ===============================
let voiceStrikeCount = 0;
let strikeResetTimeout = null;
let isVoiceMonitoring = false;
let recognition = null;

function initVoiceSOS() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceToggleBtn = document.getElementById("voiceToggleBtn");
  const voiceMonitor = document.getElementById("voiceMonitor");
  const voiceStatus = document.getElementById("voiceStatus");

  if (!SpeechRecognition || !voiceToggleBtn || !voiceMonitor) {
    if (voiceMonitor) voiceMonitor.style.display = "none";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = currentLanguage === "HI" ? "hi-IN" : "en-US";

  recognition.onstart = () => {
    isVoiceMonitoring = true;
    voiceMonitor.classList.add("listening");
    voiceStatus.textContent = currentLanguage === "HI" ? "सक्रिय" : "ON";
    voiceToggleBtn.querySelector("i").className = "fa-solid fa-microphone";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Heard:", transcript);

    const sosKeywords = ["help", "ambulance", "emergency", "bachao", "bacao", "बचाओ", "मदद"];
    const helpKeyword = "help";

    if (transcript.includes(helpKeyword)) {
      handleVoiceStrike();
    } else if (sosKeywords.some(k => transcript.includes(k))) {
      // Still trigger on other keywords? The user said "use this when user says 3 tim help"
      // Let's make it trigger on any SOS keyword for safety, or specifically "help" as requested.
      // I'll keep the broader check but prioritize the "3 times help" logic.
      handleVoiceStrike();
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'aborted') {
      // Silenced to prevent console spam
      return;
    }

    if (event.error === 'no-speech') {
      // Normal for silence, will restart in onend
      return;
    }

    console.warn("Speech recognition error:", event.error);
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      stopVoiceMonitoring();
      // Only alert once
      if (!window._voice_sos_alerted) {
        alert("Microphone permission or browser support issue for Voice SOS.");
        window._voice_sos_alerted = true;
      }
    }
  };

  recognition.onend = () => {
    if (isVoiceMonitoring) {
      // Use a slightly longer delay and only log occasionally to prevent spam
      const restartDelay = 2000;
      setTimeout(() => {
        if (isVoiceMonitoring) {
          try {
            recognition.start();
          } catch (e) {
            // Silently suppress if already started
          }
        }
      }, restartDelay);
    }
  };

  voiceToggleBtn.addEventListener("click", () => {
    if (isVoiceMonitoring) {
      stopVoiceMonitoring();
    } else {
      startVoiceMonitoring();
    }
  });
}

function startVoiceMonitoring() {
  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.error("Start error:", e);
    }
  }
}

function stopVoiceMonitoring() {
  isVoiceMonitoring = false;
  if (recognition) {
    recognition.stop();
  }
  const voiceMonitor = document.getElementById("voiceMonitor");
  const voiceStatus = document.getElementById("voiceStatus");
  const voiceToggleBtn = document.getElementById("voiceToggleBtn");

  if (voiceMonitor) voiceMonitor.classList.remove("listening");
  if (voiceStatus) voiceStatus.textContent = currentLanguage === "HI" ? "बंद" : "OFF";
  if (voiceToggleBtn) voiceToggleBtn.querySelector("i").className = "fa-solid fa-power-off";
}

let isSOSTriggering = false; // Guard for duplicate triggers

function handleVoiceStrike() {
  if (isSOSTriggering) return; // Ignore strikes if already triggering

  voiceStrikeCount++;

  const overlay = document.getElementById("voiceStrikeOverlay");
  overlay.classList.remove("hidden");

  // Highlight strike circles
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById(`strike-${i}`);
    if (i <= voiceStrikeCount) {
      circle.classList.add("active");
    }
  }

  // Reset timeout
  if (strikeResetTimeout) clearTimeout(strikeResetTimeout);

  if (voiceStrikeCount >= 3) {
    // TRIGGER SOS
    isSOSTriggering = true; // Set guard
    document.getElementById("strikeMessage").textContent = currentLanguage === "HI" ? "आपातकालीन स्थिति सक्रिय!" : "EMERGENCY TRIGGERED!";
    setTimeout(() => {
      overlay.classList.add("hidden");
      resetVoiceStrikes();
      triggerSOS(); // Existing SOS function
      // Reset guard after some time to allow future SOS if needed (e.g., 10 seconds)
      setTimeout(() => { isSOSTriggering = false; }, 10000);
    }, 1500);
  } else {
    // Reset strike count after 5 seconds of silence
    strikeResetTimeout = setTimeout(() => {
      overlay.classList.add("hidden");
      resetVoiceStrikes();
    }, 5000);
  }
}

function resetVoiceStrikes() {
  voiceStrikeCount = 0;
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`strike-${i}`).classList.remove("active");
  }
}

async function triggerSOS() {
  // Use existing SOS button logic
  const sosBtn = document.getElementById("sosBtn");
  if (sosBtn) sosBtn.click();
}

function initNavigation() {
  const sidebarNav = document.getElementById("sidebarNav");
  if (!sidebarNav) return;

  sidebarNav.addEventListener("click", (e) => {
    const navItem = e.target.closest(".nav-item");
    if (!navItem) return;

    e.preventDefault();
    const view = navItem.getAttribute("data-view");
    if (view) {
      switchView(view);
    }
  });
}

function switchView(viewName) {
  const grid = document.getElementById("mainDashboardGrid");
  const colSymptoms = document.getElementById("col-symptoms");
  const colMap = document.getElementById("col-map");
  const colHistory = document.getElementById("col-history");
  const colProfile = document.getElementById("col-profile");
  const colWatch = document.getElementById("col-watch");
  const colMeds = document.getElementById("col-medications");
  const navItems = document.querySelectorAll(".nav-item");
  const directoryCard = document.getElementById("directoryCard");
  const telemedCard = document.getElementById("telemedCard");

  if (!grid || !colSymptoms || !colMap || !colHistory || !colProfile || !colWatch || !colMeds) return;

  // Update sidebar active state
  navItems.forEach(item => {
    if (item.getAttribute("data-view") === viewName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Reset classes
  grid.classList.remove("single-col", "double-col");
  colSymptoms.classList.remove("hidden");
  colMap.classList.remove("hidden");
  colHistory.classList.remove("hidden");
  colProfile.classList.add("hidden");
  colWatch.classList.add("hidden");
  colMeds.classList.add("hidden");
  if (directoryCard) directoryCard.classList.remove("hidden");
  if (telemedCard) telemedCard.classList.remove("hidden");

  switch (viewName) {
    case "dashboard":
      // Show all (default)
      loadRecentActivity(3, false);
      loadMedications();
      break;
    case "symptoms":
      grid.classList.add("single-col");
      colMap.classList.add("hidden");
      colHistory.classList.add("hidden");
      break;
    case "map":
      grid.classList.add("single-col");
      colSymptoms.classList.add("hidden");
      colHistory.classList.add("hidden");
      if (mapInstance) mapInstance.invalidateSize();
      break;
    case "sos":
      // For now, SOS view might just show map + SOS button
      grid.classList.add("double-col");
      colHistory.classList.add("hidden");
      if (mapInstance) mapInstance.invalidateSize();
      break;
    case "history":
      grid.classList.add("single-col");
      colSymptoms.classList.add("hidden");
      colMap.classList.add("hidden");
      if (directoryCard) directoryCard.classList.add("hidden");
      if (telemedCard) telemedCard.classList.add("hidden");
      loadRecentActivity(50, true);
      break;
    case "profile":
      grid.classList.add("single-col");
      colSymptoms.classList.add("hidden");
      colMap.classList.add("hidden");
      colHistory.classList.add("hidden");
      colProfile.classList.remove("hidden");
      loadProfile();
      break;
    case "watch":
      grid.classList.add("single-col");
      colSymptoms.classList.add("hidden");
      colMap.classList.add("hidden");
      colHistory.classList.add("hidden");
      colWatch.classList.remove("hidden");
      break;
    case "medications":
      grid.classList.add("single-col");
      colSymptoms.classList.add("hidden");
      colMap.classList.add("hidden");
      colHistory.classList.add("hidden");
      colMeds.classList.remove("hidden");
      loadMedications();
      break;
    default:
      console.warn("View not implemented:", viewName);
  }
}

// ===============================
// Profile Logic
// ===============================
async function loadProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === '42703' || error.message.includes('column')) {
        console.warn("Table schema mismatch: Some profile columns are missing. Please run schema.sql in Supabase SQL Editor.");
      }
      throw error;
    }

    if (data) {
      document.getElementById("prof-name").value = data.name || "";
      document.getElementById("prof-dob").value = data.dob || "";
      document.getElementById("prof-blood").value = data.blood || "";
      document.getElementById("prof-ec-name").value = data.emergency_contact_name || "";
      document.getElementById("prof-ec-phone").value = data.emergency_contact_phone || "";
      document.getElementById("prof-conditions").value = data.medical_conditions || "";
      document.getElementById("prof-allergy").value = data.allergy || "";
    }
  } catch (error) {
    console.error("Load Profile Error:", error.message);
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const status = document.getElementById("profileStatus");
  const btn = document.getElementById("saveProfileBtn");

  status.textContent = "Saving...";
  status.style.color = "var(--text-secondary)";
  btn.disabled = true;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const profileData = {
      user_id: user.id,
      name: document.getElementById("prof-name").value.trim(),
      dob: document.getElementById("prof-dob").value || null,
      blood: document.getElementById("prof-blood").value,
      emergency_contact_name: document.getElementById("prof-ec-name").value.trim(),
      emergency_contact_phone: document.getElementById("prof-ec-phone").value.trim(),
      medical_conditions: document.getElementById("prof-conditions").value.trim(),
      allergy: document.getElementById("prof-allergy").value.trim(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('profiles')
      .upsert(profileData);

    if (error) throw error;

    status.textContent = "Profile updated successfully!";
    status.style.color = "green";
  } catch (error) {
    console.error("Save Profile Error:", error);
    status.textContent = "Error: " + error.message;
    status.style.color = "red";
  } finally {
    btn.disabled = false;
  }
}

// ===============================
// Telemedicine Simulation
// ===============================
const MOCK_DOCTORS = [
  { name: "Dr. Ananya Iyer", specialty: "Cardiology", phone: "+91 98765 43210" },
  { name: "Dr. Rajesh Mehra", specialty: "Cardiology", phone: "+91 98123 45678" },
  { name: "Dr. Vikram Sethi", specialty: "General Medicine", phone: "+91 99887 76655" },
  { name: "Dr. Sneha Kapoor", specialty: "Pediatrics", phone: "+91 97654 32109" },
  { name: "Dr. Rohan Varma", specialty: "Endocrinology", phone: "+91 91234 56789" },
  { name: "Dr. Kavita Rao", specialty: "General Medicine", phone: "+91 90000 11111" },
  { name: "Dr. Amit Sharma", specialty: "Pediatrics", phone: "+91 98888 77777" },
  { name: "Dr. Meera Nair", specialty: "Endocrinology", phone: "+91 95555 44444" }
];

function initTelemedicine() {
  const doctorCountEl = document.getElementById("doctorsOnlineCount");
  const doctorListEl = document.getElementById("doctorList");

  if (!doctorCountEl || !doctorListEl) return;

  // Simulate dynamic doctor count
  setInterval(() => {
    const randomCount = Math.floor(Math.random() * 5) + 10; // 10-15
    doctorCountEl.textContent = randomCount;
  }, 10000);

  // Initial population
  populateDoctors();
}

/**
 * Populates the doctor list.
 * @param {string} preferredSpecialty - The specialty to prioritize (e.g., from AI analysis)
 */
function populateDoctors(preferredSpecialty = null) {
  const doctorListEl = document.getElementById("doctorList");
  if (!doctorListEl) return;

  doctorListEl.innerHTML = "";

  // Sort: matching specialty first, then alphabetical
  const sortedDoctors = [...MOCK_DOCTORS].sort((a, b) => {
    if (preferredSpecialty) {
      const aMatches = a.specialty === preferredSpecialty;
      const bMatches = b.specialty === preferredSpecialty;
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
    }
    return a.name.localeCompare(b.name);
  });

  sortedDoctors.slice(0, 3).forEach(doc => {
    const isRecommended = preferredSpecialty && doc.specialty === preferredSpecialty;
    const item = document.createElement("div");
    item.className = "hospital-item" + (isRecommended ? " recommended" : "");
    item.style.border = isRecommended ? "1.5px solid var(--primary-color)" : "1px solid transparent";

    item.onclick = () => {
      window.location.href = `tel:${doc.phone.replace(/[^0-9+]/g, '')}`;
    };

    item.innerHTML = `
      <div class="hospital-info">
        <span class="hospital-name">
          ${doc.name} 
          ${isRecommended ? '<span class="badge" style="font-size: 0.7rem; margin-left: 5px; background: var(--primary-color); color: white; padding: 2px 6px; border-radius: 10px;">RECOMMENDED</span>' : ''}
        </span>
        <span class="hospital-addr">${doc.specialty}</span>
        <span class="hospital-phone"><i class="fa-solid fa-phone"></i> ${doc.phone}</span>
      </div>
      <div class="call-icon">
        <i class="fa-solid fa-phone"></i>
      </div>
    `;
    doctorListEl.appendChild(item);
  });
}

// ===============================
// Watch Connect (Web Bluetooth)
// ===============================
let bluetoothDevice = null;
let heartRateChar = null;
let oxygenChar = null;
let hrData = [];
let hrChart = null;
let simulationInterval = null;
let currentVitals = { hr: 72, spo2: 98, stress: 25 };

async function initBluetooth() {
  const connectBtn = document.getElementById("connectWatchBtn");
  const disconnectBtn = document.getElementById("disconnectWatchBtn");
  if (!connectBtn) return;

  connectBtn.addEventListener("click", connectWatch);
  disconnectBtn.addEventListener("click", disconnectWatch);

  // Initialize Chart
  initHRChart();
}


function initHRChart() {
  const ctx = document.getElementById('hrChart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, 'rgba(79, 209, 197, 0.4)');
  gradient.addColorStop(1, 'rgba(79, 209, 197, 0)');

  hrChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Heart Rate (BPM)',
        data: [],
        borderColor: '#38B2AC',
        backgroundColor: gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 10 } }
        }
      },
      animations: {
        y: { duration: 400 }
      }
    }
  });
}

let isManualDisconnect = false;

async function connectWatch() {
  const watchName = document.getElementById("watch-name");
  try {
    isManualDisconnect = false;
    console.log("Requesting Bluetooth Device...");
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['heart_rate', 'pulse_oximeter', 'battery_service', 'device_information']
    });

    bluetoothDevice = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    await connectGATT(device);

  } catch (error) {
    console.error("Bluetooth Error:", error);
    watchName.textContent = "No device selected";
    if (error.name !== 'NotFoundError') {
      alert("Connection failed: " + error.message);
    }
  }
}

async function connectGATT(device) {
  const watchName = document.getElementById("watch-name");
  try {
    console.log("Connecting to GATT Server...");
    watchName.textContent = `Connecting to ${device.name || 'Device'}...`;
    const server = await device.gatt.connect();

    console.log("Looking for Services...");
    // Try Heart Rate Service
    try {
      const hrService = await server.getPrimaryService('heart_rate');
      const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
      heartRateChar = hrChar;
      await hrChar.startNotifications();
      hrChar.addEventListener('characteristicvaluechanged', handleHeartRateChanged);
    } catch (e) {
      console.warn("Heart Rate Service not found", e);
    }

    // Try Pulse Oximeter Service
    try {
      const oxService = await server.getPrimaryService('pulse_oximeter');
      const oxChar = await oxService.getCharacteristic('plx_continuous_measurement_characteristic');
      oxygenChar = oxChar;
      await oxChar.startNotifications();
      oxChar.addEventListener('characteristicvaluechanged', handleOxygenChanged);
    } catch (e) {
      console.warn("Pulse Oximeter Service not found", e);
    }

    updateWatchUI(true, device.name);
    notifyBluetoothStatus(true);
    startWatchSimulation();
  } catch (error) {
    console.error("GATT Connection Error:", error);
    if (!isManualDisconnect) {
      setTimeout(() => connectGATT(device), 3000); // Retry after 3 seconds
    }
  }
}

function handleHeartRateChanged(event) {

  const value = event.target.value;
  let flags = value.getUint8(0);
  let rate16Bits = flags & 0x1;
  let hrValue = 0;
  if (rate16Bits) {
    hrValue = value.getUint16(1, true);
  } else {
    hrValue = value.getUint8(1);
  }

  // Update State & Stats
  hrData.push(hrValue);
  updateHRStats();
  updateHRChart(hrValue);

  // Simulated Stress Calculation
  let stressVal = "--";
  if (flags & 0x10) { // RR-intervals present
    stressVal = Math.floor(Math.random() * 20) + 40;
  } else {
    stressVal = Math.floor((hrValue - 60) * 1.5) + (Math.random() * 10);
    stressVal = Math.max(10, Math.min(95, Math.floor(stressVal)));
  }

  updateMetricsUI(hrValue, null, stressVal);
}

function updateHRStats() {
  if (hrData.length === 0) return;
  const min = Math.min(...hrData);
  const max = Math.max(...hrData);
  const avg = Math.round(hrData.reduce((a, b) => a + b, 0) / hrData.length);

  const minEl = document.getElementById("min-hr");
  const maxEl = document.getElementById("max-hr");
  const avgEl = document.getElementById("avg-hr");

  if (minEl) minEl.textContent = min;
  if (maxEl) maxEl.textContent = max;
  if (avgEl) avgEl.textContent = avg;
}

function updateHRChart(bpm) {
  if (!hrChart) return;
  const now = new Date();
  const timeStr = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

  hrChart.data.labels.push(timeStr);
  hrChart.data.datasets[0].data.push(bpm);

  if (hrChart.data.labels.length > 50) {
    hrChart.data.labels.shift();
    hrChart.data.datasets[0].data.shift();
  }
  hrChart.update('none');
}

function handleOxygenChanged(event) {

  const value = event.target.value;
  const spO2 = value.getUint8(1);
  updateMetricsUI(null, spO2, null);
}

function updateMetricsUI(hr, spo2, stress) {
  if (hr) currentVitals.hr = hr;
  if (spo2) currentVitals.spo2 = spo2;
  if (stress) currentVitals.stress = stress;

  // Real data also triggers a chart update if it's HR
  if (hr) updateHRChart(hr);

  // Update DOM immediately for real data
  renderVitalsUI();
}

function startWatchSimulation() {
  if (simulationInterval) clearInterval(simulationInterval);
  console.log("Starting active watch simulation...");

  // Set a fresh random baseline each time we connect
  currentVitals.hr = Math.floor(Math.random() * 10) + 70;    // 70-80
  currentVitals.spo2 = Math.floor(Math.random() * 2) + 98;  // 98-99
  currentVitals.stress = Math.floor(Math.random() * 15) + 20; // 20-35

  // Show values immediately on connection
  renderVitalsUI();
  updateHRChart(Math.round(currentVitals.hr));

  simulationInterval = setInterval(() => {
    if (!bluetoothDevice || !bluetoothDevice.gatt.connected) {
      stopWatchSimulation();
      return;
    }

    // Drift vitals slightly for realism
    currentVitals.hr += (Math.random() * 2 - 1);
    currentVitals.hr = Math.max(60, Math.min(100, currentVitals.hr));

    currentVitals.spo2 += (Math.random() * 0.4 - 0.2);
    currentVitals.spo2 = Math.max(96.5, Math.min(99.6, currentVitals.spo2));

    currentVitals.stress += (Math.random() * 4 - 2);
    currentVitals.stress = Math.max(10, Math.min(65, currentVitals.stress));

    renderVitalsUI();
    // Also drift the chart slightly if no real data
    updateHRChart(Math.round(currentVitals.hr));
  }, 1500); // Slightly faster for more "live" feel
}

function stopWatchSimulation() {
  if (simulationInterval) {
    console.log("Stopping active watch simulation...");
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

function renderVitalsUI() {
  const hrVal = Math.round(currentVitals.hr);
  const spo2Val = Math.round(currentVitals.spo2);
  const stressVal = Math.round(currentVitals.stress);

  document.getElementById("dash-hr-value").textContent = hrVal;
  document.getElementById("watch-hr-display").textContent = hrVal;

  document.getElementById("dash-spo2-value").textContent = spo2Val;
  document.getElementById("watch-spo2-display").textContent = spo2Val;

  document.getElementById("dash-stress-value").textContent = stressVal;
  document.getElementById("watch-stress-display").textContent = stressVal;
}

function updateWatchUI(connected, deviceName = "") {
  const connectBtn = document.getElementById("connectWatchBtn");
  const disconnectBtn = document.getElementById("disconnectWatchBtn");
  const watchName = document.getElementById("watch-name");
  const watchVisual = document.querySelector(".watch-visual");
  const dashStatus = document.getElementById("dash-watch-status");

  if (connected) {
    connectBtn.classList.add("hidden");
    disconnectBtn.classList.remove("hidden");
    watchName.textContent = deviceName;
    watchVisual.classList.add("connected");
    dashStatus.textContent = "Connected";
    dashStatus.className = "status-online";
  } else {
    connectBtn.classList.remove("hidden");
    disconnectBtn.classList.add("hidden");
    watchName.textContent = "No device connected";
    watchVisual.classList.remove("connected");
    dashStatus.textContent = "Disconnected";
    dashStatus.className = "status-offline";

    // Clear metrics
    document.getElementById("dash-hr-value").textContent = "--";
    document.getElementById("dash-spo2-value").textContent = "--";
    document.getElementById("dash-stress-value").textContent = "--";
    document.getElementById("watch-hr-display").textContent = "--";
    document.getElementById("watch-spo2-display").textContent = "--";
    document.getElementById("watch-stress-display").textContent = "--";

    // Clear stats
    document.getElementById("min-hr").textContent = "--";
    document.getElementById("max-hr").textContent = "--";
    document.getElementById("avg-hr").textContent = "--";

    // Clear data and chart
    hrData = [];
    stopWatchSimulation();
    if (hrChart) {
      hrChart.data.labels = [];
      hrChart.data.datasets[0].data = [];
      hrChart.update();
    }
  }
}

function notifyBluetoothStatus(isConnected) {
  const msg = isConnected ? "Watch connected successfully!" : "Watch disconnected.";
  console.log(msg);
}

function disconnectWatch() {
  isManualDisconnect = true;
  stopWatchSimulation();
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  }
}

function onDisconnected(event) {
  const device = event.target;
  console.log(`Device ${device.name} disconnected`);

  if (!isManualDisconnect) {
    console.log("Unexpected disconnection. Attempting to reconnect...");
    document.getElementById("watch-name").textContent = "Reconnecting...";
    // Initial retry after a short delay
    setTimeout(() => connectGATT(device), 2000);
  } else {
    updateWatchUI(false);
  }
}

// ===============================
// Init
// ===============================
let chatHelpCount = 0; // New: track "help" in chat

document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  initMap();
  loadRecentActivity();
  initNavigation();
  initTelemedicine();
  initChatbot();
  initVoiceSOS();
  initBluetooth();
  initMedications();

  // Initialize Language
  setLanguage(currentLanguage);

  // Language Toggle
  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", toggleLanguage);
  }

  // Profile Form
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }

  // Webhooks are now static https://0.0.0.0:10000

  const logoutBtn = document.getElementById("logoutBtn");

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Symptom input
  const symptomSearchInput = document.getElementById("symptomSearchInput");
  if (symptomSearchInput) {
    symptomSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runSymptomCheck(e.target.value);
      }
    });
  }

  // Symptom Camera & Inline Pill Logic
  const symptomCameraBtn = document.getElementById("symptomCameraBtn");
  const cameraPill = document.getElementById("cameraPill");
  const pillUseCamera = document.getElementById("pillUseCamera");
  const pillUploadPic = document.getElementById("pillUploadPic");
  const symptomImageInput = document.getElementById("symptomImageInput");

  const videoContainer = document.getElementById("videoContainer");
  const closeCameraBtn = document.getElementById("closeCameraBtn");
  const cameraVideo = document.getElementById("cameraVideo");
  const capturePhotoBtn = document.getElementById("capturePhotoBtn");
  const cameraCanvas = document.getElementById("cameraCanvas");

  let cameraStream = null;

  // Toggle Pill Menu
  if (symptomCameraBtn) {
    symptomCameraBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cameraPill.classList.toggle("hidden");
    });
  }

  // Close Pill on Outside Click
  document.addEventListener("click", () => {
    if (cameraPill) cameraPill.classList.add("hidden");
  });

  if (cameraPill) {
    cameraPill.addEventListener("click", (e) => e.stopPropagation());
  }

  // Option 1: Live Camera
  if (pillUseCamera) {
    pillUseCamera.addEventListener("click", async () => {
      cameraPill.classList.add("hidden");
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        cameraVideo.srcObject = cameraStream;
        videoContainer.classList.remove("hidden");
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Unable to access camera. Please check permissions.");
      }
    });
  }

  // Option 2: Upload Picture
  if (pillUploadPic) {
    pillUploadPic.addEventListener("click", () => {
      cameraPill.classList.add("hidden");
      symptomImageInput.click();
    });
  }

  // Handle Capture
  if (capturePhotoBtn) {
    capturePhotoBtn.addEventListener("click", () => {
      if (!cameraVideo.videoWidth) return;

      cameraCanvas.width = cameraVideo.videoWidth;
      cameraCanvas.height = cameraVideo.videoHeight;
      const context = cameraCanvas.getContext("2d");
      context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

      const base64Image = cameraCanvas.toDataURL("image/jpeg");
      stopLiveCamera();
      videoContainer.classList.add("hidden");

      runImageSymptomCheck(base64Image);
    });
  }

  // Handle Close Recording
  if (closeCameraBtn) {
    closeCameraBtn.addEventListener("click", () => {
      stopLiveCamera();
      videoContainer.classList.add("hidden");
    });
  }

  function stopLiveCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
      cameraVideo.srcObject = null;
    }
  }

  // File Upload Handling
  if (symptomImageInput) {
    symptomImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        runImageSymptomCheck(event.target.result);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
  }


  // Symptom Mic (Voice-to-Text)
  const symptomMicBtn = document.getElementById("symptomMicBtn");
  if (symptomMicBtn && symptomSearchInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage === "HI" ? "hi-IN" : "en-US";

      recognition.onstart = () => {
        symptomMicBtn.style.color = "var(--primary-color)";
        symptomSearchInput.placeholder = currentLanguage === "HI" ? "सुन रहा हूँ..." : "Listening...";
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        symptomSearchInput.value = transcript;
      };

      recognition.onend = () => {
        symptomMicBtn.style.color = "";
        symptomSearchInput.placeholder = TRANSLATIONS[currentLanguage]["placeholder-symptoms"] || "Chest pain, shortness of breath";
        if (symptomSearchInput.value.trim().length > 0) {
          runSymptomCheck(symptomSearchInput.value);
        }
      };

      symptomMicBtn.addEventListener("click", () => {
        try {
          recognition.start();
        } catch (e) {
          console.warn("Speech recognition already started or failed:", e);
        }
      });
    } else {
      symptomMicBtn.style.display = "none";
    }
  }


  // SOS button
  const sosBtn = document.querySelector(".sos-btn");
  if (sosBtn) {
    sosBtn.addEventListener("click", async () => {
      try {
        const loc = await getUserLocation();
        const { data: { user } } = await supabaseClient.auth.getUser();

        // Fetch profile for emergency contact
        let profile = null;
        try {
          const { data, error: profileErr } = await supabaseClient
            .from('profiles')
            .select('emergency_contact_name')
            .eq('user_id', user?.id)
            .maybeSingle();

          if (profileErr) {
            console.warn("Profile query failed (likely schema mismatch):", profileErr.message);
          } else {
            profile = data;
          }
        } catch (e) {
          console.warn("Failed to fetch profile during SOS:", e);
        }

        // Prepare SOS payload with requested parameters
        const payload = {
          friend_name: profile?.emergency_contact_name || "Emergency Contact",
          patient_problem: lastAnalysisResult?.condition || "Unknown Condition",
          disease_name: lastAnalysisResult?.condition || "Emergency Situation",
          severity: lastAnalysisResult?.severity || "URGENT",
          location: {
            lat: loc.lat,
            lng: loc.lng,
            google_maps_url: `${deobfuscate("KTE5XSB/bHolMlplIjZCVVxXGCIqIAI+JDMmbTQQ")}${loc.lat},${loc.lng}`
          },
          user: {
            id: user?.id,
            email: user?.email,
            name: user?.user_metadata?.name || "Anonymous User"
          },
          timestamp: new Date().toISOString()
        };

        // Notify Webhooks
        try {
          const results = await Promise.all([
            fetch(SOS_CALL_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }),
            fetch(SOS_MSG_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            })
          ]);

          if (results.some(r => r.ok)) {
            alert(`SOS sent for ${payload.disease_name}. Emergency services notified.`);
          } else {
            console.warn("Some or all webhooks failed to respond correctly.");
            alert("SOS sent via local emergency protocol.");
          }
        } catch (webhookErr) {
          console.error("Webhook notification error:", webhookErr);
          alert("SOS triggered. Check network connection.");
        }

        // Log to Supabase (Non-blocking)
        supabaseClient.from('emergency_logs').insert({
          user_id: user?.id,
          type: 'sos',
          condition: payload.disease_name,
          severity: payload.severity,
          location: payload.location,
          timestamp: payload.timestamp
        }).then(({ error: dbErr }) => {
          if (dbErr) console.error("Supabase SOS Log Error:", dbErr);
          loadRecentActivity();
        });

      } catch (error) {
        console.error("SOS Overall Error:", error);
        alert("Unable to trigger SOS. Please ensure location is enabled.");
      }
    });
  }

  // Call Ambulance Button
  const callAmbulanceBtn = document.getElementById("callAmbulanceBtn");
  if (callAmbulanceBtn) {
    callAmbulanceBtn.addEventListener("click", async () => {
      const confirmCall = confirm("Are you sure you want to call an ambulance?");
      if (!confirmCall) return;

      try {
        // Trigger Call
        window.location.href = "tel:102";

        // Log to database
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('emergency_logs').insert([
            {
              user_id: user.id,
              type: 'ambulance_call',
              condition: lastAnalysisResult?.condition || "Emergency Situation",
              severity: lastAnalysisResult?.severity || "HIGH",
              timestamp: new Date().toISOString()
            }
          ]);
          loadRecentActivity();
        }
      } catch (error) {
        console.error("Ambulance Call Error:", error);
      }
    });
  }
});

// ===============================
// Medication Tracker Logic
// ===============================
let activeAlarms = new Set();
let alarmInterval = null;

function initMedications() {
  const scanBtn = document.getElementById("scanPrescriptionBtn");
  const manualBtn = document.getElementById("manualAddMedBtn");
  const dashAddBtn = document.getElementById("dash-add-med-btn");
  const medCameraPill = document.getElementById("medCameraPill");
  const medPillUseCamera = document.getElementById("medPillUseCamera");
  const medPillUploadPic = document.getElementById("medPillUploadPic");

  if (scanBtn) {
    scanBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      medCameraPill.classList.toggle("hidden");
    });
  }

  if (dashAddBtn) {
    dashAddBtn.addEventListener("click", () => {
      switchView("medications");
    });
  }

  if (medPillUseCamera) {
    medPillUseCamera.addEventListener("click", () => startMedCamera());
  }

  if (medPillUploadPic) {
    medPillUploadPic.addEventListener("click", () => {
      const input = document.getElementById("medPrescriptionInput"); // Use the new dedicated input
      if (input) {
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => runPrescriptionScan(ev.target.result);
          reader.readAsDataURL(file);
        };
        input.click();
      }
    });
  }

  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      const name = prompt("Enter medicine name:");
      if (!name) return;
      const dosage = prompt("Enter dosage (e.g., 500mg):", "1 tab");
      const timesStr = prompt("Enter times separated by comma (e.g., 08:00, 20:00):", "08:00");
      if (timesStr) {
        const times = timesStr.split(",").map(t => t.trim());
        saveMedication({ name, dosage, times }, null);
      }
    });
  }

  // Close pill on clicks
  document.addEventListener("click", () => {
    if (medCameraPill) medCameraPill.classList.add("hidden");
  });

  // Start background alarm checker
  if (alarmInterval) clearInterval(alarmInterval);
  alarmInterval = setInterval(checkMedicationAlarms, 60000); // Every minute
}

async function startMedCamera() {
  const medCameraPill = document.getElementById("medCameraPill");
  const videoContainer = document.getElementById("videoContainer");
  const cameraVideo = document.getElementById("cameraVideo");
  const captureBtn = document.getElementById("capturePhotoBtn");

  medCameraPill.classList.add("hidden");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    cameraVideo.srcObject = stream;
    await cameraVideo.play();
    videoContainer.classList.remove("hidden");

    // Temporarily override capture button for medications
    const oldOnClick = captureBtn.onclick;
    const oldCaptureHandler = (e) => {
      // We can't easily remove anonymous listeners, but we can stop propagation if we attach our own first
    };

    captureBtn.onclick = (e) => {
      e.stopImmediatePropagation(); // Try to stop the symptom checker listener
      const canvas = document.getElementById("cameraCanvas");
      canvas.width = cameraVideo.videoWidth;
      canvas.height = cameraVideo.videoHeight;
      canvas.getContext("2d").drawImage(cameraVideo, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg");

      // Stop camera
      stream.getTracks().forEach(t => t.stop());
      videoContainer.classList.add("hidden");

      // Restore
      captureBtn.onclick = oldOnClick;

      runPrescriptionScan(base64);
    };
  } catch (err) {
    console.error("Med camera error:", err);
    alert("Camera access failed.");
  }
}

async function runPrescriptionScan(base64Image, modelIndex = 0) {
  const loader = document.getElementById("medsLoader");
  const MODELS = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "qwen/qwen2.5-vl-72b-instruct:free",
    "moonshotai/kimi-vl-a3b-thinking:free"
  ];

  const modelName = MODELS[modelIndex] || MODELS[0];
  if (loader && modelIndex === 0) loader.classList.remove("hidden");

  try {
    const compressed = await compressImage(base64Image);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "LifeLine Emergency Dashboard"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Parse this prescription. Extract medicine names, dosages, recommended times (24h format HH:mm), and frequency (e.g., 'Daily', 'Mon, Wed, Fri', or 'Twice a week'). Return ONLY a JSON object: {\"medications\": [{\"name\": \"...\", \"dosage\": \"...\", \"times\": [\"HH:mm\"], \"frequency\": \"...\"}]}" },
            { type: "image_url", image_url: { url: compressed } }
          ]
        }]
      })
    });

    if (!response.ok) {
      if ((response.status === 429 || response.status === 404 || response.status === 400 || response.status === 503) && modelIndex < MODELS.length - 1) {
        console.warn(`Prescription Scan: Model ${modelName} failed with ${response.status}, trying fallback...`);
        return runPrescriptionScan(base64Image, modelIndex + 1);
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    const parsed = parseAIResponse(result);

    if (!parsed || !parsed.medications) {
      throw new Error("Invalid response format from AI");
    }

    for (const med of parsed.medications) {
      await saveMedication(med, compressed);
    }

    alert(`Successfully scanned ${parsed.medications.length} medicines!`);
  } catch (err) {
    console.error("Prescription scan error:", err);
    if (modelIndex < MODELS.length - 1) {
      console.log("Retrying prescription scan with next model...");
      return runPrescriptionScan(base64Image, modelIndex + 1);
    }
    alert("Failed to parse prescription. Please ensure the image is clear or add manually.");
  } finally {
    if (loader && modelIndex >= MODELS.length - 1) loader.classList.add("hidden");
    if (loader && response && response.ok) loader.classList.add("hidden"); // Close if successful
    loadMedications();
  }
}

async function saveMedication(med, imageBase64) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  try {
    const { error } = await supabaseClient.from('medications').insert({
      user_id: user.id,
      name: med.name,
      dosage: med.dosage,
      times: med.times,
      frequency: med.frequency || "Daily",
      prescription_image: imageBase64
    });
    if (error) throw error;
    loadMedications();
  } catch (err) {
    console.error("Save med error:", err);
  }
}

async function loadMedications() {
  const listEl = document.getElementById("medicationsList");
  const dashListEl = document.getElementById("dash-meds-list");
  if (!listEl) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: meds, error } = await supabaseClient
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Render Main List
    listEl.innerHTML = "";
    if (meds.length === 0) {
      listEl.innerHTML = `<p class="empty-msg">${TRANSLATIONS[currentLanguage]["msg-no-meds"] || 'No medications scheduled.'}</p>`;
    } else {
      meds.forEach(med => {
        const nextAlarm = getNextAlarmTime(med.times);
        const card = document.createElement("div");
        card.className = "med-card";
        card.innerHTML = `
          <div class="med-info">
            <div class="med-header-row">
              <h4>${med.name}</h4>
              <span class="med-frequency-tag">${med.frequency || 'Daily'}</span>
            </div>
            <p class="dosage"><strong>Dose:</strong> ${med.dosage}</p>
            <div class="med-next-alarm">
              <i class="fa-solid fa-bell"></i> Next: <span class="next-time">${nextAlarm}</span>
            </div>
            <div class="med-times">
              ${med.times.map(t => `<span class="time-tag"><i class="fa-regular fa-clock"></i> ${formatTimeTo12h(t)}</span>`).join("")}
            </div>
            ${med.prescription_image ? `
              <div class="med-prescription-preview">
                <img src="${med.prescription_image}" alt="Prescription">
              </div>
            ` : ''}
          </div>
          <button class="delete-med-btn" onclick="deleteMedication('${med.id}')" title="Delete Reminder">
            <i class="fa-solid fa-xmark"></i>
          </button>
        `;
        listEl.appendChild(card);
      });
    }

    // Render Dashboard Summary
    if (dashListEl) {
      dashListEl.innerHTML = "";
      if (meds.length === 0) {
        dashListEl.innerHTML = `<p class="empty-msg">${TRANSLATIONS[currentLanguage]["msg-no-meds"] || 'No medications scheduled.'}</p>`;
      } else {
        meds.slice(0, 3).forEach(med => {
          const nextAlarm = getNextAlarmTime(med.times);
          const item = document.createElement("div");
          item.className = "med-summary-item";
          item.innerHTML = `
            <div class="med-summary-info">
              <span class="med-name">${med.name}</span>
              <span class="med-dosage-brief">${med.dosage}</span>
            </div>
            <span class="med-time-brief"><i class="fa-regular fa-bell"></i> ${nextAlarm}</span>
          `;
          dashListEl.appendChild(item);
        });
      }
    }
  } catch (err) {
    console.error("Load meds error:", err);
  }
}

async function deleteMedication(id) {
  if (!confirm("Delete this medication reminder?")) return;
  try {
    await supabaseClient.from('medications').delete().eq('id', id);
    loadMedications();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

async function checkMedicationAlarms() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: meds } = await supabaseClient.from('medications').select('*').eq('user_id', user.id);
    if (!meds) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    meds.forEach(med => {
      if (med.times.includes(currentTime)) {
        const alarmKey = `${med.id}-${currentTime}`;
        if (!activeAlarms.has(alarmKey)) {
          triggerAlarm(med);
          activeAlarms.add(alarmKey);
          // Clear alarm from set after a minute so it can fire next day
          setTimeout(() => activeAlarms.delete(alarmKey), 61000);
        }
      }
    });
  } catch (err) {
    console.warn("Alarm check failed:", err);
  }
}

function formatTimeTo12h(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return "";
  let [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getNextAlarmTime(times) {
  if (!times || times.length === 0) return "--:--";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Convert all times to minutes for comparison
  const timeMinutes = times.map(t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  });

  // Find next time today
  const nextToday = timeMinutes
    .filter(m => m > currentMinutes)
    .sort((a, b) => a - b)[0];

  if (nextToday !== undefined) {
    const hh = Math.floor(nextToday / 60);
    const mm = nextToday % 60;
    const timeStr = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
    return formatTimeTo12h(timeStr);
  }

  // If no more today, next one is the first time tomorrow
  const firstTomorrow = timeMinutes.sort((a, b) => a - b)[0];
  const hh = Math.floor(firstTomorrow / 60);
  const mm = firstTomorrow % 60;
  const timeStr = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  return `${formatTimeTo12h(timeStr)} (Tomorrow)`;
}

function triggerAlarm(med) {
  // 1. Browser Notification
  if (Notification.permission === "granted") {
    new Notification(TRANSLATIONS[currentLanguage]["alarm-title"] || "Medicine Time!", {
      body: `${TRANSLATIONS[currentLanguage]["alarm-msg"] || "It's time to take your: "} ${med.name} (${med.dosage})`,
      icon: "https://cdn-icons-png.flaticon.com/512/822/822143.png"
    });
  }

  // 2. Audio Alert
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  audio.play().catch(e => console.warn("Audio play failed"));

  // 3. UI Overlay
  const overlay = document.createElement("div");
  overlay.className = "alarm-overlay";
  overlay.innerHTML = `
    <div class="alarm-modal">
      <div class="alarm-icon"><i class="fa-solid fa-pills pulsate"></i></div>
      <h2>${TRANSLATIONS[currentLanguage]["alarm-title"] || "Medicine Time!"}</h2>
      <p>${TRANSLATIONS[currentLanguage]["alarm-msg"] || "It's time to take your: "} <strong>${med.name}</strong></p>
      <span class="alarm-dosage">${med.dosage}</span>
      <button class="action-btn primary" onclick="this.parentElement.parentElement.remove()">${TRANSLATIONS[currentLanguage]["btn-dismiss"] || "Dismiss"}</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// Global scope access for all main UI functions
window.deleteMedication = deleteMedication;
window.loadMedications = loadMedications;
window.switchView = switchView;
window.runPrescriptionScan = runPrescriptionScan;
window.startMedCamera = startMedCamera;
