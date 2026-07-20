// =====================================
// FINVISION UGANDA
// script.js - Part 1
// Firebase + Authentication
// =====================================

// ==========================
// FIREBASE IMPORTS
// ==========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================
// FIREBASE CONFIGURATION
// ==========================

const firebaseConfig = {

    apiKey: "AIzaSyB38ICbYFoIkKJFqttTj1pV94Geg7vdxcw",

    authDomain: "finvision-uganda-4796e.firebaseapp.com",

    projectId: "finvision-uganda-4796e",

    storageBucket: "finvision-uganda-4796e.firebasestorage.app",

    messagingSenderId: "679632218540",

    appId: "1:679632218540:web:6fc2895f89ebc943887209"

};

// ==========================
// INITIALIZE FIREBASE
// ==========================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// ==========================
// REGISTER ACCOUNT
// ==========================

window.register = async function () {

    const business =
    document.getElementById("business").value.trim();

    const username =
    document.getElementById("username").value.trim();

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value;

    if (
        !business ||
        !username ||
        !email ||
        !password
    ) {

        alert("Please fill in all fields.");

        return;

    }

    try {

        await addDoc(
            collection(db, "users"),
            {

                businessName: business,

                username: username,

                email: email,

                password: password,

                createdAt: new Date()

            }
        );

        alert("Account created successfully.");

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

};

// ==========================
// LOGIN
// ==========================

window.login = async function () {

    const username =
    document.getElementById("username").value.trim();

    const password =
    document.getElementById("password").value;

    if (!username || !password) {

        alert("Please enter username and password.");

        return;

    }

    try {

        const q = query(

            collection(db, "users"),

            where("username", "==", username),

            where("password", "==", password)

        );

        const result = await getDocs(q);

        if (result.empty) {

            alert("Invalid username or password.");

            return;

        }

        result.forEach((doc) => {

            localStorage.setItem(
                "business",
                doc.data().businessName
            );

            localStorage.setItem(
                "username",
                doc.data().username
            );

        });

        alert("Login Successful!");

        window.location.href =
        "dashboard.html";

    }

    catch (error) {

        alert(error.message);

    }

};

// ==========================
// SHOW / HIDE PASSWORD
// ==========================

window.togglePassword = function () {

    const password =
    document.getElementById("password");

    if (password.type === "password") {

        password.type = "text";

    }

    else {

        password.type = "password";

    }

};

// ==========================
// LOGOUT
// ==========================

window.logout = function () {

    localStorage.clear();

    window.location.href =
    "login.html";

};
// =====================================
// FINVISION UGANDA
// script.js - Part 2
// Sales, Expenses, Products & Customers
// =====================================

// ==========================
// SAVE SALE
// ==========================

window.saveSale = async function () {

    const product = document.getElementById("product").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const price = Number(document.getElementById("price").value);
    const customer = document.getElementById("customer").value.trim();
    const payment = document.getElementById("payment").value;
    const date = document.getElementById("date").value;

    if (!product || !quantity || !price || !customer || !date) {
        alert("Please fill in all fields.");
        return;
    }

    const total = quantity * price;

    try {

        await addDoc(collection(db, "sales"), {
            product,
            quantity,
            price,
            total,
            customer,
            payment,
            date,
            createdAt: new Date()
        });

        if (document.getElementById("result")) {
            document.getElementById("result").innerHTML =
            "<h3 style='color:green;'>✅ Sale Saved Successfully!</h3>" +
            "<p>Total: UGX " + total.toLocaleString() + "</p>";
        }

        if (document.getElementById("product")) {
            document.getElementById("product").value = "";
            document.getElementById("quantity").value = "";
            document.getElementById("price").value = "";
            document.getElementById("customer").value = "";
            document.getElementById("payment").selectedIndex = 0;
            document.getElementById("date").value = "";
        }

    } catch (error) {

        alert(error.message);

    }

};

// ==========================
// SAVE EXPENSE
// ==========================

window.saveExpense = async function () {

    const expenseName =
    document.getElementById("expenseName").value.trim();

    const category =
    document.getElementById("category").value;

    const amount =
    Number(document.getElementById("amount").value);

    const expenseDate =
    document.getElementById("expenseDate").value;

    const paymentMethod =
    document.getElementById("paymentMethod").value;

    const description =
    document.getElementById("description").value.trim();

    if (!expenseName || !amount || !expenseDate) {

        alert("Please fill in all required fields.");

        return;

    }

    try {

        await addDoc(collection(db, "expenses"), {

            expenseName,
            category,
            amount,
            date: expenseDate,
            payment: paymentMethod,
            description,
            createdAt: new Date()

        });

        if (document.getElementById("expenseResult")) {

            document.getElementById("expenseResult").innerHTML =
            "<h3 style='color:green;'>✅ Expense Saved Successfully!</h3>";

        }

        document.querySelector("form").reset();

    }

    catch (error) {

        alert(error.message);

    }

};

// ==========================
// SAVE PRODUCT
// ==========================

window.saveProduct = async function () {

    const name =
    document.getElementById("productName").value.trim();

    const category =
    document.getElementById("productCategory").value;

    const buyingPrice =
    Number(document.getElementById("buyPrice").value);

    const sellingPrice =
    Number(document.getElementById("sellPrice").value);

    const quantity =
    Number(document.getElementById("productQuantity").value);

    const date =
    document.getElementById("productDate").value;

    if (
        !name ||
        !buyingPrice ||
        !sellingPrice ||
        !quantity ||
        !date
    ) {

        alert("Please fill in all fields.");

        return;

    }

    try {

        await addDoc(collection(db, "products"), {

            name,
            category,
            buyingPrice,
            sellingPrice,
            quantity,
            date,
            createdAt: new Date()

        });

        if (document.getElementById("productResult")) {

            document.getElementById("productResult").innerHTML =
            "<h3 style='color:green;'>✅ Product Saved Successfully!</h3>";

        }

        document.querySelector("form").reset();

    }

    catch (error) {

        alert(error.message);

    }

};

// ==========================
// SAVE CUSTOMER
// ==========================

window.saveCustomer = async function () {

    const name =
    document.getElementById("customerName").value.trim();

    const phone =
    document.getElementById("customerPhone").value.trim();

    const email =
    document.getElementById("customerEmail").value.trim();

    const address =
    document.getElementById("customerAddress").value.trim();

    const type =
    document.getElementById("customerType").value;

    const date =
    document.getElementById("customerDate").value;

    if (
        !name ||
        !phone ||
        !email ||
        !address ||
        !date
    ) {

        alert("Please fill in all fields.");

        return;

    }

    try {

        await addDoc(collection(db, "customers"), {

            name,
            phone,
            email,
            address,
            type,
            date,
            createdAt: new Date()

        });

        if (document.getElementById("customerResult")) {

            document.getElementById("customerResult").innerHTML =
            "<h3 style='color:green;'>✅ Customer Saved Successfully!</h3>";

        }

        document.querySelector("form").reset();

    }

    catch (error) {

        alert(error.message);

    }

};
// =====================================
// FINVISION UGANDA
// script.js - Part 3
// LIVE DASHBOARD
// =====================================

// ==========================
// DASHBOARD TOTALS
// ==========================

let totalSales = 0;
let totalExpenses = 0;

// ==========================
// UPDATE DASHBOARD
// ==========================

function updateDashboard() {

    const profit = totalSales - totalExpenses;
    const cashBalance = profit;

    if (document.getElementById("todaySales")) {
        document.getElementById("todaySales").innerHTML =
            "UGX " + totalSales.toLocaleString();
    }

    if (document.getElementById("todayExpenses")) {
        document.getElementById("todayExpenses").innerHTML =
            "UGX " + totalExpenses.toLocaleString();
    }

    if (document.getElementById("todayProfit")) {
        document.getElementById("todayProfit").innerHTML =
            "UGX " + profit.toLocaleString();
    }

    if (document.getElementById("cashBalance")) {
        document.getElementById("cashBalance").innerHTML =
            "UGX " + cashBalance.toLocaleString();
    }

}

// ==========================
// LIVE SALES TOTAL
// ==========================

onSnapshot(collection(db, "sales"), (snapshot) => {

    totalSales = 0;

    snapshot.forEach((doc) => {

        totalSales += Number(doc.data().total || 0);

    });

    updateDashboard();

});

// ==========================
// LIVE EXPENSES TOTAL
// ==========================

onSnapshot(collection(db, "expenses"), (snapshot) => {

    totalExpenses = 0;

    snapshot.forEach((doc) => {

        totalExpenses += Number(doc.data().amount || 0);

    });

    updateDashboard();

});

// ==========================
// LIVE CUSTOMER COUNT
// ==========================

if (document.getElementById("customerCount")) {

    onSnapshot(collection(db, "customers"), (snapshot) => {

        document.getElementById("customerCount").innerHTML =
            snapshot.size;

    });

}

// ==========================
// LIVE PRODUCT COUNT
// ==========================

if (document.getElementById("productCount")) {

    onSnapshot(collection(db, "products"), (snapshot) => {

        document.getElementById("productCount").innerHTML =
            snapshot.size;

    });

}

// ==========================
// SHOW BUSINESS NAME
// ==========================

const business = localStorage.getItem("business");

if (business && document.getElementById("welcome")) {

    document.getElementById("welcome").innerHTML =
        "Welcome, " + business;

}
// =====================================
// FINVISION UGANDA
// script.js - Part 4
// REPORTS
// =====================================

// ==========================
// LOAD REPORT
// ==========================

window.loadReport = function(type = "Daily") {

    if (!document.getElementById("reportTable")) return;

    onSnapshot(collection(db, "sales"), (salesSnapshot) => {

        let sales = 0;
        let transactions = 0;
        let rows = "";

        salesSnapshot.forEach((doc) => {

            const sale = doc.data();

            sales += Number(sale.total || 0);
            transactions++;

            rows += `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.product}</td>
                <td>${sale.customer}</td>
                <td>${sale.payment}</td>
                <td>UGX ${Number(sale.total).toLocaleString()}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="5">
                    No Sales Records Found
                </td>
            </tr>
            `;

        }

        document.getElementById("reportTable").innerHTML = rows;

        document.getElementById("reportTitle").innerHTML =
            type + " Report";

        document.getElementById("totalSales").innerHTML =
            "UGX " + sales.toLocaleString();

        document.getElementById("transactions").innerHTML =
            transactions;

        loadExpenseReport(sales);

    });

};

// ==========================
// LOAD EXPENSES
// ==========================

function loadExpenseReport(totalSalesAmount) {

    onSnapshot(collection(db, "expenses"), (expenseSnapshot) => {

        let expenses = 0;

        expenseSnapshot.forEach((doc) => {

            expenses += Number(doc.data().amount || 0);

        });

        const profit = totalSalesAmount - expenses;

        document.getElementById("totalExpenses").innerHTML =
            "UGX " + expenses.toLocaleString();

        document.getElementById("netProfit").innerHTML =
            "UGX " + profit.toLocaleString();

    });

}

// ==========================
// PRINT REPORT
// ==========================

window.printReport = function () {

    window.print();

};

// ==========================
// CHANGE REPORT TYPE
// ==========================

window.changeReport = function () {

    const reportType =
        document.getElementById("reportType").value;

    loadReport(reportType);

};

// ==========================
// AUTO LOAD REPORT
// ==========================

if (document.getElementById("reportTable")) {

    loadReport("Daily");

}
// =====================================
// FINVISION UGANDA
// script.js - Part 5
// GENERAL JOURNAL & GENERAL LEDGER
// =====================================

// ==========================
// SAVE GENERAL JOURNAL
// ==========================

window.saveJournal = async function () {

    const journalNumber = document.getElementById("journalNumber").value.trim();
    const journalDate = document.getElementById("journalDate").value;
    const debitAccount = document.getElementById("debitAccount").value;
    const creditAccount = document.getElementById("creditAccount").value;
    const amount = Number(document.getElementById("journalAmount").value);
    const reference = document.getElementById("referenceNumber").value.trim();
    const description = document.getElementById("journalDescription").value.trim();

    if (!journalDate || !debitAccount || !creditAccount || !amount) {
        alert("Please fill in all required fields.");
        return;
    }

    if (debitAccount === creditAccount) {
        alert("Debit and Credit accounts cannot be the same.");
        return;
    }

    try {

        await addDoc(collection(db, "journal"), {

            journalNumber,
            date: journalDate,
            debitAccount,
            creditAccount,
            amount,
            reference,
            description,
            createdAt: new Date()

        });

        if (document.getElementById("journalResult")) {

            document.getElementById("journalResult").innerHTML =
                "<h3 style='color:green;'>✅ Journal Entry Saved Successfully!</h3>";

        }

        document.querySelector("form").reset();

    } catch (error) {

        alert(error.message);

    }

};

// ==========================
// LOAD JOURNAL
// ==========================

window.loadJournal = function () {

    if (!document.getElementById("journalTable")) return;

    onSnapshot(collection(db, "journal"), (snapshot) => {

        let rows = "";

        snapshot.forEach((doc) => {

            const j = doc.data();

            rows += `
            <tr>
                <td>${j.journalNumber}</td>
                <td>${j.date}</td>
                <td>${j.debitAccount}</td>
                <td>${j.creditAccount}</td>
                <td>UGX ${Number(j.amount).toLocaleString()}</td>
                <td>${j.reference}</td>
                <td>${j.description}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="7">
                    No Journal Entries Found
                </td>
            </tr>
            `;

        }

        document.getElementById("journalTable").innerHTML = rows;

    });

};

// ==========================
// LOAD GENERAL LEDGER
// ==========================

window.loadLedger = function () {

    if (!document.getElementById("ledgerTable")) return;

    const selectedAccount =
        document.getElementById("ledgerAccount").value;

    onSnapshot(collection(db, "journal"), (snapshot) => {

        let rows = "";
        let totalDebit = 0;
        let totalCredit = 0;
        let balance = 0;

        snapshot.forEach((doc) => {

            const entry = doc.data();

            if (
                selectedAccount !== "All" &&
                entry.debitAccount !== selectedAccount &&
                entry.creditAccount !== selectedAccount
            ) {
                return;
            }

            let debit = "";
            let credit = "";

            if (
                selectedAccount === "All" ||
                entry.debitAccount === selectedAccount
            ) {

                debit = Number(entry.amount);
                totalDebit += debit;
                balance += debit;

            }

            if (
                selectedAccount === "All" ||
                entry.creditAccount === selectedAccount
            ) {

                credit = Number(entry.amount);
                totalCredit += credit;
                balance -= credit;

            }

            rows += `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.journalNumber}</td>
                <td>${entry.debitAccount}</td>
                <td>${entry.creditAccount}</td>
                <td>${debit === "" ? "-" : "UGX " + debit.toLocaleString()}</td>
                <td>${credit === "" ? "-" : "UGX " + credit.toLocaleString()}</td>
                <td>UGX ${balance.toLocaleString()}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="7">
                    No Ledger Entries Found
                </td>
            </tr>
            `;

        }

        document.getElementById("ledgerTable").innerHTML = rows;

        document.getElementById("totalDebit").innerHTML =
            "UGX " + totalDebit.toLocaleString();

        document.getElementById("totalCredit").innerHTML =
            "UGX " + totalCredit.toLocaleString();

        document.getElementById("ledgerBalance").innerHTML =
            "UGX " + balance.toLocaleString();

    });

};

// ==========================
// AUTO LOAD
// ==========================

if (document.getElementById("journalTable")) {

    loadJournal();

}

if (document.getElementById("ledgerTable")) {

    loadLedger();

}
// =====================================
// FINVISION UGANDA
// script.js - Part 6
// TRIAL BALANCE, INCOME STATEMENT,
// BALANCE SHEET
// =====================================

// ==========================
// LOAD TRIAL BALANCE
// ==========================

window.loadTrialBalance = function () {

    if (!document.getElementById("trialTable")) return;

    onSnapshot(collection(db, "journal"), (snapshot) => {

        const accounts = {};

        snapshot.forEach((doc) => {

            const entry = doc.data();

            if (!accounts[entry.debitAccount]) {
                accounts[entry.debitAccount] = {
                    debit: 0,
                    credit: 0
                };
            }

            if (!accounts[entry.creditAccount]) {
                accounts[entry.creditAccount] = {
                    debit: 0,
                    credit: 0
                };
            }

            accounts[entry.debitAccount].debit += Number(entry.amount);
            accounts[entry.creditAccount].credit += Number(entry.amount);

        });

        let rows = "";
        let totalDebit = 0;
        let totalCredit = 0;

        for (const account in accounts) {

            totalDebit += accounts[account].debit;
            totalCredit += accounts[account].credit;

            rows += `
            <tr>
                <td>${account}</td>
                <td>UGX ${accounts[account].debit.toLocaleString()}</td>
                <td>UGX ${accounts[account].credit.toLocaleString()}</td>
            </tr>`;
        }

        if (rows === "") {
            rows = `
            <tr>
                <td colspan="3">No Trial Balance Records Found</td>
            </tr>`;
        }

        document.getElementById("trialTable").innerHTML = rows;

        document.getElementById("trialDebit").innerHTML =
            "UGX " + totalDebit.toLocaleString();

        document.getElementById("trialCredit").innerHTML =
            "UGX " + totalCredit.toLocaleString();

    });

};

// ==========================
// LOAD INCOME STATEMENT
// ==========================

window.loadIncomeStatement = function () {

    if (!document.getElementById("incomeRevenue")) return;

    onSnapshot(collection(db, "sales"), (salesSnapshot) => {

        let revenue = 0;

        salesSnapshot.forEach((doc) => {
            revenue += Number(doc.data().total || 0);
        });

        onSnapshot(collection(db, "expenses"), (expenseSnapshot) => {

            let expenses = 0;

            expenseSnapshot.forEach((doc) => {
                expenses += Number(doc.data().amount || 0);
            });

            const netIncome = revenue - expenses;

            document.getElementById("incomeRevenue").innerHTML =
                "UGX " + revenue.toLocaleString();

            document.getElementById("incomeExpenses").innerHTML =
                "UGX " + expenses.toLocaleString();

            document.getElementById("netIncome").innerHTML =
                "UGX " + netIncome.toLocaleString();

        });

    });

};

// ==========================
// LOAD BALANCE SHEET
// ==========================

window.loadBalanceSheet = function () {

    if (!document.getElementById("totalAssets")) return;

    onSnapshot(collection(db, "sales"), (salesSnapshot) => {

        let cash = 0;

        salesSnapshot.forEach((doc) => {
            cash += Number(doc.data().total || 0);
        });

        onSnapshot(collection(db, "expenses"), (expenseSnapshot) => {

            let expenses = 0;

            expenseSnapshot.forEach((doc) => {
                expenses += Number(doc.data().amount || 0);
            });

            const assets = cash;
            const liabilities = expenses;
            const equity = assets - liabilities;

            document.getElementById("totalAssets").innerHTML =
                "UGX " + assets.toLocaleString();

            document.getElementById("totalLiabilities").innerHTML =
                "UGX " + liabilities.toLocaleString();

            document.getElementById("ownerEquity").innerHTML =
                "UGX " + equity.toLocaleString();

        });

    });

};

// ==========================
// AUTO LOAD
// ==========================

if (document.getElementById("trialTable")) {
    loadTrialBalance();
}

if (document.getElementById("incomeRevenue")) {
    loadIncomeStatement();
}

if (document.getElementById("totalAssets")) {
    loadBalanceSheet();
}
// =====================================
// FINVISION UGANDA
// script.js - Part 7
// ACCOUNTS PAYABLE & RECEIVABLE
// =====================================

// ==========================
// SAVE ACCOUNTS PAYABLE
// ==========================

window.savePayable = async function () {

    const supplier =
        document.getElementById("supplierName").value.trim();

    const invoice =
        document.getElementById("invoiceNumber").value.trim();

    const amount =
        Number(document.getElementById("payableAmount").value);

    const dueDate =
        document.getElementById("dueDate").value;

    const status =
        document.getElementById("payableStatus").value;

    if (!supplier || !invoice || !amount || !dueDate) {

        alert("Please fill in all required fields.");

        return;

    }

    try {

        await addDoc(collection(db, "accountsPayable"), {

            supplier,
            invoice,
            amount,
            dueDate,
            status,
            createdAt: new Date()

        });

        alert("Accounts Payable saved successfully.");

        document.querySelector("form").reset();

    }

    catch (error) {

        alert(error.message);

    }

};

// ==========================
// LOAD PAYABLES
// ==========================

window.loadPayables = function () {

    if (!document.getElementById("payableTable")) return;

    onSnapshot(collection(db, "accountsPayable"), (snapshot) => {

        let rows = "";
        let total = 0;

        snapshot.forEach((doc) => {

            const p = doc.data();

            total += Number(p.amount);

            rows += `
            <tr>
                <td>${p.supplier}</td>
                <td>${p.invoice}</td>
                <td>UGX ${Number(p.amount).toLocaleString()}</td>
                <td>${p.dueDate}</td>
                <td>${p.status}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="5">
                    No Accounts Payable Records
                </td>
            </tr>
            `;

        }

        document.getElementById("payableTable").innerHTML = rows;

        if (document.getElementById("totalPayables")) {

            document.getElementById("totalPayables").innerHTML =
                "UGX " + total.toLocaleString();

        }

    });

};

// ==========================
// SAVE ACCOUNTS RECEIVABLE
// ==========================

window.saveReceivable = async function () {

    const customer =
        document.getElementById("customerName").value.trim();

    const invoice =
        document.getElementById("invoiceNumber").value.trim();

    const amount =
        Number(document.getElementById("receivableAmount").value);

    const dueDate =
        document.getElementById("dueDate").value;

    const status =
        document.getElementById("receivableStatus").value;

    if (!customer || !invoice || !amount || !dueDate) {

        alert("Please fill in all required fields.");

        return;

    }

    try {

        await addDoc(collection(db, "accountsReceivable"), {

            customer,
            invoice,
            amount,
            dueDate,
            status,
            createdAt: new Date()

        });

        alert("Accounts Receivable saved successfully.");

        document.querySelector("form").reset();

    }

    catch (error) {

        alert(error.message);

    }

};

// ==========================
// LOAD RECEIVABLES
// ==========================

window.loadReceivables = function () {

    if (!document.getElementById("receivableTable")) return;

    onSnapshot(collection(db, "accountsReceivable"), (snapshot) => {

        let rows = "";
        let total = 0;

        snapshot.forEach((doc) => {

            const r = doc.data();

            total += Number(r.amount);

            rows += `
            <tr>
                <td>${r.customer}</td>
                <td>${r.invoice}</td>
                <td>UGX ${Number(r.amount).toLocaleString()}</td>
                <td>${r.dueDate}</td>
                <td>${r.status}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="5">
                    No Accounts Receivable Records
                </td>
            </tr>
            `;

        }

        document.getElementById("receivableTable").innerHTML = rows;

        if (document.getElementById("totalReceivables")) {

            document.getElementById("totalReceivables").innerHTML =
                "UGX " + total.toLocaleString();

        }

    });

};

// ==========================
// AUTO LOAD
// ==========================

if (document.getElementById("payableTable")) {

    loadPayables();

}

if (document.getElementById("receivableTable")) {

    loadReceivables();

}
// =====================================
// FINVISION UGANDA
// script.js - Part 8
// CASH FLOW & FINAL INITIALIZATION
// =====================================

// ==========================
// LOAD CASH FLOW STATEMENT
// ==========================

window.loadCashFlow = function () {

    if (!document.getElementById("cashIn")) return;

    onSnapshot(collection(db, "sales"), (salesSnapshot) => {

        let cashIn = 0;

        salesSnapshot.forEach((doc) => {

            cashIn += Number(doc.data().total || 0);

        });

        onSnapshot(collection(db, "expenses"), (expenseSnapshot) => {

            let cashOut = 0;

            expenseSnapshot.forEach((doc) => {

                cashOut += Number(doc.data().amount || 0);

            });

            const netCash = cashIn - cashOut;

            document.getElementById("cashIn").innerHTML =
                "UGX " + cashIn.toLocaleString();

            document.getElementById("cashOut").innerHTML =
                "UGX " + cashOut.toLocaleString();

            document.getElementById("netCashFlow").innerHTML =
                "UGX " + netCash.toLocaleString();

        });

    });

};

// ==========================
// PRINT PAGE
// ==========================

window.printPage = function () {

    window.print();

};

// ==========================
// EXPORT PLACEHOLDER
// ==========================

window.exportPDF = function () {

    alert("PDF export will be added in a future version.");

};

window.exportExcel = function () {

    alert("Excel export will be added in a future version.");

};

// ==========================
// PAGE INITIALIZATION
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("cashIn")) {
        loadCashFlow();
    }

    if (document.getElementById("welcome")) {

        const business = localStorage.getItem("business");

        if (business) {

            document.getElementById("welcome").textContent =
                "Welcome, " + business;

        }

    }

});

// ==========================
// GLOBAL ERROR HANDLER
// ==========================

window.addEventListener("error", (event) => {

    console.error("JavaScript Error:", event.message);

});

// =====================================
// END OF SCRIPT.JS
// FINVISION UGANDA v1.0
// =====================================