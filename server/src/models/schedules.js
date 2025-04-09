const mongoose = require("mongoose");

const ScheduleDeliveriesSchema = new mongoose.Schema({
  email: {
    type: String,
    //required: true,
    unique: true, // Ensures only one record per email
  },
  scheduleDeliveries: [
    {
      date: {
        type: String,
        //required: true,
      },
      title: {
        type: String,
        //required: true,
      },
    }
  ],
});

const ScheduleDeliveries = mongoose.model("ScheduleDeliveries", ScheduleDeliveriesSchema);

module.exports = ScheduleDeliveries;
