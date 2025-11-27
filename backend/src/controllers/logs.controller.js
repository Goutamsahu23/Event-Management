const EventLog = require('../models/EventLog.model');
const Event = require('../models/Event.model');

exports.listLogsForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
    const skip = (page - 1) * limit;

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Event not found' });
    }

    // permission: only assigned profiles or admin
    if (req.user.role !== 'admin' && !event.profiles.map(String).includes(req.user.sub)) {
      return res.status(403).json({ status: 'error', code: 'FORBIDDEN', message: 'Not allowed to view logs' });
    }

    const [items, total] = await Promise.all([
      EventLog.find({ eventId }).sort({ timestampUTC: -1 }).skip(skip).limit(limit).lean(),
      EventLog.countDocuments({ eventId }),
    ]);

    res.json({ status: 'ok', data: { items, meta: { page, limit, total } } });
  } catch (err) {
    console.error('logs.listLogsForEvent error', err);
    res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};
