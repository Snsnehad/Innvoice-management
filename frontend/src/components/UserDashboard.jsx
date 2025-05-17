import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUserRole,
  deleteUsers,
} from "../services/api"; // assumes token is handled here

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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


      setEmail("");
      setUserName("");
      setPassword("");
      setRole("USER");
      setEditUserId(null);

      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  const handleDelete = async () => {
    const toDelete = users.filter((u) => u.selected).map((u) => u._id);
    if (toDelete.length === 0) {
      alert("Select users to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete selected users?"))
      return;

    try {
      await deleteUsers(toDelete);
      alert("Users deleted");
      loadUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const toggleSelect = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, selected: !u.selected } : u))
    );
  };

  const startEdit = (user) => {
    setEditUserId(user._id);
    setEmail(user.email);
    setUserName(user.userName);
    setRole(user.role);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <form
        onSubmit={handleFormSubmit}
        className="bg-gray-50 p-4 rounded shadow-md mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editUserId ? "Edit User Role" : "Create User"}
        </h2>

        {!editUserId && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 mb-3 w-full"
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border rounded px-3 py-2 mb-3 w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2 mb-3 w-full"
              required
            />
          </>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2 mb-3 w-full"
        >
          <option value="USER">USER</option>
          <option value="UNIT_MANAGER">UNIT_MANAGER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editUserId ? "Update Role" : "Create User"}
        </button>

        {editUserId && (
          <button
            type="button"
            onClick={() => {
              setEditUserId(null);
              setEmail("");
              setUserName("");
              setPassword("");
              setRole("USER");
            }}
            className="ml-3 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="mb-4 flex gap-3">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Selected
        </button>
        <button
          onClick={loadUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Select</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Username</th>
              <th className="border border-gray-300 p-2">Role</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!u.selected}
                      onChange={() => toggleSelect(u._id)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">{u.email}</td>
                  <td className="border border-gray-300 p-2">{u.userName}</td>
                  <td className="border border-gray-300 p-2">{u.role}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => startEdit(u)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserDashboard;
