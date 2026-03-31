// Admin common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update admin profile info
    const user = auth.getCurrentUser();
    if (user) {
        const profileSpan = document.querySelector('.admin-profile span');
        const profileImg = document.querySelector('.admin-profile img');
        if (profileSpan) profileSpan.textContent = user.fullname;
        if (profileImg) profileImg.src = user.avatar;
    }
    
    // Toggle dropdown
    const adminProfile = document.querySelector('.admin-profile');
    if (adminProfile) {
        adminProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            adminProfile.classList.remove('active');
        });
    }
});
