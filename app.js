const authScreen = document.getElementById("authScreen");
const app = document.getElementById("app");

const logoutBtn = document.getElementById("logoutBtn");
const newChat = document.getElementById("newChat");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const chatArea = document.getElementById("chatArea");
const welcome = document.getElementById("welcome");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

let currentUser = null;
let currentChatId = null;


// ==================================================
// AUTH
// ==================================================

function showApp() {
  authScreen.style.display = "none";
  app.classList.remove("app-hidden");
}

function showAuth() {
  authScreen.style.display = "flex";
  app.classList.add("app-hidden");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ==================================================
// AUTH SCREEN
// ==================================================

function restoreAuthScreen() {

  authScreen.innerHTML = `
    <div class="auth-card">

      <div class="auth-logo">K</div>

      <h1>مرحبًا بك في KingGPT 👑</h1>

      <p class="auth-subtitle">
        سجّل الدخول للمتابعة
      </p>

      <button class="google-btn" id="googleBtn" type="button">
        <span class="google-icon">G</span>
        <span>المتابعة باستخدام Google</span>
      </button>

      <div class="divider">
        <span>أو</span>
      </div>

      <input
        type="email"
        id="emailInput"
        placeholder="البريد الإلكتروني"
        autocomplete="email"
      >

      <input
        type="password"
        id="passwordInput"
        placeholder="كلمة المرور"
        autocomplete="current-password"
      >

      <button class="auth-btn" id="loginBtn" type="button">
        تسجيل الدخول
      </button>

      <button class="forgot-btn" id="forgotBtn" type="button">
        نسيت كلمة المرور؟
      </button>

      <p class="auth-switch">
        ليس لديك حساب؟
        <button id="signupBtn" type="button">
          إنشاء حساب
        </button>
      </p>

      <p class="auth-message" id="authMessage"></p>

    </div>
  `;

  setupAuthElements();
}


function setupAuthElements() {

  const google =
    document.getElementById("googleBtn");

  const login =
    document.getElementById("loginBtn");

  const signup =
    document.getElementById("signupBtn");

  const email =
    document.getElementById("emailInput");

  const password =
    document.getElementById("passwordInput");

  if (google) {
    google.addEventListener("click", () => {

      document.getElementById(
        "authMessage"
      ).textContent =
        "🔐 تسجيل الدخول باستخدام Google سيتم تفعيله لاحقًا.";

    });
  }

  if (login) {
    login.addEventListener("click", loginUser);
  }

  if (signup) {
    signup.addEventListener("click", signupUser);
  }

  [email, password].forEach(input => {

    if (!input) return;

    input.addEventListener("keydown", event => {

      if (event.key === "Enter") {
        event.preventDefault();
        loginUser();
      }

    });

  });
}


// ==================================================
// NAME SCREEN
// ==================================================

function showNameScreen(user) {

  currentUser = user;

  authScreen.style.display = "flex";
  app.classList.add("app-hidden");

  authScreen.innerHTML = `
    <div class="auth-card">

      <div class="auth-logo">
        K
      </div>

      <h1>
        أهلًا بيك في KingGPT 👑
      </h1>

      <p class="auth-subtitle">
        قبل ما نبدأ، تحب نناديك بإيه؟
      </p>

      <input
        type="text"
        id="displayNameInput"
        placeholder="اكتب اسمك"
        maxlength="50"
      >

      <button
        class="auth-btn"
        id="saveNameBtn"
        type="button"
      >
        متابعة
      </button>

      <p
        class="auth-message"
        id="nameMessage"
      ></p>

    </div>
  `;

  const input =
    document.getElementById("displayNameInput");

  const button =
    document.getElementById("saveNameBtn");

  const message =
    document.getElementById("nameMessage");

  button.addEventListener("click", async () => {

    const displayName =
      input.value.trim();

    if (!displayName) {

      message.textContent =
        "❌ اكتب اسمك أولًا.";

      return;
    }

    button.disabled = true;
    button.textContent =
      "جاري الحفظ...";

    try {

      const response =
        await fetch(
          "/api/auth/name",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            credentials:
              "same-origin",

            body: JSON.stringify({
              displayName
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "حدث خطأ."
        );
      }

      currentUser =
        data.user;

      restoreAuthScreen();

      showApp();

      updateWelcome();

      await loadChats();

    } catch (error) {

      message.textContent =
        "❌ " + error.message;

      button.disabled = false;

      button.textContent =
        "متابعة";
    }

  });

  input.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      button.click();
    }

  });

  setTimeout(() => input.focus(), 100);
}


