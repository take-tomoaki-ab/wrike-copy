const WRIKE_TITLE_SELECTOR = '[aria-label="作業項目タイトル"]'

// コピー操作のトリガー（右クリック・三点リーダー・サイドバーメニュー）からキャプチャしたタイトル。
// 使用後にクリアされる。
let lastCapturedTitle: string | null = null

// テーブルビューの行 / サイドバーのフォルダアイテムからタイトルをキャプチャ
function captureTitle(target: Element): void {
  // テーブルビュー: rowheader を右クリック
  const rowheader = target.closest('[role="rowheader"]')
  if (rowheader) {
    lastCapturedTitle = rowheader.textContent?.trim() ?? null
    return
  }
  // テーブルビュー: 行内の三点リーダーボタン
  const row = target.closest('[role="row"]')
  if (row) {
    const rh = row.querySelector('[role="rowheader"]')
    lastCapturedTitle = rh?.textContent?.trim() ?? null
    return
  }
  // サイドバー: フォルダツリーアイテム
  const treeNode = target.closest('folder-tree-node')
  if (treeNode) {
    const nameEl = treeNode.querySelector('.tree-item-name__button')
    lastCapturedTitle = nameEl?.textContent?.trim() ?? null
  }
}

document.addEventListener('contextmenu', e => captureTitle(e.target as Element), true)
document.addEventListener('click', e => {
  const btn = (e.target as Element).closest('button')
  if (btn) captureTitle(btn)
}, true)

function getTicketTitle(): string | null {
  if (lastCapturedTitle) return lastCapturedTitle
  return document.querySelector<HTMLTextAreaElement>(WRIKE_TITLE_SELECTOR)?.value ?? null
}

async function writeWrikeUrlToClipboard(url: string, fallbackTitle: string): Promise<void> {
  const ticketTitle = getTicketTitle() ?? fallbackTitle
  lastCapturedTitle = null // 使用後にクリア

  const htmlContent = `<a href="${url}">${ticketTitle}</a>`
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([url], { type: 'text/plain' }),
      'text/html': new Blob([htmlContent], { type: 'text/html' })
    })
  ])
  console.log('Wrike URL copied with HTML formatting:', { url, title: ticketTitle })
}

// copy イベント（execCommand fallback 用）
document.addEventListener('copy', async event => {
  try {
    const selection = window.getSelection()
    if (!selection) return
    const copiedText = selection.toString().trim()
    if (copiedText.startsWith('https://www.wrike.com/')) {
      event.preventDefault()
      await writeWrikeUrlToClipboard(copiedText, copiedText)
    }
  } catch (error) {
    console.error('Error processing copy event:', error)
  }
})

// navigator.clipboard.writeText を上書き（manifest の world: "MAIN" で動作）
const originalWriteText = navigator.clipboard.writeText
navigator.clipboard.writeText = async function(text) {
  if (text?.startsWith('https://www.wrike.com/')) {
    try {
      await writeWrikeUrlToClipboard(text, 'Wrike Ticket')
      return
    } catch (error) {
      console.error('Error writing HTML clipboard:', error)
    }
  }
  return originalWriteText.call(this, text)
}
