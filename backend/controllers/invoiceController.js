const Invoice = require("../models/invoice");
const getFinancialYear = require("../utils/getFinancialYear");
const mongoose = require('mongoose')

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, invoiceDate, invoiceAmount } = req.body;
    if (!invoiceNumber || !invoiceDate || !invoiceAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const financialYear = getFinancialYear(invoiceDate);

    const exists = await Invoice.findOne({ invoiceNumber, financialYear });
    if (exists)
      return res
        .status(400)
        .json({
          message: "Invoice number already exists in this financial year",
        });

    const prev = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNumber - 1,
    });
    const next = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNumber + 1,
    });

    const date = new Date(invoiceDate);
    if (prev && date <= prev.invoiceDate)
      return res
        .status(400)
        .json({ message: "Date must be after previous invoice date" });
    if (next && date >= next.invoiceDate)
      return res
        .status(400)
        .json({ message: "Date must be before next invoice date" });

    const invoice = new Invoice({
      invoiceNumber,
      invoiceDate: date,
      invoiceAmount,
      financialYear,
    });
    await invoice.save();

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const { invoiceDate, invoiceAmount } = req.body;

    if (!invoiceDate && !invoiceAmount) {
      return res
        .status(400)
        .json({ message: "At least one field to update is required" });
    }

    const existing = await Invoice.findOne({ invoiceNumber });
    if (!existing)
      return res.status(404).json({ message: "Invoice not found" });

    const financialYear = getFinancialYear(invoiceDate || existing.invoiceDate);
    const date = invoiceDate ? new Date(invoiceDate) : existing.invoiceDate;

    const prev = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNumber - 1,
    });
    const next = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNumber + 1,
    });

    if (prev && date <= prev.invoiceDate)
      return res
        .status(400)
        .json({ message: "Date must be after previous invoice date" });
    if (next && date >= next.invoiceDate)
      return res
        .status(400)
        .json({ message: "Date must be before next invoice date" });

    existing.invoiceDate = date;
    existing.invoiceAmount = invoiceAmount ?? existing.invoiceAmount;
    existing.financialYear = financialYear;

    await existing.save();
    res.json({ message: "Invoice updated", invoice: existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    let { ids } = req.body;

    // Allow single string or array
    if (!ids) {
      return res.status(400).json({ message: "Invoice ID(s) required" });
    }

    // Convert single string to array
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    // Validate each ID
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json({ message: `Invalid ID(s): ${invalidIds.join(", ")}` });
    }

    // Perform deletion
    const result = await Invoice.deleteMany({ _id: { $in: ids } });

    res.json({
      message: "Invoice(s) deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      financialYear,
      startDate,
      endDate,
      search,
    } = req.query;
    const query = {};

    if (financialYear) query.financialYear = financialYear;
    if (startDate && endDate)
      query.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    if (search) query.invoiceNumber = parseInt(search);
    console.log("Invoice filter query:", query);

    const invoices = await Invoice.find(query)
      .sort({ invoiceNumber: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const count = await Invoice.countDocuments(query);

    res.json({ total: count, page: parseInt(page), invoices });
    console.log(invoices)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
