/**
 * Authentication Logic
 * 로그인, 로그아웃 및 인증 관련 로직
 */

class AuthManager {
    constructor() {
        this.currentMode = null; // 'admin' or 'member'
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        // 페이지 로드 시 자동 로그인 체크
        this.checkAutoLogin();

        // 로그인 폼 이벤트 리스너 등록
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    /**
     * 자동 로그인 체크
     */
    checkAutoLogin() {
        const token = Storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const rememberMe = Storage.get(CONFIG.STORAGE_KEYS.REMEMBER_ME);
        const userMode = Storage.get(CONFIG.STORAGE_KEYS.USER_MODE);

        if (token && rememberMe && userMode) {
            // 토큰 검증 (실제로는 서버에 검증 요청)
            this.redirectToDashboard(userMode);
        }
    }

    /**
     * 로그인 처리
     */
    async handleLogin(event) {
        event.preventDefault();

        const form = event.target;
        const username = form.username.value.trim();
        const password = form.password.value;
        const rememberMe = form.rememberMe.checked;

        // 유효성 검증
        if (!username) {
            Toast.error('아이디를 입력해주세요.');
            return;
        }

        if (!password) {
            Toast.error('비밀번호를 입력해주세요.');
            return;
        }

        // 로딩 표시
        DOM.showLoading();

        try {
            // API 호출 (Mock API 사용 시)
            let response;

            if (MockAPI.enabled) {
                // Mock API 사용
                response = await MockAPI.login(username, password);
            } else {
                // 실제 API 호출
                response = await api.post(
                    CONFIG.ENDPOINTS.AUTH.LOGIN,
                    {
                        username,
                        password,
                        mode: this.currentMode
                    },
                    false // 로그인은 토큰 없이 요청
                );
            }

            DOM.hideLoading();

            if (response.success) {
                // 로그인 성공
                const { token, user } = response.data;

                // 토큰 저장
                Storage.set(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
                Storage.set(CONFIG.STORAGE_KEYS.USER_INFO, user);
                Storage.set(CONFIG.STORAGE_KEYS.USER_MODE, this.currentMode);
                Storage.set(CONFIG.STORAGE_KEYS.REMEMBER_ME, rememberMe);

                Toast.success('로그인 성공!');

                // 대시보드로 이동
                setTimeout(() => {
                    this.redirectToDashboard(this.currentMode);
                }, 1000);

            } else {
                // 로그인 실패
                Toast.error(response.message || '로그인에 실패했습니다.');
            }

        } catch (error) {
            DOM.hideLoading();
            console.error('Login error:', error);
            Toast.error('로그인 중 오류가 발생했습니다.');
        }
    }

    /**
     * 로그아웃
     */
    async logout() {
        try {
            // 서버에 로그아웃 요청 (선택사항)
            if (!MockAPI.enabled) {
                await api.post(CONFIG.ENDPOINTS.AUTH.LOGOUT);
            }

            // 로컬 스토리지 정리
            Storage.remove(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            Storage.remove(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            Storage.remove(CONFIG.STORAGE_KEYS.USER_INFO);
            Storage.remove(CONFIG.STORAGE_KEYS.USER_MODE);
            Storage.remove(CONFIG.STORAGE_KEYS.REMEMBER_ME);

            Toast.success('로그아웃되었습니다.');

            // 로그인 페이지로 이동
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            // 에러가 발생해도 로컬 데이터는 삭제하고 로그인 페이지로 이동
            Storage.clear();
            window.location.href = '/index.html';
        }
    }

    /**
     * 대시보드로 리다이렉트
     */
    redirectToDashboard(mode) {
        if (mode === 'admin') {
            window.location.href = '/pages/admin-dashboard.html';
        } else {
            window.location.href = '/pages/member-dashboard.html';
        }
    }

    /**
     * 현재 로그인한 사용자 정보 가져오기
     */
    getCurrentUser() {
        return Storage.get(CONFIG.STORAGE_KEYS.USER_INFO);
    }

    /**
     * 인증 여부 확인
     */
    isAuthenticated() {
        const token = Storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        return !!token;
    }

    /**
     * 관리자 권한 확인
     */
    isAdmin() {
        const mode = Storage.get(CONFIG.STORAGE_KEYS.USER_MODE);
        return mode === 'admin';
    }

    /**
     * 페이지 접근 권한 확인
     */
    checkPageAccess(requiredMode) {
        if (!this.isAuthenticated()) {
            window.location.href = '/index.html';
            return false;
        }

        const currentMode = Storage.get(CONFIG.STORAGE_KEYS.USER_MODE);
        if (requiredMode && currentMode !== requiredMode) {
            Toast.error('접근 권한이 없습니다.');
            this.redirectToDashboard(currentMode);
            return false;
        }

        return true;
    }
}

// AuthManager 인스턴스 생성
const auth = new AuthManager();

// ==============================================
// 전역 함수 (index.html에서 사용)
// ==============================================

/**
 * 모드 선택
 */
function selectMode(mode) {
    auth.currentMode = mode;

    // 모드 선택 화면 숨기기
    DOM.hide('modeSelection');

    // 로그인 폼 표시
    DOM.show('loginForm');

    // 로그인 타이틀 변경
    const loginTitle = document.getElementById('loginTitle');
    if (loginTitle) {
        loginTitle.textContent = mode === 'admin' ? '관리자 로그인' : '회원 로그인';
    }

    // 회원 전용 옵션 표시/숨김
    const memberOnlyOptions = document.getElementById('memberOnlyOptions');
    if (memberOnlyOptions) {
        if (mode === 'member') {
            DOM.show(memberOnlyOptions);
        } else {
            DOM.hide(memberOnlyOptions);
        }
    }
}

/**
 * 모드 선택으로 돌아가기
 */
function backToMode() {
    // 로그인 폼 숨기기
    DOM.hide('loginForm');

    // 모드 선택 화면 표시
    DOM.show('modeSelection');

    // 폼 초기화
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }

    auth.currentMode = null;
}

/**
 * 로그아웃 (대시보드에서 호출)
 */
function handleLogout() {
    if (confirm('로그아웃하시겠습니까?')) {
        auth.logout();
    }
}

// 디버그 모드일 때 인증 매니저 로그
if (CONFIG.DEBUG) {
    console.log('Auth Manager initialized');

    // 개발용 자동 로그인 정보
    console.log('개발용 로그인 정보:');
    console.log('관리자 - ID: admin, PW: admin123');
    console.log('회원 - ID: member1, PW: member123');

    // Mock API 활성화
    MockAPI.enabled = true;
}
