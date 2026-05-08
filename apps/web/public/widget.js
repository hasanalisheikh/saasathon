"use strict";
(() => {
  // src/index.ts
  (function() {
    var _a;
    const script = document.currentScript;
    const projectId = script == null ? void 0 : script.getAttribute("data-project-id");
    const clientToken = script == null ? void 0 : script.getAttribute("data-client-token");
    const API_URL = ((_a = script == null ? void 0 : script.getAttribute("data-api-url")) != null ? _a : "https://monad.app") + "/api/widget/comment";
    if (!projectId) return;
    let pinCount = 0;
    let commentMode = false;
    const style = document.createElement("style");
    style.textContent = `
    #monad-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      background: #f59e0b; color: #080c14; border: none; border-radius: 6px;
      padding: 10px 16px; font-family: monospace; font-size: 13px; font-weight: 500;
      cursor: pointer; box-shadow: 0 4px 12px rgba(245,158,11,0.4);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    #monad-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(245,158,11,0.5); }
    #monad-btn.active { background: #ef4444; color: #fff; }
    .monad-pin {
      position: absolute; width: 28px; height: 28px; z-index: 99998;
      background: #f59e0b; border-radius: 50%; border: 2px solid #fff;
      cursor: pointer; transform: translate(-50%, -50%);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: bold; color: #080c14;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    #monad-box {
      position: fixed; z-index: 99999;
      background: #0f1624; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 16px; width: 280px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    #monad-box textarea {
      width: 100%; height: 80px; background: #080c14;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;
      color: #f0f4ff; font-family: monospace; font-size: 13px;
      padding: 8px; resize: none; outline: none; box-sizing: border-box;
    }
    #monad-box input {
      width: 100%; background: #080c14;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;
      color: #f0f4ff; font-family: monospace; font-size: 12px;
      padding: 6px 8px; outline: none; box-sizing: border-box; margin-bottom: 8px;
    }
    #monad-box-submit {
      background: #f59e0b; color: #080c14; border: none; border-radius: 4px;
      padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; width: 100%;
    }
    #monad-box-cancel {
      background: none; color: #8892a4; border: none;
      font-size: 12px; cursor: pointer; margin-top: 6px; width: 100%;
    }
    body.monad-comment-mode { cursor: crosshair !important; }
    body.monad-comment-mode * { cursor: crosshair !important; }
  `;
    document.head.appendChild(style);
    const btn = document.createElement("button");
    btn.id = "monad-btn";
    btn.textContent = "\u{1F4AC} Leave a comment";
    document.body.appendChild(btn);
    btn.addEventListener("click", () => {
      commentMode = !commentMode;
      btn.textContent = commentMode ? "\u2715 Cancel" : "\u{1F4AC} Leave a comment";
      btn.classList.toggle("active", commentMode);
      document.body.classList.toggle("monad-comment-mode", commentMode);
      if (!commentMode) removeCommentBox();
    });
    document.addEventListener("click", (e) => {
      if (!commentMode) return;
      if (e.target.closest("#monad-btn, #monad-box")) return;
      e.preventDefault();
      e.stopPropagation();
      const x = e.pageX;
      const y = e.pageY;
      showCommentBox(x, y, (text, name) => {
        placePinAndSubmit(x, y, text, name);
        removeCommentBox();
        commentMode = false;
        btn.textContent = "\u{1F4AC} Leave a comment";
        btn.classList.remove("active");
        document.body.classList.remove("monad-comment-mode");
      });
    }, true);
    let commentBox = null;
    function showCommentBox(x, y, onSubmit) {
      var _a2, _b, _c;
      removeCommentBox();
      const box = document.createElement("div");
      box.id = "monad-box";
      const vw = window.innerWidth;
      const left = x + 20 + 300 > vw ? x - 300 - 10 : x + 20;
      const top = y - 20;
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.innerHTML = `
      <p style="color:#8892a4;font-size:11px;margin:0 0 8px;font-family:monospace">Leave a comment</p>
      <input type="text" placeholder="Your name (optional)" id="monad-name-input" />
      <textarea placeholder="Describe your feedback..." id="monad-text-input"></textarea>
      <button id="monad-box-submit">Submit comment</button>
      <button id="monad-box-cancel">Cancel</button>
    `;
      document.body.appendChild(box);
      commentBox = box;
      (_a2 = box.querySelector("#monad-text-input")) == null ? void 0 : _a2.focus();
      (_b = box.querySelector("#monad-box-submit")) == null ? void 0 : _b.addEventListener("click", () => {
        const text = box.querySelector("#monad-text-input").value.trim();
        const name = box.querySelector("#monad-name-input").value.trim();
        if (!text) return;
        onSubmit(text, name);
      });
      (_c = box.querySelector("#monad-box-cancel")) == null ? void 0 : _c.addEventListener("click", removeCommentBox);
    }
    function removeCommentBox() {
      commentBox == null ? void 0 : commentBox.remove();
      commentBox = null;
    }
    function placePinAndSubmit(x, y, text, name) {
      pinCount++;
      const pin = document.createElement("div");
      pin.className = "monad-pin";
      pin.textContent = String(pinCount);
      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;
      document.body.appendChild(pin);
      const xPct = x / document.documentElement.scrollWidth;
      const yPct = y / document.documentElement.scrollHeight;
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          client_token: clientToken,
          page_url: window.location.href,
          x_position: xPct,
          y_position: yPct,
          comment_text: text,
          client_name: name || null
        })
      }).catch(console.error);
    }
  })();
})();
