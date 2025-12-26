// GA100 보안 시스템
const SECURITY_CONFIG = {
    BOT_ACTIVE_TIMES: [
        { start: 8.33, end: 14.5 },   // 08:20 - 14:30
        { start: 18, end: 19 },        // 18:00 - 19:00
        { start: 22, end: 30.5 }       // 22:00 - 06:30 (다음날)
    ]
};

let securityInterval = null;

function initSecurity() {
    // 보안 봇 시작
    startSecurityBot();
    
    // 페이지 보안 모니터링
    monitorPageSecurity();
}

function startSecurityBot() {
    // 1분마다 보안 체크
    securityInterval = setInterval(() => {
        if (isBotActiveTime()) {
            performSecurityCheck();
        }
    }, 60000);
}

function isBotActiveTime() {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    
    return SECURITY_CONFIG.BOT_ACTIVE_TIMES.some(time => {
        if (time.end > 24) {
            return hours >= time.start || hours <= (time.end - 24);
        }
        return hours >= time.start && hours <= time.end;
    });
}

function performSecurityCheck() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // 무단 수강 체크
    checkUnauthorizedAccess(currentUser);
    
    // 의심스러운 활동 체크
    checkSuspiciousActivity(currentUser);
}

function checkUnauthorizedAccess(user) {
    // 현재 페이지가 강의 상세 페이지인지 확인
    if (window.location.pathname.includes('course-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        
        if (courseId) {
            const course = getCourseById(courseId);
            
            // 무료 강의는 체크 안함
            if (!course || course.isFree) return;
            
            // 수강 권한 체크
            if (!checkEnrollment(user.id, courseId)) {
                blockUser(user.id, '결제 없이 유료 강의 접근 시도');
            }
        }
    }
}

function checkSuspiciousActivity(user) {
    // 짧은 시간 내 과도한 요청 체크
    const activityKey = `activity_${user.id}`;
    const activity = sessionStorage.getItem(activityKey);
    const now = Date.now();
    
    if (activity) {
        const data = JSON.parse(activity);
        const timeDiff = now - data.lastTime;
        
        // 1초에 10회 이상 요청 시 의심
        if (timeDiff < 1000 && data.count > 10) {
            blockUser(user.id, '비정상적인 활동 패턴 감지');
            return;
        }
        
        // 카운터 업데이트
        if (timeDiff < 1000) {
            data.count++;
        } else {
            data.count = 1;
        }
        data.lastTime = now;
        
        sessionStorage.setItem(activityKey, JSON.stringify(data));
    } else {
        sessionStorage.setItem(activityKey, JSON.stringify({
            count: 1,
            lastTime: now
        }));
    }
}

function blockUser(userId, reason) {
    addToBlacklist(userId, reason);
    
    // 관리자에게 알림
    addNotification({
        userId: 'admin',
        title: '보안 경고',
        content: `사용자가 차단되었습니다: ${reason}`,
        link: 'admin.html?tab=blacklist'
    });
    
    // 모든 사용자에게 알림
    addNotification({
        userId: 'all',
        title: '보안 조치',
        content: '위험 사용자가 차단되어 모든 회원에게 20,000 포인트가 지급되었습니다.',
        link: 'my-home.html?tab=points'
    });
    
    // 사용자 로그아웃
    if (getCurrentUser()?.id === userId) {
        alert('보안 위반으로 계정이 30일간 정지되었습니다.');
        logout();
        window.location.href = 'index.html';
    }
}

function monitorPageSecurity() {
    // 개발자 도구 감지
    let devtoolsOpen = false;
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                logSecurityEvent('개발자 도구 열림 감지');
            }
        } else {
            devtoolsOpen = false;
        }
    }, 1000);
    
    // 우클릭 방지 (강의 페이지에서만)
    if (window.location.pathname.includes('course-detail.html')) {
        document.addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        });
        
        // 텍스트 선택 방지
        document.addEventListener('selectstart', e => {
            if (e.target.classList.contains('course-content')) {
                e.preventDefault();
                return false;
            }
        });
        
        // F12, Ctrl+Shift+I 방지
        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                return false;
            }
        });
    }
}

function logSecurityEvent(event) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push({
        userId: currentUser.id,
        event,
        timestamp: Date.now()
    });
    
    // 최근 100개만 유지
    if (logs.length > 100) {
        logs.shift();
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (securityInterval) {
        clearInterval(securityInterval);
    }
});