// ==================================================
// LOGIN
// ==================================================

async function loginUser() {

  const email =
    document
      .getElementById("emailInput")
      .value
      .trim();

  const password =
    document
      .getElementById("passwordInput")
      .value;

  const message =
    document.getElementById("authMessage");

  const button =
    document.getElementById("loginBtn");

  message.textContent = "";

  if (!isValidEmail(email)) {

    message.textContent =
      "❌ اكتب بريد إلكتروني صحيح.";

    return;
  }

  if (password.length < 6) {

    message.textContent =
      "❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

    return;
  }

  button.disabled = true;

  button.textContent =
    "جاري تسجيل الدخول...";

  try {

    const response =
      await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          credentials:
            "same-origin",

          body: JSON.stringify({
            email,
            password
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "فشل تسجيل الدخول."
      );
    }

    currentUser =
      data.user;

    if (data.needsName) {

      showNameScreen(
        data.user
      );

      return;
    }

    showApp();

    updateWelcome();

    await loadChats();

  } catch (error) {

    message.textContent =
      "❌ " + error.message;

    button.disabled = false;

    button.textContent =
      "تسجيل الدخول";
  }
}


// ==================================================
// SIGNUP
// ==================================================

async function signupUser() {

  const email =
    document
      .getElementById("emailInput")
      .value
      .trim();

  const password =
    document
      .getElementById("passwordInput")
      .value;

  const message =
    document.getElementById("authMessage");

  const button =
    document.getElementById("signupBtn");

  message.textContent = "";

  if (!isValidEmail(email)) {

    message.textContent =
      "❌ اكتب بريد إلكتروني صحيح.";

    return;
  }

  if (password.length < 6) {

    message.textContent =
      "❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

    return;
  }

  button.disabled = true;

  button.textContent =
    "جاري إنشاء الحساب...";

  try {

    const response =
      await fetch(
        "/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          credentials:
            "same-origin",

          body: JSON.stringify({
            email,
            password
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "فشل إنشاء الحساب."
      );
    }

    currentUser =
      data.user;

    if (data.needsName) {

      showNameScreen(
        data.user
      );

      return;
    }

    showApp();

    updateWelcome();

    await loadChats();

  } catch (error) {

    message.textContent =
      "❌ " + error.message;

    button.disabled = false;

    button.textContent =
      "إنشاء حساب";
  }
}


// ==================================================
// CHECK AUTH
// ==================================================

async function checkAuth() {

  try {

    const response =
      await fetch(
        "/api/auth/me",
        {
          credentials:
            "same-origin"
        }
      );

    if (!response.ok) {

      currentUser = null;

      showAuth();

      return;
    }

    const data =
      await response.json();

    if (!data.authenticated) {

      currentUser = null;

      showAuth();

      return;
    }

    currentUser =
      data.user;

    if (!currentUser.displayName) {

      showNameScreen(
        currentUser
      );

      return;
    }

    showApp();

    updateWelcome();

    await loadChats();

  } catch (error) {

    console.error(
      "Auth check error:",
      error
    );

    showAuth();
  }
}


// ==================================================
// WELCOME
// ==================================================

function updateWelcome() {

  const element =
    document.getElementById("welcome");

  if (!element) return;

  const name =
    currentUser?.displayName;

  const title =
    element.querySelector("h1");

  if (title) {

    title.textContent =
      name
        ? `أهلاً يا ${name} 👑`
        : "أهلاً بك في KingGPT 👑";

  }
}


// ==================================================
// MARKDOWN
// ==================================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


function renderMarkdown(text) {

  if (typeof marked === "undefined") {
    return escapeHTML(text);
  }

  const temp =
    document.createElement("div");

  temp.innerHTML =
    marked.parse(text);

  temp
    .querySelectorAll("pre")
    .forEach(pre => {

      const code =
        pre.querySelector("code");

      if (!code) return;

      const wrapper =
        document.createElement("div");

      wrapper.className =
        "code-block-wrapper";

      const header =
        document.createElement("div");

      header.className =
        "code-block-header";

      const language =
        document.createElement("span");

      language.className =
        "code-language";

      const match =
        (code.className || "")
          .match(/language-([\w-]+)/);

      language.textContent =
        match
          ? match[1]
          : "Code";

      const copyBtn =
        document.createElement("button");

      copyBtn.type = "button";

      copyBtn.className =
        "copy-code-btn";

      copyBtn.textContent =
        "📋 Copy";

      copyBtn.addEventListener(
        "click",
        async () => {

          try {

            await navigator.clipboard.writeText(
              code.textContent
            );

            copyBtn.textContent =
              "✅ Copied!";

            setTimeout(() => {
              copyBtn.textContent =
                "📋 Copy";
            }, 2000);

          } catch {

            copyBtn.textContent =
              "❌ Failed";

          }

        }
      );

      header.appendChild(language);
      header.appendChild(copyBtn);

      pre.parentNode.insertBefore(
        wrapper,
        pre
      );

      wrapper.appendChild(header);
      wrapper.appendChild(pre);

    });

  return temp.innerHTML;
}


// ==================================================
// ADD MESSAGE
// ==================================================

function addMessage(text, type) {

  const message =
    document.createElement("div");

  message.className =
    `message ${type}`;

  const messageText =
    document.createElement("div");

  messageText.className =
    "message-text";

  if (type === "user") {

    messageText.textContent =
      text;

  } else {

    messageText.innerHTML =
      renderMarkdown(text);

  }

  message.appendChild(
    messageText
  );

  chatArea.appendChild(
    message
  );

  chatArea.scrollTop =
    chatArea.scrollHeight;

  return message;
}


// ==================================================
// SIDEBAR
// ==================================================

function getSidebarList() {

  let list =
    document.getElementById(
      "chatList"
    );

  if (list) {
    return list;
  }

  list =
    document.createElement("div");

  list.id =
    "chatList";

  list.className =
    "chat-list";

  if (sidebar) {
    sidebar.appendChild(list);
  }

  return list;
}


async function loadChats() {

  if (!currentUser) {
    return;
  }

  const list =
    getSidebarList();

  list.innerHTML = `
    <div class="chat-loading">
      ⏳ جاري تحميل المحادثات...
    </div>
  `;

  try {

    const response =
      await fetch(
        "/api/chats",
        {
          method: "GET",
          credentials: "same-origin"
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "فشل تحميل المحادثات."
      );

    }

    list.innerHTML = "";

    if (!data.chats || data.chats.length === 0) {

      list.innerHTML = `
        <div class="chat-empty">
          لا توجد محادثات محفوظة
        </div>
      `;

      return;
    }

    data.chats.forEach(chat => {

      addChatToSidebar(
        chat,
        false
      );

    });

  } catch (error) {

    console.error(
      "LOAD CHATS ERROR:",
      error
    );

    list.innerHTML = `
      <div class="chat-empty">
        ❌ فشل تحميل المحادثات
      </div>
    `;

  }
}


function addChatToSidebar(
  chat,
  prepend = true
) {

  const list =
    getSidebarList();

  const old =
    list.querySelector(
      `[data-chat-id="${chat.id}"]`
    );

  if (old) {
    old.remove();
  }

  const item =
    document.createElement("button");

  item.type = "button";

  item.className =
    "chat-item";

  item.dataset.chatId =
    String(chat.id);

  item.innerHTML = `
    <span class="chat-item-icon">💬</span>
    <span class="chat-item-title"></span>
  `;

  item.querySelector(
    ".chat-item-title"
  ).textContent =
    chat.title || "محادثة جديدة";

  if (Number(chat.id) === currentChatId) {
    item.classList.add("active");
  }

  item.addEventListener(
    "click",
    () => {

      loadChat(
        Number(chat.id)
      );

    }
  );

  if (prepend) {
    list.prepend(item);
  } else {
    list.appendChild(item);
  }
}


function updateActiveChat() {

  document
    .querySelectorAll(
      ".chat-item"
    )
    .forEach(item => {

      item.classList.toggle(
        "active",
        Number(item.dataset.chatId) ===
        currentChatId
      );

    });

}


// ==================================================
// CREATE CHAT
// ==================================================

async function createChat() {

  if (!currentUser) {
    return null;
  }

  try {

    const response =
      await fetch(
        "/api/chats",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          credentials:
            "same-origin",

          body: JSON.stringify({
            title:
              "محادثة جديدة"
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "فشل إنشاء المحادثة."
      );

    }

    currentChatId =
      Number(data.chat.id);

    addChatToSidebar(
      data.chat,
      true
    );

    updateActiveChat();

    return data.chat;

  } catch (error) {

    console.error(
      "CREATE CHAT ERROR:",
      error
    );

    return null;
  }
}


// ==================================================
// LOAD CHAT
// ==================================================

async function loadChat(chatId) {

  try {

    const response =
      await fetch(
        `/api/chats/${chatId}/messages`,
        {
          method: "GET",
          credentials: "same-origin"
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "فشل تحميل المحادثة."
      );

    }

    currentChatId =
      Number(chatId);

    chatArea.innerHTML = "";

    if (
      !data.messages ||
      data.messages.length === 0
    ) {

      chatArea.innerHTML = `
        <div
          class="welcome"
          id="welcome"
        >
          <div class="big-logo">
            K
          </div>

          <h1>
            ${currentUser?.displayName
              ? `أهلاً يا ${currentUser.displayName} 👑`
              : "أهلاً بك في KingGPT 👑"
            }
          </h1>

          <p>
            إزاي أقدر أساعدك؟
          </p>
        </div>
      `;

    } else {

      data.messages.forEach(message => {

        addMessage(
          message.content,
          message.role
        );

      });

    }

    updateActiveChat();

    closeSidebar();

  } catch (error) {

    console.error(
      "LOAD CHAT ERROR:",
      error
    );

    alert(
      "❌ فشل تحميل المحادثة."
    );

  }
}


// ==================================================
// SEND MESSAGE
// ==================================================

async function sendMessage() {

  const message =
    messageInput.value.trim();

  if (!message) {
    return;
  }

  if (!currentUser) {

    addMessage(
      "❌ يجب تسجيل الدخول أولًا.",
      "assistant"
    );

    return;
  }


  // ================================================
  // CREATE CHAT IF NEEDED
  // ================================================

  if (!Number.isInteger(currentChatId)) {

    const chat =
      await createChat();

    if (!chat) {

      addMessage(
        "❌ فشل إنشاء المحادثة.",
        "assistant"
      );

      return;
    }

  }


  const currentWelcome =
    document.getElementById(
      "welcome"
    );

  if (currentWelcome) {
    currentWelcome.style.display =
      "none";
  }


  addMessage(
    message,
    "user"
  );

  messageInput.value = "";

  messageInput.style.height =
    "auto";


  const loading =
    addMessage(
      "⏳ KingGPT بيكتب...",
      "assistant"
    );


  try {

    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          credentials:
            "same-origin",

          body: JSON.stringify({

            message,

            chatId:
              currentChatId

          })
        }
      );


    const data =
      await response.json();


    const messageText =
      loading.querySelector(
        ".message-text"
      );


    if (!response.ok) {

      messageText.textContent =
        "❌ " +
        (
          data.error ||
          "حدث خطأ أثناء الاتصال."
        );

      return;
    }


    // مهم:
    // Backend ممكن يرجع chatId جديد

    if (
      Number.isInteger(
        Number(data.chatId)
      )
    ) {

      currentChatId =
        Number(data.chatId);

    }


    messageText.innerHTML =
      renderMarkdown(
        data.reply ||
        "لم يصل رد."
      );


    // تحديث عنوان المحادثة
    await loadChats();

    updateActiveChat();

  } catch (error) {

    console.error(
      "KingGPT Error:",
      error
    );

    const messageText =
      loading.querySelector(
        ".message-text"
      );

    messageText.textContent =
      "❌ حصل خطأ أثناء الحصول على الرد.";

  }

  chatArea.scrollTop =
    chatArea.scrollHeight;
}


