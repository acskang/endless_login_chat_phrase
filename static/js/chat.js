// ===================================================================
// Chat.js - 채팅 기능 및 버튼 제어
// ===================================================================

// Global Variables
let isLoggedIn = false;
let currentUser = null;
let chatSocket = null;
let isWebSocketSupported = false;

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Chat.js initialized");
  initializeChat();
});

// 채팅 초기화
function initializeChat() {
  checkLoginStatus();
  detectWebSocketSupport();
  setupChatButton();
  setupChatModal();
  console.log("✅ Chat system initialized");
}

// WebSocket 지원 감지
function detectWebSocketSupport() {
  if ("WebSocket" in window) {
    isWebSocketSupported = true;
    console.log("✅ WebSocket supported");
  } else {
    isWebSocketSupported = false;
    console.log("❌ WebSocket not supported");
  }
}

// 로그인 상태 확인
function checkLoginStatus() {
  console.log("🔐 로그인 상태 확인");

  // Django 템플릿에서 이미 버튼이 표시되어 있다면 로그인 상태로 간주
  const chatFloatingBtn = document.getElementById("chatFloatingBtn");
  if (
    chatFloatingBtn &&
    window.getComputedStyle(chatFloatingBtn).display === "flex"
  ) {
    isLoggedIn = true;
    currentUser = { username: "user" };
    console.log("✅ Django 템플릿에서 로그인 상태 확인됨");
    return; // 버튼을 그대로 두고 함수 종료
  }

  // 기존 로직들...
  const userElement = document.querySelector(".welcome-section p");
  if (userElement && userElement.textContent.includes("환영합니다")) {
    isLoggedIn = true;
    const username = userElement.textContent.match(/환영합니다, (.+)님!/)?.[1];
    if (username) {
      currentUser = { username: username };
    }
    showChatButton();
    return;
  }

  // 네비게이션에서 로그아웃 링크 확인
  const logoutLink = document.querySelector('a[href*="logout"]');
  if (logoutLink) {
    isLoggedIn = true;
    currentUser = { username: "user" };
    showChatButton();
    return;
  }

  // 로그아웃 상태
  isLoggedIn = false;
  currentUser = null;
  hideChatButton();
}

// 채팅 버튼 표시
function showChatButton() {
  const chatFloatingBtn = document.getElementById("chatFloatingBtn");
  if (chatFloatingBtn) {
    chatFloatingBtn.style.display = "flex";
    // 애니메이션 효과 추가
    setTimeout(() => {
      chatFloatingBtn.classList.add("show");
    }, 100);
    console.log("💬 채팅 버튼 표시됨");
  }
}

// 채팅 버튼 숨김
function hideChatButton() {
  const chatFloatingBtn = document.getElementById("chatFloatingBtn");
  if (chatFloatingBtn) {
    chatFloatingBtn.classList.remove("show");
    setTimeout(() => {
      chatFloatingBtn.style.display = "none";
    }, 300);
    console.log("🚫 채팅 버튼 숨겨짐");
  }
}

// 채팅 버튼 설정
function setupChatButton() {
  const chatFloatingBtn = document.getElementById("chatFloatingBtn");
  const chatModal = document.getElementById("chatModal");

  if (!chatFloatingBtn || !chatModal) {
    console.log("⚠️ 채팅 요소를 찾을 수 없음");
    return;
  }

  // 채팅 버튼 클릭 이벤트
  chatFloatingBtn.addEventListener("click", function () {
    console.log("💬 채팅 버튼 클릭됨");
    toggleChatModal();
  });
}

