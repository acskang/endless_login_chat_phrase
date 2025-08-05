// ===================================================================
// modals control
// ===================================================================

// 모달 열기 - 범용 함수 (디버깅 로그 추가)
function openModal(modalId) {
  console.log("Opening modal:", modalId);
  if (modalId === "loginModal" || modalId === "signupModal") {
    // 다른 모달이 열려있으면 먼저 닫기
    closeModal("loginModal");
    closeModal("signupModal");

    // 잠시 후 새 모달 열기
    setTimeout(() => {
      document.getElementById(modalId).style.display = "block";
      document.body.style.overflow = "hidden";
      console.log("Modal opened:", modalId);
    }, 100);
  }
}

// 모달 닫기 - 범용 함수 (디버깅 로그 추가)
function closeModal(modalId) {
  console.log("Closing modal:", modalId);
  if (modalId === "loginModal" || modalId === "signupModal") {
    document.getElementById(modalId).style.display = "none";
    document.body.style.overflow = "auto";
    console.log("Modal closed:", modalId);
  }
}

// 모달 외부 클릭 시 닫기
window.addEventListener("click", function (e) {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  if (e.target === loginModal) {
    closeModal("loginModal");
  } else if (e.target === signupModal) {
    closeModal("signupModal");
  }
});

// ESC 키로 모달 닫기
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal("loginModal");
    closeModal("signupModal");
  }
});

// 페이지 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");

  // body overflow 초기화
  document.body.style.overflow = "auto";

  // 모든 모달 닫기
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.style.display = "none";
  });

  console.log("Initialization complete");
});
document.getElementById("signupForm").addEventListener("submit", function (e) {
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const passwordConfirm = document.getElementById(
    "signupPasswordConfirm"
  ).value;

  // 기본 유효성 검사
  if (!username || !email || !password || !passwordConfirm) {
    e.preventDefault();
    alert("모든 필드를 입력해주세요.");
    return;
  }

  if (password !== passwordConfirm) {
    e.preventDefault();
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (password.length < 6) {
    e.preventDefault();
    alert("비밀번호는 최소 6자 이상이어야 합니다.");
    return;
  }

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    e.preventDefault();
    alert("올바른 이메일 주소를 입력해주세요.");
    return;
  }

  // 유효성 검사 통과 시 폼 제출 (Django로 처리)
  console.log("회원가입 폼 제출");
});
