"use strict";(()=>{(function(){var x;let o=document.currentScript,p=o==null?void 0:o.getAttribute("data-project-id"),v=o==null?void 0:o.getAttribute("data-client-token"),w=((x=o==null?void 0:o.getAttribute("data-api-url"))!=null?x:"https://monad.app")+"/api/widget/comment";if(!p)return;let u=0,r=!1,f=document.createElement("style");f.textContent=`
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
  `,document.head.appendChild(f);let d=document.createElement("button");d.id="monad-btn",d.textContent="\u{1F4AC} Leave a comment",document.body.appendChild(d),d.addEventListener("click",()=>{r=!r,d.textContent=r?"\u2715 Cancel":"\u{1F4AC} Leave a comment",d.classList.toggle("active",r),document.body.classList.toggle("monad-comment-mode",r),r||s()}),document.addEventListener("click",e=>{if(!r||e.target.closest("#monad-btn, #monad-box"))return;e.preventDefault(),e.stopPropagation();let a=e.pageX,i=e.pageY;L(a,i,(t,n)=>{k(a,i,t,n),s(),r=!1,d.textContent="\u{1F4AC} Leave a comment",d.classList.remove("active"),document.body.classList.remove("monad-comment-mode")})},!0);let c=null;function L(e,a,i){var b,g,h;s();let t=document.createElement("div");t.id="monad-box";let n=window.innerWidth,m=e+20+300>n?e-300-10:e+20,l=a-20;t.style.left=`${m}px`,t.style.top=`${l}px`,t.innerHTML=`
      <p style="color:#737373;font-size:11px;margin:0 0 8px;font-family:Inter, sans-serif">Leave a comment</p>
      <input type="text" placeholder="Your name (optional)" id="monad-name-input" />
      <textarea placeholder="Describe your feedback..." id="monad-text-input"></textarea>
      <button id="monad-box-submit">Submit comment</button>
      <button id="monad-box-cancel">Cancel</button>
    `,document.body.appendChild(t),c=t,(b=t.querySelector("#monad-text-input"))==null||b.focus(),(g=t.querySelector("#monad-box-submit"))==null||g.addEventListener("click",()=>{let y=t.querySelector("#monad-text-input").value.trim(),E=t.querySelector("#monad-name-input").value.trim();y&&i(y,E)}),(h=t.querySelector("#monad-box-cancel"))==null||h.addEventListener("click",s)}function s(){c==null||c.remove(),c=null}function k(e,a,i,t){u++;let n=document.createElement("div");n.className="monad-pin",n.textContent=String(u),n.style.left=`${e}px`,n.style.top=`${a}px`,document.body.appendChild(n);let m=e/document.documentElement.scrollWidth,l=a/document.documentElement.scrollHeight;fetch(w,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({project_id:p,client_token:v,page_url:window.location.href,x_position:m,y_position:l,comment_text:i,client_name:t||null})}).catch(console.error)}})();})();
