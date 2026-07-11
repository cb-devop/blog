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

let securitySettings: SecuritySettings = { ...defaultSecuritySettings };

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
    passwordRequireUppercase: Boolean(data.passwordRequireUppercase),
    passwordRequireLowercase: Boolean(data.passwordRequireLowercase),
    passwordRequireNumbers: Boolean(data.passwordRequireNumbers),
    passwordRequireSpecialChars: Boolean(data.passwordRequireSpecialChars),
    sessionTimeoutHours: clamp(data.sessionTimeoutHours, 1, 720) ?? securitySettings.sessionTimeoutHours,
    maxConcurrentSessions: clamp(data.maxConcurrentSessions, 1, 100) ?? securitySettings.maxConcurrentSessions,
    auditLogEnabled: Boolean(data.auditLogEnabled),
    auditLogMaxEntries: clamp(data.auditLogMaxEntries, 100, 10000) ?? securitySettings.auditLogMaxEntries,
    allowRegistration: Boolean(data.allowRegistration),
    enableTwoFactorAuth: Boolean(data.enableTwoFactorAuth),
    enableHSTS: Boolean(data.enableHSTS),
    enableXFrameOptions: Boolean(data.enableXFrameOptions),
    enableXSSProtection: Boolean(data.enableXSSProtection),
    enableCSP: Boolean(data.enableCSP),
  };

  // Ensure passwordMaxLength >= passwordMinLength
  if (securitySettings.passwordMaxLength < securitySettings.passwordMinLength) {
    securitySettings.passwordMaxLength = securitySettings.passwordMinLength + 4;
  }

  return { ...securitySettings };
}

function clamp(value: number | undefined, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  return Math.max(min, Math.min(max, Math.round(value)));
}
