export default async function isOnline(timeout: number = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 5000);

    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
