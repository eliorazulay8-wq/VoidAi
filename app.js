const $ = (id) => document.getElementById(id);
const welcome = $("welcome"), chatArea = $("chatArea"), messages = $("messages");
let chats = JSON.parse(localStorage.getItem("voidai_chats") || "[]");
let currentChat = null;
let backend = localStorage.getItem("voidai_backend") || "";

function persist(){ localStorage.setItem("voidai_chats", JSON.stringify(chats)); }
function escapeHTML(s){ return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function renderHistory(){
  const el=$("historyList");
  if(!chats.length){el.innerHTML='<div class="empty-history">Your conversations<br>will appear here.</div>';return;}
  el.innerHTML="";
  chats.slice().reverse().forEach(chat=>{
    const b=document.createElement("button"); b.className="history-item"; b.textContent=chat.title||"New chat";
    b.onclick=()=>openChat(chat.id); el.appendChild(b);
  });
}
function startChat(){
  currentChat={id:Date.now(),title:"New chat",messages:[]}; chats.push(currentChat); persist();
  messages.innerHTML=""; welcome.style.display="none"; chatArea.classList.add("visible");
  $("crumbTitle").textContent="New chat"; $("messageInput").focus(); renderHistory();
}
function openChat(id){
  currentChat=chats.find(c=>c.id===id); if(!currentChat)return;
  messages.innerHTML=""; welcome.style.display="none"; chatArea.classList.add("visible");
  currentChat.messages.forEach(m=>addBubble(m.role,m.text));
  $("crumbTitle").textContent=currentChat.title; $("sidebar").classList.remove("open");
}
function addBubble(role,text){
  const row=document.createElement("div"); row.className="message "+(role==="user"?"user":"assistant");
  row.innerHTML=`<div class="message-avatar">${role==="user"?"Y":"✦"}</div><div class="message-content">${escapeHTML(text)}</div>`;
  messages.appendChild(row); $("chatArea").scrollTop=$("chatArea").scrollHeight;
  return row;
}
function newChat(){currentChat=null;messages.innerHTML="";chatArea.classList.remove("visible");welcome.style.display="block";$("crumbTitle").textContent="Explore";$("messageInput").value="";$("messageInput").focus();}
async function sendMessage(text){
  text=text.trim(); if(!text)return;
  if(!currentChat)startChat();
  currentChat.messages.push({role:"user",text}); if(currentChat.messages.length===1)currentChat.title=text.slice(0,32);
  addBubble("user",text); $("messageInput").value=""; $("messageInput").style.height="auto"; $("sendBtn").disabled=true;
  const typing=addBubble("assistant","Thinking...");
  try{
    let answer;
    if(backend){
      const response=await fetch(backend.replace(/\/$/,"")+"/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,history:currentChat.messages.slice(0,-1)})});
      if(!response.ok)throw new Error("Backend returned "+response.status);
      const data=await response.json(); answer=data.reply||data.response||"I couldn't create a response.";
    }else{
      await new Promise(r=>setTimeout(r,550));
      answer="Your VoidAI website is looking good! To enable real AI replies, connect a VoidAI backend in Settings. The demo mode is here so you can test the interface.";
    }
    typing.querySelector(".message-content").textContent=answer;
    currentChat.messages.push({role:"assistant",text:answer});
  }catch(e){typing.querySelector(".message-content").textContent="I couldn't reach the AI backend. Check the backend URL in Settings and try again.";currentChat.messages.push({role:"assistant",text:"I couldn't reach the AI backend. Check the backend URL in Settings and try again."});}
  persist();renderHistory();$("sendBtn").disabled=false;
}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();sendMessage($("messageInput").value);});
$("messageInput").addEventListener("input",e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,150)+"px";});
$("newChat").onclick=newChat;
document.querySelectorAll(".prompt-card").forEach(b=>b.onclick=()=>sendMessage(b.dataset.prompt));
$("settingsOpen").onclick=$("settingsTop").onclick=()=>{$("backendUrl").value=backend;$("settingsModal").classList.add("open");};
$("settingsClose").onclick=()=>$("settingsModal").classList.remove("open");
$("settingsModal").onclick=e=>{if(e.target===$("settingsModal"))$("settingsModal").classList.remove("open");};
$("saveSettings").onclick=()=>{backend=$("backendUrl").value.trim();localStorage.setItem("voidai_backend",backend);$("connectionResult").textContent="Settings saved.";};
$("testBackend").onclick=async()=>{const url=$("backendUrl").value.trim();if(!url){$("connectionResult").textContent="Enter your backend URL first.";return;}try{const r=await fetch(url.replace(/\/$/,"")+"/health");if(!r.ok)throw new Error();$("connectionResult").textContent="Connected successfully."; }catch{$("connectionResult").textContent="Could not connect. Check the URL and backend status."; }};
$("openSidebar").onclick=()=>$("sidebar").classList.add("open");
$("closeSidebar").onclick=()=>$("sidebar").classList.remove("open");
$("homeNav").onclick=newChat;
$("historyNav").onclick=()=>$("historyList").scrollIntoView({behavior:"smooth"});
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();newChat();}});
renderHistory();
