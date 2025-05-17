const bcrypt = require("bcryptjs");
const User = require("../models/user");
const generateUniqueId = require("../utils/generatedIds");

async function getVisibleUsers(requestingUser) {
  if (requestingUser.role === "SUPERADMIN") {
    return User.find();
  }
  if (requestingUser.role === "ADMIN") {
    const adminsInGroup = await User.find({
      _id: { $in: requestingUser.adminGroup },
    });
    const unitManagers = await User.find({
      $or: [
        { createdBy: requestingUser._id, role: "UNIT_MANAGER" },
        { _id: { $in: requestingUser.adminGroup }, role: "UNIT_MANAGER" },
      ],
    });
    const unitManagerIds = unitManagers.map((u) => u._id);
    const users = await User.find({
      createdBy: { $in: unitManagerIds },
      role: "USER",
    });
    return [...adminsInGroup, ...unitManagers, ...users];
  }
  if (requestingUser.role === "UNIT_MANAGER") {
    const usersCreated = await User.find({
      createdBy: requestingUser._id,
      role: "USER",
    });
    const usersInGroup = await User.find({
      _id: { $in: requestingUser.unitGroup },
      role: "USER",
    });
    return [...usersCreated, ...usersInGroup];
  }
  if (requestingUser.role === "USER") {
    return [requestingUser];
  }
  return [];
}

exports.createUser = async (req, res) => {
  try {
    const creator = req.user;
    const { userName, email, password, role, groupIds } = req.body;

    if (!userName || !email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (creator.role === "SUPERADMIN" && role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "SUPERADMIN can only create ADMIN users" });
    }
    if (creator.role === "ADMIN" && role !== "UNIT_MANAGER") {
      return res
        .status(403)
        .json({ message: "ADMIN can only create UNIT_MANAGER users" });
    }
    if (creator.role === "UNIT_MANAGER" && role !== "USER") {
      return res
        .status(403)
        .json({ message: "UNIT_MANAGER can only create USER users" });
    }

    if (!["SUPERADMIN", "ADMIN", "UNIT_MANAGER", "USER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateUniqueId(role);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      role,
      userId,
      createdBy: creator._id,
    });

    if (role === "ADMIN" && Array.isArray(groupIds)) {
      newUser.adminGroup = groupIds;
    }
    if (role === "UNIT_MANAGER" && Array.isArray(groupIds)) {
      newUser.unitGroup = groupIds;
    }

    await newUser.save();
    res
      .status(201)
      .json({
        message: `${role} created successfully`,
        userId: newUser.userId,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const requester = req.user;

    if (!role) return res.status(400).json({ message: "Role is required" });
    if (!["SUPERADMIN", "ADMIN", "UNIT_MANAGER", "USER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (requester.role !== "SUPERADMIN") {
      return res
        .status(403)
        .json({ message: "Only SUPERADMIN can update user roles" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== role) {
      user.role = role;
      user.userId = await generateUniqueId(role);
    }

    await user.save();

    res.json({
      message: "User role updated successfully",
      updatedUserId: user.userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;
    const requester = req.user;
    
    if (!["SUPERADMIN", "ADMIN"].includes(requester.role)) {
      return res.status(403).json({ message: "Forbidden to delete user" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const requester = req.user;

    const visibleUsers = await getVisibleUsers(requester);
    const startIndex = (page - 1) * limit;
    const paginated = visibleUsers.slice(
      startIndex,
      startIndex + Number(limit)
    );
    res.json({
      total: visibleUsers.length,
      page: Number(page),
      limit: Number(limit),
      users: paginated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
