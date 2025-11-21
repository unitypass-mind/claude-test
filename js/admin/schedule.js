/**
 * Schedule Management Module (Admin)
 * 관리자 PT/강습 일정 관리 기능
 */

class ScheduleManager {
    constructor() {
        this.schedules = [];
        this.reservations = [];
        this.currentDate = new Date();
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('Schedule Manager initialized');
    }

    /**
     * 일정 관리 화면 렌더링
     */
    renderScheduleView() {
        const contentArea = document.getElementById('scheduleContent');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">오늘 일정</div>
                        <div class="stat-icon">📅</div>
                    </div>
                    <div class="stat-value" id="todaySchedules">0</div>
                    <div class="stat-change">
                        <span>${DateUtils.getToday()}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">이번 주 예약</div>
                        <div class="stat-icon">📊</div>
                    </div>
                    <div class="stat-value" id="weeklyReservations">0</div>
                    <div class="stat-change positive">
                        <span>↑ 12%</span>
                        <span>지난주 대비</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">대기 중인 예약</div>
                        <div class="stat-icon">⏰</div>
                    </div>
                    <div class="stat-value" id="pendingReservations">0</div>
                    <div class="stat-change warning">
                        <span>승인 대기</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">예약률</div>
                        <div class="stat-icon">%</div>
                    </div>
                    <div class="stat-value" id="bookingRate">0%</div>
                    <div class="stat-change">
                        <span>이번 주</span>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="table-container">
                    <div class="table-header">
                        <h3 class="table-title">일정 관리</h3>
                        <button class="btn btn-primary btn-sm" onclick="scheduleManager.showAddScheduleModal()">
                            일정 추가
                        </button>
                    </div>

                    <div style="padding: 16px 24px;">
                        <input
                            type="date"
                            id="scheduleDate"
                            value="${DateUtils.getToday()}"
                            style="width: 100%; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                            onchange="scheduleManager.loadSchedulesByDate()"
                        >
                    </div>

                    <div style="padding: 0 24px 24px;">
                        <div id="scheduleList">
                            ${this.renderScheduleList()}
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-header">
                        <h3 class="table-title">예약 관리</h3>
                        <div class="table-actions">
                            <select
                                id="reservationStatusFilter"
                                style="padding: 6px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                                onchange="scheduleManager.filterReservations()"
                            >
                                <option value="all">전체</option>
                                <option value="pending">대기중</option>
                                <option value="approved">승인</option>
                                <option value="rejected">거절</option>
                                <option value="cancelled">취소</option>
                            </select>
                        </div>
                    </div>

                    <div style="padding: 0 24px 24px;">
                        <div id="reservationList">
                            ${this.renderReservationList()}
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3 class="table-title">전체 일정 목록</h3>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm" onclick="scheduleManager.exportSchedules()">
                            내보내기
                        </button>
                    </div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>일정 ID</th>
                            <th>일정 제목</th>
                            <th>유형</th>
                            <th>날짜</th>
                            <th>시간</th>
                            <th>정원</th>
                            <th>예약 수</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody id="scheduleTable">
                        <tr>
                            <td colspan="9" class="text-center" style="padding: 40px;">
                                등록된 일정이 없습니다.
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
    }