// 채팅 모달 설정
function setupChatModal() {
  const chatModal = document.getElementById("chatModal");
  const closeChat = document.getElementById("closeChat");
  const sendMessage = document.getElementById("sendMessage");
  const messageInput = document.getElementById("messageInput");

  if (!chatModal) {
    console.log("⚠️ 채팅 모달을 찾을 수 없음");
    return;
  }

  // 모달 닫기 버튼
  if (closeChat) {
    closeChat.addEventListener("click", function () {
      console.log("❌ 채팅 모달 닫기 버튼 클릭됨");
      closeChatModal();
    });
  }

  // 메시지 전송 설정
  if (sendMessage && messageInput) {
    const sendUserMessage = function () {
      const messageText = messageInput.value.trim();
      if (!messageText) return;

      console.log("📤 메시지 전송:", messageText);

      // 입력창 먼저 초기화 (UX 향상)
      messageInput.value = "";

      // WebSocket이 연결되어 있으면 실제 AI 채팅 사용
      if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        sendWebSocketMessage(messageText);
      }
      // WebSocket이 없으면 간단한 에코 응답 (백업)
      else {
        displayMessage(messageText, "sent");
        setTimeout(() => {
          displayMessage(`에코 응답: ${messageText}`, "received");
        }, 1000);

        // WebSocket 연결 시도 (로그인 상태일 때)
        if (isLoggedIn && isWebSocketSupported) {
          console.log("🔄 WebSocket 재연결 시도 중...");
          initializeWebSocket();
        }
      }
    };

    // 전송 버튼 클릭
    sendMessage.addEventListener("click", sendUserMessage);

    // Enter 키 입력
    messageInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
  }
}

// 채팅 모달 토글
function toggleChatModal() {
  const chatModal = document.getElementById("chatModal");
  const messageInput = document.getElementById("messageInput");

  if (chatModal.classList.contains("show")) {
    closeChatModal();
  } else {
    openChatModal();
    // 입력창에 포커스
    if (messageInput) {
      setTimeout(() => {
        messageInput.focus();
      }, 300);
    }
  }
}

// 채팅 모달 열기
function openChatModal() {
  const chatModal = document.getElementById("chatModal");
  if (chatModal) {
    chatModal.classList.add("show");
    console.log("🔓 채팅 모달 열림");

    // WebSocket 연결 초기화 (로그인 상태일 때만)
    if (isLoggedIn && isWebSocketSupported && !chatSocket) {
      initializeWebSocket();
    }
  }
}

// 채팅 모달 닫기
function closeChatModal() {
  const chatModal = document.getElementById("chatModal");
  if (chatModal) {
    chatModal.classList.remove("show");
    console.log("🔒 채팅 모달 닫힘");
  }
}

// 메시지 표시
function displayMessage(messageText, messageType) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) {
    console.error("❌ chatMessages 요소를 찾을 수 없습니다");
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${messageType}`;

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(messageText)}</p>
            <span class="timestamp">${timestamp}</span>
        </div>
    `;

  chatMessages.appendChild(messageDiv);

  // 스크롤을 맨 아래로
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 10);

  console.log(`💬 메시지 표시됨 (${messageType}):`, messageText);
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===================================================================
// WEBSOCKET FUNCTIONALITY
// ===================================================================

// WebSocket 연결 초기화
function initializeWebSocket() {
  if (!isLoggedIn) {
    console.log("🚫 WebSocket 초기화 건너뜀 - 로그인되지 않음");
    return;
  }

  if (!isWebSocketSupported) {
    console.log("🚫 WebSocket 초기화 건너뜀 - 브라우저에서 미지원");
    displaySystemMessage("이 브라우저는 실시간 채팅을 지원하지 않습니다.");
    return;
  }

  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    console.log("✅ WebSocket 이미 연결됨");
    return;
  }

  // WebSocket URL 설정 (/ws/chat/)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/chat/`;

  console.log("🔌 WebSocket 연결 시도:", wsUrl);

  try {
    chatSocket = new WebSocket(wsUrl);

    chatSocket.onopen = function (e) {
      console.log("✅ WebSocket 연결 성공");
      updateConnectionStatus("connected");
    };

    chatSocket.onmessage = function (e) {
      console.log("📨 WebSocket 메시지 수신:", e.data);
      try {
        const data = JSON.parse(e.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("❌ 메시지 파싱 오류:", error);
      }
    };

    chatSocket.onclose = function (e) {
      console.log(
        `❌ WebSocket 연결 종료 - Code: ${e.code}, Reason: ${e.reason}`
      );
      updateConnectionStatus("disconnected");
      chatSocket = null;

      // 로그인 상태이고 정상적인 종료가 아닌 경우 재연결 시도
      if (isLoggedIn && e.code !== 1000) {
        setTimeout(() => {
          console.log("🔄 WebSocket 재연결 시도...");
          initializeWebSocket();
        }, 3000);
      }
    };

    chatSocket.onerror = function (e) {
      console.error("❌ WebSocket 에러:", e);
      updateConnectionStatus("error");
      displaySystemMessage("채팅 서버 연결에 문제가 발생했습니다.");
    };
  } catch (error) {
    console.error("❌ WebSocket 생성 오류:", error);
    displaySystemMessage("채팅 서버에 연결할 수 없습니다.");
  }
}

