import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUserRole,
  deleteUsers, 
} from "../services/api";
import { Pencil, Trash2 } from "lucide-react";

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [editUserId, setEditUserId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      alert("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !role || (!editUserId && (!email || !password))) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editUserId) {
        await updateUserRole(editUserId, { role });
        alert("User role updated");
      } else {
        await createUser({ userName, email, password, role });
        alert("User created successfully");
      }

      closeForm();
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    console.log(id, "d")
    try {
      await deleteUsers(id); 
      alert("User deleted");
      loadUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const startEdit = (user) => {
    setEditUserId(user._id);
    setEmail(user.email);
    setUserName(user.userName);
    setRole(user.role);
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditUserId(null);
    setEmail("");
    setUserName("");
    setPassword("");
    setRole("USER");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center">
        User Management
      </h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#696969] text-white px-4 py-2 rounded-xl hover:bg-[#A0A0A0]"
        >
          Create User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto  rounded-2xl  bg-white border">
          <table className="min-w-full !border-0">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-l-0  border-t-0">Email</th>
                <th className="p-2 border border-t-0">Username</th>
                <th className="p-2 border  border-t-0">Role</th>
                <th className="p-2 border border-r-0  border-t-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 border-l-0  border-b-0">
                      {u.email}
                    </td>
                    <td className="border px-2 py-1 border-b-0">
                      {u.userName}
                    </td>
                    <td className="border px-2 py-1 border-b-0">{u.role}</td>
                    <td className="border text-center space-x-2 border-b-0 border-r-0">
                      <button
                        onClick={() => startEdit(u)}
                        className="text-blue-600 hover:underline"
                      >
                        <Pencil className="w-5 h-5 " />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-600 hover:underline"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">
              {editUserId ? "Edit User Role" : "Create User"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {!editUserId && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </>
              )}

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="USER">USER</option>
                <option value="UNIT_MANAGER">UNIT_MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editUserId ? "Update Role" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
