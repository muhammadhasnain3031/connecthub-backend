import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price zero se kam nahi ho sakti!'],
      // Custom Validator Pattern: Check karega ke decimal positions correct hain ya nahi
      validate: {
        validator: function (value) {
          // Check karta hai ke number integers ho ya max 2 decimal places tak ho (e.g. 99.99)
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        },
        message: 'Price formats sirf plain number ya do decimal places tak valid hain (e.g. 49.99)!',
      },
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes (Day 19)
serviceSchema.index({ category: 1 });
serviceSchema.index({ providerId: 1 });

// 1. Pre-save Hook (Document Middleware Pattern)
// Jab bhi service create ya save hogi, title se automatic URL-friendly slug banega
serviceSchema.pre('save', function (next) {
  // Agar title modify hua hai, sirf tabhi slug generate karein
  if (this.isModified('title')) {
    this.slug = this.title
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W\-_]+/g, '-') // Spaces aur special characters ko hyphen '-' se replace karega
      .replace(/^-+|-+$/g, '');   // Start aur end se extra hyphens clear karega
  }
  next(); // Express/Mongoose chain ko agay barhanay ke liye mandatory hai
});

// 2. Virtual Field (Computed Property Pattern)
// Database mein space nahi legi, runtime par dynamic data return karegi
serviceSchema.virtual('shortDescription').get(function () {
  if (this.description && this.description.length > 60) {
    return this.description.substring(0, 60) + '...';
  }
  return this.description;
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
