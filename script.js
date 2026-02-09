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
let SOS_WEBHOOK_URL = "";
const WEBHOOK_PATH = deobfuscate(window.CONFIG.WEBHOOK_PATH); // "/webhook/sos"

// State to store last AI analysis for SOS
let lastAnalysisResult = null;

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
  list.innerHTML = "<li>Analyzing symptoms...</li>";

  try {
    const response = await fetch(deobfuscate("KTE5XSB/bHo9NUglNzZYRlVAGCAsYkwjLGwjY2pOIyQtAlFfX0YtIDlEPCsw"), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "AEM Emergency Dashboard"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a medical emergency assistant. Analyze the symptoms and return a JSON object with: 'condition' (a short disease name), 'severity' (HIGH, MEDIUM, LOW), and 'recommendations' (an array of 3 concise strings). Only return JSON."
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

    // Resilient parsing logic
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

    // Store in global state for SOS
    lastAnalysisResult = {
      condition: content.condition || "Unknown Condition",
      severity: content.severity || "UNKNOWN",
      recommendations: content.recommendations || []
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
          symptoms: symptoms,
          condition: lastAnalysisResult.condition,
          severity: severity,
          recommendations: lastAnalysisResult.recommendations
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

      if (condition.includes("heart") || condition.includes("cardiac") || condition.includes("chest")) {
        tagsHtml += `<span class="tag"><span class="dot green"></span> Cardiology</span>`;
      } else if (condition.includes("child") || condition.includes("pediatric")) {
        tagsHtml += `<span class="tag"><span class="dot green"></span> Pediatrics</span>`;
      } else if (condition.includes("hormone") || condition.includes("diabetes") || condition.includes("thyroid")) {
        tagsHtml += `<span class="tag"><span class="dot green"></span> Endocrinology</span>`;
      } else {
        tagsHtml += `<span class="tag"><span class="dot green"></span> General Medicine</span>`;
      }
      recommendedFilters.innerHTML = tagsHtml;
    }

    // Update AI recommendations
    list.innerHTML = "";
    (content.recommendations || []).forEach((rec, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${rec}`;
      list.appendChild(li);
    });
  } catch (error) {
    console.error("OpenRouter Error:", error);
    statusEl.textContent = "ERROR";
    list.innerHTML = `<li>Failed to analyze symptoms: ${error.message}</li>`;
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
            console.warn(`Mirror ${mirror} failed with status ${response.status}. Trying next...`);
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
async function loadRecentActivity() {
  const activityCard = document.querySelector(".activity-card");
  if (!activityCard) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // Fetch latest 5 activity logs
    const { data: logs, error } = await supabaseClient
      .from('emergency_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    // Remove old items but keep h3
    const h3 = activityCard.querySelector("h3");
    activityCard.innerHTML = "";
    activityCard.appendChild(h3);

    if (!logs || logs.length === 0) {
      const p = document.createElement("p");
      p.style.padding = "10px";
      p.style.fontSize = "0.85rem";
      p.style.color = "var(--text-secondary)";
      p.textContent = "No recent activity found.";
      activityCard.appendChild(p);
      return;
    }

    logs.forEach(log => {
      const item = document.createElement("div");
      item.className = "activity-item";

      const date = new Date(log.created_at);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const label = log.type === 'sos' ? 'SOS ALERT' : 'AI Analysis';

      item.innerHTML = `
        <div class="date">${formattedDate} <span class="active-status" style="${log.type === 'sos' ? 'color: #E53E3E;' : ''}">${label}</span></div>
        <p>${log.condition || "Emergency Situation"}</p>
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
  const navItems = document.querySelectorAll(".nav-item");

  if (!grid || !colSymptoms || !colMap || !colHistory || !colProfile) return;

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

  switch (viewName) {
    case "dashboard":
      // Show all (default)
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
      break;
    case "profile":
      grid.classList.add("single-col");
      colSymptoms.classList.add("hidden");
      colMap.classList.add("hidden");
      colHistory.classList.add("hidden");
      colProfile.classList.remove("hidden");
      loadProfile();
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

    if (error) throw error;

    if (data) {
      document.getElementById("prof-name").value = data.name || "";
      document.getElementById("prof-dob").value = data.dob || "";
      document.getElementById("prof-blood").value = data.blood || "";
      document.getElementById("prof-ec-name").value = data.emergency_contact_name || "";
      document.getElementById("prof-ec-phone").value = data.emergency_contact_phone || "";
      document.getElementById("prof-conditions").value = data.medical_conditions || "";
      document.getElementById("prof-allergy").value = data.allergy || ""; // Updated ID in HTML as well if needed
    }
  } catch (error) {
    console.error("Load Profile Error:", error);
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
// Init
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  initMap();
  loadRecentActivity();
  initNavigation();

  // Profile Form
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }

  // Load tunnel config
  fetch("tunnel.txt")
    .then(res => res.text())
    .then(url => {
      SOS_WEBHOOK_URL = url.trim() + WEBHOOK_PATH;
    })
    .catch(err => console.warn("Tunnel config not found, using last known or empty:", err));

  const logoutBtn = document.getElementById("logoutBtn");

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Symptom input
  const symptomInput = document.querySelector(".symptom-input input");
  if (symptomInput) {
    symptomInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runSymptomCheck(e.target.value);
      }
    });
  }

  // SOS button
  const sosBtn = document.querySelector(".sos-btn");
  if (sosBtn) {
    sosBtn.addEventListener("click", async () => {
      try {
        const loc = await getUserLocation();
        const { data: { user } } = await supabaseClient.auth.getUser();

        // Prepare SOS payload
        const payload = {
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

        // Notify Webhook
        const response = await fetch(SOS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        // Log to Supabase
        try {
          await supabaseClient.from('emergency_logs').insert({
            user_id: user?.id,
            type: 'sos',
            condition: payload.disease_name,
            severity: payload.severity,
            location: payload.location,
            timestamp: payload.timestamp
          });
          loadRecentActivity();
        } catch (dbErr) {
          console.error("Supabase SOS Log Error:", dbErr);
        }

        if (response.ok) {
          alert(`SOS sent for ${payload.disease_name}. Emergency services notified.`);
        } else {
          console.error("Webhook failed:", response.status);
          alert("SOS sent via local emergency protocol.");
        }
      } catch (error) {
        console.error("SOS Error:", error);
        alert("Location permission is required for SOS.");
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

        // Log to Supabase
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('emergency_logs').insert({
            user_id: user.id,
            type: 'ambulance_call',
            condition: lastAnalysisResult?.condition || "Emergency Situation",
            severity: lastAnalysisResult?.severity || "HIGH",
            timestamp: new Date().toISOString()
          });
          loadRecentActivity();
        }
      } catch (error) {
        console.error("Ambulance Call Error:", error);
      }
    });
  }
}); 
