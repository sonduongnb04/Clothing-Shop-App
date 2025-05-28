const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Mô tả sản phẩm là bắt buộc'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Giá sản phẩm là bắt buộc'],
      min: [0, 'Giá sản phẩm không thể âm']
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function(value) {
          // Giá khuyến mãi phải nhỏ hơn giá gốc
          return value < this.price;
        },
        message: 'Giá khuyến mãi phải nhỏ hơn giá gốc'
      }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục sản phẩm là bắt buộc']
    },
    images: {
      type: [String],
      required: [true, 'Sản phẩm phải có ít nhất một hình ảnh'],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'Sản phẩm phải có ít nhất một hình ảnh'
      }
    },
    sizes: {
      type: [String]
    },
    colors: {
      type: [String]
    },
    inStock: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Tạo virtual để lấy tất cả đánh giá của sản phẩm
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// Middleware để cập nhật rating và numReviews khi có đánh giá mới
productSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.model('Review').aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      rating: stats[0].avgRating
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      numReviews: 0,
      rating: 0
    });
  }
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
