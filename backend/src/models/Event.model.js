const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },

    // Assigned profiles (one or more)
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
      },
    ],

    // The timezone used when creating the event (IANA string)
    eventTimezone: {
      type: String,
      required: [true, 'Event timezone (IANA) is required'],
      trim: true,
    },

    // Canonical UTC timestamps for start/end
    startUTC: {
      type: Date,
      required: [true, 'Start datetime (UTC) is required'],
    },
    endUTC: {
      type: Date,
      required: [true, 'End datetime (UTC) is required'],
    },

    // Preserve original local strings as entered by creator (optional)
    startLocal: {
      type: String,
      default: null,
    },
    endLocal: {
      type: String,
      default: null,
    },

    // Creator metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    createdAtUTC: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    createdAtLocal: {
      type: String, // e.g. "2025-11-25T09:00+05:30" (optional)
      default: null,
    },
    createdByTimezone: {
      type: String,
      default: null,
    },

    // Last-updated metadata
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      default: null,
    },
    updatedAtUTC: {
      type: Date,
      default: null,
    },
    updatedAtLocal: {
      type: String,
      default: null,
    },
    updatedByTimezone: {
      type: String,
      default: null,
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    collection: 'events',
  }
);

/**
 * Validation: ensure profiles is non-empty
 */
EventSchema.path('profiles').validate(function (val) {
  return Array.isArray(val) && val.length > 0;
}, 'Event must be assigned to at least one profile');

/**
 * Pre-validate hook: ensure endUTC >= startUTC
 */
EventSchema.pre('validate', function (next) {
  if (this.startUTC && this.endUTC) {
    if (this.endUTC < this.startUTC) {
      const err = new Error('Event end time must be equal to or after start time');
      return next(err);
    }
  }
  next();
});

/**
 * Pre-save hook: set createdAtUTC/updatedAtUTC appropriately
 */
EventSchema.pre('save', function (next) {
  const now = new Date();
  if (!this.createdAtUTC) this.createdAtUTC = now;
  // always update updatedAtUTC when saving (for new and updates)
  this.updatedAtUTC = now;
  next();
});

/**
 * Indexes:
 * - Compound index to make queries for profile + date-range fast
 */
EventSchema.index({ profiles: 1, startUTC: 1 });
EventSchema.index({ startUTC: 1 });

module.exports = mongoose.model('Event', EventSchema);
