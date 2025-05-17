import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Navbar from './components/Navbar'

import Login from "./components/Login";
import InvoiceDashboard from "./components/invoiceDashboard";
import UserDashboard from "./components/UserDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token }); 
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* <nav className="bg-white p-4 shadow flex justify-between items-center">
          <div className="flex gap-4">
            <Link to="/invoices" className="text-blue-600 hover:underline">
              Invoice Dashboard
            </Link>
            <Link to="/users" className="text-blue-600 hover:underline">
              User Dashboard
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </nav> */}

<Navbar handleLogout= {handleLogout}/>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/invoices" />} />
            <Route path="/invoices" element={<InvoiceDashboard />} />
            <Route path="/users" element={<UserDashboard />} />
            <Route path="*" element={<p>Page not found</p>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
