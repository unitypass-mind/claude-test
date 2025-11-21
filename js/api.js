/**
 * API Communication Layer
 * 백엔드 API와의 통신을 담당하는 공통 함수
 */

class ApiClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.timeout = CONFIG.REQUEST.TIMEOUT;
    }

    /**
     * HTTP 요청 헤더 생성
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = Storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * 에러 핸들링
     */
    handleError(error) {
        console.error('API Error:', error);

        // 네트워크 에러
        if (!error.response) {
            return {
                success: false,
                message: '네트워크 연결을 확인해주세요.',
                error: 'NETWORK_ERROR'
            };
        }

        // HTTP 상태 코드별 처리
        const status = error.response.status;
        let message = '오류가 발생했습니다.';

        switch (status) {
            case 400:
                message = '잘못된 요청입니다.';
                break;
            case 401:
                message = '인증이 필요합니다.';
                // 토큰 만료 시 로그인 페이지로 이동
                this.handleUnauthorized();
                break;
            case 403:
                message = '접근 권한이 없습니다.';
                break;
            case 404:
                message = '요청한 리소스를 찾을 수 없습니다.';
                break;
            case 500:
                message = '서버 오류가 발생했습니다.';
                break;
            case 503:
                message = '서비스를 일시적으로 사용할 수 없습니다.';
                break;
        }

        return {
            success: false,
            message: error.response.data?.message || message,
            error: error.response.data?.error || 'API_ERROR',
            status
        };
    }

    /**
     * 인증 실패 처리
     */
    handleUnauthorized() {
        // 토큰 삭제
        Storage.remove(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        Storage.remove(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        Storage.remove(CONFIG.STORAGE_KEYS.USER_INFO);

        // 로그인 페이지로 리다이렉트 (현재 페이지가 index.html이 아닌 경우)
        if (!window.location.pathname.endsWith('index.html') &&
            !window.location.pathname.endsWith('/')) {
            Toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        }
    }

    /**
     * fetch를 사용한 HTTP 요청
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                return this.handleError({
                    response: {
                        status: response.status,
                        data
                    }
                });
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return {
                    success: false,
                    message: '요청 시간이 초과되었습니다.',
                    error: 'TIMEOUT_ERROR'
                };
            }

            return this.handleError(error);
        }
    }

    /**
     * GET 요청
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);

        // 쿼리 파라미터 추가
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.toString(), {
            method: 'GET',
            headers: this.getHeaders()
        });
    }

    /**
     * POST 요청
     */
    async post(endpoint, data = {}, includeAuth = true) {
        return this.request(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(includeAuth),
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 요청
     */
    async put(endpoint, data = {}) {
        return this.request(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH 요청
     */
    async patch(endpoint, data = {}) {
        return this.request(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 요청
     */
    async delete(endpoint) {
        return this.request(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }
}

// API 클라이언트 인스턴스 생성
const api = new ApiClient();

// ==============================================
// Mock API (개발용)
// 백엔드가 준비되지 않았을 때 사용할 Mock 데이터
// ==============================================

const MockAPI = {
    enabled: false, // Mock API 사용 여부

    // Mock 데이터
    data: {
        users: [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: '관리자',
                role: 'admin',
                email: 'admin@fitlady.com'
            },
            {
                id: 2,
                username: 'member1',
                password: 'member123',
                name: '김회원',
                role: 'member',
                email: 'member1@example.com',
                phone: '010-1234-5678',
                birthDate: '1990-01-01',
                membershipType: '3개월권',
                membershipStart: '2024-01-01',
                membershipEnd: '2024-04-01'
            }
        ],
        members: [],
        payments: [],
        attendance: [],
        schedules: [],
        reservations: []
    },

    /**
     * Mock 로그인
     */
    async login(username, password) {
        await this.delay(500); // 네트워크 지연 시뮬레이션

        const user = this.data.users.find(
            u => u.username === username && u.password === password
        );

        if (!user) {
            return {
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.'
            };
        }

        const token = 'mock_token_' + Date.now();
        const userData = { ...user };
        delete userData.password;

        return {
            success: true,
            data: {
                token,
                user: userData
            },
            message: '로그인 성공'
        };
    },

    /**
     * Mock 회원 목록 조회
     */
    async getMembers(params = {}) {
        await this.delay(300);

        return {
            success: true,
            data: {
                members: this.data.members,
                total: this.data.members.length,
                page: params.page || 1,
                limit: params.limit || 10
            }
        };
    },

    /**
     * 지연 시뮬레이션
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 개발 모드이고 Mock API가 활성화된 경우
if (CONFIG.DEBUG && MockAPI.enabled) {
    console.log('Mock API is enabled');
}

// ==============================================
// API 함수 내보내기
// ==============================================

// 디버그 모드일 때 API 클라이언트 로그
if (CONFIG.DEBUG) {
    console.log('API Client initialized');
}
