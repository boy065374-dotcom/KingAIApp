* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
}

body {
  font-family: Arial, sans-serif;
  background: #080c13;
  color: #fff;
  overflow: hidden;
}

/* ================================
   AUTH
================================ */

.auth-screen {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 16px;

  background:
    radial-gradient(
      circle at 50% 0%,
      #18345e 0%,
      #080c13 52%
    );
}

.auth-card {
  width: min(420px, 100%);
  max-height: calc(100dvh - 32px);

  overflow-y: auto;

  padding: 30px 24px;

  background: rgba(13, 21, 34, 0.97);

  border: 1px solid #26364d;
  border-radius: 22px;

  text-align: center;

  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.5);
}

.auth-logo {
  width: 68px;
  height: 68px;

  margin: 0 auto 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #146eff;

  border-radius: 20px;

  font-size: 32px;
  font-weight: bold;
}

.auth-card h1 {
  font-size: 23px;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: #8795a8;
  font-size: 14px;
  margin-bottom: 22px;
}

/* Google */

.google-btn {
  width: 100%;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 10px;

  border: 1px solid #d4d4d4;
  border-radius: 12px;

  background: #fff;
  color: #111;

  font-size: 15px;
  font-weight: bold;

  cursor: pointer;
}

.google-btn:hover {
  background: #eeeeee;
}

.google-icon {
  font-size: 20px;
  font-weight: bold;
}

/* Divider */

.divider {
  display: flex;
  align-items: center;

  gap: 12px;

  margin: 21px 0;

  color: #68778c;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: "";

  flex: 1;

  height: 1px;

  background: #26364d;
}

/* Inputs */

.auth-card input {
  width: 100%;
  height: 48px;

  margin-bottom: 11px;

  padding: 0 14px;

  border: 1px solid #26364d;
  border-radius: 12px;

  outline: none;

  background: #111a28;
  color: #fff;

  font-size: 15px;

  direction: ltr;
  text-align: left;
}

.auth-card input::placeholder {
  color: #68778c;
}

.auth-card input:focus {
  border-color: #146eff;
}

/* Login */

.auth-btn {
  width: 100%;
  height: 48px;

  border: none;
  border-radius: 12px;

  background: #146eff;
  color: white;

  font-size: 15px;
  font-weight: bold;

  cursor: pointer;
}

.auth-btn:hover {
  background: #075ee8;
}

/* Forgot */

.forgot-btn {
  margin-top: 14px;

  border: none;
  background: transparent;

  color: #5d9cff;

  font-size: 13px;

  cursor: pointer;
}

/* Sign up */

.auth-switch {
  margin-top: 21px;

  color: #8795a8;

  font-size: 14px;
}

.auth-switch button {
  border: none;
  background: transparent;

  color: #5d9cff;

  font-weight: bold;

  cursor: pointer;
}

/* Message */

.auth-message {
  min-height: 20px;

  margin-top: 13px;

  color: #ff7777;

  font-size: 13px;
}

/* ================================
   APP
================================ */

.app-hidden {
  display: none !important;
}

#app {
  width: 100%;
  height: 100dvh;
}

/* ================================
   SIDEBAR
================================ */

.sidebar {
  position: fixed;

  top: 0;
  right: 0;

  width: 280px;
  height: 100dvh;

  padding: 18px;

  display: flex;
  flex-direction: column;

  background: #080c13;

  border-left: 1px solid #1b2636;

  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;

  gap: 10px;

  margin-bottom: 23px;

  font-size: 21px;
  font-weight: bold;
}

.logo-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #146eff;

  font-size: 20px;
  font-weight: bold;
}

.new-chat {
  width: 100%;
  min-height: 46px;

  border: 1px solid #26364d;
  border-radius: 12px;

  background: #111a28;
  color: white;

  font-size: 15px;

  cursor: pointer;
}

.new-chat:hover {
  background: #172438;
}

.section-title {
  margin: 25px 5px 10px;

  color: #718096;

  font-size: 13px;
}

.chats {
  flex: 1;

  overflow-y: auto;
}

.chat {
  padding: 12px;

  margin-bottom: 5px;

  border-radius: 10px;

  color: #c5cfdd;

  cursor: pointer;
}

.chat:hover,
.chat.active {
  background: #111a28;
  color: #fff;
}

.sidebar-bottom {
  margin-top: auto;
}

.side-button {
  width: 100%;

  padding: 13px;

  border: none;
  border-radius: 10px;

  background: transparent;
  color: #c5cfdd;

  text-align: right;

  font-size: 15px;

  cursor: pointer;
}

.side-button:hover {
  background: #111a28;
}

/* ================================
   MAIN
================================ */

.main {
  width: calc(100% - 280px);
  height: 100dvh;

  margin-right: 280px;

  display: flex;
  flex-direction: column;
}

.topbar {
  width: 100%;
  height: 60px;
  min-height: 60px;

  padding: 0 18px;

  display: flex;
  align-items: center;

  border-bottom: 1px solid #1b2636;
}

.menu-btn {
  display: none;

  border: none;
  background: transparent;

  color: #fff;

  font-size: 24px;

  cursor: pointer;
}

