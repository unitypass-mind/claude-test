/**
 * Member Schedule Module
 * 회원 PT/강습 예약 관리 기능
 */

class MemberScheduleManager {
    constructor() {
        this.availableSchedules = [];
        this.myReservations = [];
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('Member Schedule Manager initialized');
        this.loadAvailableSchedules();
        this.loadMyReservations();
    }

    /**
     * 예약 가능한 일정 조회
     */
    async loadAvailableSchedules() {
        try {
            // Mock 데이터
            this.availableSchedules = [
                {
                    id: 1,
                    title: '오전 요가',
                    type: '강습',
                    instructor: '김강사',
                    date: '2024-01-25',
                    time: '09:00-10:00',
                    capacity: 10,
                    booked: 7,
                    available: 3
                },
                {
                    id: 2,
                    title: '필라테스 그룹',
                    type: '강습',
                    instructor: '이강사',
                    date: '2024-01-25',
                    time: '14:00-15:00',
                    capacity: 8,
                    booked: 5,
                    available: 3
                },
                {
                    id: 3,
                    title: '개인 PT',
                    type: 'PT',
                    instructor: '박트레이너',
                    date: '2024-01-26',
                    time: '10:30-11:30',
                    capacity: 1,
                    booked: 0,
                    available: 1
                }
            ];

        } catch (error) {
            console.error('Load available schedules error:', error);
            Toast.error('예약 가능한 일정을 불러올 수 없습니다.');
        }
    }

    /**
     * 내 예약 조회
     */
    async loadMyReservations() {
        try {
            const user = auth.getCurrentUser();
            if (!user) return;

            // Mock 데이터
            this.myReservations = [
                {
                    id: 1,
                    scheduleId: 1,
                    title: '오전 요가',
                    type: '강습',
                    date: '2024-01-25',
                    time: '09:00-10:00',
                    instructor: '김강사',
                    status: 'approved', // pending, approved, rejected, cancelled
                    reservedAt: '2024-01-20 14:30'
                }
            ];

        } catch (error) {
            console.error('Load my reservations error:', error);
            Toast.error('예약 내역을 불러올 수 없습니다.');
        }
    }

    /**
     * 예약 관리 화면 렌더링
     */
    renderScheduleView() {
        const contentArea = document.getElementById('scheduleSection');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="schedule-section">
                <div class="section-header">
                    <h2 class="section-title">예약 가능한 일정</h2>
                    <div style="display: flex; gap: 12px;">
                        <input
                            type="date"
                            id="scheduleFilterDate"
                            value="${DateUtils.getToday()}"
                            style="padding: 6px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                            onchange="memberScheduleManager.filterByDate()"
                        >
                        <select
                            id="scheduleFilterType"
                            style="padding: 6px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                            onchange="memberScheduleManager.filterByType()"
                        >
                            <option value="all">전체</option>
                            <option value="PT">PT</option>
                            <option value="강습">강습</option>
                        </select>
                    </div>
                </div>

                <div class="schedule-list" style="margin-bottom: 48px;">
                    ${this.renderAvailableSchedules()}
                </div>

                <div class="section-header" style="margin-top: 48px;">
                    <h2 class="section-title">내 예약</h2>
                </div>

                <div class="schedule-list">
                    ${this.renderMyReservations()}
                </div>
            </div>
        `;
    }

    /**
     * 예약 가능한 일정 렌더링
     */
    renderAvailableSchedules() {
        if (this.availableSchedules.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <h3 class="empty-title">예약 가능한 일정이 없습니다</h3>
                    <p class="empty-desc">다른 날짜를 선택해보세요.</p>
                </div>
            `;
        }

