const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Profile name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,

      // unique: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    timezone: {
      type: String,
      required: [false, 'Timezone (IANA) is required'],
      trim: true,

    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAtUTC: {
      type: Date,
      default: () => new Date(),
    },
    updatedAtUTC: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    collection: 'profiles',
  }
);

// Update `updatedAtUTC` on save
ProfileSchema.pre('save', function (next) {
  this.updatedAtUTC = new Date();
  if (!this.createdAtUTC) this.createdAtUTC = this.updatedAtUTC;
  next();
});



module.exports = mongoose.model('Profile', ProfileSchema);
