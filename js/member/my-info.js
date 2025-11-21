/**
 * Member Information Module
 * 회원 본인 정보 조회 및 수정 기능
 */

class MyInfoManager {
    constructor() {
        this.memberInfo = null;
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('My Info Manager initialized');
        this.loadMemberInfo();
    }

    /**
     * 회원 정보 로드
     */
    async loadMemberInfo() {
        try {
            const user = auth.getCurrentUser();
            if (!user) {
                Toast.error('사용자 정보를 불러올 수 없습니다.');
                return;
            }

            // Mock 데이터 또는 API 호출
            this.memberInfo = {
                id: user.id || 'M001',
                name: user.name || '김회원',
                email: user.email || 'member@example.com',
                phone: user.phone || '010-1234-5678',
                birthDate: user.birthDate || '1990-01-01',
                gender: user.gender || '여성',
                address: user.address || '서울시 강남구',
                joinDate: user.joinDate || '2024-01-01',
                membershipType: user.membershipType || '3개월권',
                membershipStart: user.membershipStart || '2024-01-01',
                membershipEnd: user.membershipEnd || '2024-04-01',
                status: user.status || 'active'
            };

        } catch (error) {
            console.error('Load member info error:', error);
            Toast.error('회원 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 정보 수정 활성화
     */
    enableEdit() {
        // 입력 필드 활성화
        const inputs = document.querySelectorAll('#myinfoSection input');
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.removeAttribute('disabled');
            }
        });

        // 버튼 변경
        const editBtn = document.querySelector('#myinfoSection .btn-outline');
        if (editBtn) {
            editBtn.textContent = '저장';
            editBtn.classList.remove('btn-outline');
            editBtn.classList.add('btn-primary');
            editBtn.setAttribute('onclick', 'myInfoManager.saveInfo()');
        }
    }

    /**
     * 정보 저장
     */
    async saveInfo() {
        try {
            DOM.showLoading();

            // 입력값 가져오기
            const updatedInfo = {
                name: document.getElementById('infoName')?.value,
                email: document.getElementById('infoEmail')?.value,
                phone: document.getElementById('infoPhone')?.value,
                address: document.getElementById('infoAddress')?.value
            };

            // 유효성 검증
            const errors = [];

            if (!updatedInfo.name) {
                errors.push('이름을 입력해주세요.');
            }

            if (updatedInfo.email && !StringUtils.isValidEmail(updatedInfo.email)) {
                errors.push('유효한 이메일을 입력해주세요.');
            }

            if (updatedInfo.phone && !StringUtils.isValidPhone(updatedInfo.phone)) {
                errors.push('유효한 전화번호를 입력해주세요.');
            }

            if (errors.length > 0) {
                DOM.hideLoading();
                Toast.error(errors.join('\\n'));
                return;
            }

            // API 호출 (Mock)
            await new Promise(resolve => setTimeout(resolve, 1000));

            DOM.hideLoading();
            Toast.success('정보가 성공적으로 수정되었습니다.');

            // 편집 모드 해제
            this.disableEdit();

        } catch (error) {
            DOM.hideLoading();
            console.error('Save info error:', error);
            Toast.error('정보 저장 중 오류가 발생했습니다.');
        }
    }

    /**
     * 편집 모드 해제
     */
    disableEdit() {
        // 입력 필드 비활성화
        const inputs = document.querySelectorAll('#myinfoSection input');
        inputs.forEach(input => {
            input.setAttribute('disabled', 'disabled');
        });

        // 버튼 복원
        const saveBtn = document.querySelector('#myinfoSection .btn-primary');
        if (saveBtn) {
            saveBtn.textContent = '정보 수정';
            saveBtn.classList.remove('btn-primary');
            saveBtn.classList.add('btn-outline');
            saveBtn.setAttribute('onclick', 'myInfoManager.enableEdit()');
        }
    }

    /**
     * 비밀번호 변경 모달
     */
    showChangePasswordModal() {
        Toast.info('비밀번호 변경 기능은 추가 개발이 필요합니다.');
    }

    /**
     * 회원 탈퇴
     */
    async requestWithdrawal() {
        const confirmed = confirm(
            '정말 탈퇴하시겠습니까?\\n탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.'
        );

        if (!confirmed) {
            return;
        }

        try {
            // API 호출
            Toast.info('회원 탈퇴 기능은 추가 개발이 필요합니다.');

        } catch (error) {
            console.error('Withdrawal error:', error);
            Toast.error('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    }
}

// MyInfoManager 인스턴스 생성
const myInfoManager = new MyInfoManager();