        return this.availableSchedules.map(schedule => `
            <div class="schedule-item" style="border-left-color: ${schedule.type === 'PT' ? 'var(--color-primary)' : 'var(--color-secondary)'};">
                <div class="schedule-time">
                    <div class="time">${schedule.time.split('-')[0]}</div>
                    <div class="date">${schedule.date}</div>
                </div>
                <div class="schedule-details">
                    <h4>${schedule.title}</h4>
                    <p>
                        <span class="badge ${schedule.type === 'PT' ? 'badge-primary' : 'badge-success'}">${schedule.type}</span>
                        ${schedule.instructor} •
                        ${schedule.available}/${schedule.capacity} 예약 가능
                    </p>
                </div>
                <div class="schedule-actions">
                    ${schedule.available > 0 ?
                        `<button class="btn btn-primary btn-sm" onclick="memberScheduleManager.reserveSchedule(${schedule.id})">예약하기</button>` :
                        `<button class="btn btn-sm" disabled>마감</button>`
                    }
                </div>
            </div>
        `).join('');
    }

    /**
     * 내 예약 렌더링
     */
    renderMyReservations() {
        if (this.myReservations.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3 class="empty-title">예약 내역이 없습니다</h3>
                    <p class="empty-desc">원하시는 일정을 예약해보세요!</p>
                </div>
            `;
        }

        return this.myReservations.map(reservation => `
            <div class="schedule-item">
                <div class="schedule-time">
                    <div class="time">${reservation.time.split('-')[0]}</div>
                    <div class="date">${reservation.date}</div>
                </div>
                <div class="schedule-details">
                    <h4>${reservation.title}</h4>
                    <p>
                        <span class="badge ${reservation.type === 'PT' ? 'badge-primary' : 'badge-success'}">${reservation.type}</span>
                        ${reservation.instructor} •
                        ${this.getReservationStatusBadge(reservation.status)}
                    </p>
                    <p class="text-secondary" style="font-size: 12px; margin-top: 4px;">
                        예약일시: ${reservation.reservedAt}
                    </p>
                </div>
                <div class="schedule-actions">
                    ${reservation.status === 'approved' || reservation.status === 'pending' ?
                        `<button class="btn btn-outline btn-sm" onclick="memberScheduleManager.cancelReservation(${reservation.id})">취소</button>` :
                        ''
                    }
                </div>
            </div>
        `).join('');
    }

    /**
     * 예약 상태 뱃지
     */
    getReservationStatusBadge(status) {
        const badges = {
            pending: '<span class="badge badge-warning">승인 대기</span>',
            approved: '<span class="badge badge-success">승인</span>',
            rejected: '<span class="badge badge-error">거절</span>',
            cancelled: '<span class="badge">취소됨</span>'
        };
        return badges[status] || '';
    }

    /**
     * 일정 예약
     */
    async reserveSchedule(scheduleId) {
        try {
            const schedule = this.availableSchedules.find(s => s.id === scheduleId);
            if (!schedule) {
                Toast.error('일정을 찾을 수 없습니다.');
                return;
            }

            const confirmed = confirm(
                `${schedule.title} 일정을 예약하시겠습니까?\\n\\n` +
                `날짜: ${schedule.date}\\n` +
                `시간: ${schedule.time}\\n` +
                `강사: ${schedule.instructor}`
            );

            if (!confirmed) return;

            DOM.showLoading();

            // API 호출 (Mock)
            if (MockAPI.enabled) {
                await MockAPI.delay(800);
            } else {
                const response = await api.post(CONFIG.ENDPOINTS.RESERVATIONS.CREATE, {
                    scheduleId
                });
                if (!response.success) {
                    throw new Error(response.message);
                }
            }

            DOM.hideLoading();
            Toast.success('예약이 완료되었습니다!\\n승인 후 확정됩니다.');

            // 데이터 새로고침
            await this.loadAvailableSchedules();
            await this.loadMyReservations();
            this.renderScheduleView();

        } catch (error) {
            DOM.hideLoading();
            console.error('Reserve schedule error:', error);
            Toast.error(error.message || '예약 중 오류가 발생했습니다.');
        }
    }

    /**
     * 예약 취소
     */
    async cancelReservation(reservationId) {
        try {
            const confirmed = confirm('예약을 취소하시겠습니까?');
            if (!confirmed) return;

            DOM.showLoading();

            // API 호출 (Mock)
            if (MockAPI.enabled) {
                await MockAPI.delay(500);
            } else {
                const response = await api.delete(
                    CONFIG.ENDPOINTS.RESERVATIONS.CANCEL(reservationId)
                );
                if (!response.success) {
                    throw new Error(response.message);
                }
            }

            DOM.hideLoading();
            Toast.success('예약이 취소되었습니다.');

            // 데이터 새로고침
            await this.loadAvailableSchedules();
            await this.loadMyReservations();
            this.renderScheduleView();

        } catch (error) {
            DOM.hideLoading();
            console.error('Cancel reservation error:', error);
            Toast.error(error.message || '예약 취소 중 오류가 발생했습니다.');
        }
    }

    /**
     * 날짜별 필터링
     */
    filterByDate() {
        const date = document.getElementById('scheduleFilterDate').value;
        Toast.info(`${date} 일정을 조회합니다.`);
        // 실제로는 여기서 API를 다시 호출하여 필터링된 데이터를 가져옴
    }

    /**
     * 타입별 필터링
     */
    filterByType() {
        const type = document.getElementById('scheduleFilterType').value;
        Toast.info(`${type} 일정을 조회합니다.`);
        // 실제로는 여기서 필터링 로직 적용
    }
}

// MemberScheduleManager 인스턴스 생성
const memberScheduleManager = new MemberScheduleManager();
