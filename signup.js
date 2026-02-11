// ===============================
// Supabase config
// ===============================
const SUPABASE_URL = deobfuscate("KTE5XSB/bHo8PE8yLihLSEVDRzs3Lkk9KjY8P2tePjU4T1NDVxgiKg==");
const SUPABASE_ANON_KEY = deobfuscate("JDwHRTECIDwdLGcCECNkA35bfzIMI39mJgAcZAxGOx0PbngJHFM4Dz1OYAgqGjsPVy8dG0VrXXRMGxYEXhorCTkILGR9DDQYB2lcWjMmGndlIRsTKiBDAS8DagdGVmEtMQREJCwgOGs2dxgMb2RfdkdUc3EkYRAPMwwKFEQELxwefFpZAg8/JlUcASAmGyh7fyYaZAR9WHd1Cxl8YgsXEGYLHntrK2RRb1xDc3cMRyIwLTNmA1wdaBR7ZH9fQAAHBV4ABxsQBXF+PithT2t+ew==");

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// Anti-spam cooldown
// ===============================
let locked = false;

// ===============================
// Signup Logic
// ===============================
document.getElementById("signupBtn").addEventListener("click", async () => {

  if (locked) return;
  locked = true;
  setTimeout(() => locked = false, 10000);

  const btn = document.getElementById("signupBtn");
  btn.disabled = true;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  const message = document.getElementById("status");

  message.style.color = "red";
  message.textContent = "";

  if (!email || !password || !confirm) {
    message.textContent = "Please fill all fields.";
    btn.disabled = false;
    return;
  }

  if (password !== confirm) {
    message.textContent = "Passwords do not match.";
    btn.disabled = false;
    return;
  }

  try {

    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("dob").value;
    const blood = document.getElementById("blood").value.trim();
    const allergy = document.getElementById("allergy").value.trim();
    const condition = document.getElementById("condition").value.trim();
    const emergency = document.getElementById("emergency").value.trim();

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          dob: dob,
          blood: blood,
          allergy: allergy,
          medical_conditions: condition,
          emergency_contact_phone: emergency
        }
      }
    });

    if (error) throw error;

    message.style.color = "green";
    message.textContent =
      "Signup successful! Confirm email, then login.";

    setTimeout(() => {
      window.location.href = "signin.html";
    }, 2000);

  } catch (err) {
    message.style.color = "red";
    message.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});