// ==================================================
// NEW CHAT
// ==================================================

newChat.addEventListener(
  "click",
  async () => {

    currentChatId = null;

    chatArea.innerHTML = `
      <div
        class="welcome"
        id="welcome"
      >

        <div class="big-logo">
          K
        </div>

        <h1>
          أهلاً يا ${
            currentUser?.displayName ||
            "بك"
          } 👑
        </h1>

        <p>
          إزاي أقدر أساعدك؟
        </p>

      </div>
    `;

    messageInput.value = "";

    messageInput.style.height =
      "auto";

    updateActiveChat();

    closeSidebar();

  }
);


// ==================================================
// LOGOUT
// ==================================================

logoutBtn.addEventListener(
  "click",
  async () => {

    try {

      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials:
            "same-origin"
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

    currentUser = null;

    currentChatId = null;

    showAuth();

    restoreAuthScreen();

    closeSidebar();

    chatArea.innerHTML = `
      <div
        class="welcome"
        id="welcome"
      >

        <div class="big-logo">
          K
        </div>

        <h1>
          أهلاً بك في KingGPT 👑
        </h1>

        <p>
          إزاي أقدر أساعدك؟
        </p>

      </div>
    `;

    messageInput.value = "";

  }
);


// ==================================================
// SIDEBAR MOBILE
// ==================================================

function openSidebar() {

  sidebar.classList.add("open");

  if (overlay) {
    overlay.classList.add("active");
  }

}


function closeSidebar() {

  sidebar.classList.remove("open");

  if (overlay) {
    overlay.classList.remove("active");
  }

}


menuBtn.addEventListener(
  "click",
  () => {

    if (
      sidebar.classList.contains("open")
    ) {

      closeSidebar();

    } else {

      openSidebar();

    }

  }
);


if (overlay) {

  overlay.addEventListener(
    "click",
    closeSidebar
  );

}


// ==================================================
// SEND BUTTON
// ==================================================

sendBtn.addEventListener(
  "click",
  sendMessage
);


messageInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);


