const Event = require('../models/Event.model');
const EventLog = require('../models/EventLog.model');
const Profile = require('../models/Profile.model');
const timeUtil = require('../utils/time.util'); // implement conversions here

// Helper: validate profile ids exist
async function ensureProfilesExist(profileIds = []) {
  const count = await Profile.countDocuments({ _id: { $in: profileIds } });
  return count === profileIds.length;
}

/**
 * Create event:
 */
exports.createEvent = async (req, res) => {
  try {
    const actorId = req.user && req.user.sub; // set by auth middleware
    const {
      title,
      description,
      profiles,
      eventTimezone,
      startLocal,
      endLocal,
      startISO,
      endISO,
    } = req.body;

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'profiles required',
      });
    }

    // permission: non-admin must include themselves
    if (req.user.role !== 'admin' && !profiles.includes(actorId)) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Cannot create event for other profiles',
      });
    }

    // ensure profiles exist
    const ok = await ensureProfilesExist(profiles);
    if (!ok) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'One or more profiles not found',
      });
    }

    // convert input into UTC Date objects
    let startUTC, endUTC;
    if (startLocal && endLocal && eventTimezone) {
      startUTC = timeUtil.localToUTC(startLocal, eventTimezone);
      endUTC = timeUtil.localToUTC(endLocal, eventTimezone);
    } else if (startISO && endISO) {
      startUTC = timeUtil.isoToUTC(startISO);
      endUTC = timeUtil.isoToUTC(endISO);
    } else {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'Invalid date input',
      });
    }

    if (endUTC < startUTC) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'end must be >= start',
      });
    }

    const now = new Date();
    let eventDoc = new Event({
      title: title || '',
      description: description || '',
      profiles,
      eventTimezone,
      startUTC,
      endUTC,
      startLocal: startLocal || null,
      endLocal: endLocal || null,
      createdBy: actorId,
      createdAtUTC: now,
      createdAtLocal: timeUtil.utcToLocalString(
        now,
        req.user.timezone || eventTimezone
      ),
      createdByTimezone: req.user.timezone || eventTimezone,
    });

    await eventDoc.save();

    // Re-query with populate so frontend gets full profile objects
    const populatedEvent = await Event.findById(eventDoc._id)
      .populate('profiles', 'name timezone email role')
      .populate('createdBy', 'name timezone email role');

    res.status(201).json({ status: 'ok', data: populatedEvent });
  } catch (err) {
    console.error('events.createEvent error', err);
    res
      .status(500)
      .json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const profileId = req.query.profileId;
    if (!profileId) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'profileId is required',
      });
    }

    // optional range
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const q = { profiles: profileId };
    if (from && to) {
      // overlap condition
      q.startUTC = { $lte: to };
      q.endUTC = { $gte: from };
    } else if (from) {
      q.endUTC = { $gte: from };
    }

    // pagination
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, parseInt(req.query.limit || '200', 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Event.find(q)
        .sort({ startUTC: 1 })
        .skip(skip)
        .limit(limit)
        .populate('profiles', 'name timezone email role')
        .populate('createdBy', 'name timezone email role')
        .populate('updatedBy', 'name timezone email role')
        .lean(),
      Event.countDocuments(q),
    ]);

    res.json({ status: 'ok', data: { items, meta: { page, limit, total } } });
  } catch (err) {
    console.error('events.listEvents error', err);
    res
      .status(500)
      .json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id)
      .populate('profiles createdBy updatedBy', 'name timezone email role')
      .lean();
    if (!event) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Event not found',
      });
    }

    // permission: only profiles assigned or admin
    if (
      req.user.role !== 'admin' &&
      !event.profiles.some((p) => p._id.toString() === req.user.sub)
    ) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Not allowed to view this event',
      });
    }

    res.json({ status: 'ok', data: event });
  } catch (err) {
    console.error('events.getEvent error', err);
    res
      .status(500)
      .json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const actorId = req.user.sub;
    const id = req.params.id;
    const updates = req.body;

    let event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Event not found',
      });
    }

    // permission: admin or any profile listed in event.profiles
    const isAssigned = event.profiles.map(String).includes(actorId);
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Not allowed to update',
      });
    }

    // Keep a snapshot for diff
    const before = event.toObject();

    // Apply updates:
    // - If startLocal/endLocal/eventTimezone provided, convert to UTC
    if ((updates.startLocal && updates.endLocal) || updates.startISO || updates.endISO) {
      if (updates.startLocal && updates.endLocal && updates.eventTimezone) {
        event.startUTC = timeUtil.localToUTC(
          updates.startLocal,
          updates.eventTimezone
        );
        event.endUTC = timeUtil.localToUTC(
          updates.endLocal,
          updates.eventTimezone
        );
        event.startLocal = updates.startLocal;
        event.endLocal = updates.endLocal;
        event.eventTimezone = updates.eventTimezone;
      } else if (updates.startISO && updates.endISO) {
        event.startUTC = timeUtil.isoToUTC(updates.startISO);
        event.endUTC = timeUtil.isoToUTC(updates.endISO);
      }
    }

    // other updatable fields
    const allowed = ['title', 'description', 'profiles', 'meta'];
    allowed.forEach((k) => {
      if (updates[k] !== undefined) event[k] = updates[k];
    });

    // validate end >= start enforced by schema pre-validate
    event.updatedBy = actorId;
    event.updatedAtUTC = new Date();
    event.updatedAtLocal = timeUtil.utcToLocalString(
      event.updatedAtUTC,
      req.user.timezone || event.eventTimezone
    );
    event.updatedByTimezone = req.user.timezone || event.eventTimezone;

    await event.save();

    // create EventLog: compute diffs (only changed fields)
    const changes = [];
    const fieldsToCheck = [
      'title',
      'description',
      'profiles',
      'eventTimezone',
      'startUTC',
      'endUTC',
      'meta',
    ];
    fieldsToCheck.forEach((f) => {
      const b = JSON.stringify(before[f] === undefined ? null : before[f]);
      const a = JSON.stringify(event[f] === undefined ? null : event[f]);
      if (a !== b) {
        changes.push({ field: f, before: JSON.parse(b), after: JSON.parse(a) });
      }
    });

    if (changes.length > 0) {
      const now = new Date();
      const log = new EventLog({
        eventId: event._id,
        changedBy: actorId,
        timestampUTC: now,
        timestampLocal: timeUtil.utcToLocalString(
          now,
          req.user.timezone || event.eventTimezone
        ),
        changedByTimezone: req.user.timezone || event.eventTimezone,
        changes,
        note: updates.note || '',
      });
      await log.save();
    }

    // Re-query with populate so frontend gets full profile objects
    const populatedEvent = await Event.findById(event._id)
      .populate('profiles', 'name timezone email role')
      .populate('createdBy', 'name timezone email role')
      .populate('updatedBy', 'name timezone email role');

    res.json({ status: 'ok', data: populatedEvent });
  } catch (err) {
    console.error('events.updateEvent error', err);
    res
      .status(500)
      .json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const actorId = req.user.sub;
    const id = req.params.id;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Event not found',
      });
    }

    // only admin or creator allowed (business rule)
    if (req.user.role !== 'admin' && event.createdBy.toString() !== actorId) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Not allowed to delete',
      });
    }

    // Soft delete recommended: set meta.deleted = true
    event.meta = event.meta || {};
    event.meta.deleted = true;
    event.updatedBy = actorId;
    event.updatedAtUTC = new Date();
    await event.save();

    res.json({ status: 'ok', data: { _id: id, deleted: true } });
  } catch (err) {
    console.error('events.deleteEvent error', err);
    res
      .status(500)
      .json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};
