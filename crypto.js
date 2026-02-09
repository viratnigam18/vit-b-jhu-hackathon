const SECRET_KEY = "AEM-SECURE-KEY-2026";

/**
 * Basic XOR-based de-obfuscation.
 * Not cryptographically secure, but hides keys from plain text.
 */
function deobfuscate(text) {
    try {
        const decoded = atob(text);
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return result;
    } catch (e) {
        console.error("Deobfuscation failed:", e);
        return "";
    }
}

// Attach to window for global access
window.deobfuscate = deobfuscate;
