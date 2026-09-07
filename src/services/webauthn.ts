/**
 * WebAuthn / Passkey Biometric Service
 * Allows device-level biometric/PIN unlock where supported by browser & OS.
 */

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function isWebAuthnSupported(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

export const registerPasskey = registerBiometricCredential;
export const verifyPasskey = verifyBiometricCredential;

export async function registerBiometricCredential(
  userId: string,
  userName: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = new TextEncoder().encode(userId);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Team Hub Local',
          id: window.location.hostname === 'localhost' ? 'localhost' : undefined,
        },
        user: {
          id: userIdBuffer,
          name: userName || 'Local User',
          displayName: userName || 'Local User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;

    if (credential && credential.id) {
      return { success: true, credentialId: credential.id };
    }
    return { success: false, error: 'Failed to create biometric credential' };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric registration was canceled or timed out.' };
    }
    return { success: false, error: err.message || 'Unable to register biometric credential' };
  }
}

export async function verifyBiometricCredential(credentialId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const allowCredentials: PublicKeyCredentialDescriptor[] = [];

    if (credentialId) {
      try {
        allowCredentials.push({
          id: base64ToBuffer(credentialId),
          type: 'public-key',
        });
      } catch {
        // Fallback: allow any platform credential if conversion fails
      }
    }

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: 'preferred',
        timeout: 60000,
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      },
    });

    if (assertion) {
      return { success: true };
    }
    return { success: false, error: 'Biometric verification failed' };
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric verification was canceled.' };
    }
    return { success: false, error: err.message || 'Biometric verification error' };
  }
}
