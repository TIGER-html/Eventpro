const pool = require('../config/db');

exports.addGuest = async (req, res) => {
  res.json({ message: 'addGuest OK' });
};

exports.importGuests = async (req, res) => {
  res.json({ message: 'importGuests OK' });
};

exports.getGuestsByEvent = async (req, res) => {
  res.json({ message: 'getGuestsByEvent OK' });
};

exports.updateRsvp = async (req, res) => {
  res.json({ message: 'updateRsvp OK' });
};

exports.assignTable = async (req, res) => {
  res.json({ message: 'assignTable OK' });
};

exports.deleteGuest = async (req, res) => {
  res.json({ message: 'deleteGuest OK' });
};