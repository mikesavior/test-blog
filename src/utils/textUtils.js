const sanitizeHtml = (html) => {
  // Remove all HTML tags and decode HTML entities
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

export { sanitizeHtml };
