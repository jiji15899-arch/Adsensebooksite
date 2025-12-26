// GA100 데이터 저장 및 관리
const STORAGE_KEYS = {
    USERS: 'ga100_users',
    COURSES: 'ga100_courses',
    ENROLLMENTS: 'ga100_enrollments',
    REVENUES: 'ga100_revenues',
    COMMUNITY: 'ga100_community',
    NOTIFICATIONS: 'ga100_notifications',
    BLACKLIST: 'ga100_blacklist'
};

// 초기 데이터 설정
function initStorage() {
    if (!getData(STORAGE_KEYS.USERS)) {
        setData(STORAGE_KEYS.USERS, [
            {
                id: 'admin',
                nickname: 'ga100admin',
                password: 'adminpower100',
                role: 'admin',
                points: 0,
                secretQuestions: 0,
                created: Date.now()
            }
        ]);
    }
    
    if (!getData(STORAGE_KEYS.COURSES)) {
        setData(STORAGE_KEYS.COURSES, [
            {
                id: 'course1',
                title: '애드센스 완벽 가이드',
                description: '애드센스 승인부터 수익화까지 모든 것을 배웁니다',
                price: 50000,
                category: '애드센스 승인',
                duration: 30,
                isFree: false,
                content: '강의 내용이 여기에 들어갑니다...',
                created: Date.now()
            },
            {
                id: 'course2',
                title: '애드센스 수익 극대화',
                description: '수익을 10배 증가시키는 실전 전략',
                price: 80000,
                category: '수익 창출',
                duration: 30,
                isFree: false,
                content: '강의 내용이 여기에 들어갑니다...',
                created: Date.now()
            },
            {
                id: 'course3',
                title: '무료 애드센스 입문',
                description: '애드센스의 기초를 무료로 배워보세요',
                price: 0,
                category: '무료',
                duration: 7,
                isFree: true,
                content: '강의 내용이 여기에 들어갑니다...',
                created: Date.now()
            }
        ]);
    }
    
    if (!getData(STORAGE_KEYS.ENROLLMENTS)) {
        setData(STORAGE_KEYS.ENROLLMENTS, []);
    }
    
    if (!getData(STORAGE_KEYS.REVENUES)) {
        setData(STORAGE_KEYS.REVENUES, []);
    }
    
    if (!getData(STORAGE_KEYS.COMMUNITY)) {
        setData(STORAGE_KEYS.COMMUNITY, []);
    }
    
    if (!getData(STORAGE_KEYS.NOTIFICATIONS)) {
        setData(STORAGE_KEYS.NOTIFICATIONS, []);
    }
    
    if (!getData(STORAGE_KEYS.BLACKLIST)) {
        setData(STORAGE_KEYS.BLACKLIST, []);
    }
}

// 데이터 가져오기
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// 데이터 저장하기
function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// 사용자 관련
function getUsers() {
    return getData(STORAGE_KEYS.USERS) || [];
}

function addUser(user) {
    const users = getUsers();
    users.push({
        ...user,
        id: generateId(),
        points: 0,
        secretQuestions: 0,
        created: Date.now()
    });
    setData(STORAGE_KEYS.USERS, users);
    return users[users.length - 1];
}

function updateUser(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        setData(STORAGE_KEYS.USERS, users);
        return users[index];
    }
    return null;
}

function deleteUser(userId) {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    setData(STORAGE_KEYS.USERS, filtered);
}

function getUserByCredentials(nickname, password) {
    const users = getUsers();
    return users.find(u => u.nickname === nickname && u.password === password);
}

function checkUserExists(nickname, password) {
    const users = getUsers();
    return users.some(u => u.nickname === nickname || u.password === password);
}

// 강의 관련
function getCourses() {
    return getData(STORAGE_KEYS.COURSES) || [];
}

function getCourseById(courseId) {
    return getCourses().find(c => c.id === courseId);
}

function addCourse(course) {
    const courses = getCourses();
    courses.push({
        ...course,
        id: generateId(),
        created: Date.now()
    });
    setData(STORAGE_KEYS.COURSES, courses);
}

function updateCourse(courseId, updates) {
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
        courses[index] = { ...courses[index], ...updates };
        setData(STORAGE_KEYS.COURSES, courses);
    }
}

function deleteCourse(courseId) {
    const courses = getCourses();
    const filtered = courses.filter(c => c.id !== courseId);
    setData(STORAGE_KEYS.COURSES, filtered);
}

// 수강 신청 관련
function getEnrollments() {
    return getData(STORAGE_KEYS.ENROLLMENTS) || [];
}

function getUserEnrollments(userId) {
    return getEnrollments().filter(e => e.userId === userId);
}

