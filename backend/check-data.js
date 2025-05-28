require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Kết nối MongoDB thành công');

        const categories = await Category.find();
        const products = await Product.find();

        console.log(`\n📊 Tổng kết dữ liệu:`);
        console.log(`Categories: ${categories.length}`);
        console.log(`Products: ${products.length}`);

        console.log(`\n📝 Danh sách Categories:`);
        categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name} (ID: ${cat._id})`);
        });

        console.log(`\n🛍️ Sản phẩm theo danh mục:`);
        for (const category of categories) {
            const categoryProducts = await Product.find({ category: category._id });
            console.log(`${category.name}: ${categoryProducts.length} sản phẩm`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    }
}

checkData(); 