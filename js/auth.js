// GA100 인증 시스템
function initAuth() {
    const currentUser = getCurrentUser();
    const authBtn = document.getElementById('authBtn');
    
    if (authBtn) {
        if (currentUser) {
            authBtn.textContent = '로그아웃';
            authBtn.onclick = handleLogout;
        } else {
            authBtn.textContent = '로그인';
            authBtn.onclick = () => window.location.href = 'login.html';
        }
    }
}

function handleLogin(nickname, password) {
    // 블랙리스트 체크
    const users = getUsers();
    const user = users.find(u => u.nickname === nickname);
    
    if (user && isBlacklisted(user.id)) {
        return {
            success: false,
            message: '이용이 정지된 계정입니다.'
        };
    }
    
    // 로그인
    const foundUser = getUserByCredentials(nickname, password);
    if (foundUser) {
        setCurrentUser(foundUser.id);
        return {
            success: true,
            user: foundUser
        };
    }
    
    return {
        success: false,
        message: '닉네임 또는 비밀번호가 일치하지 않습니다.'
    };
}

function handleSignup(nickname, password) {
    // 중복 체크
    if (checkUserExists(nickname, password)) {
        return {
            success: false,
            message: '이미 사용 중인 닉네임 또는 비밀번호입니다.'
        };
    }
    
    // 회원가입
    const newUser = addUser({
        nickname,
        password,
        role: 'user'
    });
    
    setCurrentUser(newUser.id);
    
    return {
        success: true,
        user: newUser
    };
}

function handleLogout() {
    logout();
    window.location.href = 'index.html';
}

function requireAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return false;
    }
    
    if (isBlacklisted(currentUser.id)) {
        alert('이용이 정지된 계정입니다.');
        logout();
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

function requireAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
