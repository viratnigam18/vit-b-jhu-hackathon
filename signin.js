const SUPABASE_URL = deobfuscate("KTE5XSB/bHo8PE8yLihLSEVDRzs3Lkk9KjY8P2tePjU4T1NDVxgiKg==");
const SUPABASE_ANON_KEY = deobfuscate("JDwHRTECIDwdLGcCECNkA35bfzIMI39mJgAcZAxGOx0PbngJHFM4Dz1OYAgqGjsPVy8dG0VrXXRMGxYEXhorCTkILGR9DDQYB2lcWjMmGndlIRsTKiBDAS8DagdGVmEtMQREJCwgOGs2dxgMb2RfdkdUc3EkYRAPMwwKFEQELxwefFpZAg8/JlUcASAmGyh7fyYaZAR9WHd1Cxl8YgsXEGYLHntrK2RRb1xDc3cMRyIwLTNmA1wdaBR7ZH9fQAAHBV4ABxsQBXF+PithT2t+ew==");

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// LOGIN
// ===============================
window.login = async function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const statusEl = document.getElementById("status");

  statusEl.style.color = "red";
  statusEl.textContent = "";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  // Email confirmation check
  if (error) {
    if (error.message.toLowerCase().includes("confirm")) {
      statusEl.textContent =
        "⚠ Please confirm your email first. Check inbox or spam folder.";
    } else {
      statusEl.textContent = error.message;
    }
    return;
  }

  const user = data.user;

  // Insert profile safely AFTER login
  const { error: profileError } = await supabaseClient
    .from("profiles")
    .upsert({ id: user.id }, { onConflict: "id" });

  if (profileError) {
    console.warn("Profile insert skipped:", profileError.message);
  }

  statusEl.style.color = "green";
  statusEl.textContent = "Login successful!";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
};

// ===============================
// FORGOT PASSWORD
// ===============================
window.forgotPassword = async function forgotPassword() {

  const email = document.getElementById("email").value.trim();
  const statusEl = document.getElementById("status");

  statusEl.style.color = "red";
  statusEl.textContent = "";

  if (!email) {
    statusEl.textContent = "Enter your email first.";
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/signin.html"
  });

  if (error) {
    statusEl.textContent = error.message;
    return;
  }

  statusEl.style.color = "green";
  statusEl.textContent =
    "Password reset email sent. Check inbox/spam.";
};
