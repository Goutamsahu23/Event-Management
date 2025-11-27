const mongoose = require('mongoose');

const ChangeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const EventLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    timestampUTC: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    timestampLocal: {
      type: String, // optional: creator-local formatted timestamp
      default: null,
    },
    changedByTimezone: {
      type: String,
      default: null,
    },
    changes: {
      type: [ChangeSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'EventLog.changes must be a non-empty array',
      },
    },
    note: {
      type: String,
      default: '',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    collection: 'event_logs',
  }
);

// Index to fetch logs by event in reverse-chronological order
EventLogSchema.index({ eventId: 1, timestampUTC: -1 });

module.exports = mongoose.model('EventLog', EventLogSchema);
