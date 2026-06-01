function logout() {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = '/frontend/login.html';
}

document.querySelector('.action-card').addEventListener('click', () => {
    document.getElementById('result').innerText = '';
}, true);

const loggedInUser = sessionStorage.getItem('loggedInUser');
if (!loggedInUser) {
    window.location.href = '/frontend/login.html';
} else {
    document.getElementById('name').value = loggedInUser;
}
