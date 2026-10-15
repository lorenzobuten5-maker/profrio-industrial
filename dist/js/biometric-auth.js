/**
 * biometric-auth.js — ProFrio Industrial Biometric Auth Manager v25.2
 * Autenticación biométrica nativa (Huella / FaceID) mediante WebAuthn API.
 */

const BiometricAuth = {
  KEY_PREF: 'pf_biometric_enabled',

  isSupported() {
    return window.PublicKeyCredential !== undefined && typeof window.PublicKeyCredential === 'function';
  },

  async isBiometricAvailable() {
    if (!this.isSupported()) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (_) {
      return false;
    }
  },

  isEnabled() {
    return localStorage.getItem(this.KEY_PREF) === 'true';
  },

  async registerBiometric(userEmail) {
    if (!(await this.isBiometricAvailable())) {
      alert('Tu dispositivo no soporta autenticación biométrica (Huella / FaceID).');
      return false;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: 'ProFrio Industrial', id: window.location.hostname },
        user: {
          id: userId,
          name: userEmail,
          displayName: userEmail.split('@')[0]
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
      if (credential) {
        localStorage.setItem(this.KEY_PREF, 'true');
        localStorage.setItem('pf_biometric_user', userEmail);
        if (window.hapticFeedback) window.hapticFeedback([50, 100, 50]);
        alert('✨ Autenticación biométrica registrada con éxito.');
        return true;
      }
    } catch (err) {
      console.warn('[BiometricAuth] Error registrando biometría:', err);
    }
    return false;
  },

  async verifyBiometric() {
    if (!this.isEnabled()) return false;
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required'
      };

      const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
      if (assertion) {
        if (window.hapticFeedback) window.hapticFeedback([40]);
        return true;
      }
    } catch (err) {
      console.warn('[BiometricAuth] Verificación cancelada o fallida:', err);
    }
    return false;
  }
};

window.BiometricAuth = BiometricAuth;