// ==================================================
// TEXTAREA RESIZE
// ==================================================

messageInput.addEventListener(
  "input",
  () => {

    messageInput.style.height =
      "auto";

    messageInput.style.height =
      Math.min(
        messageInput.scrollHeight,
        140
      ) + "px";

  }
);


// ==================================================
// PASSWORD RESET
// ==================================================

const resetCard =
  document.getElementById("resetCard");

const loginCard =
  document.getElementById("loginCard");

const backToLoginBtn =
  document.getElementById(
    "backToLoginBtn"
  );

const resetSendBtn =
  document.getElementById(
    "resetSendBtn"
  );

const resetEmailInput =
  document.getElementById(
    "resetEmailInput"
  );

const resetMessage =
  document.getElementById(
    "resetMessage"
  );


const forgotBtn =
  document.getElementById(
    "forgotBtn"
  );


if (forgotBtn) {

  forgotBtn.addEventListener(
    "click",
    () => {

      if (!loginCard || !resetCard) {
        return;
      }

      loginCard.style.display =
        "none";

      resetCard.style.display =
        "block";

      if (resetEmailInput) {
        resetEmailInput.value = "";
        resetEmailInput.focus();
      }

      if (resetMessage) {
        resetMessage.textContent = "";
      }

    }
  );

}


