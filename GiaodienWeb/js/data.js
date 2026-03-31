// Mock Data for EXPED System

// Users Database
const USERS = {
    customers: [
        {
            id: 1,
            email: 'nguyenthu2018dn@gmail.com',
            password: '123',
            fullname: 'Nguyễn Hoàng Anh Thư',
            phone: '0912345678',
            role: 'customer',
            avatar: '../images/rose.jpg',
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            email: 'user@test.com',
            password: '123456',
            fullname: 'Trần Thị B',
            phone: '0987654321',
            role: 'customer',
            avatar: '../images/lisa.jpg',
            createdAt: '2024-02-20'
        }
    ],
    admin: {
        id: 999,
        email: 'admin@gmail.com',
        password: '123',
        fullname: 'Admin User',
        phone: '0900000000',
        role: 'admin',
        avatar: '../images/rose.jpg',
        createdAt: '2023-01-01'
    }
};

// Campaigns Database
const CAMPAIGNS = [
    {
        id: 1,
        name: 'CHIẾN DỊCH ROSÉ X EXED',
        slug: 'rose-x-exed',
        artist: 'ROSÉ',
        artistId: 1,
        category: 'sneaker',
        status: 'ongoing',
        image: '../images/chiendich1.jpg',
        images: ['../images/chiendich1.jpg', '../images/chiendich2.jpg'],
        description: 'Giày sneaker phiên bản giới hạn được thiết kế độc quyền bởi ROSÉ và EXED.',
        originalPrice: 28850000,
        moq: 100,
        maxQuantity: 1200,
        currentQuantity: 924,
        endDate: '2026-04-03T23:59:59',
        createdAt: '2026-03-25',
        tieredPricing: [
            { range: '100-499', price: 25550000, discount: 11.4, votes: 397 },
            { range: '500-799', price: 23550000, discount: 18.4, votes: 412 },
            { range: '800-999', price: 21550000, discount: 25.3, votes: 82 },
            { range: '1000-1200', price: 18550000, discount: 35.7, votes: 33 }
        ],
        participationFee: 500000
    },
    {
        id: 2,
        name: 'CHIẾN DỊCH PARK BO GUM X EXED',
        slug: 'park-bo-gum-x-exed',
        artist: 'PARK BO GUM',
        artistId: 8,
        category: 'sneaker',
        status: 'ended',
        image: '../images/chiendich2.jpg',
        images: ['../images/chiendich2.jpg'],
        description: 'Limited edition sneaker collaboration.',
        originalPrice: 32100000,
        moq: 100,
        maxQuantity: 1200,
        currentQuantity: 1208,
        endDate: '2026-02-20T23:59:59',
        createdAt: '2026-02-01',
        finalPrice: 18790000,
        tieredPricing: [
            { range: '100-499', price: 28850000, discount: 10.1, votes: 250 },
            { range: '500-799', price: 25550000, discount: 20.4, votes: 380 },
            { range: '800-999', price: 22550000, discount: 29.8, votes: 298 },
            { range: '1000-1200', price: 18790000, discount: 41.5, votes: 280 }
        ],
        participationFee: 500000
    }
];

// Artists Database
const ARTISTS = [
    { id: 1, name: 'ROSÉ', image: '../images/rose.jpg', bio: 'Thành viên BLACKPINK' },
    { id: 2, name: 'LISA', image: '../images/lisa.jpg', bio: 'Thành viên BLACKPINK' },
    { id: 3, name: 'JISOO', image: '../images/jisoo.jpg', bio: 'Thành viên BLACKPINK' },
    { id: 4, name: 'JENNIE', image: '../images/jen.jpg', bio: 'Thành viên BLACKPINK' },
    { id: 5, name: 'GO YOUN JUNG', image: '../images/goyounjung.jpg', bio: 'Diễn viên Hàn Quốc' },
    { id: 6, name: 'KIM JI WON', image: '../images/kimjiwon.jpg', bio: 'Diễn viên Hàn Quốc' },
    { id: 7, name: 'JI CHANG WOOK', image: '../images/jichangwook.jpg', bio: 'Diễn viên Hàn Quốc' },
    { id: 8, name: 'PARK BO GUM', image: '../images/parkbogum.jpg', bio: 'Diễn viên Hàn Quốc' }
];

// Orders Database
const ORDERS = [
    {
        id: 'CD2024001',
        userId: 1,
        campaignId: 2,
        campaignName: 'CHIẾN DỊCH PARK BO GUM X EXED',
        status: 'delivered',
        betRange: '1000-1200',
        betCorrect: true,
        quantity: 2,
        paidAmount: 58200000,
        refundAmount: 20600000,
        finalAmount: 37600000,
        shippingStatus: 'delivered',
        orderDate: '2026-02-15',
        deliveryDate: '2026-03-10'
    },
    {
        id: 'CD2024002',
        userId: 1,
        campaignId: 1,
        campaignName: 'CHIẾN DỊCH ROSÉ X EXED',
        status: 'ongoing',
        betRange: '800-999',
        betCorrect: null,
        quantity: 1,
        paidAmount: 29350000,
        refundAmount: 0,
        finalAmount: 29350000,
        shippingStatus: 'pending',
        orderDate: '2026-03-25'
    }
];

// Reviews Database
const REVIEWS = [
    {
        id: 1,
        orderId: 'CD2024001',
        userId: 1,
        campaignId: 2,
        rating: 5,
        comment: 'Sản phẩm chất lượng tuyệt vời! Đúng như mô tả, giao hàng nhanh.',
        images: ['../images/review1.jpg', '../images/review1.1.jpg'],
        createdAt: '2026-03-15'
    }
];

// Export data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { USERS, CAMPAIGNS, ARTISTS, ORDERS, REVIEWS };
}
