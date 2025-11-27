// routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const profilesController = require('../controllers/profiles.controller');
const eventsController = require('../controllers/events.controller');
const logsController = require('../controllers/logs.controller');

const authMiddleware = require('../middlewares/auth.middleware'); // implement to set req.user
const adminOnly = require('../middlewares/adminOnly.middleware'); // optional helper

// Health
router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Auth
router.post('/auth/login', authController.login);

// Profiles (protected)
router.post('/profiles', authMiddleware, adminOnly, profilesController.createProfile);
router.get('/profiles', authMiddleware, profilesController.listProfiles);
router.get('/profiles/:id', authMiddleware, profilesController.getProfile);
router.patch('/profiles/:id', authMiddleware, profilesController.updateProfile);

// Events
router.post('/events', authMiddleware, eventsController.createEvent);
router.get('/events', authMiddleware, eventsController.listEvents);
router.get('/events/:id', authMiddleware, eventsController.getEvent);
router.patch('/events/:id', authMiddleware, eventsController.updateEvent);
router.delete('/events/:id', authMiddleware, eventsController.deleteEvent);

// Event logs
router.get('/events/:id/logs', authMiddleware, logsController.listLogsForEvent);

module.exports = router;
