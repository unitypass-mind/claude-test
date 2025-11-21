/**
 * Member Management Module (Admin)
 * 관리자 회원 관리 기능
 */

class MemberManager {
    constructor() {
        this.members = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.filterStatus = 'all'; // all, active, inactive, expired
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('Member Manager initialized');
        this.loadMembers();
    }

    /**
     * 회원 목록 조회
     */
    async loadMembers(page = 1) {
        try {
            DOM.showLoading();

            const params = {
                page: page,
                limit: this.itemsPerPage,
                search: this.searchQuery,
                status: this.filterStatus !== 'all' ? this.filterStatus : undefined
            };

            let response;
            if (MockAPI.enabled) {
                response = await MockAPI.getMembers(params);
            } else {
                response = await api.get(CONFIG.ENDPOINTS.MEMBERS.LIST, params);
            }

            DOM.hideLoading();

            if (response.success) {
                this.members = response.data.members || [];
                this.currentPage = page;
                this.renderMemberList();
                this.renderPagination(response.data.total);
            } else {
                Toast.error(response.message || '회원 목록을 불러올 수 없습니다.');
            }

        } catch (error) {
            DOM.hideLoading();
            console.error('Load members error:', error);
            Toast.error('회원 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 회원 목록 렌더링
     */
    renderMemberList() {
        const contentArea = document.getElementById('membersContent');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h3 class="table-title">회원 목록</h3>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-sm" onclick="memberManager.exportToCSV()">
                            내보내기
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="memberManager.showAddMemberModal()">
                            회원 등록
                        </button>
                    </div>
                </div>

                <div style="padding: 16px 24px; border-bottom: 1px solid var(--color-border-light);">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input
                            type="text"
                            id="memberSearch"
                            placeholder="이름, 전화번호로 검색..."
                            style="flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                            onkeyup="memberManager.handleSearch(event)"
                        >
                        <select
                            id="statusFilter"
                            style="padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 6px;"
                            onchange="memberManager.handleFilterChange()"
                        >
                            <option value="all">전체 상태</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="expired">만료</option>
                        </select>
                    </div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>회원번호</th>
                            <th>이름</th>
                            <th>연락처</th>
                            <th>회원권</th>
                            <th>등록일</th>
                            <th>만료일</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody id="memberTableBody">
                        ${this.renderMemberRows()}
                    </tbody>
                </table>

                <div class="pagination" id="memberPagination">
                    <!-- 페이지네이션은 별도로 렌더링 -->
                </div>
            </div>
        `;
    }

    /**
     * 회원 테이블 행 렌더링
     */
    renderMemberRows() {
        if (this.members.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 40px;">
                        등록된 회원이 없습니다.
                    </td>
                </tr>
            `;
        }

        return this.members.map(member => `
            <tr>
                <td>${member.id || '-'}</td>
                <td>${member.name}</td>
                <td>${StringUtils.formatPhone(member.phone)}</td>
                <td>${member.membershipType || '-'}</td>
                <td>${DateUtils.formatDate(member.joinDate)}</td>
                <td>${member.membershipEnd ? DateUtils.formatDate(member.membershipEnd) : '-'}</td>
                <td>${this.getStatusBadge(member.status)}</td>
                <td class="table-actions-cell">
                    <button class="icon-btn" onclick="memberManager.viewMember(${member.id})" title="상세보기">
                        👁️
                    </button>
                    <button class="icon-btn" onclick="memberManager.editMember(${member.id})" title="수정">
                        ✏️
                    </button>
                    <button class="icon-btn delete" onclick="memberManager.deleteMember(${member.id})" title="삭제">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 상태 뱃지 생성
     */
    getStatusBadge(status) {
        const badges = {
            active: '<span class="badge badge-success">활성</span>',
            inactive: '<span class="badge">비활성</span>',
            expired: '<span class="badge badge-error">만료</span>'
        };
        return badges[status] || '<span class="badge">-</span>';
    }

    /**
     * 페이지네이션 렌더링
     */
    renderPagination(total) {
        const totalPages = Math.ceil(total / this.itemsPerPage);
        const pagination = document.getElementById('memberPagination');
        if (!pagination) return;

        let html = `
            <div class="pagination-info">
                전체 ${NumberUtils.formatNumber(total)}명
            </div>
            <div class="pagination-controls">
        `;

        // 이전 버튼
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="memberManager.loadMembers(${this.currentPage - 1})">이전</button>`;
        }

        // 페이지 번호
        for (let i = 1; i <= Math.min(5, totalPages); i++) {
            const active = i === this.currentPage ? 'active' : '';
            html += `<button class="page-btn ${active}" onclick="memberManager.loadMembers(${i})">${i}</button>`;
        }

        // 다음 버튼
        if (this.currentPage < totalPages) {
            html += `<button class="page-btn" onclick="memberManager.loadMembers(${this.currentPage + 1})">다음</button>`;
        }

        html += `
            </div>
        `;

        pagination.innerHTML = html;
    }

    /**
     * 검색 처리
     */
    handleSearch(event) {
        if (event.key === 'Enter' || event.type === 'click') {
            this.searchQuery = document.getElementById('memberSearch').value.trim();
            this.loadMembers(1);
        }
    }

    /**
     * 필터 변경 처리
     */
    handleFilterChange() {
        this.filterStatus = document.getElementById('statusFilter').value;
        this.loadMembers(1);
    }

    /**
     * 회원 추가 모달 표시
     */
    showAddMemberModal() {
        // 모달 구현 (예제)
        Toast.info('회원 등록 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 회원 상세보기
     */
    viewMember(id) {
        Toast.info(`회원 ID ${id}의 상세 정보를 조회합니다.`);
    }

    /**
     * 회원 수정
     */
    editMember(id) {
        Toast.info(`회원 ID ${id}를 수정합니다.`);
    }

    /**
     * 회원 삭제
     */
    async deleteMember(id) {
        if (!confirm('정말 이 회원을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await api.delete(CONFIG.ENDPOINTS.MEMBERS.DELETE(id));

            if (response.success) {
                Toast.success('회원이 삭제되었습니다.');
                this.loadMembers(this.currentPage);
            } else {
                Toast.error(response.message || '회원 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete member error:', error);
            Toast.error('회원 삭제 중 오류가 발생했습니다.');
        }
    }

    /**
     * CSV로 내보내기
     */
    exportToCSV() {
        Toast.info('CSV 내보내기 기능은 추가 개발이 필요합니다.');
    }
}

// MemberManager 인스턴스 생성
const memberManager = new MemberManager();
