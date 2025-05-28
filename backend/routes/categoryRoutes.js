const express = require('express');
const router = express.Router();
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy danh mục theo ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy tất cả sản phẩm thuộc danh mục
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tạo danh mục mới
router.post('/', async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    // Kiểm tra xem danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Danh mục này đã tồn tại' });
    }

    const category = new Category({
      name,
      description,
      image: image || 'icon.png'
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Khởi tạo dữ liệu mẫu cho danh mục (chỉ chạy một lần)
router.post('/init-sample-data', async (req, res) => {
  try {
    // Kiểm tra xem đã có dữ liệu chưa
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      return res.json({ message: 'Dữ liệu danh mục đã có sẵn', categories: existingCategories });
    }

    // Tạo dữ liệu mẫu
    const sampleCategories = [
      {
        name: 'Áo',
        description: 'Tất cả các loại áo thời trang',
        image: 'ao-icon.png'
      },
      {
        name: 'Quần',
        description: 'Quần dài, quần ngắn, quần jean',
        image: 'quan-icon.png'
      },
      {
        name: 'Váy',
        description: 'Váy dài, váy ngắn, váy công sở',
        image: 'vay-icon.png'
      },
      {
        name: 'Phụ kiện',
        description: 'Túi xách, giày dép, trang sức',
        image: 'phu-kien-icon.png'
      },
      {
        name: 'Đồ thể thao',
        description: 'Quần áo thể thao, giày thể thao',
        image: 'the-thao-icon.png'
      },
      {
        name: 'Đồ ngủ',
        description: 'Pyjama, áo ngủ, đồ mặc nhà',
        image: 'do-ngu-icon.png'
      }
    ];

    const createdCategories = await Category.insertMany(sampleCategories);
    res.status(201).json({ 
      message: 'Đã tạo dữ liệu mẫu thành công', 
      categories: createdCategories 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