if (backToLoginBtn) {

  backToLoginBtn.addEventListener(
    "click",
    () => {

      resetCard.style.display =
        "none";

      loginCard.style.display =
        "block";

      resetMessage.textContent =
        "";

    }
  );

}


if (resetSendBtn) {

  resetSendBtn.addEventListener(
    "click",
    async () => {

      const email =
        resetEmailInput.value.trim();

      resetMessage.textContent =
        "";

      if (!isValidEmail(email)) {

        resetMessage.textContent =
          "❌ اكتب بريد إلكتروني صحيح.";

        return;
      }

      resetSendBtn.disabled =
        true;

      resetSendBtn.textContent =
        "جاري الإرسال...";

      try {

        resetMessage.textContent =
          "📧 نظام إرسال رابط الاسترجاع سيتم تفعيله قريبًا.";

      } finally {

        resetSendBtn.disabled =
          false;

        resetSendBtn.textContent =
          "إرسال رابط الاسترجاع";

      }

    }
  );

}


// ==================================================
// SETTINGS
// ==================================================

const settingsScreen =
  document.getElementById(
    "settingsScreen"
  );

const settingsBtn =
  document.getElementById(
    "settingsBtn"
  );

const settingsBackBtn =
  document.getElementById(
    "settingsBackBtn"
  );