// WebSocket 메시지 처리
function handleWebSocketMessage(data) {
  console.log("🎯 WebSocket 메시지 처리:", data);

  switch (data.type) {
    case "connection_established":
      console.log("✅ 연결 확립:", data.message);
      displaySystemMessage(data.message);
      break;

    case "chat_message":
      if (data.message) {
        // AI 응답은 받은 메시지로 표시
        if (data.message.sender === "ai" || data.message.sender === "system") {
          displayMessage(data.message.text, "received");
        }
        // 사용자 메시지는 이미 전송할 때 표시했으므로 중복 방지
        else if (data.message.sender === "user") {
          console.log("👤 사용자 메시지 수신 (화면 표시 스킵)");
        }
      }
      break;

    case "typing_indicator":
      if (data.message) {
        displaySystemMessage(data.message.text);
        // 3초 후 타이핑 메시지 제거
        setTimeout(() => {
          removeTypingIndicator();
        }, 3000);
      }
      break;

    case "error":
      console.error("❌ 서버 에러:", data.message);
      if (data.message && data.message.text) {
        displaySystemMessage(`오류: ${data.message.text}`);
      }
      break;

    default:
      console.log("❓ 알 수 없는 메시지 타입:", data.type);
  }
}

// WebSocket 메시지 전송
function sendWebSocketMessage(message) {
  if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
    console.error("❌ WebSocket이 연결되지 않음");
    displaySystemMessage(
      "채팅 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요."
    );
    return;
  }

  console.log("📤 WebSocket 메시지 전송:", message);

  // 사용자 메시지를 즉시 화면에 표시
  displayMessage(message, "sent");

  // 서버로 메시지 전송
  try {
    chatSocket.send(
      JSON.stringify({
        type: "message",
        message: message,
      })
    );
  } catch (error) {
    console.error("❌ 메시지 전송 오류:", error);
    displaySystemMessage("메시지 전송에 실패했습니다.");
  }
}

// 연결 상태 업데이트
function updateConnectionStatus(status) {
  const chatTitle = document.querySelector(".chat-title");
  if (chatTitle) {
    switch (status) {
      case "connected":
        chatTitle.textContent = "TheSysM Support (연결됨)";
        break;
      case "disconnected":
        chatTitle.textContent = "TheSysM Support (연결 끊김)";
        break;
      case "error":
        chatTitle.textContent = "TheSysM Support (연결 오류)";
        break;
      default:
        chatTitle.textContent = "TheSysM Support";
    }
  }
  console.log("📊 연결 상태 업데이트:", status);
}

// 시스템 메시지 표시
function displaySystemMessage(messageText) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = "message system";
  messageDiv.id = "system-message"; // 타이핑 메시지 제거용

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
        <div class="message-content" style="background: rgba(0, 0, 0, 0.05); color: #666; font-size: 14px; padding: 8px 16px; border-radius: 12px; max-width: 90%; text-align: center;">
            <p>${escapeHtml(messageText)}</p>
            <span class="timestamp">${timestamp}</span>
        </div>
    `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  console.log("📢 시스템 메시지 표시:", messageText);
}

// 타이핑 인디케이터 제거
function removeTypingIndicator() {
  const systemMessage = document.getElementById("system-message");
  if (
    systemMessage &&
    systemMessage.textContent.includes("AI가 응답을 생성하고 있습니다")
  ) {
    systemMessage.remove();
  }
}

// 외부에서 호출 가능한 함수들
window.chatSystem = {
  showButton: showChatButton,
  hideButton: hideChatButton,
  openModal: openChatModal,
  closeModal: closeChatModal,
  sendMessage: displayMessage,
  connectWebSocket: initializeWebSocket,
  isLoggedIn: () => isLoggedIn,
  currentUser: () => currentUser,
  socketStatus: () => (chatSocket ? chatSocket.readyState : "not connected"),
};

console.log("💬 Chat.js 로드 완료");
