// Campaign filtering and search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const artistFilter = document.getElementById('artistFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const resetBtn = document.querySelector('.btn-reset-filter');
    const campaignCards = document.querySelectorAll('.campaign-card');
    const resultsInfo = document.querySelector('.results-info strong');

    // Filter function
    function filterCampaigns() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const artistValue = artistFilter.value;
        const categoryValue = categoryFilter.value;
        
        let visibleCount = 0;

        campaignCards.forEach(card => {
            const cardStatus = card.getAttribute('data-status');
            const cardArtist = card.getAttribute('data-artist');
            const cardCategory = card.getAttribute('data-category');
            const cardText = card.textContent.toLowerCase();

            const matchesSearch = cardText.includes(searchTerm);
            const matchesStatus = !statusValue || cardStatus === statusValue;
            const matchesArtist = !artistValue || cardArtist === artistValue;
            const matchesCategory = !categoryValue || cardCategory === categoryValue;

            if (matchesSearch && matchesStatus && matchesArtist && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        resultsInfo.textContent = `${visibleCount} chiến dịch`;
    }

    // Event listeners
    searchInput.addEventListener('input', filterCampaigns);
    statusFilter.addEventListener('change', filterCampaigns);
    artistFilter.addEventListener('change', filterCampaigns);
    categoryFilter.addEventListener('change', filterCampaigns);

    // Reset filters
    resetBtn.addEventListener('click', function() {
        searchInput.value = '';
        statusFilter.value = '';
        artistFilter.value = '';
        categoryFilter.value = '';
        sortFilter.value = 'newest';
        filterCampaigns();
    });

    // Sort functionality (basic implementation)
    sortFilter.addEventListener('change', function() {
        // This would require more complex sorting logic
        console.log('Sort by:', this.value);
    });
});
