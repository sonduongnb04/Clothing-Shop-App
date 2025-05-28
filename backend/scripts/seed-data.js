const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Cấu hình biến môi trường
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối đến MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Dữ liệu danh mục
const categories = [
  {
    name: 'Áo',
    description: 'Các loại áo thời trang nam nữ',
    image: 'icon.png'
  },
  {
    name: 'Quần',
    description: 'Các loại quần thời trang nam nữ',
    image: 'icon.png'
  },
  {
    name: 'Váy',
    description: 'Các loại váy thời trang nữ',
    image: 'icon.png'
  },
  {
    name: 'Phụ kiện',
    description: 'Các loại phụ kiện thời trang',
    image: 'icon.png'
  }
];

// Dữ liệu sản phẩm
const generateProducts = (categoryIds) => {
  const products = [];

  // Sản phẩm danh mục Áo
  products.push(
    {
      name: 'Áo sơ mi nam ',
      description: 'Áo sơ mi nam , chất liệu lụa mềm mại, thoáng mát, dễ dàng phối đồ.',
      price: 299000,
      category: categoryIds[0], // Áo
      images: ['ao-so-mi.webp', 'ao-so-mi1.webp', 'ao-so-mi2.webp', 'ao-so-mi3.webp'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Trắng', 'Xanh nhạt', 'Đen'],
      inStock: true,
      rating: 4.2
    },
    {
      name: 'Áo khoác denim unisex',
      description: 'Áo khoác denim unisex phong cách Hàn Quốc, chất liệu denim dày dặn, form rộng.',
      price: 499000,
      discountPrice: 399000,
      category: categoryIds[0], // Áo
      images: ['ao-khoac-jean.webp', 'ao-khoac-jean1.webp', 'ao-khoac-jean2.webp', 'ao-khoac-jean3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Xanh nhạt', 'Xanh đậm'],
      inStock: true,
      rating: 4.8
    },
    {
      name: 'Áo polo nam',
      description: 'Áo polo nam thiết kế đơn giản, lịch sự, chất liệu cotton co giãn thoáng mát.',
      price: 249000,
      category: categoryIds[0], // Áo
      images: ['polo-dirtycoins.webp', 'polo-dirtycoins1.webp', 'polo-dirtycoins2.webp', 'polo-dirtycoins3.webp'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Đen', 'Trắng', 'Xanh navy', 'Đỏ đô'],
      inStock: true,
      rating: 4.3
    },
    {
      name: 'Áo thun Bad Habits',
      description: 'Áo thun Bad Habits phong cách đường phố, chất liệu cotton mềm mại, form rộng cá tính.',
      price: 259000,
      category: categoryIds[0], // Áo
      images: ['ao-badhabits.jpg', 'ao-badhabits1.jpg', 'ao-badhabits2.jpg', 'ao-badhabits3.jpg'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Đen', 'Trắng', 'Xám'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Áo khoác Flanel',
      description: 'Áo khoác Flanel chất liệu dày dặn, giữ ấm tốt, phong cách đường phố hiện đại.',
      price: 399000,
      discountPrice: 349000,
      category: categoryIds[0], // Áo
      images: ['ao-khoac-flanel.jpg', 'ao-khoac-flanel1.jpg', 'ao-khoac-flanel2.jpg', 'ao-khoac-flanel3.jpg'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đỏ kẻ', 'Xanh kẻ'],
      inStock: true,
      rating: 4.7
    },
    {
      name: 'Cuban Shirt',
      description: 'Cuban Shirt phong cách đường phố, chất liệu mềm mại, thoáng mát, kiểu dáng hiện đại.',
      price: 359000,
      category: categoryIds[0], // Áo
      images: ['cuban-shirt.webp', 'cuban-shirt1.webp', 'cuban-shirt2.webp', 'cuban-shirt3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng', 'Be'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Áo Mikenco',
      description: 'Áo Mikenco thiết kế hiện đại, chất liệu cao cấp, form rộng thoải mái.',
      price: 299000,
      category: categoryIds[0], // Áo
      images: ['ao-mikenco.webp', 'ao-mikenco1.webp', 'ao-mikenco2.webp', 'ao-mikenco3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng', 'Xám'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Áo Mikenco Premium',
      description: 'Áo Mikenco Premium thiết kế cao cấp, chất liệu cotton organic, kiểu dáng hiện đại.',
      price: 379000,
      discountPrice: 329000,
      category: categoryIds[0], // Áo
      images: ['mikenco00.webp', 'mikenco00-1.webp', 'mikenco00-2.webp', 'mikenco00-3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng', 'Xám'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Áo khoác da bông Cool Crew',
      description: 'Áo khoác da chần bông Cool Crew unisex, ấm áp trong mùa đông, thiết kế hiện đại.',
      price: 699000,
      discountPrice: 599000,
      category: categoryIds[0], // Áo
      images: ['ao-khoac-da-chan-bong-coolcrew-unisex.jpg', 'ao-khoac-da-chan-bong-coolcrew-unisex1.jpg', 'ao-khoac-da-chan-bong-coolcrew-unisex2.jpg', 'ao-khoac-da-chan-bong-coolcrew-unisex3.jpg'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Nâu'],
      inStock: true,
      rating: 4.8
    },
    {
      name: 'Áo thun Hades',
      description: 'Áo thun Hades phong cách đường phố, chất liệu cotton cao cấp, form rộng thoải mái.',
      price: 279000,
      category: categoryIds[0], // Áo
      images: ['tee-den-hades.webp', 'tee-den-hades1.webp', 'tee-den-hades2.webp', 'tee-den-hades3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng'],
      inStock: true,
      rating: 4.7
    },
    {
      name: 'Áo thun Dirty Coins',
      description: 'Áo thun Dirty Coins thiết kế độc đáo, chất liệu cao cấp, phong cách đường phố.',
      price: 259000,
      category: categoryIds[0], // Áo
      images: ['ao-thun-dirtycoins.webp', 'ao-thun-dirtycoins1.webp', 'ao-thun-dirtycoins2.webp', 'ao-thun-dirtycoins3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Áo Levents',
      description: 'Áo Levents thiết kế hiện đại, chất liệu cotton mềm mại, form rộng thoải mái.',
      price: 269000,
      category: categoryIds[0], // Áo
      images: ['polo-levents.webp', 'ao-levents1.webp', 'ao-levents2.webp', 'ao-levents3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng', 'Hồng'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Áo khoác Hades',
      description: 'Áo khoác Hades thiết kế độc đáo, chất liệu dày dặn, phong cách đường phố.',
      price: 599000,
      discountPrice: 499000,
      category: categoryIds[0], // Áo
      images: ['ao-khoac-hades.webp', 'ao-khoac-hades1.webp', 'ao-khoac-hades2.webp', 'ao-khoac-hades3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng'],
      inStock: true,
      rating: 4.8
    },
    {
      name: 'Áo khoác Dù',
      description: 'Áo khoác Dù chống nước, chống gió, nhẹ nhàng, phù hợp cho mùa thu đông.',
      price: 459000,
      discountPrice: 399000,
      category: categoryIds[0], // Áo
      images: ['jacket-du.webp', 'jacket-du1.webp', 'jacket-du2.webp', 'jacket-du3.webp'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Đen', 'Xanh navy', 'Xám'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Áo khoác Kaki Godmother',
      description: 'Áo khoác Kaki form crop Godmother, thiết kế trẻ trung, chất liệu dày dặn.',
      price: 459000,
      category: categoryIds[0], // Áo
      images: ['ao-khoac-kaki-khoa-keo-form-crop-godmothe.jpg', 'ao-khoac-kaki-khoa-keo-form-crop-godmother1.jpg', 'ao-khoac-kaki-khoa-keo-form-crop-godmother2.jpg', 'ao-khoac-kaki-khoa-keo-form-crop-godmother3.jpg'],
      sizes: ['S', 'M', 'L'],
      colors: ['Nâu'],
      inStock: true,
      rating: 4.5
    }
  );

  // Sản phẩm danh mục Quần
  products.push(
    {
      name: 'Quần jean nam',
      description: 'Quần jean nam form slim fit, chất liệu denim co giãn, thoải mái khi vận động.',
      price: 399000,
      category: categoryIds[1], // Quần
      images: ['quan-jean-nam.webp', 'quan-jean-nam1.webp', 'quan-jean-nam2.webp', 'quan-jean-nam3.webp'],
      sizes: ['29', '30', '31', '32', '33', '34'],
      colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Quần jean rách gối',
      description: 'Quần jean rách gối form slim, chất liệu denim co giãn, thiết kế trẻ trung.',
      price: 349000,
      discountPrice: 299000,
      category: categoryIds[1], // Quần
      images: ['quan-jean-rach-goi.webp', 'quan-jean-rach-goi1.webp', 'quan-jean-rach-goi2.webp', 'quan-jean-rach-goi3.webp'],
      sizes: ['29', '30', '31', '32', '33', '34'],
      colors: ['Xanh nhạt', 'Xanh đậm', 'Đen'],
      inStock: true,
      rating: 4.3
    },
    {
      name: 'Quần jean nữ',
      description: 'Quần jean nữ ống đứng, chất liệu denim co giãn, tôn dáng hoàn hảo.',
      price: 379000,
      category: categoryIds[1], // Quần
      images: ['jean-nu.webp', 'jean-nu1.webp', 'jean-nu2.webp', 'jean-nu3.webp'],
      sizes: ['26', '27', '28', '29', '30', '31'],
      colors: ['Xanh nhạt', 'Xanh đậm', 'Đen'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Quần túi hộp',
      description: 'Quần túi hộp form rộng, chất liệu dày dặn, phong cách đường phố hiện đại.',
      price: 329000,
      category: categoryIds[1], // Quần
      images: ['quan-tui-hop.webp', 'quan-tui-hop1.webp', 'quan-tui-hop2.webp', 'quan-tui-hop3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Nâu', 'Xám'],
      inStock: true,
      rating: 4.7
    },
    {
      name: 'Quần kaki nữ trơn',
      description: 'Quần kaki nữ trơn, chất liệu cotton mềm mại, thoáng mát, form tôn dáng.',
      price: 299000,
      category: categoryIds[1], // Quần
      images: ['quan-kaki-nu-tron.webp', 'quan-kaki-nu-tron1.webp', 'quan-kaki-nu-tron2.webp', 'quan-kaki-nu-tron3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Be', 'Trắng'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Quần nỉ caro',
      description: 'Quần nỉ caro form rộng, chất liệu nỉ mềm mại, ấm áp, phong cách thời trang.',
      price: 289000,
      discountPrice: 249000,
      category: categoryIds[1], // Quần
      images: ['quan-ni-caro.webp', 'quan-ni-caro1.webp', 'quan-ni-caro2.webp', 'quan-ni-caro3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen caro', 'Be caro', 'Xám caro'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Quần ống rộng',
      description: 'Quần ống rộng dáng dài, chất liệu mềm mại, thoáng mát, phong cách thời trang hiện đại.',
      price: 349000,
      category: categoryIds[1], // Quần
      images: ['quan-ong-rong.webp', 'quan-ong-rong1.webp', 'quan-ong-rong2.webp', 'quan-ong-rong3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Be', 'Nâu'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Quần nữ Masara',
      description: 'Quần nữ Masara form baggy, chất liệu cao cấp, thoáng mát, phong cách thanh lịch.',
      price: 399000,
      discountPrice: 349000,
      category: categoryIds[1], // Quần
      images: ['quan-nu-Masara.webp', 'quan-nu-Masara1.webp', 'quan-nu-Masara2.webp', 'quan-nu-Masara3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Be', 'Xanh navy'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Quần short túi hộp',
      description: 'Quần short túi hộp form rộng, chất liệu dày dặn, phong cách đường phố cá tính.',
      price: 259000,
      category: categoryIds[1], // Quần
      images: ['quan-short-tui-hop.webp', 'quan-short-tui-hop1.webp', 'quan-short-tui-hop2.webp', 'quan-short-tui-hop3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Rêu', 'Be'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Quần short unisex',
      description: 'Quần short unisex form rộng, chất liệu thoáng mát, phong cách thể thao năng động.',
      price: 219000,
      category: categoryIds[1], // Quần
      images: ['quan-short-unisex.webp', 'quan-short-unisex1.webp', 'quan-short-unisex2.webp', 'quan-short-unisex3.webp'],
      sizes: ['M', 'L', 'XL'],
      colors: ['Đen', 'Trắng', 'Xám'],
      inStock: true,
      rating: 4.3
    },
    {
      name: 'Quần short nữ',
      description: 'Quần short nữ cạp cao, chất liệu thoáng mát, phù hợp cho mùa hè năng động.',
      price: 249000,
      category: categoryIds[1], // Quần
      images: ['quan-short-nu.webp', 'quan-short-nu1.webp', 'quan-short-nu2.webp', 'quan-short-nu3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Trắng', 'Hồng nhạt'],
      inStock: true,
      rating: 4.5
    }
  );

  // Sản phẩm danh mục Váy
  products.push(
    {
      name: 'Váy liền dáng suông',
      description: 'Váy liền dáng suông, chất liệu lụa mềm mại, thoáng mát, phù hợp đi làm, đi chơi.',
      price: 399000,
      discountPrice: 349000,
      category: categoryIds[2], // Váy
      images: ['chan-vay.webp', 'chan-vay1.webp', 'chan-vay2.webp', 'chan-vay3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Trắng', 'Hoa nhí'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Váy ren',
      description: 'Váy ren tinh tế, chất liệu ren cao cấp, form dáng tôn nữ tính.',
      price: 449000,
      category: categoryIds[2], // Váy
      images: ['chan-vay-ren.webp', 'chan-vay-ren1.webp', 'chan-vay-ren2.webp', 'chan-vay-ren3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Trắng', 'Hồng pastel'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Váy hoa',
      description: 'Váy hoa họa tiết tươi sáng, chất liệu mềm mại, thoáng mát, phù hợp mùa hè.',
      price: 499000,
      category: categoryIds[2], // Váy
      images: ['vay-hoa.webp', 'vay-hoa1.webp', 'vay-hoa2.webp', 'vay-hoa3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Hoa xanh', 'Hoa đỏ', 'Hoa vàng'],
      inStock: true,
      rating: 4.8
    },
    {
      name: 'Váy dự tiệc',
      description: 'Váy dự tiệc sang trọng, chất liệu cao cấp, thiết kế tinh tế, phù hợp các buổi tiệc quan trọng.',
      price: 899000,
      discountPrice: 799000,
      category: categoryIds[2], // Váy
      images: ['vay-du-tiec.webp', 'vay-du-tiec1.webp', 'vay-du-tiec2.webp', 'vay-du-tiec3.webp'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Đỏ', 'Xanh navy'],
      inStock: true,
      rating: 4.9
    },
    {
      name: 'Đầm hồng hai dây dáng dài',
      description: 'Đầm hồng hai dây dáng dài thiết kế sang trọng, chất liệu mềm mại, phù hợp dự tiệc, đi chơi.',
      price: 649000,
      category: categoryIds[2], // Váy
      images: ['dam-hong-hai-day-dang-dai-sang-trong.jpg', 'dam-hong-hai-day-dang-dai-sang-trong1.jpg', 'dam-hong-hai-day-dang-dai-sang-trong2.jpg', 'dam-hong-hai-day-dang-dai-sang-trong3.jpg'],
      sizes: ['S', 'M', 'L'],
      colors: ['Hồng', 'Đen', 'Trắng'],
      inStock: true,
      rating: 4.7
    },
    {
      name: 'Váy tơ ống cổ V nơ ngực',
      description: 'Váy tơ ống cổ V nơ ngực thiết kế nữ tính, chất liệu mềm mại, tôn dáng hoàn hảo.',
      price: 499000,
      discountPrice: 429000,
      category: categoryIds[2], // Váy
      images: ['vay-to-ong-co-v-no-nguc.jpg', 'vay-to-ong-co-v-no-nguc1.jpg', 'vay-to-ong-co-v-no-nguc2.jpg', 'vay-to-ong-co-v-no-nguc3.jpg'],
      sizes: ['S', 'M', 'L'],
      colors: ['Trắng', 'Xanh nhạt', 'Hồng nhạt'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Váy xếp ly xòe',
      description: 'Váy xếp ly xòe thiết kế điệu đà, chất liệu cao cấp, phù hợp đi chơi, dự tiệc.',
      price: 379000,
      category: categoryIds[2], // Váy
      images: ['vay-xep-ly-xoe.jpg', 'vay-xep-ly-xoe1.jpg', 'vay-xep-ly-xoe2.jpg', 'vay-xep-ly-xoe3.jpg'],
      sizes: ['S', 'M', 'L'],
      colors: ['Trắng', 'Đen', 'Hồng pastel'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Váy trễ vai',
      description: 'Váy trễ vai thiết kế quyến rũ, chất liệu mềm mại, phù hợp đi chơi, dự tiệc.',
      price: 459000,
      category: categoryIds[2], // Váy
      images: ['vay-tre-vai.jpg', 'vay-tre-vai1.jpg', 'vay-tre-vai3.jpg', 'z64vay-tre-vai3.jpg'],
      sizes: ['S', 'M', 'L'],
      colors: ['Đen', 'Trắng', 'Đỏ'],
      inStock: true,
      rating: 4.7
    }
  );

  // Sản phẩm danh mục Phụ kiện
  products.push(
    {
      name: 'Túi xách nữ',
      description: 'Túi xách nữ thiết kế thanh lịch, chất liệu da PU cao cấp, phù hợp đi làm, đi chơi.',
      price: 499000,
      category: categoryIds[3], // Phụ kiện
      images: ['tui-sach.webp', 'tui-sach1.webp', 'tui-sach2.webp', 'tui-sach3.webp'],
      colors: ['Đen', 'Be', 'Đỏ đô'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Mũ len',
      description: 'Mũ len thiết kế đơn giản, chất liệu len mềm mại, giữ ấm tốt, phù hợp mùa đông.',
      price: 199000,
      discountPrice: 149000,
      category: categoryIds[3], // Phụ kiện
      images: ['mu-len.webp', 'mu-len1.webp', 'mu-len2.webp', 'mu-len3.webp'],
      sizes: ['M', 'L'],
      colors: ['Đen', 'Trắng', 'Be'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Mũ MLB',
      description: 'Mũ MLB chính hãng, thiết kế thời trang, chất liệu cao cấp, logo nổi bật.',
      price: 359000,
      category: categoryIds[3], // Phụ kiện
      images: ['mu-mlb.webp', 'mu-mlb1.webp', 'mu-mlb2.webp', 'mu-mlb3.webp'],
      sizes: ['M', 'L'],
      colors: ['Đen', 'Trắng', 'Xanh navy'],
      inStock: true,
      rating: 4.7
    },
    {
      name: 'Túi đeo chéo',
      description: 'Túi đeo chéo thiết kế nhỏ gọn, tiện lợi, chất liệu da PU cao cấp, phù hợp đi chơi.',
      price: 299000,
      category: categoryIds[3], // Phụ kiện
      images: ['tui-deo-cheo.webp', 'tui-deo-cheo1.webp', 'tui-deo-cheo2.webp', 'tui-deo-cheo3.webp'],
      colors: ['Đen', 'Nâu', 'Trắng'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Balo da',
      description: 'Balo da thiết kế hiện đại, chất liệu da PU cao cấp, bền đẹp, phù hợp đi học, đi làm.',
      price: 599000,
      category: categoryIds[3], // Phụ kiện
      images: ['balo-da.webp', 'balo-da1.webp', 'balo-da2.webp', 'balo-da3.webp'],
      colors: ['Đen', 'Nâu', 'Xám'],
      inStock: true,
      rating: 4.8
    },
    {
      name: 'Dây chuyền bạc',
      description: 'Dây chuyền bạc 925 thiết kế tinh tế, hoa văn độc đáo, phù hợp làm quà tặng.',
      price: 399000,
      discountPrice: 349000,
      category: categoryIds[3], // Phụ kiện
      images: ['day-chuyen-bac.webp', 'day-chuyen-bac1.webp', 'day-chuyen-bac2.webp', 'day-chuyen-bac3.webp'],
      colors: ['Bạc'],
      inStock: true,
      rating: 4.7
    },
    {
      name: 'Vòng tay bạc',
      description: 'Vòng tay bạc 925 thiết kế tinh tế, sang trọng, phù hợp đi làm, đi chơi, dự tiệc.',
      price: 299000,
      category: categoryIds[3], // Phụ kiện
      images: ['vong-tay-bac.webp', 'vong-tay-bac1.webp', 'vong-tay-bac2.webp', 'vong-tay-bac3.webp'],
      colors: ['Bạc'],
      inStock: true,
      rating: 4.6
    },
    {
      name: 'Vòng tay nữ',
      description: 'Vòng tay nữ thiết kế dễ thương, màu sắc tươi sáng, phù hợp đi chơi, đi học.',
      price: 159000,
      category: categoryIds[3], // Phụ kiện
      images: ['vong-tay-nu.webp', 'vong-tay-nu1.webp', 'vong-tay-nu2.webp', 'vong-tay-nu3.webp'],
      colors: ['Hồng', 'Xanh', 'Trắng'],
      inStock: true,
      rating: 4.5
    },
    {
      name: 'Nhẫn bạc',
      description: 'Nhẫn bạc 925 thiết kế tinh tế, thanh lịch, phù hợp đi làm, đi chơi, dự tiệc.',
      price: 249000,
      category: categoryIds[3], // Phụ kiện
      images: ['nhan-bac.webp', 'nhan-bac1.webp', 'nhan-bac2.webp', 'nhan-bac3.webp'],
      sizes: ['6', '7', '8', '9'],
      colors: ['Bạc'],
      inStock: true,
      rating: 4.4
    },
    {
      name: 'Khuyên tai bạc',
      description: 'Khuyên tai bạc 925 thiết kế tinh tế, thời trang, phù hợp đi làm, đi chơi, dự tiệc.',
      price: 199000,
      category: categoryIds[3], // Phụ kiện
      images: ['khuyem-tai-bac.webp', 'khuyem-tai-bac1.webp', 'khuyem-tai-bac2.webp', 'khuyem-tai-bac3.webp'],
      colors: ['Bạc'],
      inStock: true,
      rating: 4.5
    }
  );

  return products;
};

// Hàm seed dữ liệu
const seedData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Đã xóa dữ liệu cũ');

    // Thêm danh mục
    const createdCategories = await Category.insertMany(categories);
    console.log(`Đã thêm ${createdCategories.length} danh mục`);

    // Lấy ID của các danh mục
    const categoryIds = createdCategories.map(category => category._id);

    // Tạo và thêm sản phẩm
    const products = generateProducts(categoryIds);
    const createdProducts = await Product.insertMany(products);
    console.log(`Đã thêm ${createdProducts.length} sản phẩm`);

    console.log('Seed dữ liệu thành công!');
    process.exit();
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

// Chạy hàm seed dữ liệu
seedData();
