import { loadJsonFile, saveJsonFile } from "./persistent-store";

export interface SecuritySettings {
  // Login rate limiting
  loginMaxAttempts: number;
  loginWindowMinutes: number;
  // Signup rate limiting
  signupMaxAttempts: number;
  signupWindowMinutes: number;
  // Password policy
  passwordMinLength: number;
  passwordMaxLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  // Session settings
  sessionTimeoutHours: number;
  maxConcurrentSessions: number;
  // Audit log settings
  auditLogEnabled: boolean;
  auditLogMaxEntries: number;
  // Registration
  allowRegistration: boolean;
  // Security features
  enableTwoFactorAuth: boolean;
  // Security headers
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
  enableXSSProtection: boolean;
  enableCSP: boolean;
}

export const defaultSecuritySettings: SecuritySettings = {
  loginMaxAttempts: 5,
  loginWindowMinutes: 15,
  signupMaxAttempts: 3,
  signupWindowMinutes: 60,
  passwordMinLength: 8,
  passwordMaxLength: 128,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: false,
  sessionTimeoutHours: 24,
  maxConcurrentSessions: 5,
  auditLogEnabled: true,
  auditLogMaxEntries: 1000,
  allowRegistration: true,
  enableTwoFactorAuth: false,
  enableHSTS: true,
  enableXFrameOptions: true,
  enableXSSProtection: true,
  enableCSP: false,
};

// Load persisted settings from disk so changes survive server restarts.
let securitySettings: SecuritySettings = loadJsonFile("security-settings.json", defaultSecuritySettings);

export function getSecuritySettings(): SecuritySettings {
  return { ...securitySettings };
}

export function updateSecuritySettings(data: Partial<SecuritySettings>): SecuritySettings {
  securitySettings = {
    ...securitySettings,
    loginMaxAttempts: clamp(data.loginMaxAttempts, 1, 100) ?? securitySettings.loginMaxAttempts,
    loginWindowMinutes: clamp(data.loginWindowMinutes, 1, 1440) ?? securitySettings.loginWindowMinutes,
    signupMaxAttempts: clamp(data.signupMaxAttempts, 1, 100) ?? securitySettings.signupMaxAttempts,
    signupWindowMinutes: clamp(data.signupWindowMinutes, 1, 1440) ?? securitySettings.signupWindowMinutes,
    passwordMinLength: clamp(data.passwordMinLength, 4, 64) ?? securitySettings.passwordMinLength,
    passwordMaxLength: clamp(data.passwordMaxLength, 8, 256) ?? securitySettings.passwordMaxLength,
    passwordRequireUppercase: data.passwordRequireUppercase ?? securitySettings.passwordRequireUppercase,
    passwordRequireLowercase: data.passwordRequireLowercase ?? securitySettings.passwordRequireLowercase,
    passwordRequireNumbers: data.passwordRequireNumbers ?? securitySettings.passwordRequireNumbers,
    passwordRequireSpecialChars: data.passwordRequireSpecialChars ?? securitySettings.passwordRequireSpecialChars,
    sessionTimeoutHours: clamp(data.sessionTimeoutHours, 1, 720) ?? securitySettings.sessionTimeoutHours,
    maxConcurrentSessions: clamp(data.maxConcurrentSessions, 1, 100) ?? securitySettings.maxConcurrentSessions,
    auditLogEnabled: data.auditLogEnabled ?? securitySettings.auditLogEnabled,
    auditLogMaxEntries: clamp(data.auditLogMaxEntries, 100, 10000) ?? securitySettings.auditLogMaxEntries,
    allowRegistration: data.allowRegistration ?? securitySettings.allowRegistration,
    enableTwoFactorAuth: data.enableTwoFactorAuth ?? securitySettings.enableTwoFactorAuth,
    enableHSTS: data.enableHSTS ?? securitySettings.enableHSTS,
    enableXFrameOptions: data.enableXFrameOptions ?? securitySettings.enableXFrameOptions,
    enableXSSProtection: data.enableXSSProtection ?? securitySettings.enableXSSProtection,
    enableCSP: data.enableCSP ?? securitySettings.enableCSP,
  };

  // Ensure passwordMaxLength >= passwordMinLength
  if (securitySettings.passwordMaxLength < securitySettings.passwordMinLength) {
    securitySettings.passwordMaxLength = securitySettings.passwordMinLength + 4;
  }

  saveJsonFile("security-settings.json", securitySettings);
  return { ...securitySettings };
}

function clamp(value: number | undefined, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  return Math.max(min, Math.min(max, Math.round(value)));
}
