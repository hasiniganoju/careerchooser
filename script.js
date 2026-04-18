const chatInner = document.getElementById("chatInner");
const chatArea = document.getElementById("chatArea");
const inputDock = document.getElementById("inputDock");
const startBtn = document.getElementById("startBtn");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let conversationHistory = [];
let isLoading = false;

// Auto-resize textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
});

// Enter to send
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!isLoading && userInput.value.trim()) sendMessage();
  }
});

sendBtn.addEventListener("click", () => {
  if (!isLoading && userInput.value.trim()) sendMessage();
});

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  startBtn.textContent = "Starting...";
  startConversation();
});

function startConversation() {
  // Clear welcome block
  chatInner.innerHTML = "";
  inputDock.style.display = "flex";
  inputDock.style.flexDirection = "column";
  initiateAI();
}

async function initiateAI() {
  conversationHistory = [];
  showTyping();
  sendBtn.disabled = true;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello, I need career guidance." }]
      })
    });

    const data = await res.json();
    removeTyping();

    if (data.error) {
      showError(data.error);
      return;
    }

    conversationHistory.push({ role: "user", content: "Hello, I need career guidance." });
    conversationHistory.push({ role: "assistant", content: data.reply });
    appendMessage("ai", data.reply);
    userInput.focus();
  } catch (err) {
    removeTyping();
    showError("Could not connect to MENTOR. Make sure the server is running.");
  } finally {
    sendBtn.disabled = false;
    isLoading = false;
  }
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  isLoading = true;
  sendBtn.disabled = true;
  userInput.value = "";
  userInput.style.height = "auto";

  appendMessage("user", text);
  conversationHistory.push({ role: "user", content: text });
  showTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await res.json();
    removeTyping();

    if (data.error) {
      showError(data.error);
      return;
    }

    conversationHistory.push({ role: "assistant", content: data.reply });
    appendMessage("ai", data.reply);
  } catch (err) {
    removeTyping();
    showError("Network error. Please try again.");
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

function appendMessage(role, text) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "ai" ? "M" : "U";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = formatMessage(text);

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatInner.appendChild(row);
  scrollToBottom();
}

function formatMessage(text) {
  // Convert markdown-like syntax to HTML
  let html = text
    // Headers with emoji (##)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Bullet lists
    .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Paragraphs (double newline)
    .split(/\n\n+/)
    .map(block => {
      if (block.includes("<h2>") || block.includes("<h3>") || block.includes("<hr>")) return block;
      if (block.includes("<li>")) return `<ul>${block}</ul>`;
      if (block.trim()) return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      return "";
    })
    .join("");

  return html;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "msg-row ai typing-row";
  row.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = "M";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatInner.appendChild(row);
  scrollToBottom();
}

function removeTyping() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function showError(msg) {
  const row = document.createElement("div");
  row.className = "msg-row ai";
  row.innerHTML = `
    <div class="msg-avatar">!</div>
    <div class="msg-bubble" style="border-color:rgba(255,80,80,0.3); color: #ff9090;">
      <p>⚠️ ${msg}</p>
    </div>
  `;
  chatInner.appendChild(row);
  scrollToBottom();
  sendBtn.disabled = false;
  isLoading = false;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
  });
}
