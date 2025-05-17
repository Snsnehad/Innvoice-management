import React, { useState, useEffect } from "react";
import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoices,
} from "../services/api";

const InvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [financialYear, setFinancialYear] = useState("");
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [formInvoiceNumber, setFormInvoiceNumber] = useState("");
  const [formInvoiceDate, setFormInvoiceDate] = useState("");
  const [formInvoiceAmount, setFormInvoiceAmount] = useState("");
  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [error, setError] = useState("");

  const validateFinancialYear = (value) => {
    // Allow format like "2023-2024"
    return /^\d{4}-\d{4}$/.test(value.trim());
  };

  const loadInvoices = async () => {
    setLoading(true);
    setError("");

    // Validate financialYear before calling backend
    if (financialYear && !validateFinancialYear(financialYear)) {
      setError("Financial Year must be in format YYYY-YYYY (e.g. 2023-2024)");
      setLoading(false);
      return;
    }

    try {
      const params = {};
      if (financialYear) params.financialYear = financialYear.trim();
      if (searchInvoiceNumber)
        params.invoiceNumber = searchInvoiceNumber.trim();

      console.log("Sending filter params:", params);

      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(
        `http://localhost:5000/api/invoice?${queryString}`
      );
      console.log("res: ", res);
      const data = await res.json();

      setInvoices(data.invoices);
    } catch (error) {
      alert("Failed to fetch invoices: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, [financialYear, searchInvoiceNumber]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formInvoiceNumber || !formInvoiceDate || !formInvoiceAmount) {
      alert("Please fill all fields");
      return;
    }
    try {
      const data = {
        invoiceNumber: formInvoiceNumber,
        invoiceDate: formInvoiceDate,
        invoiceAmount: Number(formInvoiceAmount),
        financialYear,
      };
      if (editInvoiceId) {
        await updateInvoice(editInvoiceId, data);
        alert("Invoice updated");
      } else {
        await createInvoice(data);
        alert("Invoice created");
      }
      setFormInvoiceNumber("");
      setFormInvoiceDate("");
      setFormInvoiceAmount("");
      setEditInvoiceId(null);
      loadInvoices();
    } catch (err) {
      alert("Error: " + err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    const toDelete = invoices.filter((inv) => inv.selected).map((i) => i._id);
    if (toDelete.length === 0) {
      alert("Select at least one invoice to delete");
      return;
    }
    if (!window.confirm("Delete selected invoices?")) return;

    try {
      await deleteInvoices(toDelete);
      alert("Deleted successfully");
      loadInvoices();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const toggleSelect = (id) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === id ? { ...inv, selected: !inv.selected } : inv
      )
    );
  };

  const startEdit = (inv) => {
    setEditInvoiceId(inv._id);
    setFormInvoiceNumber(inv.invoiceNumber);
    setFormInvoiceDate(inv.invoiceDate.split("T")[0]);
    setFormInvoiceAmount(inv.invoiceAmount);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Invoice Dashboard</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by Financial Year (e.g. 2023-2024)"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="text"
          placeholder="Search by Invoice Number"
          value={searchInvoiceNumber}
          onChange={(e) => setSearchInvoiceNumber(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={loadInvoices}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Filter
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 rounded hover:bg-red-700"
        >
          Delete Selected
        </button>
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="mb-6 bg-gray-50 p-4 rounded shadow-md max-w-lg"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editInvoiceId ? "Edit Invoice" : "Create Invoice"}
        </h2>
        <input
          type="number"
          placeholder="Invoice Number"
          value={formInvoiceNumber}
          onChange={(e) => setFormInvoiceNumber(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-3"
          disabled={!!editInvoiceId} // Invoice number not editable during update
          required
        />
        <input
          type="date"
          placeholder="Invoice Date"
          value={formInvoiceDate}
          onChange={(e) => setFormInvoiceDate(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-3"
          required
        />
        <input
          type="number"
          placeholder="Invoice Amount"
          value={formInvoiceAmount}
          onChange={(e) => setFormInvoiceAmount(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-3"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editInvoiceId ? "Update" : "Create"}
        </button>
        {editInvoiceId && (
          <button
            type="button"
            onClick={() => {
              setEditInvoiceId(null);
              setFormInvoiceNumber("");
              setFormInvoiceDate("");
              setFormInvoiceAmount("");
            }}
            className="ml-3 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading invoices...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Select</th>
              <th className="border border-gray-300 p-2">Invoice Number</th>
              <th className="border border-gray-300 p-2">Invoice Date</th>
              <th className="border border-gray-300 p-2">Invoice Amount</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No invoices found
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-center">
                  <input
                    type="checkbox"
                    checked={!!inv.selected}
                    onChange={() => toggleSelect(inv._id)}
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  {inv.invoiceNumber}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(inv.invoiceDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {inv.invoiceAmount}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={() => startEdit(inv)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoiceDashboard;
