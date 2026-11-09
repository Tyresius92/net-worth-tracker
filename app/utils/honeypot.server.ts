/**
 * Returns true when the honeypot field rendered by `<Honeypot name={name} />`
 * was filled in, which only bots do.
 */
export const isHoneypotTripped = (
  formData: FormData,
  name: string,
): boolean => {
  const value = formData.get(name);
  return typeof value === "string" && value.length > 0;
};
