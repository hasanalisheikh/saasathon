"use strict";(()=>{(function(){var x;let o=document.currentScript,l=o==null?void 0:o.getAttribute("data-project-id"),v=o==null?void 0:o.getAttribute("data-client-token"),w=((x=o==null?void 0:o.getAttribute("data-api-url"))!=null?x:"https://monad.app")+"/api/widget/comment";if(!l)return;let u=0,a=!1,b=document.createElement("style");b.textContent=`
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
  `,document.head.appendChild(b);let r=document.createElement("button");r.id="monad-btn",r.textContent="\u{1F4AC} Leave a comment",document.body.appendChild(r),r.addEventListener("click",()=>{a=!a,r.textContent=a?"\u2715 Cancel":"\u{1F4AC} Leave a comment",r.classList.toggle("active",a),document.body.classList.toggle("monad-comment-mode",a),a||m()}),document.addEventListener("click",e=>{if(!a||e.target.closest("#monad-btn, #monad-box"))return;e.preventDefault(),e.stopPropagation();let i=e.pageX,d=e.pageY;L(i,d,(t,n)=>{k(i,d,t,n),m(),a=!1,r.textContent="\u{1F4AC} Leave a comment",r.classList.remove("active"),document.body.classList.remove("monad-comment-mode")})},!0);let c=null;function L(e,i,d){var f,g,h;m();let t=document.createElement("div");t.id="monad-box";let n=window.innerWidth,s=e+20+300>n?e-300-10:e+20,p=i-20;t.style.left=`${s}px`,t.style.top=`${p}px`,t.innerHTML=`
      <p style="color:#8892a4;font-size:11px;margin:0 0 8px;font-family:monospace">Leave a comment</p>
      <input type="text" placeholder="Your name (optional)" id="monad-name-input" />
      <textarea placeholder="Describe your feedback..." id="monad-text-input"></textarea>
      <button id="monad-box-submit">Submit comment</button>
      <button id="monad-box-cancel">Cancel</button>
    `,document.body.appendChild(t),c=t,(f=t.querySelector("#monad-text-input"))==null||f.focus(),(g=t.querySelector("#monad-box-submit"))==null||g.addEventListener("click",()=>{let y=t.querySelector("#monad-text-input").value.trim(),E=t.querySelector("#monad-name-input").value.trim();y&&d(y,E)}),(h=t.querySelector("#monad-box-cancel"))==null||h.addEventListener("click",m)}function m(){c==null||c.remove(),c=null}function k(e,i,d,t){u++;let n=document.createElement("div");n.className="monad-pin",n.textContent=String(u),n.style.left=`${e}px`,n.style.top=`${i}px`,document.body.appendChild(n);let s=e/document.documentElement.scrollWidth,p=i/document.documentElement.scrollHeight;fetch(w,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({project_id:l,client_token:v,page_url:window.location.href,x_position:s,y_position:p,comment_text:d,client_name:t||null})}).catch(console.error)}})();})();
