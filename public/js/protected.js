// public/js/protected.js
$(document).ready(function() {

    function refreshAccessToken() {
        $.ajax({
            url: '/refresh-token',
            method: 'POST'
        }).done(function(response) {
            console.log('Access token refreshed successfully');
        }).fail(function(xhr) {
            console.error('Failed to refresh access token:', xhr.responseJSON.message);
            // 리프레시 토큰 갱신에 실패하면 로그아웃 처리
            window.location.href = '/';
        });
    }

    function logout() {
        $.ajax({
            url: '/logout',
            method: 'POST',
            success: function() {
                window.location.href = '/';
            }
        });
    }

    function autoRefreshToken() {
        setInterval(function() {
            refreshAccessToken();
        }, 55 * 1000); // 55초마다 엑세스 토큰 갱신 시도
    }

    $('#logout').click(logout);

    autoRefreshToken(); // 페이지 로드 시 토큰 자동 갱신 시작
});