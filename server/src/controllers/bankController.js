const Bank = require('../models/bank');

module.exports.addBank = async (req, res) => {
  try {
    const { bankName, openingBalance, asOfDate } = req.body;
    if (!bankName || !openingBalance || !asOfDate) {
      return res.status(400).json({ message: "All fields (bankName, openingBalance, asOfDate) are required." });
    }

    // Parse the date in DD/MM/YYYY format to YYYY-MM-DD format
    const [day, month, year] = asOfDate.split('/');
    const formattedDate = new Date(`${year}-${month}-${day}`);

    // Check if the date is valid
    if (isNaN(formattedDate)) {
      return res.status(400).json({ message: "Invalid date format. Please use DD/MM/YYYY." });
    }

    const newBank = new Bank({
      bankName,
      openingBalance,
      asOfDate: formattedDate,
    });

    await newBank.save();

    res.status(201).json({
      message: "Bank added successfully",
      bank: newBank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding bank." });
  }
};



module.exports.getAllBank = async (req, res) => {
    try {
      const banks = await Bank.find();
      if (banks.length === 0) {
        return res.status(200).json({ message: "No banks found.", data: [] });
      }
      res.status(200).json({
        message: "Banks fetched successfully",
        data: banks,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error while fetching banks." });
    }
  };