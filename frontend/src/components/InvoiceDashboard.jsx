import React, { useState, useEffect } from "react";
import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoices,
} from "../services/api";
import { Funnel, Plus, X, Pencil } from "lucide-react";

const InvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [financialYear, setFinancialYear] = useState("");
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formInvoiceNumber, setFormInvoiceNumber] = useState("");
  const [formInvoiceDate, setFormInvoiceDate] = useState("");
  const [formInvoiceAmount, setFormInvoiceAmount] = useState("");
  const [editInvoiceId, setEditInvoiceId] = useState(null);

  const [error, setError] = useState("");
  const validateFinancialYear = (v) => /^\d{4}-\d{4}$/.test(v.trim());

  const loadInvoices = async () => {
    setLoading(true);
    setError("");
    if (financialYear && !validateFinancialYear(financialYear)) {
      setError("Financial Year must be YYYY-YYYY");
      setLoading(false);
      return;
    }
    try {
      const params = {};
      if (financialYear) params.financialYear = financialYear.trim();
      if (searchInvoiceNumber)
        params.invoiceNumber = searchInvoiceNumber.trim();
      const q = new URLSearchParams(params).toString();
      const res = await fetch(
        `https://innvoice-management.onrender.com/api/invoice?${q}`
      );
      const data = await res.json();
      setInvoices(data.invoices);
    } catch (e) {
      setError("Failed to fetch: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, [financialYear, searchInvoiceNumber]);

  const openCreate = () => {
    setEditInvoiceId(null);
    setFormInvoiceNumber("");
    setFormInvoiceDate("");
    setFormInvoiceAmount("");
    setIsModalOpen(true);
  };
  const openEdit = (inv) => {
    setEditInvoiceId(inv._id);
    setFormInvoiceNumber(inv.invoiceNumber);
    setFormInvoiceDate(inv.invoiceDate.split("T")[0]);
    setFormInvoiceAmount(inv.invoiceAmount);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formInvoiceNumber || !formInvoiceDate || !formInvoiceAmount) {
      alert("Fill all fields");
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
        alert("Updated");
      } else {
        await createInvoice(data);
        alert("Created");
      }
      closeModal();
      loadInvoices();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleSelect = (id) =>
    setInvoices((prev) =>
      prev.map((i) => (i._id === id ? { ...i, selected: !i.selected } : i))
    );
  const hasSelected = invoices.some((i) => i.selected);

  const handleDelete = async () => {
    const toDelete = invoices.filter((i) => i.selected).map((i) => i._id);
    if (toDelete.length === 0) return;
    if (!window.confirm("Delete selected?")) return;
    try {
      await deleteInvoices(toDelete);
      alert("Deleted");
      loadInvoices();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">
        Invoice Dashboard
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Financial Year (e.g. 2023-2024)"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 w-full sm:w-64"
          />
          <input
            type="text"
            placeholder="Search Invoice Number"
            value={searchInvoiceNumber}
            onChange={(e) => setSearchInvoiceNumber(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 w-full sm:w-64"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadInvoices}
            className=" text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400 flex items-center gap-1"
            title="Filter"
          >
            <Funnel size={16} />
          </button>
          <button
            onClick={openCreate}
            className=" text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400 flex items-center gap-1"
          >
            <Plus size={16} />
          </button>
          {hasSelected && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-1"
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 mb-10">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Invoice Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!inv.selected}
                        onChange={() => toggleSelect(inv._id)}
                        className="w-5 h-5 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      ${inv.invoiceAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openEdit(inv)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        <Pencil size= {16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {editInvoiceId ? "Edit Invoice" : "Create Invoice"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="number"
                  value={formInvoiceNumber}
                  onChange={(e) => setFormInvoiceNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  disabled={!!editInvoiceId}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formInvoiceDate}
                  onChange={(e) => setFormInvoiceDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={formInvoiceAmount}
                  onChange={(e) => setFormInvoiceAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
                >
                  {editInvoiceId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard;
