const ScheduleDeliveries = require("../models/schedules");

module.exports.addScheduleDeliveries = async (req, res) => {
  try {
    const email = req.email;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date, title } = req.body;
    if (!date || !title) {
      return res.status(400).json({ message: "Date and title are required." });
    }

    let userSchedule = await ScheduleDeliveries.findOne({ email });

    if (!userSchedule) {
      // If user does not exist, create a new record
      userSchedule = new ScheduleDeliveries({ email, scheduleDeliveries: [] });
    }

    // Add new delivery to the schedule array
    userSchedule.scheduleDeliveries.push({ date, title });

    await userSchedule.save();

    res.status(201).json({ message: "Schedule added successfully!", schedule: userSchedule });
  } catch (error) {
    console.error("Error adding schedule:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get schedule deliveries for a user
module.exports.getScheduleDeliveries = async (req, res) => {
  try {
    const email = req.email;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userSchedule = await ScheduleDeliveries.findOne({ email });

    if (!userSchedule) {
      return res.status(200).json({success: false, schedules: []});
    }

    res.status(200).json({success: true, schedules: userSchedule.scheduleDeliveries});
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