const aboutUserInput =
  document.getElementById(
    "aboutUserInput"
  );

const responseStyleInput =
  document.getElementById(
    "responseStyleInput"
  );

const saveInstructionsBtn =
  document.getElementById(
    "saveInstructionsBtn"
  );

const instructionsMessage =
  document.getElementById(
    "instructionsMessage"
  );


if (settingsBtn) {

  settingsBtn.addEventListener(
    "click",
    () => {

      let saved = {};

      try {

        saved =
          JSON.parse(
            localStorage.getItem(
              "kinggpt_custom_instructions"
            ) || "{}"
          );

      } catch {}

      if (aboutUserInput) {
        aboutUserInput.value =
          saved.aboutUser || "";
      }

      if (responseStyleInput) {
        responseStyleInput.value =
          saved.responseStyle || "";
      }

      settingsScreen.classList.remove(
        "app-hidden"
      );

    }
  );

}


if (settingsBackBtn) {

  settingsBackBtn.addEventListener(
    "click",
    () => {

      settingsScreen.classList.add(
        "app-hidden"
      );

    }
  );

}


if (saveInstructionsBtn) {

  saveInstructionsBtn.addEventListener(
    "click",
    () => {

      const instructions = {

        aboutUser:
          aboutUserInput?.value.trim() || "",

        responseStyle:
          responseStyleInput?.value.trim() || ""

      };

      localStorage.setItem(
        "kinggpt_custom_instructions",
        JSON.stringify(instructions)
      );

      if (instructionsMessage) {

        instructionsMessage.textContent =
          "✓ تم حفظ التعليمات بنجاح";

        setTimeout(() => {

          instructionsMessage.textContent =
            "";

        }, 2500);

      }

    }
  );

}


// ==================================================
// EXTRA SETTINGS
// ==================================================

const modelSelect =
  document.getElementById(
    "modelSelect"
  );

const creativityRange =
  document.getElementById(
    "creativityRange"
  );

const responseLengthSelect =
  document.getElementById(
    "responseLengthSelect"
  );

const languageSelect =
  document.getElementById(
    "languageSelect"
  );

const notificationsToggle =
  document.getElementById(
    "notificationsToggle"
  );

const SETTINGS_KEY =
  "kinggpt_extra_settings";


function loadExtraSettings() {

  let settings = {};

  try {

    settings =
      JSON.parse(
        localStorage.getItem(
          SETTINGS_KEY
        ) || "{}"
      );

  } catch {}

  if (modelSelect) {
    modelSelect.value =
      settings.model || "kinggpt";
  }

  if (creativityRange) {
    creativityRange.value =
      settings.creativity ?? 50;
  }

  if (responseLengthSelect) {
    responseLengthSelect.value =
      settings.responseLength || "medium";
  }

  if (languageSelect) {
    languageSelect.value =
      settings.language || "ar";
  }

  if (notificationsToggle) {
    notificationsToggle.checked =
      settings.notifications !== false;
  }

}


function saveExtraSetting(
  key,
  value
) {

  let settings = {};

  try {

    settings =
      JSON.parse(
        localStorage.getItem(
          SETTINGS_KEY
        ) || "{}"
      );

  } catch {}

  settings[key] =
    value;

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );

}


if (modelSelect) {

  modelSelect.addEventListener(
    "change",
    () => {

      saveExtraSetting(
        "model",
        modelSelect.value
      );

    }
  );

}


if (creativityRange) {

  creativityRange.addEventListener(
    "input",
    () => {

      saveExtraSetting(
        "creativity",
        Number(
          creativityRange.value
        )
      );

    }
  );

}


if (responseLengthSelect) {

  responseLengthSelect.addEventListener(
    "change",
    () => {

      saveExtraSetting(
        "responseLength",
        responseLengthSelect.value
      );

    }
  );

}


if (languageSelect) {

  languageSelect.addEventListener(
    "change",
    () => {

      saveExtraSetting(
        "language",
        languageSelect.value
      );

    }
  );

}


if (notificationsToggle) {

  notificationsToggle.addEventListener(
    "change",
    () => {

      saveExtraSetting(
        "notifications",
        notificationsToggle.checked
      );

    }
  );

}


loadExtraSettings();


// ==================================================
// START
// ==================================================

restoreAuthScreen();

checkAuth();
