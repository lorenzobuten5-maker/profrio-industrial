---
name: auth-biometric-integrator
description: Integrates WebAuthn biometric authentication (fingerprint/FaceID) for ProFrio Industrial. Covers registration, verification, device compatibility, and fallback flows. Activate when the user wants to enable biometric login or debug biometric auth issues.
---

# Auth Biometric Integrator — ProFrio Industrial

## Architecture (`js/biometric-auth.js`)
- **API**: WebAuthn (Web Authentication API)
- **Support**: Chrome 67+, Safari 14+, Firefox 60+
- **Devices**: Android fingerprint, iPhone FaceID/TouchID, Windows Hello

## Integration Flow

### 1. Check Availability
```javascript
const available = await window.BiometricAuth.isBiometricAvailable();
if (!available) {
  document.getElementById('btn-biometric-login')?.style.setProperty('display', 'none');
}
```

### 2. Register (First-Time Setup)
```javascript
// Call AFTER a successful email/password login:
const registered = await window.BiometricAuth.registerBiometric(userEmail);
if (registered) window.showToast('✅ Acceso biométrico activado', 'success');
```

### 3. Fast Biometric Login (Returning User)
```javascript
if (window.BiometricAuth.isEnabled()) {
  const verified = await window.BiometricAuth.verifyBiometric();
  if (verified) {
    window.location.href = 'dashboard-empleado.html';
  }
}
```

## HTML Button for Login Page
```html
<button id="btn-biometric-login" class="btn btn-secondary" hidden>
  🖐 Acceder con Huella / FaceID
</button>
```

## Security Model
- **Private key never leaves device** — this is a core WebAuthn guarantee
- Only a challenge response is sent over the network
- Works only on HTTPS — Cloudflare Workers provides this ✅
- Credential is tied to browser + device combination

## User Edge Cases
| Scenario | Behavior |
|---|---|
| New device | Must register again after email/password login |
| Browser data cleared | Must register again |
| Unsupported browser | Button hidden, falls back to password |
| Authentication cancelled | Shows error toast, stays on login page |
