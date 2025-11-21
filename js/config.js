/**
 * API Configuration
 * 백엔드 API 엔드포인트 설정 파일
 */

const CONFIG = {
    // API Base URL
    // 개발 환경에서는 로컬 서버, 프로덕션에서는 실제 서버 URL 사용
    API_BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://api.fitlady.com/api',

    // API Endpoints
    ENDPOINTS: {
        // 인증 관련
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password'
        },

        // 회원 관리 (관리자)
        MEMBERS: {
            LIST: '/members',
            CREATE: '/members',
            GET: (id) => `/members/${id}`,
            UPDATE: (id) => `/members/${id}`,
            DELETE: (id) => `/members/${id}`,
            SEARCH: '/members/search',
            STATS: '/members/stats'
        },

        // 결제 및 회원권
        PAYMENTS: {
            LIST: '/payments',
            CREATE: '/payments',
            GET: (id) => `/payments/${id}`,
            UPDATE: (id) => `/payments/${id}`,
            DELETE: (id) => `/payments/${id}`,
            MEMBER_PAYMENTS: (memberId) => `/members/${memberId}/payments`,
            STATS: '/payments/stats'
        },

        // 회원권 타입
        MEMBERSHIP_TYPES: {
            LIST: '/membership-types',
            CREATE: '/membership-types',
            UPDATE: (id) => `/membership-types/${id}`,
            DELETE: (id) => `/membership-types/${id}`
        },

        // 출석 관리
        ATTENDANCE: {
            LIST: '/attendance',
            CHECK_IN: '/attendance/check-in',
            CHECK_OUT: '/attendance/check-out',
            MEMBER_HISTORY: (memberId) => `/members/${memberId}/attendance`,
            STATS: '/attendance/stats',
            TODAY: '/attendance/today'
        },

        // PT/강습 일정
        SCHEDULES: {
            LIST: '/schedules',
            CREATE: '/schedules',
            GET: (id) => `/schedules/${id}`,
            UPDATE: (id) => `/schedules/${id}`,
            DELETE: (id) => `/schedules/${id}`,
            CALENDAR: '/schedules/calendar',
            UPCOMING: '/schedules/upcoming'
        },

        // 예약
        RESERVATIONS: {
            LIST: '/reservations',
            CREATE: '/reservations',
            GET: (id) => `/reservations/${id}`,
            CANCEL: (id) => `/reservations/${id}/cancel`,
            APPROVE: (id) => `/reservations/${id}/approve`,
            REJECT: (id) => `/reservations/${id}/reject`,
            MEMBER_RESERVATIONS: (memberId) => `/members/${memberId}/reservations`
        },

        // 대시보드
        DASHBOARD: {
            ADMIN_STATS: '/dashboard/admin/stats',
            MEMBER_INFO: '/dashboard/member/info'
        }
    },

    // 로컬스토리지 키
    STORAGE_KEYS: {
        AUTH_TOKEN: 'fitlady_auth_token',
        REFRESH_TOKEN: 'fitlady_refresh_token',
        USER_INFO: 'fitlady_user_info',
        USER_MODE: 'fitlady_user_mode', // 'admin' or 'member'
        REMEMBER_ME: 'fitlady_remember_me'
    },

    // 요청 설정
    REQUEST: {
        TIMEOUT: 30000, // 30초
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1초
    },

    // 페이지네이션 기본값
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // 날짜 포맷
    DATE_FORMAT: {
        DISPLAY: 'YYYY-MM-DD',
        DISPLAY_TIME: 'YYYY-MM-DD HH:mm',
        API: 'YYYY-MM-DD',
        API_TIME: 'YYYY-MM-DDTHH:mm:ss'
    },

    // 회원권 타입 (기본값)
    DEFAULT_MEMBERSHIP_TYPES: [
        { id: 1, name: '1개월권', duration: 30, price: 80000 },
        { id: 2, name: '3개월권', duration: 90, price: 210000 },
        { id: 3, name: '6개월권', duration: 180, price: 390000 },
        { id: 4, name: '1년권', duration: 365, price: 720000 }
    ],

    // 운영 시간
    OPERATING_HOURS: {
        WEEKDAY_START: '06:00',
        WEEKDAY_END: '22:00',
        WEEKEND_START: '08:00',
        WEEKEND_END: '20:00'
    },

    // Toast 메시지 설정
    TOAST: {
        DURATION: 3000, // 3초
        POSITION: 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
    },

    // 개발 모드
    DEBUG: window.location.hostname === 'localhost'
};

// 설정을 전역으로 접근 가능하게 설정 (읽기 전용)
Object.freeze(CONFIG);

// 헬퍼 함수: 전체 URL 생성
function getApiUrl(endpoint) {
    return `${CONFIG.API_BASE_URL}${endpoint}`;
}

// 헬퍼 함수: 엔드포인트 가져오기
function getEndpoint(category, action, ...params) {
    const endpoint = CONFIG.ENDPOINTS[category][action];
    if (typeof endpoint === 'function') {
        return endpoint(...params);
    }
    return endpoint;
}

// 디버그 모드일 때 설정 출력
if (CONFIG.DEBUG) {
    console.log('FitLady Config Loaded:', CONFIG);
}
