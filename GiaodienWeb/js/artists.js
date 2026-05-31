// Artists page functionality
document.addEventListener('DOMContentLoaded', async () => {
    await loadArtists();
});

async function loadArtists() {
    try {
        // Load artists and campaigns
        const [artistsResponse, campaignsResponse] = await Promise.all([
            api.getAllNgheSi(),
            api.getAllChienDich()
        ]);

        console.log('Artists Response:', artistsResponse);
        console.log('Campaigns Response:', campaignsResponse);

        if (!artistsResponse.success || !campaignsResponse.success) {
            console.error('Failed to load data');
            return;
        }

        const artists = artistsResponse.data;
        const campaigns = campaignsResponse.data;

        console.log('First artist:', artists[0]);
        console.log('First artist images:', artists[0]?.hinhAnhNgheSis);

        // Calculate stats for each artist
        const artistsWithStats = artists.map(artist => {
            // Find all campaigns for this artist
            const artistCampaigns = campaigns.filter(c => c.ngheSi?.maNgheSi === artist.maNgheSi);
            
            // Calculate total registered products from all campaigns
            const totalRegisteredProducts = artistCampaigns.reduce((sum, campaign) => {
                return sum + (campaign.tongSoLuongHienTai || 0);
            }, 0);

            return {
                ...artist,
                campaignCount: artistCampaigns.length,
                totalRegisteredProducts: totalRegisteredProducts
            };
        });

        renderArtists(artistsWithStats);
    } catch (error) {
        console.error('Error loading artists:', error);
    }
}

function renderArtists(artists) {
    const grid = document.querySelector('.artists-grid');
    if (!grid) return;

    // Clear existing content to prevent duplication
    grid.innerHTML = '';

    if (!artists || artists.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Không có nghệ sĩ nào.</p>';
        return;
    }

    grid.innerHTML = artists.map(artist => {
        // Get first image or use data URI placeholder to avoid 404 loop
        const imageUrl = artist.hinhAnhNgheSis && artist.hinhAnhNgheSis.length > 0
            ? `../${artist.hinhAnhNgheSis[0].duongDan}`
            : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="40" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

        return `
            <div class="artist-card">
                <div class="artist-image">
                    <img src="${imageUrl}" alt="${artist.tenNgheSi}" onerror="if(this.src!=='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2240%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'){this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2240%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'}">
                </div>
                <div class="artist-info">
                    <h3>${artist.tenNgheSi}</h3>
                    <p class="artist-role">${artist.ngheNghiep || 'Artist'}</p>
                    <p class="artist-desc">${artist.moTa || 'Nghệ sĩ tài năng với phong cách độc đáo.'}</p>
                    <div class="artist-stats">
                        <span>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            ${artist.campaignCount} chiến dịch
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
