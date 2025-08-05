# account/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import User
from .forms import UserLoginForm, UserSignupForm
import logging
import time

logger = logging.getLogger(__name__)

# 서버 시작 시간 (전역 변수)
SERVER_START_TIME = time.time()


def login_view(request):
    """홈 페이지 - 로그인과 메인을 모두 처리"""

    # 서버 재시작 감지 및 자동 로그아웃
    if request.user.is_authenticated:
        session_server_time = request.session.get("server_start_time")
        if session_server_time != SERVER_START_TIME:
            # 서버가 재시작된 경우 로그아웃
            logout(request)
            request.session.flush()
            messages.info(request, "서버가 재시작되어 자동 로그아웃되었습니다.")
            return redirect("account:login")

    if request.method == "POST":
        email_or_username = request.POST.get("email_or_username", "").strip()
        password = request.POST.get("password", "")

        if not email_or_username or not password:
            messages.error(request, "이메일/사용자명과 비밀번호를 입력해주세요.")
            return render(request, "index.html")

        logger.info(f"로그인 시도: {email_or_username}")

        # 인증 시도
        user = None

        # 이메일로 시도
        if "@" in email_or_username:
            try:
                user_obj = User.objects.get(email=email_or_username)
                if user_obj.is_active:
                    user = authenticate(
                        request, username=user_obj.email, password=password
                    )
            except User.DoesNotExist:
                pass
        else:
            # 사용자명으로 시도
            try:
                user_obj = User.objects.get(username=email_or_username)
                if user_obj.is_active:
                    user = authenticate(
                        request, username=user_obj.email, password=password
                    )
            except User.DoesNotExist:
                pass

        if user:
            login(request, user)

            # 세션에 서버 시작 시간 저장
            request.session["server_start_time"] = SERVER_START_TIME

            logger.info(f"로그인 성공: {user.username}")
            return redirect("account:login")
        else:
            messages.error(request, "이메일/사용자명 또는 비밀번호가 잘못되었습니다.")
            logger.warning(f"로그인 실패: {email_or_username}")

    # GET 요청 시 서버 시작 시간을 세션에 저장
    if not request.session.get("server_start_time"):
        request.session["server_start_time"] = SERVER_START_TIME

    return render(request, "home.html")


def signup_view(request):
    """회원가입 처리"""
    if request.method == "POST":
        form = UserSignupForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data["username"]
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]

            try:
                # 사용자 생성
                user = User.objects.create_user(
                    username=username, email=email, password=password
                )

                logger.info(f"회원가입 성공: {username} ({email})")
                messages.success(request, "회원가입이 완료되었습니다! 로그인해주세요.")

                return redirect("account:login")

            except Exception as e:
                logger.error(f"회원가입 오류: {e}")
                messages.error(request, "회원가입 중 오류가 발생했습니다.")
        else:
            # 폼 에러를 메시지로 변환
            for field, errors in form.errors.items():
                for error in errors:
                    if field == "__all__":
                        messages.error(request, error)
                    else:
                        messages.error(request, f"{error}")

    return redirect("account:login")


def logout_view(request):
    """로그아웃"""
    if request.user.is_authenticated:
        username = request.user.username
        logout(request)
        request.session.flush()  # 세션 완전 삭제
        logger.info(f"로그아웃: {username}")

    return redirect("account:login")