function addEnrollment(enrollment) {
    const enrollments = getEnrollments();
    enrollments.push({
        ...enrollment,
        id: generateId(),
        enrolled: Date.now(),
        status: 'pending'
    });
    setData(STORAGE_KEYS.ENROLLMENTS, enrollments);
}

function updateEnrollment(enrollmentId, updates) {
    const enrollments = getEnrollments();
    const index = enrollments.findIndex(e => e.id === enrollmentId);
    if (index !== -1) {
        enrollments[index] = { ...enrollments[index], ...updates };
        setData(STORAGE_KEYS.ENROLLMENTS, enrollments);
    }
}

function checkEnrollment(userId, courseId) {
    const enrollments = getEnrollments();
    const enrollment = enrollments.find(e => 
        e.userId === userId && 
        e.courseId === courseId && 
        e.status === 'active'
    );
    
    if (!enrollment) return false;
    
    const expiryDate = new Date(enrollment.expiryDate);
    if (expiryDate < new Date()) {
        updateEnrollment(enrollment.id, { status: 'expired' });
        return false;
    }
    
    return true;
}

// 수익 인증 관련
function getRevenues() {
    return getData(STORAGE_KEYS.REVENUES) || [];
}

function addRevenue(revenue) {
    const revenues = getRevenues();
    revenues.push({
        ...revenue,
        id: generateId(),
        created: Date.now()
    });
    setData(STORAGE_KEYS.REVENUES, revenues);
}

// 커뮤니티 관련
function getCommunityPosts(type = 'all') {
    const posts = getData(STORAGE_KEYS.COMMUNITY) || [];
    if (type === 'all') return posts;
    return posts.filter(p => p.type === type);
}

function addCommunityPost(post) {
    const posts = getCommunityPosts();
    const newPost = {
        ...post,
        id: generateId(),
        created: Date.now(),
        views: 0,
        comments: []
    };
    posts.push(newPost);
    setData(STORAGE_KEYS.COMMUNITY, posts);
    return newPost;
}

function addComment(postId, comment) {
    const posts = getCommunityPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            ...comment,
            id: generateId(),
            created: Date.now()
        });
        setData(STORAGE_KEYS.COMMUNITY, posts);
        
        // 댓글 작성 시 질문권 1회 증가
        const currentUser = getCurrentUser();
        if (currentUser && comment.userId === currentUser.id) {
            updateUser(currentUser.id, {
                secretQuestions: currentUser.secretQuestions + 1
            });
        }
    }
}

function updatePost(postId, updates) {
    const posts = getCommunityPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index] = { ...posts[index], ...updates };
        setData(STORAGE_KEYS.COMMUNITY, posts);
    }
}

function deletePost(postId) {
    const posts = getCommunityPosts();
    const filtered = posts.filter(p => p.id !== postId);
    setData(STORAGE_KEYS.COMMUNITY, filtered);
}

// 알림 관련
function getNotifications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    return notifications.filter(n => n.userId === currentUser.id || n.userId === 'all');
}

function addNotification(notification) {
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    notifications.push({
        ...notification,
        id: generateId(),
        time: Date.now(),
        read: false
    });
    setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

function markNotificationRead(notificationId) {
    const notifications = getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
}

// 블랙리스트 관련
function getBlacklist() {
    return getData(STORAGE_KEYS.BLACKLIST) || [];
}

function addToBlacklist(userId, reason) {
    const blacklist = getBlacklist();
    blacklist.push({
        userId,
        reason,
        added: Date.now(),
        expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30일
    });
    setData(STORAGE_KEYS.BLACKLIST, blacklist);
    
    // 모든 사용자에게 20000 포인트 지급
    const users = getUsers();
    users.forEach(u => {
        if (u.id !== userId) {
            updateUser(u.id, { points: u.points + 20000 });
        }
    });
}

function isBlacklisted(userId) {
    const blacklist = getBlacklist();
    const entry = blacklist.find(b => b.userId === userId);
    
    if (!entry) return false;
    
    if (entry.expiryDate < Date.now()) {
        removeFromBlacklist(userId);
        return false;
    }
    
    return true;
}

function removeFromBlacklist(userId) {
    const blacklist = getBlacklist();
    const filtered = blacklist.filter(b => b.userId !== userId);
    setData(STORAGE_KEYS.BLACKLIST, filtered);
}

// 현재 로그인 사용자
function getCurrentUser() {
    const userId = sessionStorage.getItem('currentUserId');
    if (!userId) return null;
    return getUsers().find(u => u.id === userId);
}

function setCurrentUser(userId) {
    sessionStorage.setItem('currentUserId', userId);
}

function logout() {
    sessionStorage.removeItem('currentUserId');
}

// 유틸리티
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 초기화
initStorage();
