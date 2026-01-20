// CSS selector for Wrike ticket title (to be customized)
const WRIKE_TITLE_SELECTOR = '.title__field';

// Monitor copy events
document.addEventListener('copy', async (event) => {
  try {
    // Get the text that's being copied
    const selection = window.getSelection();
    if (!selection) return;

    const copiedText = selection.toString().trim();

    // Check if it's a Wrike URL
    if (copiedText.startsWith('https://www.wrike.com/')) {
      // Get the ticket title from the page
      const titleElement = document.querySelector<HTMLTextAreaElement>(WRIKE_TITLE_SELECTOR);
      const ticketTitle = titleElement ? titleElement.value : copiedText;

      // Create HTML format for Slack
      const htmlContent = `<a href="${copiedText}">${ticketTitle}</a>`;

      // Prevent default copy behavior
      event.preventDefault();

      // Write both plain text and HTML to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([copiedText], { type: 'text/plain' }),
          'text/html': new Blob([htmlContent], { type: 'text/html' })
        })
      ]);

      console.log('Wrike URL copied with HTML formatting:', { url: copiedText, title: ticketTitle });
    }
  } catch (error) {
    console.error('Error processing copy event:', error);
  }
});

// Alternative approach: Monitor clipboard API usage
const originalWriteText = navigator.clipboard.writeText;
navigator.clipboard.writeText = async function (text) {
  if (text && text.startsWith('https://www.wrike.com/')) {
    // Get the ticket title from the page
    const titleElement = document.querySelector<HTMLTextAreaElement>(WRIKE_TITLE_SELECTOR);
    const ticketTitle = titleElement ? titleElement.value : 'Wrike Ticket';

    // Create HTML format for Slack
    const htmlContent = `<a href="${text}">${ticketTitle}</a>`;

    try {
      // Write both plain text and HTML to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([htmlContent], { type: 'text/html' })
        })
      ]);

      console.log('Wrike URL copied with HTML formatting via writeText:', { url: text, title: ticketTitle });
      return;
    } catch (error) {
      console.error('Error writing HTML clipboard:', error);
    }
  }

  // Fall back to original behavior
  return originalWriteText.call(this, text);
};