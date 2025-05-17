const Counter = require("../models/counter");

const generateUniqueId = async (role) => {
  let prefix;
  switch (role) {
    case "SUPERADMIN":
      prefix = "SA";
      break;
    case "ADMIN":
      prefix = "A";
      break;
    case "UNIT_MANAGER":
      prefix = "UM";
      break;
    case "USER":
      prefix = "U";
      break;
    default:
      prefix = "X";
  }

  const counter = await Counter.findOneAndUpdate(
    { role },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  console.log("Counter after update:", counter); // <--- Add this

  return `${prefix}${counter.count}`;
};

module.exports = generateUniqueId;
