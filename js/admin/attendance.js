/**
 * Attendance Management Module (Admin)
 * 관리자 출석 관리 기능
 */

class AttendanceManager {
    constructor() {
        this.todayAttendance = [];
        this.attendanceHistory = [];
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('Attendance Manager initialized');
    }

    /**
     * 출석 관리 화면 렌더링
     */
    renderAttendanceView() {
        const contentArea = document.getElementById('attendanceContent');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">오늘 출석</div>
                        <div class="stat-icon">✓</div>
                    </div>
                    <div class="stat-value" id="todayCount">0</div>
                    <div class="stat-change">
                        <span>${DateUtils.getToday()}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">이번 주 평균</div>
                        <div class="stat-icon">📊</div>
                    </div>
                    <div class="stat-value" id="weeklyAverage">0</div>
                    <div class="stat-change positive">
                        <span>↑ 5%</span>
                        <span>지난주 대비</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">이번 달 총 출석</div>
                        <div class="stat-icon">📅</div>
                    </div>
                    <div class="stat-value" id="monthlyTotal">0</div>
                    <div class="stat-change">
                        <span>이번 달</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">출석률</div>
                        <div class="stat-icon">%</div>
                    </div>
                    <div class="stat-value" id="attendanceRate">0%</div>
                    <div class="stat-change positive">
                        <span>활성 회원 기준</span>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3 class="table-title">오늘 출석 현황</h3>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm" onclick="attendanceManager.refreshToday()">
                            새로고침
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="attendanceManager.showManualCheckInModal()">
                            수동 체크인
                        </button>
                    </div>
                </div>

                <div style="padding: 16px 24px; border-bottom: 1px solid var(--color-border-light);">
                    <input
                        type="text"
                        id="attendanceSearch"
                        placeholder="회원 이름으로 검색..."
                        style="width: 100%; max-width: 400px; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                    >
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>회원명</th>
                            <th>회원번호</th>
                            <th>체크인 시간</th>
                            <th>체크아웃 시간</th>
                            <th>운동 시간</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody id="todayAttendanceTable">
                        ${this.renderTodayAttendance()}
                    </tbody>
                </table>
            </div>

            <div class="table-container" style="margin-top: 24px;">
                <div class="table-header">
                    <h3 class="table-title">출석 이력</h3>
                    <div class="table-actions">
                        <input
                            type="date"
                            id="dateFilter"
                            value="${DateUtils.getToday()}"
                            style="padding: 6px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                            onchange="attendanceManager.loadHistoryByDate()"
                        >
                        <button class="btn btn-outline btn-sm" onclick="attendanceManager.exportAttendance()">
                            내보내기
                        </button>
                    </div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th>회원명</th>
                            <th>체크인</th>
                            <th>체크아웃</th>
                            <th>운동 시간</th>
                            <th>비고</th>
                        </tr>
                    </thead>
                    <tbody id="attendanceHistoryTable">
                        <tr>
                            <td colspan="6" class="text-center" style="padding: 40px;">
                                출석 기록이 없습니다.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="pagination">
                    <div class="pagination-info">전체 0건</div>
                    <div class="pagination-controls">
                        <button class="page-btn active">1</button>
                    </div>
                </div>
            </div>
        `;

        this.updateStats();
        this.loadTodayAttendance();
    }

    /**
     * 오늘 출석 렌더링
     */
    renderTodayAttendance() {
        // Mock 데이터
        const mockData = [
            { name: '김민지', id: 'M001', checkIn: '09:30', checkOut: '11:00', duration: '1시간 30분' },
            { name: '이수진', id: 'M002', checkIn: '10:15', checkOut: '11:45', duration: '1시간 30분' },
            { name: '박지은', id: 'M003', checkIn: '14:00', checkOut: '-', duration: '-' }
        ];

        if (mockData.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 40px;">
                        오늘 출석한 회원이 없습니다.
                    </td>
                </tr>
            `;
        }

        return mockData.map(record => `
            <tr>
                <td>${record.name}</td>
                <td>${record.id}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut}</td>
                <td>${record.duration}</td>
                <td class="table-actions-cell">
                    ${record.checkOut === '-' ?
                        `<button class="btn btn-sm btn-outline" onclick="attendanceManager.checkOut('${record.id}')">체크아웃</button>` :
                        `<span class="text-secondary">완료</span>`
                    }
                </td>
            </tr>
        `).join('');
    }

    /**
     * 통계 업데이트
     */
    updateStats() {
        document.getElementById('todayCount').textContent = '87';
        document.getElementById('weeklyAverage').textContent = '92';
        document.getElementById('monthlyTotal').textContent = '2,184';
        document.getElementById('attendanceRate').textContent = '75%';
    }

    /**
     * 오늘 출석 데이터 로드
     */
    async loadTodayAttendance() {
        // API 호출 또는 Mock 데이터 사용
        const tbody = document.getElementById('todayAttendanceTable');
        if (tbody) {
            tbody.innerHTML = this.renderTodayAttendance();
        }
    }

    /**
     * 날짜별 이력 조회
     */
    loadHistoryByDate() {
        const date = document.getElementById('dateFilter').value;
        Toast.info(`${date} 출석 이력을 조회합니다.`);
    }

    /**
     * 오늘 출석 새로고침
     */
    refreshToday() {
        Toast.success('출석 현황이 새로고침되었습니다.');
        this.loadTodayAttendance();
    }

    /**
     * 수동 체크인 모달
     */
    showManualCheckInModal() {
        Toast.info('수동 체크인 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 체크아웃 처리
     */
    checkOut(memberId) {
        Toast.success(`${memberId} 회원이 체크아웃되었습니다.`);
        this.loadTodayAttendance();
    }

    /**
     * 출석 데이터 내보내기
     */
    exportAttendance() {
        Toast.info('출석 데이터 내보내기 기능은 추가 개발이 필요합니다.');
    }
}

// AttendanceManager 인스턴스 생성
const attendanceManager = new AttendanceManager();
