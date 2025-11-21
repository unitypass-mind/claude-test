/**
 * Utility Functions
 * 전역에서 사용되는 유틸리티 함수 모음
 */

// ==============================================
// 로컬스토리지 관리
// ==============================================

const Storage = {
    /**
     * 로컬스토리지에 값 저장
     */
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    /**
     * 로컬스토리지에서 값 가져오기
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    /**
     * 로컬스토리지에서 값 제거
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    /**
     * 로컬스토리지 전체 삭제
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// ==============================================
// 날짜/시간 유틸리티
// ==============================================

const DateUtils = {
    /**
     * Date 객체를 YYYY-MM-DD 형식으로 변환
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Date 객체를 YYYY-MM-DD HH:mm 형식으로 변환
     */
    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        const datePart = this.formatDate(d);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${datePart} ${hours}:${minutes}`;
    },

    /**
     * 날짜 문자열을 상대적인 시간으로 변환 (예: '2시간 전')
     */
    getRelativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = now - target;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 30) return `${days}일 전`;
        if (months < 12) return `${months}개월 전`;
        return `${years}년 전`;
    },

    /**
     * 두 날짜 사이의 일수 계산
     */
    getDaysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * 특정 날짜에 일수 더하기
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * 오늘 날짜 가져오기
     */
    getToday() {
        return this.formatDate(new Date());
    },

    /**
     * 현재 시간 가져오기
     */
    getNow() {
        return this.formatDateTime(new Date());
    }
};

// ==============================================
// 숫자 포맷팅
// ==============================================

const NumberUtils = {
    /**
     * 숫자를 통화 형식으로 변환 (예: 1000 -> 1,000원)
     */
    formatCurrency(number) {
        if (number === null || number === undefined) return '0원';
        return new Intl.NumberFormat('ko-KR').format(number) + '원';
    },

    /**
     * 숫자에 천단위 콤마 추가
     */
    formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('ko-KR').format(number);
    },

    /**
     * 백분율 계산
     */
    getPercentage(value, total) {
        if (!total || total === 0) return 0;
        return Math.round((value / total) * 100);
    }
};

// ==============================================
// 문자열 유틸리티
// ==============================================

const StringUtils = {
    /**
     * 전화번호 포맷팅 (010-1234-5678)
     */
    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phone;
    },

    /**
     * 이메일 유효성 검증
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * 전화번호 유효성 검증
     */
    isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    },

    /**
     * 문자열 자르기 (말줄임표 추가)
     */
    truncate(str, length) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }
};

// ==============================================
// 폼 검증
// ==============================================

const Validator = {
    /**
     * 필수 입력 검증
     */
    required(value, fieldName = '필드') {
        if (!value || value.trim() === '') {
            return `${fieldName}는 필수 입력 항목입니다.`;
        }
        return null;
    },

    /**
     * 이메일 검증
     */
    email(value) {
        if (!value) return null;
        if (!StringUtils.isValidEmail(value)) {
            return '유효한 이메일 주소를 입력해주세요.';
        }
        return null;
    },

    /**
     * 전화번호 검증
     */
    phone(value) {
        if (!value) return null;
        if (!StringUtils.isValidPhone(value)) {
            return '유효한 전화번호를 입력해주세요.';
        }
        return null;
    },

    /**
     * 최소 길이 검증
     */
    minLength(value, min) {
        if (!value) return null;
        if (value.length < min) {
            return `최소 ${min}자 이상 입력해주세요.`;
        }
        return null;
    },

    /**
     * 최대 길이 검증
     */
    maxLength(value, max) {
        if (!value) return null;
        if (value.length > max) {
            return `최대 ${max}자까지 입력 가능합니다.`;
        }
        return null;
    },

    /**
     * 숫자 검증
     */
    number(value) {
        if (!value) return null;
        if (isNaN(value)) {
            return '숫자만 입력 가능합니다.';
        }
        return null;
    },

    /**
     * 범위 검증
     */
    range(value, min, max) {
        if (!value) return null;
        const num = Number(value);
        if (num < min || num > max) {
            return `${min}에서 ${max} 사이의 값을 입력해주세요.`;
        }
        return null;
    }
};

// ==============================================
// Toast 알림
// ==============================================

const Toast = {
    /**
     * Toast 메시지 표시
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.error('Toast element not found');
            return;
        }

        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) {
            messageEl.textContent = message;
        }

        // 타입별 클래스 제거
        toast.classList.remove('success', 'error', 'warning', 'info');

        // 새로운 타입 클래스 추가
        if (type && type !== 'info') {
            toast.classList.add(type);
        }

        // Toast 표시
        toast.classList.remove('hidden');

        // 자동으로 숨기기
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// ==============================================
// DOM 유틸리티
// ==============================================

const DOM = {
    /**
     * 요소 표시/숨김
     */
    show(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },

    hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },

    toggle(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.toggle('hidden');
        }
    },

    /**
     * 로딩 상태 표시/숨김
     */
    showLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.classList.remove('hidden');
        }
    },

    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
};

// ==============================================
// 유틸리티 함수 내보내기
// ==============================================

// 디버그 모드일 때 유틸리티 함수 로그
if (CONFIG && CONFIG.DEBUG) {
    console.log('Utility functions loaded');
}
