$(document).ready(function() {
  $('#loginForm').submit(function(e) {
      e.preventDefault();
      $.ajax({
          url: '/login',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              username: $('#username').val(),
              password: $('#password').val()
          }),
          success: function(response) {
              $('#result').text(response.message);
              window.location.href = '/protected';
          },
          error: function(xhr) {
              $('#result').text('Login failed: ' + xhr.responseJSON.message);
          }
      });
  });
});
