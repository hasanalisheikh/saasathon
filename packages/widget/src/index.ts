// Monad Website Commenting Widget
// Embed from your configured Monad deployment and include both data-project-id and data-client-token.

(function () {
  const script = document.currentScript as HTMLScriptElement | null
  const projectId = script?.getAttribute('data-project-id')
  const clientToken = script?.getAttribute('data-client-token')
  const apiBaseUrl = script?.getAttribute('data-api-url') ?? inferApiBaseUrl(script)

  if (!projectId || !apiBaseUrl) return

  const API_URL = `${apiBaseUrl}/api/widget/comment`

  let pinCount = 0
  let commentMode = false

  // ─── Styles ───────────────────────────────────────────────────────────────
  const style = document.createElement('style')
  style.textContent = `
    #monad-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      background: #171717; color: #ffffff; border: none; border-radius: 6px;
      padding: 10px 16px; font-family: Inter, sans-serif; font-size: 13px; font-weight: 500;
      cursor: pointer; box-shadow: 0 4px 12px rgba(23,23,23,0.4);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    #monad-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(23,23,23,0.5); }
    #monad-btn.active { background: #ef4444; color: #fff; }
    .monad-pin {
      position: absolute; width: 28px; height: 28px; z-index: 99998;
      background: #171717; border-radius: 50%; border: 2px solid #fff;
      cursor: pointer; transform: translate(-50%, -50%);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: bold; color: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    #monad-box {
      position: fixed; z-index: 99999;
      background: #ffffff; border: 1px solid #e5e5e5;
      border-radius: 8px; padding: 16px; width: 280px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    #monad-box textarea {
      width: 100%; height: 80px; background: #ffffff;
      border: 1px solid #d4d4d4; border-radius: 4px;
      color: #171717; font-family: Inter, sans-serif; font-size: 13px;
      padding: 8px; resize: none; outline: none; box-sizing: border-box;
    }
    #monad-box input {
      width: 100%; background: #ffffff;
      border: 1px solid #d4d4d4; border-radius: 4px;
      color: #171717; font-family: Inter, sans-serif; font-size: 12px;
      padding: 6px 8px; outline: none; box-sizing: border-box; margin-bottom: 8px;
    }
    #monad-box-submit {
      background: #171717; color: #ffffff; border: none; border-radius: 4px;
      padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; width: 100%;
    }
    #monad-box-cancel {
      background: none; color: #737373; border: none;
      font-size: 12px; cursor: pointer; margin-top: 6px; width: 100%;
    }
    body.monad-comment-mode { cursor: crosshair !important; }
    body.monad-comment-mode * { cursor: crosshair !important; }
  `
  document.head.appendChild(style)

  // ─── Toggle button ────────────────────────────────────────────────────────
  const btn = document.createElement('button')
  btn.id = 'monad-btn'
  btn.textContent = '💬 Leave a comment'
  document.body.appendChild(btn)

  btn.addEventListener('click', () => {
    commentMode = !commentMode
    btn.textContent = commentMode ? '✕ Cancel' : '💬 Leave a comment'
    btn.classList.toggle('active', commentMode)
    document.body.classList.toggle('monad-comment-mode', commentMode)
    if (!commentMode) removeCommentBox()
  })

  // ─── Click-to-pin ─────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!commentMode) return
    if ((e.target as HTMLElement).closest('#monad-btn, #monad-box')) return

    e.preventDefault()
    e.stopPropagation()

    const x = e.pageX
    const y = e.pageY

    showCommentBox(x, y, (text, name) => {
      placePinAndSubmit(x, y, text, name)
      removeCommentBox()
      commentMode = false
      btn.textContent = '💬 Leave a comment'
      btn.classList.remove('active')
      document.body.classList.remove('monad-comment-mode')
    })
  }, true)

  // ─── Comment box ──────────────────────────────────────────────────────────
  let commentBox: HTMLElement | null = null

  function showCommentBox(x: number, y: number, onSubmit: (text: string, name: string) => void) {
    removeCommentBox()

    const box = document.createElement('div')
    box.id = 'monad-box'

    const vw = window.innerWidth
    const left = x + 20 + 300 > vw ? x - 300 - 10 : x + 20
    const top = y - 20

    box.style.left = `${left}px`
    box.style.top = `${top}px`

    box.innerHTML = `
      <p style="color:#737373;font-size:11px;margin:0 0 8px;font-family:Inter, sans-serif">Leave a comment</p>
      <input type="text" placeholder="Your name (optional)" id="monad-name-input" />
      <textarea placeholder="Describe your feedback..." id="monad-text-input"></textarea>
      <button id="monad-box-submit">Submit comment</button>
      <button id="monad-box-cancel">Cancel</button>
    `

    document.body.appendChild(box)
    commentBox = box;

    (box.querySelector('#monad-text-input') as HTMLTextAreaElement)?.focus()

    box.querySelector('#monad-box-submit')?.addEventListener('click', () => {
      const text = (box.querySelector('#monad-text-input') as HTMLTextAreaElement).value.trim()
      const name = (box.querySelector('#monad-name-input') as HTMLInputElement).value.trim()
      if (!text) return
      onSubmit(text, name)
    })

    box.querySelector('#monad-box-cancel')?.addEventListener('click', removeCommentBox)
  }

  function removeCommentBox() {
    commentBox?.remove()
    commentBox = null
  }

  // ─── Pin + submit ─────────────────────────────────────────────────────────
  function placePinAndSubmit(x: number, y: number, text: string, name: string) {
    pinCount++

    const pin = document.createElement('div')
    pin.className = 'monad-pin'
    pin.textContent = String(pinCount)
    pin.style.left = `${x}px`
    pin.style.top = `${y}px`
    document.body.appendChild(pin)

    const xPct = x / document.documentElement.scrollWidth
    const yPct = y / document.documentElement.scrollHeight

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        client_token: clientToken,
        page_url: window.location.href,
        x_position: xPct,
        y_position: yPct,
        comment_text: text,
        client_name: name || null,
      }),
    }).catch(console.error)
  }

  function inferApiBaseUrl(currentScript: HTMLScriptElement | null) {
    const scriptSrc = currentScript?.src?.trim()
    if (!scriptSrc) return null

    try {
      return new URL(scriptSrc).origin
    } catch {
      return null
    }
  }
})()
