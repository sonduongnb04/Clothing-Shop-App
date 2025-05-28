const fetch = require('node-fetch');

async function addMoreCategories() {
    try {
        console.log('Đang thêm thêm categories...');

        const newCategories = [
            {
                name: 'Đồ thể thao',
                description: 'Quần áo thể thao, giày thể thao',
                image: 'the-thao-icon.png'
            },
            {
                name: 'Đồ ngủ',
                description: 'Pyjama, áo ngủ, đồ mặc nhà',
                image: 'do-ngu-icon.png'
            },
            {
                name: 'Đồ công sở',
                description: 'Trang phục công sở chuyên nghiệp',
                image: 'cong-so-icon.png'
            },
            {
                name: 'Đồ dự tiệc',
                description: 'Trang phục dự tiệc sang trọng',
                image: 'du-tiec-icon.png'
            }
        ];

        for (const category of newCategories) {
            try {
                const response = await fetch('http://localhost:5000/api/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(category)
                });

                const result = await response.json();
                if (response.ok) {
                    console.log(`✅ Đã thêm danh mục: ${category.name}`);
                } else {
                    console.log(`⚠️ ${category.name}: ${result.message}`);
                }
            } catch (error) {
                console.error(`❌ Lỗi khi thêm ${category.name}:`, error.message);
            }
        }

        // Kiểm tra tổng số categories
        console.log('\n📋 Kiểm tra danh sách categories hiện tại:');
        const categoriesResponse = await fetch('http://localhost:5000/api/categories');
        const categories = await categoriesResponse.json();
        console.log(`Tổng số categories: ${categories.length}`);
        categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
        });

    } catch (error) {
        console.error('Lỗi:', error.message);
    }
}

addMoreCategories(); 