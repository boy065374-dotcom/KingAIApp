// redeployment made for make vercel make deploy
// ==================================================
// KINGGPT APP.JS
// ==================================================

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
// AUTH UI
// ==================================================

function showApp() {
  if (authScreen) {
    authScreen.style.display = "none";
  }

  if (app) {
    app.classList.remove("app-hidden");
  }
}


function showAuth() {
  if (authScreen) {
    authScreen.style.display = "flex";
  }

  if (app) {
    app.classList.add("app-hidden");
  }
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ==================================================
// AUTH SCREEN
// ==================================================

function restoreAuthScreen() {

  if (!authScreen) {
    return;
  }

  authScreen.innerHTML = `
    <div class="auth-card">

      <div class="auth-logo">
        <img
          src="1787430604018.png"
          alt="KingGPT Logo"
        >
      </div>

      <h1>الوووو انا KingGPT يسطاااااااا</h1>

      <p class="auth-subtitle">
       مش هقولك حاجة غير ما تسجل وربنا سجل و اقولك
      </p>

      <button
        class="google-btn"
        id="googleBtn"
        type="button"
      >
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
        inputmode="email"
      >

      <input
        type="password"
        id="passwordInput"
        placeholder="كلمة المرور"
        autocomplete="current-password"
      >

      <button
        class="auth-btn"
        id="loginBtn"
        type="button"
      >
        تسجيل الدخول
      </button>

      <button
        class="forgot-btn"
        id="forgotBtn"
        type="button"
      >
        نسيت كلمة المرور؟
      </button>

      <p class="auth-switch">
        معندكش حساب؟

        <button
          id="signupBtn"
          type="button"
        >
          انا اسمح؟ دوس هنا و اعمل
        </button>
      </p>

      <p
        class="auth-message"
        id="authMessage"
      ></p>

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

  const forgot =
    document.getElementById("forgotBtn");


  if (google) {

    google.addEventListener("click", () => {

      const message =
        document.getElementById("authMessage");

      if (message) {

        message.textContent =
         "🔐 استنا التحديثات الجاية لعلى و عسى نعمل تسجيل الدخول بجوجل";

      }

    });

  }


  if (login) {
    login.addEventListener(
      "click",
      loginUser
    );
  }


  if (signup) {
    signup.addEventListener(
      "click",
      signupUser
    );
  }


  if (forgot) {

    forgot.addEventListener(
      "click",
      showPasswordReset
    );

  }


  [email, password].forEach(input => {

    if (!input) {
      return;
    }

    input.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          loginUser();

        }

      }
    );

  });

}


// ==================================================
// PASSWORD RESET REQUEST
// ==================================================

function showPasswordReset() {

  if (!authScreen) {
    return;
  }

  authScreen.innerHTML = `
    <div class="auth-card reset-card">

      <div class="auth-logo">
        <img
          src="1787430604018.png"
          alt="KingGPT Logo"
        >
      </div>

      <h1>
        رجع كلمة السر هنا 🔄
      </h1>

      <p class="auth-subtitle">
        دخل بريدك الالكتروني و هتشوف البركة وربنا هرجعلك
      </p>

      <input
        type="email"
        id="resetEmailInput"
        placeholder="البريد الإلكتروني"
        autocomplete="email"
        inputmode="email"
      >

      <button
        class="auth-btn"
        id="resetSendBtn"
        type="button"
      >
        ارسال رابط الاسترجاع
      </button>

      <p
        class="auth-message"
        id="resetMessage"
      ></p>

      <button
        class="forgot-btn"
        id="backToLoginBtn"
        type="button"
      >
        ← ارجع للتسجيل
      </button>

    </div>
  `;


  const email =
    document.getElementById(
      "resetEmailInput"
    );

  const send =
    document.getElementById(
      "resetSendBtn"
    );

  const back =
    document.getElementById(
      "backToLoginBtn"
    );

  const message =
    document.getElementById(
      "resetMessage"
    );


  if (back) {

    back.addEventListener(
      "click",
      () => {

        restoreAuthScreen();

      }
    );

  }


  async function sendResetRequest() {

    const value =
      email?.value.trim() || "";


    if (!isValidEmail(value)) {

      if (message) {
        message.textContent =
          "❌ اكتبه صح ياهطل";
      }

      return;
    }


    if (!send) {
      return;
    }


    send.disabled = true;

    send.textContent =
      "جاري الإرسال...";


    if (message) {
      message.textContent = "";
    }


    try {

      const response =
        await fetch(
          "/api/auth/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            credentials:
              "same-origin",

            body:
              JSON.stringify({
                email: value
              })
          }
        );


      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      if (!response.ok) {

        throw new Error(
          data.error ||
          "لا معلش كد النظام وقع تعالى كمان شوية"
        );

      }


      if (message) {

        message.textContent =
          "📧 " +
          (
            data.message ||
            "لو الحساب كان مرتبط بالبريد دا كلمة المرور هتتغير بردو"
          );

      }


    } catch (error) {

      console.error(
        "ايرووووور:",
        error
      );


      if (message) {

        message.textContent =
          "❌ " +
          (
            error.message ||
            "اهو حدث خطأ بق اصبر شوية و جرب"
          );

      }

    } finally {

      send.disabled = false;

      send.textContent =
        "إرسال رابط الاسترجاع";

    }

  }


  if (send) {

    send.addEventListener(
      "click",
      sendResetRequest
    );

  }


  if (email) {

    email.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          sendResetRequest();

        }

      }
    );


    setTimeout(
      () => email.focus(),
      100
    );

  }

}


// ==================================================
// RESET PASSWORD PAGE
// ==================================================

function showResetPasswordPage(token) {

  if (!authScreen) {
    return;
  }


  authScreen.innerHTML = `
    <div class="auth-card reset-card">

      <div class="auth-logo">
        <img
          src="1787430604018.png"
          alt="KingGPT Logo"
        >
      </div>

      <h1>
        كلمة السر الجديدة هنااا مبروكك
      </h1>

      <p class="auth-subtitle">
        اكتب كلمة السر هنا
      </p>

      <input
        type="password"
        id="newPasswordInput"
        placeholder="كلمة السر الجاديدة"
        autocomplete="new-password"
      >

      <input
        type="password"
        id="confirmPasswordInput"
        placeholder="دخلها تاني علشان اتأكد"
        autocomplete="new-password"
      >

      <button
        class="auth-btn"
        id="resetPasswordBtn"
        type="button"
      >
        تغيير كلمة المرور
      </button>

      <p
        class="auth-message"
        id="resetPasswordMessage"
      ></p>

      <button
        class="forgot-btn"
        id="resetBackLoginBtn"
        type="button"
      >
        ← العودة لتسجيل الدخول
      </button>

    </div>
  `;


  const password =
    document.getElementById(
      "newPasswordInput"
    );

  const confirmPassword =
    document.getElementById(
      "confirmPasswordInput"
    );

  const button =
    document.getElementById(
      "resetPasswordBtn"
    );

  const message =
    document.getElementById(
      "resetPasswordMessage"
    );

  const back =
    document.getElementById(
      "resetBackLoginBtn"
    );


  if (back) {

    back.addEventListener(
      "click",
      () => {

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        restoreAuthScreen();

      }
    );

  }


  async function resetPassword() {

    const newPassword =
      password?.value || "";

    const confirmation =
      confirmPassword?.value || "";


    if (
      newPassword.length < 6
    ) {

      message.textContent =
        "❌ حط 6 حروف على الاقل ياذكي";

      return;
    }


    if (
      newPassword !==
      confirmation
    ) {

      message.textContent =
        "❌ لا معلش مش متطبقين اكتبهم تاني";

      return;
    }


    button.disabled = true;

    button.textContent =
      "جاري تغيير كلمة المرور...";

    message.textContent = "";


    try {

      const response =
        await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            credentials:
              "same-origin",

            body:
              JSON.stringify({
                token,
                password:
                  newPassword
              })
          }
        );


      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }


      if (!response.ok) {

        throw new Error(
          data.error ||
          "معرفتش اغير اصبر شوية و جرب تاني"
        );

      }


      message.textContent =
        "✅ " +
        (
          data.message ||
          "تم تغيير كلمة المرور بنجاح."
        );


      password.value = "";
      confirmPassword.value = "";


      setTimeout(
        () => {

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          restoreAuthScreen();

        },
        1800
      );


    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );


      message.textContent =
        "❌ " +
        (
          error.message ||
          "معرفتش اغيرها علشان فيه ايرور و معرفهوش"
        );


      button.disabled = false;

      button.textContent =
        "تغيير كلمة المرور";

    }

  }


  if (button) {

    button.addEventListener(
      "click",
      resetPassword
    );

  }


  [password, confirmPassword].forEach(
    input => {

      if (!input) {
        return;
      }

      input.addEventListener(
        "keydown",
        event => {

          if (event.key === "Enter") {

            event.preventDefault();

            resetPassword();

          }

        }
      );

    }
  );


  setTimeout(
    () => password?.focus(),
    100
  );

}


// ==================================================
// NAME SCREEN
// ==================================================

function showNameScreen(user) {

  currentUser = user;

  showAuth();

  authScreen.innerHTML = `
    <div class="auth-card">

      <div class="auth-logo">
        <img
          src="1787430604018.png"
          alt="KingGPT Logo"
        >
      </div>

      <h1>
        انا بق KingGPT
      </h1>

      <p class="auth-subtitle">
        قبل ما نبدأ، اقولك ايه يعني اناديك بايه
      </p>

      <input
        type="text"
        id="displayNameInput"
        placeholder="اكتب اسمك"
        maxlength="50"
        autocomplete="name"
      >

      <button
        class="auth-btn"
        id="saveNameBtn"
        type="button"
      >
        كمل
      </button>

      <p
        class="auth-message"
        id="nameMessage"
      ></p>

    </div>
  `;


  const input =
    document.getElementById(
      "displayNameInput"
    );

  const button =
    document.getElementById(
      "saveNameBtn"
    );

  const message =
    document.getElementById(
      "nameMessage"
    );


  if (!input || !button || !message) {
    return;
  }


  async function saveName() {

    const displayName =
      input.value.trim();


    if (!displayName) {

      message.textContent =
        "❌ اكتب اسمك يا اهطل";

      return;
    }


    if (displayName.length > 50) {

      message.textContent =
        "❌ الاسم طويل جدًا.";

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

            body:
              JSON.stringify({
                displayName
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "حدث خطأ. حاول مرة تانية كمان شوية"
        );

      }


      currentUser =
        data.user;


      showApp();

      updateWelcome();

      await loadChats();


    } catch (error) {

      message.textContent =
        "❌ " +
        error.message;


      button.disabled = false;

      button.textContent =
        "متابعة";

    }

  }


  button.addEventListener(
    "click",
    saveName
  );


  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        saveName();

      }

    }
  );


  setTimeout(
    () => input.focus(),
    100
  );

}


// ==================================================
// LOGIN
// ==================================================

async function loginUser() {

  const emailInput =
    document.getElementById(
      "emailInput"
    );

  const passwordInput =
    document.getElementById(
      "passwordInput"
    );

  const message =
    document.getElementById(
      "authMessage"
    );

  const button =
    document.getElementById(
      "loginBtn"
    );


  if (
    !emailInput ||
    !passwordInput ||
    !message ||
    !button
  ) {
    return;
  }


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


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

          body:
            JSON.stringify({
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
      "❌ " +
      error.message;

    button.disabled = false;

    button.textContent =
      "تسجيل الدخول";

  }

}


// ==================================================
// SIGNUP
// ==================================================

async function signupUser() {

  const emailInput =
    document.getElementById(
      "emailInput"
    );

  const passwordInput =
    document.getElementById(
      "passwordInput"
    );

  const message =
    document.getElementById(
      "authMessage"
    );

  const button =
    document.getElementById(
      "signupBtn"
    );


  if (
    !emailInput ||
    !passwordInput ||
    !message ||
    !button
  ) {
    return;
  }


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


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

          body:
            JSON.stringify({
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
      "❌ " +
      error.message;

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
          method: "GET",
          credentials:
            "same-origin"
        }
      );


    if (!response.ok) {

      currentUser = null;

      showAuth();

      restoreAuthScreen();

      return;
    }


    const data =
      await response.json();


    if (!data.authenticated) {

      currentUser = null;

      showAuth();

      restoreAuthScreen();

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
      "AUTH CHECK ERROR:",
      error
    );

    currentUser = null;

    showAuth();

    restoreAuthScreen();

  }

}


// ==================================================
// WELCOME
// ==================================================

function updateWelcome() {

  const element =
    document.getElementById(
      "welcome"
    );


  if (!element) {
    return;
  }


  const title =
    element.querySelector("h1");


  if (!title) {
    return;
  }


  const name =
    currentUser?.displayName;


  title.textContent =
    name
      ? `أهلاً يا ${name} 👑`
      : "أهلاً بك في KingGPT 👑";

}


// ==================================================
// MARKDOWN
// ==================================================

function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    String(text ?? "");

  return div.innerHTML;

}


function renderMarkdown(text) {

  if (
    typeof marked === "undefined"
  ) {
    return escapeHTML(text);
  }


  const temp =
    document.createElement(
      "div"
    );


  temp.innerHTML =
    marked.parse(
      String(text ?? "")
    );


  temp
    .querySelectorAll("pre")
    .forEach(pre => {

      const code =
        pre.querySelector("code");


      if (!code) {
        return;
      }


      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.className =
        "code-block-wrapper";


      const header =
        document.createElement(
          "div"
        );

      header.className =
        "code-block-header";


      const language =
        document.createElement(
          "span"
        );

      language.className =
        "code-language";


      const match =
        (code.className || "")
          .match(
            /language-([\w-]+)/
          );


      language.textContent =
        match
          ? match[1]
          : "Code";


      const copyBtn =
        document.createElement(
          "button"
        );

      copyBtn.type =
        "button";

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


            setTimeout(
              () => {

                copyBtn.textContent =
                  "📋 Copy";

              },
              2000
            );


          } catch {

            copyBtn.textContent =
              "❌ Failed";

          }

        }
      );


      header.appendChild(
        language
      );

      header.appendChild(
        copyBtn
      );


      pre.parentNode.insertBefore(
        wrapper,
        pre
      );


      wrapper.appendChild(
        header
      );

      wrapper.appendChild(
        pre
      );

    });


  return temp.innerHTML;

}


// ==================================================
// ADD MESSAGE
// ==================================================

function addMessage(
  text,
  type
) {

  if (!chatArea) {
    return null;
  }


  const message =
    document.createElement(
      "div"
    );


  message.className =
    `message ${type}`;


  const messageText =
    document.createElement(
      "div"
    );


  messageText.className =
    "message-text";


  if (type === "user") {

    messageText.textContent =
      String(text ?? "");

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
    document.createElement(
      "div"
    );


  list.id =
    "chatList";

  list.className =
    "chat-list";


  if (sidebar) {
    sidebar.appendChild(list);
  }


  return list;

}


// ==================================================
// LOAD CHATS
// ==================================================

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
          credentials:
            "same-origin"
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


    if (
      !Array.isArray(data.chats) ||
      data.chats.length === 0
    ) {

      list.innerHTML = `
        <div class="chat-empty">
          لا توجد محادثات محفوظة
        </div>
      `;

      return;
    }


    data.chats.forEach(
      chat => {

        addChatToSidebar(
          chat,
          false
        );

      }
    );


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


// ==================================================
// SIDEBAR CHAT ITEM
// ==================================================

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
    document.createElement(
      "button"
    );


  item.type =
    "button";

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
    chat.title ||
    "محادثة جديدة";


  if (
    Number(chat.id) ===
    currentChatId
  ) {

    item.classList.add(
      "active"
    );

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


// ==================================================
// ACTIVE CHAT
// ==================================================

function updateActiveChat() {

  document
    .querySelectorAll(
      ".chat-item"
    )
    .forEach(item => {

      item.classList.toggle(
        "active",
        Number(
          item.dataset.chatId
        ) === currentChatId
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

          body:
            JSON.stringify({
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

async function loadChat(
  chatId
) {

  try {

    const response =
      await fetch(
        `/api/chats/${chatId}/messages`,
        {
          method: "GET",
          credentials:
            "same-origin"
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


    chatArea.innerHTML =
      "";


    if (
      !Array.isArray(data.messages) ||
      data.messages.length === 0
    ) {

      chatArea.innerHTML = `
        <div
          class="welcome"
          id="welcome"
        >

          <div class="big-logo">

            <img
              src="1787430604018.png"
              alt="KingGPT Logo"
            >

          </div>

          <h1>
            ${
              currentUser?.displayName
                ? `أهلاً يا ${escapeHTML(
                    currentUser.displayName
                  )} 👑`
                : "أهلاً بك في KingGPT 👑"
            }
          </h1>

          <p>
            إزاي أقدر أساعدك؟
          </p>

        </div>
      `;

    } else {

      data.messages.forEach(
        message => {

          addMessage(
            message.content,
            message.role
          );

        }
      );

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

  if (!messageInput) {
    return;
  }


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


  if (
    !Number.isInteger(
      currentChatId
    )
  ) {

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


  messageInput.value =
    "";

  messageInput.style.height =
    "auto";


  sendBtn.disabled =
    true;


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

          body:
            JSON.stringify({
              message,
              chatId:
                currentChatId
            })
          }
        );


    const data =
      await response.json();


    const messageText =
      loading?.querySelector(
        ".message-text"
      );


    if (!response.ok) {

      if (messageText) {

        messageText.textContent =
          "❌ " +
          (
            data.error ||
            "حدث خطأ أثناء الاتصال."
          );

      }

      return;
    }


    if (
      Number.isInteger(
        Number(data.chatId)
      )
    ) {

      currentChatId =
        Number(data.chatId);

    }


    if (messageText) {

      messageText.innerHTML =
        renderMarkdown(
          data.reply ||
          "لم يصل رد."
        );

    }


    await loadChats();

    updateActiveChat();


  } catch (error) {

    console.error(
      "KINGGPT ERROR:",
      error
    );


    const messageText =
      loading?.querySelector(
        ".message-text"
      );


    if (messageText) {

      messageText.textContent =
        "❌ حصل خطأ أثناء الحصول على الرد.";

    }

  } finally {

    sendBtn.disabled =
      false;

    chatArea.scrollTop =
      chatArea.scrollHeight;

  }

}


// ==================================================
// NEW CHAT
// ==================================================

if (newChat) {

  newChat.addEventListener(
    "click",
    async () => {

      currentChatId =
        null;


      chatArea.innerHTML = `
        <div
          class="welcome"
          id="welcome"
        >

          <div class="big-logo">

            <img
              src="1787430604018.png"
              alt="KingGPT Logo"
            >

          </div>

          <h1>
            أهلاً يا ${
              currentUser?.displayName
                ? escapeHTML(
                    currentUser.displayName
                  )
                : "بك"
            } 👑
          </h1>

          <p>
            إزاي أقدر أساعدك؟
          </p>

        </div>
      `;


      messageInput.value =
        "";

      messageInput.style.height =
        "auto";


      updateActiveChat();

      closeSidebar();

    }
  );

}


// ==================================================
// LOGOUT
// ==================================================

if (logoutBtn) {

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
          "LOGOUT ERROR:",
          error
        );

      }


      currentUser =
        null;

      currentChatId =
        null;


      showAuth();

      restoreAuthScreen();

      closeSidebar();


      if (chatArea) {

        chatArea.innerHTML = `
          <div
            class="welcome"
            id="welcome"
          >

            <div class="big-logo">

              <img
                src="1787430604018.png"
                alt="KingGPT Logo"
              >

            </div>

            <h1>
              أهلاً بك في KingGPT 👑
            </h1>

            <p>
              إزاي أقدر أساعدك؟
            </p>

          </div>
        `;

      }


      if (messageInput) {

        messageInput.value =
          "";

      }

    }
  );

}


// ==================================================
// SIDEBAR MOBILE
// ==================================================

function openSidebar() {

  if (sidebar) {
    sidebar.classList.add(
      "open"
    );
  }


  if (overlay) {
    overlay.classList.add(
      "active"
    );
  }

}


function closeSidebar() {

  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }

}


if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      if (
        sidebar?.classList.contains(
          "open"
        )
      ) {

        closeSidebar();

      } else {

        openSidebar();

      }

    }
  );

}


if (overlay) {

  overlay.addEventListener(
    "click",
    closeSidebar
  );

}


// ==================================================
// SEND BUTTON
// ==================================================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

}


// ==================================================
// ENTER TO SEND
// ==================================================

if (messageInput) {

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

}


// ==================================================
// TEXTAREA RESIZE
// ==================================================

if (messageInput) {

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

      } catch {

        saved = {};

      }


      if (aboutUserInput) {

        aboutUserInput.value =
          saved.aboutUser || "";

      }


      if (responseStyleInput) {

        responseStyleInput.value =
          saved.responseStyle || "";

      }


      settingsScreen?.classList.remove(
        "app-hidden"
      );

    }
  );

}


if (settingsBackBtn) {

  settingsBackBtn.addEventListener(
    "click",
    () => {

      settingsScreen?.classList.add(
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
        JSON.stringify(
          instructions
        )
      );


      if (instructionsMessage) {

        instructionsMessage.textContent =
          "✓ تم حفظ التعليمات بنجاح";


        setTimeout(
          () => {

            instructionsMessage.textContent =
              "";

          },
          2500
        );

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

  } catch {

    settings = {};

  }


  if (modelSelect) {

    modelSelect.value =
      settings.model ||
      "kinggpt";

  }


  if (creativityRange) {

    creativityRange.value =
      settings.creativity ??
      50;

  }


  if (responseLengthSelect) {

    responseLengthSelect.value =
      settings.responseLength ||
      "medium";

  }


  if (languageSelect) {

    languageSelect.value =
      settings.language ||
      "ar";

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

  } catch {

    settings = {};

  }


  settings[key] =
    value;


  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(
      settings
    )
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
// HANDLE RESET PASSWORD URL
// ==================================================

function checkResetPasswordURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const token =
    params.get("token");


  if (
    window.location.pathname ===
      "/reset-password" &&
    token
  ) {

    showAuth();

    showResetPasswordPage(
      token
    );

    return true;
  }


  return false;

}


// ==================================================
// START KINGGPT
// ==================================================

if (!checkResetPasswordURL()) {

  restoreAuthScreen();

  checkAuth();

      }