.mobile-title {
  font-size: 18px;
  font-weight: bold;
}

/* ================================
   CHAT
================================ */

.chat-area {
  width: 100%;

  flex: 1;
  min-height: 0;

  overflow-y: auto;

  padding: 25px 30px;
}

.welcome {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;
}

.big-logo {
  width: 76px;
  height: 76px;

  margin-bottom: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 22px;

  background: #146eff;

  font-size: 36px;
  font-weight: bold;
}

.welcome h1 {
  margin-bottom: 10px;

  font-size: clamp(22px, 4vw, 30px);
}

.welcome p {
  color: #8795a8;
}

/* ================================
   MESSAGES
================================ */

.message {
  width: 100%;

  display: flex;

  margin: 16px 0;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-text {
  max-width: min(720px, 75%);

  padding: 12px 16px;

  border-radius: 17px;

  line-height: 1.7;

  word-wrap: break-word;
}

/* User */

.message.user .message-text {
  background: #146eff;
  color: #fff;

  border-bottom-right-radius: 5px;
}

/* KingGPT */

.message.assistant .message-text {
  background: #111a28;
  color: #fff;

  border: 1px solid #26364d;

  border-bottom-left-radius: 5px;
}

/* ================================
   MARKDOWN
================================ */

.message-text strong {
  font-weight: 700;
}

.message-text em {
  font-style: italic;
}

.message-text code {
  background: #182235;

  padding: 3px 6px;

  border-radius: 6px;

  font-family: monospace;
}

.message-text pre {
  margin: 10px 0;

  padding: 14px;

  background: #080c13;

  border: 1px solid #26364d;

  border-radius: 12px;

  overflow-x: auto;

  direction: ltr;

  text-align: left;
}

.message-text pre code {
  padding: 0;

  background: transparent;
}

.message-text ul,
.message-text ol {
  margin: 8px 0;

  padding-right: 25px;
}

.message-text blockquote {
  margin: 10px 0;

  padding-right: 12px;

  border-right: 3px solid #146eff;

  color: #9aa8bb;
}

.message-text h1,
.message-text h2,
.message-text h3 {
  margin: 12px 0;
}

/* ================================
   INPUT
================================ */

.input-container {
  width: 100%;

  padding: 10px 20px 18px;

  flex-shrink: 0;
}

.input-box {
  width: min(850px, 100%);

  min-height: 58px;

  margin: auto;

  padding: 8px;

  display: flex;
  align-items: flex-end;

  background: #111a28;

  border: 1px solid #26364d;

  border-radius: 17px;
}

textarea {
  width: 100%;
  min-width: 0;

  max-height: 140px;

  resize: none;

  border: none;
  outline: none;

  background: transparent;

  color: white;

  font-family: inherit;

  font-size: 16px;

  line-height: 1.5;

  padding: 9px 10px;
}

textarea::placeholder {
  color: #68778c;
}

.send-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;

  border: none;
  border-radius: 12px;

  background: #146eff;
  color: white;

  font-size: 19px;

  cursor: pointer;
}

.send-btn:hover {
  background: #075ee8;
}

.input-note {
  width: 100%;

  margin-top: 7px;

  text-align: center;

  color: #536176;

  font-size: 11px;
}

/* ================================
   MOBILE
================================ */

@media (max-width: 700px) {

  .auth-screen {
    padding: 12px;
  }

  .auth-card {
    padding: 27px 19px;
    border-radius: 20px;
  }

  .auth-logo {
    width: 62px;
    height: 62px;

    font-size: 29px;
  }

  .auth-card h1 {
    font-size: 20px;
  }

  .sidebar {
    width: min(82vw, 300px);

    right: -100%;

    transition: right 0.25s ease;

    box-shadow:
      -10px 0 30px rgba(0, 0, 0, 0.4);
  }

  .sidebar.open {
    right: 0;
  }

  .main {
    width: 100%;
    height: 100dvh;

    margin-right: 0;
  }

  .topbar {
    height: 56px;
    min-height: 56px;

    padding: 0 12px;
  }

  .menu-btn {
    display: block;
  }

  .mobile-title {
    margin-right: 12px;
  }

  .chat-area {
    padding: 15px 10px;
  }

  .message-text {
    max-width: 88%;

    padding: 10px 13px;

    font-size: 15px;
  }

  .input-container {
    padding: 8px 8px 12px;
  }

  .input-box {
    min-height: 54px;

    padding: 6px;

    border-radius: 15px;
  }

  textarea {
    font-size: 16px;

    padding: 8px;
  }

  .send-btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }

  .input-note {
    margin-top: 5px;

    font-size: 10px;
  }
}

/* ================================
   SMALL PHONES
================================ */

@media (max-width: 380px) {

  .auth-card {
    padding: 23px 15px;
  }

  .auth-card h1 {
    font-size: 19px;
  }

  .message-text {
    max-width: 92%;
  }

  .input-container {
    padding-left: 5px;
    padding-right: 5px;
  }

  textarea {
    font-size: 15px;
  }

  .send-btn {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }
}
