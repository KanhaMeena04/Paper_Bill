const JournalEntry = require('../models/journalEntry');

module.exports.addJournalEntry = async (req, res) => {
    try {
        const { journalDate, entries, description } = req.body;
        if (!entries || entries.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Minimum 2 entries required"
            });
        }

        const totals = entries.reduce((acc, entry) => ({
            credit: acc.credit + Number(entry.credit),
            debit: acc.debit + Number(entry.debit)
        }), { credit: 0, debit: 0 });

        if (Math.abs(totals.credit - totals.debit) > 0.01) {
            return res.status(400).json({
                success: false,
                message: "Total debits must equal total credits"
            });
        }
        // const lastEntry = await JournalEntry.findOne({}, {}, { sort: { 'referenceNumber': -1 } });
        // const lastNumber = lastEntry ? parseInt(lastEntry.referenceNumber.split('-')[1]) : 0;
        const journalEntry = await JournalEntry.create({
            journalDate,
            entries,
            description
        });

        res.status(201).json({
            success: true,
            data: journalEntry
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.getJournalEntry = async (req, res) => {
    try {
        const journalEntries = await JournalEntry.find()
            .sort({ journalDate: -1, referenceNumber: -1 });

        res.status(200).json({
            success: true,
            count: journalEntries.length,
            data: journalEntries
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
