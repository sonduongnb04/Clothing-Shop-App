const fetch = require('node-fetch');

async function initCategories() {
    try {
        console.log('Đang gọi API để khởi tạo categories...');

        const response = await fetch('http://localhost:5000/api/categories/init-sample-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        const data = await response.json();
        console.log('Kết quả:', data);

        // Kiểm tra tất cả categories
        console.log('\nKiểm tra danh sách categories:');
        const categoriesResponse = await fetch('http://localhost:5000/api/categories');
        const categories = await categoriesResponse.json();
        console.log('Danh sách categories:', categories);

    } catch (error) {
        console.error('Lỗi:', error.message);
    }
}

initCategories(); 