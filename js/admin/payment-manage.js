/**
 * Payment Management Module (Admin)
 * 관리자 결제 및 회원권 관리 기능
 */

class PaymentManager {
    constructor() {
        this.payments = [];
        this.membershipTypes = CONFIG.DEFAULT_MEMBERSHIP_TYPES;
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('Payment Manager initialized');
    }

    /**
     * 결제 관리 화면 렌더링
     */
    renderPaymentsView() {
        const contentArea = document.getElementById('paymentsContent');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">이번 달 매출</div>
                        <div class="stat-icon">💰</div>
                    </div>
                    <div class="stat-value" id="monthlyRevenue">0원</div>
                    <div class="stat-change positive">
                        <span>↑ 15%</span>
                        <span>지난달 대비</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">신규 결제</div>
                        <div class="stat-icon">📈</div>
                    </div>
                    <div class="stat-value" id="newPayments">0</div>
                    <div class="stat-change">
                        <span>이번 달</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">만료 예정</div>
                        <div class="stat-icon">⏰</div>
                    </div>
                    <div class="stat-value" id="expiringSoon">0</div>
                    <div class="stat-change warning">
                        <span>7일 이내</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">평균 결제액</div>
                        <div class="stat-icon">💵</div>
                    </div>
                    <div class="stat-value" id="averagePayment">0원</div>
                    <div class="stat-change">
                        <span>이번 달 평균</span>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3 class="table-title">결제 내역</h3>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm" onclick="paymentManager.exportPayments()">
                            내보내기
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="paymentManager.showAddPaymentModal()">
                            결제 등록
                        </button>
                    </div>
                </div>

                <div style="padding: 16px 24px; border-bottom: 1px solid var(--color-border-light);">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input
                            type="text"
                            id="paymentSearch"
                            placeholder="회원 이름으로 검색..."
                            style="flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                        >
                        <select
                            id="membershipTypeFilter"
                            style="padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                        >
                            <option value="all">모든 회원권</option>
                            ${this.membershipTypes.map(type =>
                                `<option value="${type.id}">${type.name}</option>`
                            ).join('')}
                        </select>
                        <input
                            type="month"
                            id="monthFilter"
                            style="padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                        >
                    </div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>결제번호</th>
                            <th>회원명</th>
                            <th>회원권 종류</th>
                            <th>결제 금액</th>
                            <th>결제일</th>
                            <th>시작일</th>
                            <th>만료일</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody id="paymentTableBody">
                        <tr>
                            <td colspan="9" class="text-center" style="padding: 40px;">
                                결제 내역이 없습니다.
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

            <div class="table-container" style="margin-top: 24px;">
                <div class="table-header">
                    <h3 class="table-title">회원권 종류 관리</h3>
                    <button class="btn btn-primary btn-sm" onclick="paymentManager.showAddMembershipTypeModal()">
                        회원권 추가
                    </button>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>회원권 이름</th>
                            <th>기간</th>
                            <th>가격</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.membershipTypes.map(type => `
                            <tr>
                                <td>${type.name}</td>
                                <td>${type.duration}일</td>
                                <td>${NumberUtils.formatCurrency(type.price)}</td>
                                <td class="table-actions-cell">
                                    <button class="icon-btn" onclick="paymentManager.editMembershipType(${type.id})" title="수정">
                                        ✏️
                                    </button>
                                    <button class="icon-btn delete" onclick="paymentManager.deleteMembershipType(${type.id})" title="삭제">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // 통계 업데이트
        this.updateStats();
    }

    /**
     * 통계 업데이트
     */
    updateStats() {
        // Mock 데이터
        document.getElementById('monthlyRevenue').textContent = NumberUtils.formatCurrency(12450000);
        document.getElementById('newPayments').textContent = '24';
        document.getElementById('expiringSoon').textContent = '8';
        document.getElementById('averagePayment').textContent = NumberUtils.formatCurrency(518750);
    }

    /**
     * 결제 등록 모달
     */
    showAddPaymentModal() {
        Toast.info('결제 등록 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 결제 내보내기
     */
    exportPayments() {
        Toast.info('결제 내역 내보내기 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 회원권 종류 추가 모달
     */
    showAddMembershipTypeModal() {
        Toast.info('회원권 추가 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 회원권 종류 수정
     */
    editMembershipType(id) {
        Toast.info(`회원권 ID ${id}를 수정합니다.`);
    }

    /**
     * 회원권 종류 삭제
     */
    deleteMembershipType(id) {
        if (!confirm('이 회원권 종류를 삭제하시겠습니까?')) {
            return;
        }
        Toast.success('회원권이 삭제되었습니다.');
    }
}

// PaymentManager 인스턴스 생성
const paymentManager = new PaymentManager();
