const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authMiddleware = require("../middlewares/auth");

// router.use(authMiddleware);

router.post("/create", invoiceController.createInvoice);
router.put("/:invoiceNumber", invoiceController.updateInvoice);
router.delete("/delete", invoiceController.deleteInvoice);
router.get("/", invoiceController.listInvoices);

module.exports = router;
