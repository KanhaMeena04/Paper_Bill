const express = require('express');
const router = express.Router();
const {addJournalEntry, getJournalEntry} = require('../controllers/journalEntryController')

router.post('/addJournalEntry', addJournalEntry)
router.get('/getJournalEntry', getJournalEntry)

module.exports = router;