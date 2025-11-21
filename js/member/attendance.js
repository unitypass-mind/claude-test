/**
 * Member Attendance Module
 * 회원 출석 체크 기능
 */

class MemberAttendanceManager {
    constructor() {
        this.attendanceHistory = [];
        this.monthlyStats = null;
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('Member Attendance Manager initialized');
        this.loadAttendanceHistory();
    }

    /**
     * 출석 체크 (체크인)
     */
    async checkIn() {
        try {
            DOM.showLoading();

            // API 호출 (Mock)
            if (MockAPI.enabled) {
                await MockAPI.delay(800);
            } else {
                const response = await api.post(CONFIG.ENDPOINTS.ATTENDANCE.CHECK_IN);
                if (!response.success) {
                    throw new Error(response.message);
                }
            }

            DOM.hideLoading();

            // 성공 메시지
            Toast.success('출석이 완료되었습니다!');

            // 현재 시간 표시
            const now = DateUtils.getNow();
            const lastCheckInEl = document.getElementById('lastCheckIn');
            if (lastCheckInEl) {
                lastCheckInEl.textContent = `마지막 출석: ${now}`;
            }

            // 출석 기록 새로고침
            this.loadAttendanceHistory();

        } catch (error) {
            DOM.hideLoading();
            console.error('Check-in error:', error);
            Toast.error(error.message || '출석 체크 중 오류가 발생했습니다.');
        }
    }

    /**
     * 체크아웃
     */
    async checkOut() {
        try {
            DOM.showLoading();

            // API 호출 (Mock)
            if (MockAPI.enabled) {
                await MockAPI.delay(500);
            } else {
                const response = await api.post(CONFIG.ENDPOINTS.ATTENDANCE.CHECK_OUT);
                if (!response.success) {
                    throw new Error(response.message);
                }
            }

            DOM.hideLoading();
            Toast.success('체크아웃이 완료되었습니다. 수고하셨습니다!');

            this.loadAttendanceHistory();

        } catch (error) {
            DOM.hideLoading();
            console.error('Check-out error:', error);
            Toast.error(error.message || '체크아웃 중 오류가 발생했습니다.');
        }
    }

    /**
     * 출석 기록 조회
     */
    async loadAttendanceHistory(month = null) {
        try {
            const user = auth.getCurrentUser();
            if (!user) return;

            // Mock 데이터
            this.attendanceHistory = this.generateMockHistory();
            this.monthlyStats = {
                totalDays: 31,
                attendedDays: 15,
                attendanceRate: 48,
                consecutiveDays: 3,
                totalWorkoutTime: '22시간 30분'
            };

            this.renderAttendanceHistory();

        } catch (error) {
            console.error('Load attendance history error:', error);
            Toast.error('출석 기록을 불러올 수 없습니다.');
        }
    }

    /**
     * Mock 출석 기록 생성
     */
    generateMockHistory() {
        const history = [];
        const today = new Date();

        // 최근 10일간의 출석 기록
        for (let i = 0; i < 10; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // 랜덤하게 출석 여부 결정
            if (Math.random() > 0.3) {
                const checkInHour = 9 + Math.floor(Math.random() * 5);
                const checkOutHour = checkInHour + 1 + Math.floor(Math.random() * 2);

                history.push({
                    date: DateUtils.formatDate(date),
                    checkIn: `${String(checkInHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                    checkOut: `${String(checkOutHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                    duration: `${checkOutHour - checkInHour}시간`
                });
            }
        }

        return history;
    }

    /**
     * 출석 기록 렌더링
     */
    renderAttendanceHistory() {
        // 통계 정보 업데이트
        const statsHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="info-item">
                    <div class="info-label">이번 달 출석</div>
                    <div class="info-value">${this.monthlyStats.attendedDays}일</div>
                </div>
                <div class="info-item">
                    <div class="info-label">출석률</div>
                    <div class="info-value">${this.monthlyStats.attendanceRate}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">연속 출석</div>
                    <div class="info-value">${this.monthlyStats.consecutiveDays}일</div>
                </div>
                <div class="info-item">
                    <div class="info-label">총 운동 시간</div>
                    <div class="info-value">${this.monthlyStats.totalWorkoutTime}</div>
                </div>
            </div>
        `;

        // 출석 기록 테이블
        const historyHTML = `
            <div class="table-container" style="margin-top: 24px;">
                <div class="table-header">
                    <h3 class="table-title">최근 출석 기록</h3>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th>체크인</th>
                            <th>체크아웃</th>
                            <th>운동 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.attendanceHistory.map(record => `
                            <tr>
                                <td>${record.date}</td>
                                <td>${record.checkIn}</td>
                                <td>${record.checkOut}</td>
                                <td>${record.duration}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // 섹션에 추가 (attendance section이 있는 경우)
        const attendanceSection = document.getElementById('attendanceSection');
        if (attendanceSection) {
            const scheduleSection = attendanceSection.querySelector('.schedule-section');
            if (scheduleSection) {
                // 기존 통계와 테이블이 있으면 제거
                const existingStats = scheduleSection.querySelector('[style*="grid"]');
                const existingTable = scheduleSection.querySelector('.table-container');
                if (existingStats) existingStats.remove();
                if (existingTable) existingTable.remove();

                // 새로운 통계와 테이블 추가
                scheduleSection.insertAdjacentHTML('beforeend', statsHTML + historyHTML);
            }
        }
    }

    /**
     * 월별 출석 조회
     */
    loadMonthlyAttendance(month) {
        Toast.info(`${month} 출석 기록을 조회합니다.`);
        this.loadAttendanceHistory(month);
    }
}

// MemberAttendanceManager 인스턴스 생성
const memberAttendanceManager = new MemberAttendanceManager();

// 전역 함수 (HTML에서 직접 호출)
function checkAttendance() {
    memberAttendanceManager.checkIn();
}
