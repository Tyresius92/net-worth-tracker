export const MAX_NAME_LENGTH = 50;

// Matches anything link-like: a scheme ("://", "http:"), "www.", or a bare
// domain such as "example.com".
const LINK_PATTERN = /:\/\/|https?:|www\.|[a-z0-9-]+\.[a-z]{2,}\b/i;

type NameValidationResult =
  | { success: true; data: string }
  | { success: false; error: string };

export const validateName = (
  value: unknown,
  label: string,
): NameValidationResult => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { success: false, error: `${label} is required` };
  }

  if (value.length > MAX_NAME_LENGTH) {
    return { success: false, error: `${label} is too long` };
  }

  if (LINK_PATTERN.test(value)) {
    return { success: false, error: `${label} can't contain links` };
  }

  return { success: true, data: value };
};
