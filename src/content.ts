// CSS selector for Wrike ticket title (to be customized)
const WRIKE_TITLE_SELECTOR = '.title__field'
const WRIKE_MENU_DIALOG = 'WRIKE-MENU-V2'

let menuKind: 'sidebar' | null = null
let selectedMenu: string | null = null

// Watch menu dialog
const menuObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (mutation.type !== 'childList') return

    Array.from(mutation.addedNodes).forEach(node => {
      if ((node as Element).tagName === WRIKE_MENU_DIALOG) {
        menuKind = 'sidebar'
        const selectedRow = document.querySelector('.folder-tree-item--context-menu-open .tree-item-name__button-text')
        if (selectedRow) selectedMenu = selectedRow.textContent
      }
    })

    // Remove menu kind after copy
    Array.from(mutation.removedNodes).forEach(node => {
      if ((node as Element).tagName === WRIKE_MENU_DIALOG) {
        setTimeout(() => {
          menuKind = null
        }, 1000);
      }
    })
  }
})
menuObserver.observe(document.body, {
  childList: true,
  subtree: false
})

/**
 * Get the ticket title from the page
 * @returns The ticket title or null if not found
 */
function getTicketTitle(): string | null {
  if (menuKind === 'sidebar') { // menu on sidebar
    return selectedMenu
  }

  const titleElement = document.querySelector<HTMLTextAreaElement>(WRIKE_TITLE_SELECTOR);
  return titleElement ? titleElement.value : null;
}

/**
 * Write Wrike URL with HTML formatting to clipboard
 * @param url - The Wrike URL
 * @param fallbackTitle - Fallback title if no title found on page
 */
async function writeWrikeUrlToClipboard(url: string, fallbackTitle: string): Promise<void> {
  const ticketTitle = getTicketTitle() ?? fallbackTitle;
  const htmlContent = `<a href="${url}">${ticketTitle}</a>`;

  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([url], { type: 'text/plain' }),
      'text/html': new Blob([htmlContent], { type: 'text/html' })
    })
  ]);

  console.log('Wrike URL copied with HTML formatting:', { url, title: ticketTitle });
}

// Monitor copy events
document.addEventListener('copy', async (event) => {
  try {
    const selection = window.getSelection();
    if (!selection) return;

    const copiedText = selection.toString().trim();

    // Check if it's a Wrike URL
    if (copiedText.startsWith('https://www.wrike.com/')) {
      event.preventDefault();
      await writeWrikeUrlToClipboard(copiedText, copiedText);
    }
  } catch (error) {
    console.error('Error processing copy event:', error);
  }
});

// Alternative approach: Monitor clipboard API usage
const originalWriteText = navigator.clipboard.writeText;
navigator.clipboard.writeText = async function (text) {
  if (text && text.startsWith('https://www.wrike.com/')) {
    try {
      await writeWrikeUrlToClipboard(text, 'Wrike Ticket');
      return;
    } catch (error) {
      console.error('Error writing HTML clipboard:', error);
    }
  }

  // Fall back to original behavior
  return originalWriteText.call(this, text);
};