    /**
     * 일정 목록 렌더링
     */
    renderScheduleList() {
        // Mock 데이터
        const mockSchedules = [
            { id: 1, title: '오전 요가', type: 'PT', time: '09:00-10:00', capacity: 10, booked: 7 },
            { id: 2, title: '개인 PT - 김민지', type: 'PT', time: '10:30-11:30', capacity: 1, booked: 1 },
            { id: 3, title: '필라테스 그룹', type: '강습', time: '14:00-15:00', capacity: 8, booked: 5 }
        ];

        if (mockSchedules.length === 0) {
            return '<p class="text-center text-secondary">일정이 없습니다.</p>';
        }

        return mockSchedules.map(schedule => `
            <div style="padding: 16px; background: var(--color-bg-secondary); border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${schedule.title}</h4>
                        <p style="font-size: 14px; color: var(--color-text-secondary);">${schedule.time}</p>
                    </div>
                    <span class="badge badge-primary">${schedule.type}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: var(--color-text-secondary);">
                        ${schedule.booked}/${schedule.capacity} 예약
                    </span>
                    <div style="display: flex; gap: 8px;">
                        <button class="icon-btn" onclick="scheduleManager.editSchedule(${schedule.id})" title="수정">✏️</button>
                        <button class="icon-btn delete" onclick="scheduleManager.deleteSchedule(${schedule.id})" title="삭제">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 예약 목록 렌더링
     */
    renderReservationList() {
        // Mock 데이터
        const mockReservations = [
            { id: 1, memberName: '김민지', schedule: '오전 요가', time: '09:00', status: 'approved' },
            { id: 2, memberName: '이수진', schedule: '필라테스 그룹', time: '14:00', status: 'pending' },
            { id: 3, memberName: '박지은', schedule: '개인 PT', time: '10:30', status: 'approved' }
        ];

        if (mockReservations.length === 0) {
            return '<p class="text-center text-secondary">예약이 없습니다.</p>';
        }

        return mockReservations.map(reservation => `
            <div style="padding: 16px; background: var(--color-bg-secondary); border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${reservation.memberName}</h4>
                        <p style="font-size: 14px; color: var(--color-text-secondary);">${reservation.schedule} - ${reservation.time}</p>
                    </div>
                    ${this.getReservationStatusBadge(reservation.status)}
                </div>
                ${reservation.status === 'pending' ? `
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button class="btn btn-sm btn-primary" onclick="scheduleManager.approveReservation(${reservation.id})">승인</button>
                        <button class="btn btn-sm btn-outline" onclick="scheduleManager.rejectReservation(${reservation.id})">거절</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    /**
     * 예약 상태 뱃지
     */
    getReservationStatusBadge(status) {
        const badges = {
            pending: '<span class="badge badge-warning">대기중</span>',
            approved: '<span class="badge badge-success">승인</span>',
            rejected: '<span class="badge badge-error">거절</span>',
            cancelled: '<span class="badge">취소</span>'
        };
        return badges[status] || '';
    }

    /**
     * 통계 업데이트
     */
    updateStats() {
        document.getElementById('todaySchedules').textContent = '12';
        document.getElementById('weeklyReservations').textContent = '48';
        document.getElementById('pendingReservations').textContent = '5';
        document.getElementById('bookingRate').textContent = '78%';
    }

    /**
     * 날짜별 일정 조회
     */
    loadSchedulesByDate() {
        const date = document.getElementById('scheduleDate').value;
        Toast.info(`${date} 일정을 조회합니다.`);
    }

    /**
     * 예약 필터링
     */
    filterReservations() {
        const status = document.getElementById('reservationStatusFilter').value;
        Toast.info(`${status} 상태의 예약을 조회합니다.`);
    }

    /**
     * 일정 추가 모달
     */
    showAddScheduleModal() {
        Toast.info('일정 추가 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 일정 수정
     */
    editSchedule(id) {
        Toast.info(`일정 ID ${id}를 수정합니다.`);
    }

    /**
     * 일정 삭제
     */
    deleteSchedule(id) {
        if (!confirm('이 일정을 삭제하시겠습니까?')) {
            return;
        }
        Toast.success('일정이 삭제되었습니다.');
    }

    /**
     * 예약 승인
     */
    approveReservation(id) {
        Toast.success(`예약 ID ${id}가 승인되었습니다.`);
        setTimeout(() => {
            document.getElementById('reservationList').innerHTML = this.renderReservationList();
        }, 500);
    }

    /**
     * 예약 거절
     */
    rejectReservation(id) {
        if (!confirm('이 예약을 거절하시겠습니까?')) {
            return;
        }
        Toast.success(`예약 ID ${id}가 거절되었습니다.`);
    }

    /**
     * 일정 내보내기
     */
    exportSchedules() {
        Toast.info('일정 내보내기 기능은 추가 개발이 필요합니다.');
    }
}

// ScheduleManager 인스턴스 생성
const scheduleManager = new ScheduleManager();
