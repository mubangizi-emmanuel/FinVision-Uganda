// =====================================
// FINVISION UGANDA
// script.js
// PART 1 - FIREBASE SETUP
// =====================================

// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firestore
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    doc,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =====================================
// FIREBASE CONFIGURATION
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyB38ICbYFoIkKJFqttTj1pV94Geg7vdxcw",
    authDomain: "finvision-uganda-4796e.firebaseapp.com",
    projectId: "finvision-uganda-4796e",
    storageBucket: "finvision-uganda-4796e.firebasestorage.app",
    messagingSenderId: "679632218540",
    appId: "1:679632218540:web:6fc2895f89ebc943887209"
};

// =====================================
// INITIALIZE FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =====================================
// CURRENT USER
// =====================================

let currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

// =====================================
// HELPER FUNCTION
// Adds logged-in username to every record
// =====================================

function getUserData(data) {

    if (!currentUser) {
        return data;
    }

    return {
        ...data,
        owner: currentUser.username
    };
}
// =====================================
// PART 2 - REGISTER
// =====================================

window.register = async function () {

    const business = document.getElementById("business").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!business || !username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Save user information in Firestore
        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,
            businessName: business,
            username: username,
            email: email,
            createdAt: new Date()

        });

        alert("Account created successfully!");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 3 - LOGIN
// =====================================

window.login = async function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {

        // Sign in using Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Get user information from Firestore
        const userSnapshot = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!userSnapshot.exists()) {
            alert("User information not found.");
            return;
        }

        currentUser = userSnapshot.data();

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 4 - LOGOUT
// =====================================

window.logout = async function () {

    try {

        // Sign out from Firebase Authentication
        await signOut(auth);

        // Remove saved user information
        localStorage.removeItem("currentUser");

        currentUser = null;

        alert("Logged out successfully!");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 5 - SAVE SALES
// =====================================

window.saveSale = async function () {

    const product = document.getElementById("product").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const price = Number(document.getElementById("price").value);
    const customer = document.getElementById("customer").value.trim();
    const payment = document.getElementById("payment").value;
    const paymentStatus =
document.getElementById("paymentStatus").value;
    const date = document.getElementById("date").value;

    if (!product || !quantity || !price || !customer || !date) {
        alert("Please fill in all fields.");
        return;
    }

    const total = quantity * price;

    try {

        await addDoc(collection(db, "sales"), getUserData({

            product: product,
            quantity: quantity,
            price: price,
            total: total,
            customer: customer,
            payment: payment,
            paymentStatus: paymentStatus,
            date: date,
            createdAt: new Date()

        }));

        alert("Sale saved successfully!");

        document.getElementById("product").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("price").value = "";
        document.getElementById("customer").value = "";
        document.getElementById("date").value = "";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 6 - LOAD SALES
// =====================================

window.loadSales = function () {

    if (!document.getElementById("salesTable")) return;

    const q = query(
        collection(db, "sales"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";
        let totalSales = 0;

        snapshot.forEach((doc) => {

            const sale = doc.data();

            totalSales += Number(sale.total);

            rows += `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.customer}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity}</td>
                <td>UGX ${Number(sale.price).toLocaleString()}</td>
                <td>UGX ${Number(sale.total).toLocaleString()}</td>
                <td>${sale.payment}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="7">
                    No Sales Found
                </td>
            </tr>
            `;

        }

        document.getElementById("salesTable").innerHTML = rows;

        if (document.getElementById("totalSales")) {

            document.getElementById("totalSales").innerHTML =
                "UGX " + totalSales.toLocaleString();

        }

    });

};
// =====================================
// PART 7 - SAVE PRODUCTS
// =====================================

window.saveProduct = async function () {

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const buyingPrice = Number(document.getElementById("buyPrice").value);
    const sellingPrice = Number(document.getElementById("sellPrice").value);
    const quantity = Number(document.getElementById("productQuantity").value);
    const date = document.getElementById("productDate").value;

    if (!name || !buyingPrice || !sellingPrice || !quantity || !date) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "products"), getUserData({

            name: name,
            category: category,
            buyingPrice: buyingPrice,
            sellingPrice: sellingPrice,
            quantity: quantity,
            date: date,
            createdAt: new Date()

        }));

        alert("Product saved successfully!");

        document.getElementById("productName").value = "";
        document.getElementById("productCategory").value = "";
        document.getElementById("buyPrice").value = "";
        document.getElementById("sellPrice").value = "";
        document.getElementById("productQuantity").value = "";
        document.getElementById("productDate").value = "";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 8 - LOAD PRODUCTS
// =====================================

window.loadProducts = function () {

    if (!document.getElementById("productTable")) return;

    const q = query(
        collection(db, "products"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        snapshot.forEach((doc) => {

            const product = doc.data();

            rows += `
            <tr>
                <td>${product.date}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>UGX ${Number(product.buyingPrice).toLocaleString()}</td>
                <td>UGX ${Number(product.sellingPrice).toLocaleString()}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="6">
                    No Products Found
                </td>
            </tr>
            `;

        }

        document.getElementById("productTable").innerHTML = rows;

    });

};
// =====================================
// PART 9 - SAVE CUSTOMER
// =====================================

window.saveCustomer = async function () {

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const type = document.getElementById("customerType").value;
    const date = document.getElementById("customerDate").value;

    if (!name || !phone || !email || !address || !date) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "customers"), getUserData({

            name: name,
            phone: phone,
            email: email,
            address: address,
            type: type,
            date: date,
            createdAt: new Date()

        }));

        alert("Customer saved successfully!");

        document.getElementById("customerName").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("customerEmail").value = "";
        document.getElementById("customerAddress").value = "";
        document.getElementById("customerType").selectedIndex = 0;
        document.getElementById("customerDate").value = "";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 10 - LOAD CUSTOMERS
// =====================================

window.loadCustomers = function () {

    if (!document.getElementById("customerTable")) return;

    const q = query(
        collection(db, "customers"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        snapshot.forEach((doc) => {

            const customer = doc.data();

            rows += `
            <tr>
                <td>${customer.date}</td>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email}</td>
                <td>${customer.address}</td>
                <td>${customer.type}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="6">
                    No Customers Found
                </td>
            </tr>
            `;

        }

        document.getElementById("customerTable").innerHTML = rows;

    });

};
// =====================================
// PART 11 - SAVE EXPENSE
// =====================================

window.saveExpense = async function () {

    const expenseName = document.getElementById("expenseName").value.trim();
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const expenseDate = document.getElementById("expenseDate").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const paymentStatus =
document.getElementById("paymentStatus").value;
    const description = document.getElementById("description").value.trim();

    if (!expenseName || !amount || !expenseDate) {
        alert("Please fill in all required fields.");
        return;
    }

    try {

        await addDoc(collection(db, "expenses"), {

            owner: currentUser.username,
            expenseName: expenseName,
            category: category,
            amount: amount,
            date: expenseDate,
            payment: paymentMethod,
            paymentStatus: paymentStatus,
            description: description,
            createdAt: new Date()

        });

        alert("Expense saved successfully!");

        document.getElementById("expenseName").value = "";
        document.getElementById("category").selectedIndex = 0;
        document.getElementById("amount").value = "";
        document.getElementById("expenseDate").value = "";
        document.getElementById("paymentMethod").selectedIndex = 0;
        document.getElementById("description").value = "";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 12 - LOAD EXPENSES
// =====================================

window.loadExpenses = function () {

    if (!document.getElementById("expenseTable")) return;

    const q = query(
        collection(db, "expenses"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";
        let totalExpenses = 0;

        snapshot.forEach((doc) => {

            const expense = doc.data();

            totalExpenses += Number(expense.amount);

            rows += `
            <tr>
                <td>${expense.date}</td>
                <td>${expense.expenseName}</td>
                <td>${expense.category}</td>
                <td>${expense.payment}</td>
                <td>UGX ${Number(expense.amount).toLocaleString()}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="5">
                    No Expenses Found
                </td>
            </tr>
            `;

        }

        document.getElementById("expenseTable").innerHTML = rows;

        if (document.getElementById("totalExpenses")) {

            document.getElementById("totalExpenses").innerHTML =
                "UGX " + totalExpenses.toLocaleString();

        }

    });

};
// =====================================
// PART 13 - SAVE ACCOUNTS RECEIVABLE
// =====================================

window.saveReceivable = async function () {

    const customer = document.getElementById("customer").value.trim();
    const product = document.getElementById("product").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const dueDate = document.getElementById("dueDate").value;

    if (!customer || !product || !amount || !dueDate) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "receivables"), getUserData({

            customer: customer,
            product: product,
            amount: amount,
            dueDate: dueDate,
            createdAt: new Date()

        }));

        alert("Accounts Receivable saved successfully!");

        document.getElementById("customer").value = "";
        document.getElementById("product").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("dueDate").value = "";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// LOAD ACCOUNTS RECEIVABLE
// =====================================

window.loadAccountsReceivable = function () {

    if (!document.getElementById("receivableTable")) return;

    const q = query(
        collection(db, "receivables"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";
        let totalReceivable = 0;

        snapshot.forEach((doc) => {

            const receivable = doc.data();

            totalReceivable += Number(receivable.amount);

            rows += `
            <tr>
                <td>${receivable.dueDate}</td>
                <td>${receivable.customer}</td>
                <td>${receivable.product}</td>
                <td>UGX ${Number(receivable.amount).toLocaleString()}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="4">
                    No Accounts Receivable
                </td>
            </tr>
            `;

        }

        document.getElementById("receivableTable").innerHTML = rows;

        if (document.getElementById("totalReceivable")) {

            document.getElementById("totalReceivable").innerHTML =
                "UGX " + totalReceivable.toLocaleString();

        }

    });

};
// =====================================
// PART 14 - SAVE ACCOUNTS PAYABLE
// =====================================

window.savePayable = async function () {

    const supplier = document.getElementById("supplier").value.trim();
    const item = document.getElementById("item").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const dueDate = document.getElementById("dueDate").value;

    if (!supplier || !item || !amount || !dueDate) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "payables"), getUserData({

            supplier: supplier,
            item: item,
            amount: amount,
            dueDate: dueDate,
            createdAt: new Date()

        }));

        alert("Accounts Payable saved successfully!");

        document.getElementById("supplier").value = "";
        document.getElementById("item").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("dueDate").value = "";

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// LOAD ACCOUNTS PAYABLE
// =====================================

window.loadAccountsPayable = function () {

    if (!document.getElementById("payableTable")) return;

    const q = query(
        collection(db, "payables"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";
        let totalPayable = 0;

        snapshot.forEach((doc) => {

            const payable = doc.data();

            totalPayable += Number(payable.amount);

            rows += `
            <tr>
                <td>${payable.dueDate}</td>
                <td>${payable.supplier}</td>
                <td>${payable.item}</td>
                <td>UGX ${Number(payable.amount).toLocaleString()}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="4">
                    No Accounts Payable
                </td>
            </tr>
            `;

        }

        document.getElementById("payableTable").innerHTML = rows;

        if (document.getElementById("totalPayable")) {

            document.getElementById("totalPayable").innerHTML =
                "UGX " + totalPayable.toLocaleString();

        }

    });

};
// =====================================
// PART 15 - LOAD DASHBOARD
// =====================================

window.loadDashboard = function () {

    if (!document.getElementById("todaySales")) return;

    // SALES
    onSnapshot(
        query(
            collection(db, "sales"),
            where("owner", "==", currentUser.username)
        ),
        (snapshot) => {

            let sales = 0;

            snapshot.forEach((doc) => {
                sales += Number(doc.data().total);
            });

            document.getElementById("todaySales").innerHTML =
                "UGX " + sales.toLocaleString();

            calculateProfit();

        }
    );

    // EXPENSES
    onSnapshot(
        query(
            collection(db, "expenses"),
            where("owner", "==", currentUser.username)
        ),
        (snapshot) => {

            let expenses = 0;

            snapshot.forEach((doc) => {
                expenses += Number(doc.data().amount);
            });

            document.getElementById("todayExpenses").innerHTML =
                "UGX " + expenses.toLocaleString();

            calculateProfit();

        }
    );

    // PRODUCTS
    onSnapshot(
        query(
            collection(db, "products"),
            where("owner", "==", currentUser.username)
        ),
        (snapshot) => {

            document.getElementById("productCount").innerHTML =
                snapshot.size;

        }
    );

    // CUSTOMERS
    onSnapshot(
        query(
            collection(db, "customers"),
            where("owner", "==", currentUser.username)
        ),
        (snapshot) => {

            document.getElementById("customerCount").innerHTML =
                snapshot.size;

        }
    );

};
function calculateProfit() {

    let sales = Number(
        document.getElementById("todaySales")
            .innerHTML
            .replace("UGX", "")
            .replace(/,/g, "")
            .trim()
    );

    let expenses = Number(
        document.getElementById("todayExpenses")
            .innerHTML
            .replace("UGX", "")
            .replace(/,/g, "")
            .trim()
    );

    let profit = sales - expenses;

    document.getElementById("todayProfit").innerHTML =
        "UGX " + profit.toLocaleString();

    document.getElementById("cashBalance").innerHTML =
        "UGX " + profit.toLocaleString();

}
// =====================================
// AUTO LOAD DASHBOARD
// =====================================

if (document.getElementById("todaySales")) {

    loadDashboard();

}
// =====================================
// PART 16 - REPORTS
// =====================================

window.loadReports = function () {

    if (!document.getElementById("totalSales")) return;

    // SALES
    onSnapshot(
        query(
            collection(db, "sales"),
            where("owner", "==", currentUser.username)
        ),
        (snapshot) => {

            let totalSales = 0;
            let transactions = snapshot.size;

            snapshot.forEach((doc) => {
                totalSales += Number(doc.data().total);
            });

            document.getElementById("totalSales").innerHTML =
                "UGX " + totalSales.toLocaleString();

            document.getElementById("transactions").innerHTML =
                transactions;

            calculateReportProfit();

        }
    );

    // EXPENSES
    onSnapshot(
        query(
            collection(db, "expenses"),
            where("owner", "==", currentUser.username)
        ),
        (snapshot) => {

            let totalExpenses = 0;

            snapshot.forEach((doc) => {
                totalExpenses += Number(doc.data().amount);
            });

            document.getElementById("totalExpenses").innerHTML =
                "UGX " + totalExpenses.toLocaleString();

            calculateReportProfit();

        }
    );

};
function calculateReportProfit() {

    const sales = Number(
        document.getElementById("totalSales")
            .innerHTML
            .replace("UGX", "")
            .replace(/,/g, "")
            .trim()
    );

    const expenses = Number(
        document.getElementById("totalExpenses")
            .innerHTML
            .replace("UGX", "")
            .replace(/,/g, "")
            .trim()
    );

    document.getElementById("netProfit").innerHTML =
        "UGX " + (sales - expenses).toLocaleString();

}
// =====================================
// AUTO LOAD REPORTS
// =====================================

if (document.getElementById("totalSales")) {

    loadReports();

}
// =====================================
// PART 17 - LOAD REPORT TABLE
// =====================================

window.loadReport = function (type) {

    if (!document.getElementById("reportTable")) return;

    document.getElementById("reportTitle").innerHTML =
        type.toUpperCase() + " REPORT";

    const q = query(
        collection(db, "sales"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        snapshot.forEach((doc) => {

            const sale = doc.data();

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
                    No records found
                </td>
            </tr>
            `;

        }

        document.getElementById("reportTable").innerHTML = rows;

    });

};
// =====================================
// FINAL AUTO LOAD
// =====================================

if (document.getElementById("salesTable")) {
    loadSales();
}

if (document.getElementById("expenseTable")) {
    loadExpenses();
}

if (document.getElementById("productTable")) {
    loadProducts();
}

if (document.getElementById("customerTable")) {
    loadCustomers();
}

if (document.getElementById("receivableTable")) {
    loadAccountsReceivable();
}

if (document.getElementById("payableTable")) {
    loadAccountsPayable();
}

if (document.getElementById("todaySales")) {
    loadDashboard();
}

if (document.getElementById("totalSales")) {
    loadReports();
}
// =====================================
// PART 16 - SAVE GENERAL JOURNAL
// =====================================

window.saveJournal = async function () {

    const journalNumber =
        document.getElementById("journalNumber").value;

    const journalDate =
        document.getElementById("journalDate").value;

    const debitAccount =
        document.getElementById("debitAccount").value;

    const creditAccount =
        document.getElementById("creditAccount").value;

    const amount =
        Number(document.getElementById("journalAmount").value);

    const referenceNumber =
        document.getElementById("referenceNumber").value.trim();

    const description =
        document.getElementById("journalDescription").value.trim();

    if (
        !journalDate ||
        !debitAccount ||
        !creditAccount ||
        !amount
    ) {

        alert("Please complete all required fields.");
        return;

    }

    try {

        const journal = {

    owner: currentUser.username,

    journalNumber: journalNumber,

    date: journalDate,

    debitAccount: debitAccount,

    creditAccount: creditAccount,

    amount: amount,

    referenceNumber: referenceNumber,

    description: description,

    createdAt: new Date()

};

await addDoc(collection(db, "generalJournal"), journal);

await postToLedger(journal);

        document.getElementById("journalResult").innerHTML =
            "✅ Journal Entry Saved Successfully";

        clearJournal();

        generateJournalNumber();
    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 17 - LOAD GENERAL JOURNAL
// =====================================

window.loadJournal = function () {

    if (!document.getElementById("journalTable")) return;

    const q = query(
        collection(db, "generalJournal"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        snapshot.forEach((doc) => {

            const journal = doc.data();

            rows += `
            <tr>
                <td>${journal.journalNumber}</td>
                <td>${journal.date}</td>
                <td>${journal.debitAccount}</td>
                <td>${journal.creditAccount}</td>
                <td>UGX ${Number(journal.amount).toLocaleString()}</td>
                <td>${journal.referenceNumber}</td>
                <td>${journal.description}</td>
            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="7">
                    No journal entries available.
                </td>
            </tr>
            `;

        }

        document.getElementById("journalTable").innerHTML = rows;

    });

};

// Automatically load journal entries
window.addEventListener("load", () => {

    loadJournal();

    loadGeneralLedger();

    generateJournalNumber();

});
// =====================================
// PART 18 - AUTO JOURNAL NUMBER
// =====================================

window.generateJournalNumber = async function () {

    try {

        const snapshot = await getDocs(
            collection(db, "generalJournal")
        );

        const nextNumber = snapshot.size + 1;

        const journalNumber =
            "JV-" + String(nextNumber).padStart(4, "0");

        if (document.getElementById("journalNumber")) {

            document.getElementById("journalNumber").value =
                journalNumber;

        }

    } catch (error) {

        console.log(error);

    }

};
// =====================================
// PART 19 - AUTO POST TO GENERAL LEDGER
// =====================================

window.postToLedger = async function (journal) {

    try {

        // Debit Entry
        await addDoc(collection(db, "generalLedger"), {

            owner: journal.owner,

            journalNumber: journal.journalNumber,

            date: journal.date,

            account: journal.debitAccount,

            type: "Debit",

            debit: journal.amount,

            credit: 0,

            referenceNumber: journal.referenceNumber,

            description: journal.description,

            createdAt: new Date()

        });

        // Credit Entry
        await addDoc(collection(db, "generalLedger"), {

            owner: journal.owner,

            journalNumber: journal.journalNumber,

            date: journal.date,

            account: journal.creditAccount,

            type: "Credit",

            debit: 0,

            credit: journal.amount,

            referenceNumber: journal.referenceNumber,

            description: journal.description,

            createdAt: new Date()

        });

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 20 - LOAD GENERAL LEDGER
// =====================================

window.loadGeneralLedger = function () {

    if (!document.getElementById("ledgerTable")) return;

    const q = query(
        collection(db, "generalLedger"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalDebit = 0;
        let totalCredit = 0;

        snapshot.forEach((doc) => {

            const ledger = doc.data();

            totalDebit += Number(ledger.debit);
            totalCredit += Number(ledger.credit);

            rows += `
            <tr>

                <td>${ledger.date}</td>

                <td>${ledger.journalNumber}</td>

                <td>${ledger.account}</td>

                <td>${ledger.type}</td>

                <td>UGX ${Number(ledger.debit).toLocaleString()}</td>

                <td>UGX ${Number(ledger.credit).toLocaleString()}</td>

                <td>${ledger.referenceNumber}</td>

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

        if (document.getElementById("ledgerTotalDebit")) {

            document.getElementById("ledgerTotalDebit").innerHTML =
                "UGX " + totalDebit.toLocaleString();

        }

        if (document.getElementById("ledgerTotalCredit")) {

            document.getElementById("ledgerTotalCredit").innerHTML =
                "UGX " + totalCredit.toLocaleString();

        }

    });

};
// =====================================
// PART 21 - LOAD TRIAL BALANCE
// =====================================

window.loadTrialBalance = function () {

    if (!document.getElementById("trialBalanceTable")) return;

    const q = query(
        collection(db, "generalLedger"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        const accounts = {};

        snapshot.forEach((doc) => {

            const ledger = doc.data();

            if (!accounts[ledger.account]) {

                accounts[ledger.account] = {
                    debit: 0,
                    credit: 0
                };

            }

            accounts[ledger.account].debit += Number(ledger.debit);
            accounts[ledger.account].credit += Number(ledger.credit);

        });

        let rows = "";

        let totalDebit = 0;
        let totalCredit = 0;

        Object.keys(accounts).forEach((account) => {

            totalDebit += accounts[account].debit;
            totalCredit += accounts[account].credit;

            rows += `
            <tr>

                <td>${account}</td>

                <td>
                UGX ${accounts[account].debit.toLocaleString()}
                </td>

                <td>
                UGX ${accounts[account].credit.toLocaleString()}
                </td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="3">
                    No Trial Balance Available
                </td>
            </tr>
            `;

        }

        document.getElementById("trialBalanceTable").innerHTML = rows;

        document.getElementById("trialDebit").innerHTML =
            "UGX " + totalDebit.toLocaleString();

        document.getElementById("trialCredit").innerHTML =
            "UGX " + totalCredit.toLocaleString();

    });

};
// =====================================
// PART 22 - LOAD INCOME STATEMENT
// =====================================

window.loadIncomeStatement = function () {

    if (!document.getElementById("incomeStatementTable")) return;

    const q = query(
        collection(db, "generalLedger"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalRevenue = 0;
        let totalExpenses = 0;

        snapshot.forEach((doc) => {

            const ledger = doc.data();

            const account = ledger.account;

            const debit = Number(ledger.debit);
            const credit = Number(ledger.credit);

            // Revenue Accounts
            if (
                account === "Sales Revenue" ||
                account === "Service Revenue"
            ) {

                totalRevenue += credit;

                rows += `
                <tr>
                    <td>${account}</td>
                    <td>Revenue</td>
                    <td>UGX ${credit.toLocaleString()}</td>
                </tr>
                `;

            }

            // Expense Accounts
            if (
                account === "Rent Expense" ||
                account === "Salaries Expense" ||
                account === "Utilities Expense"
            ) {

                totalExpenses += debit;

                rows += `
                <tr>
                    <td>${account}</td>
                    <td>Expense</td>
                    <td>UGX ${debit.toLocaleString()}</td>
                </tr>
                `;

            }

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="3">
                    No Income Statement Available
                </td>
            </tr>
            `;

        }

        const netProfit = totalRevenue - totalExpenses;

        document.getElementById("incomeStatementTable").innerHTML = rows;

        document.getElementById("totalRevenue").innerHTML =
            "UGX " + totalRevenue.toLocaleString();

        document.getElementById("totalExpenses").innerHTML =
            "UGX " + totalExpenses.toLocaleString();

        document.getElementById("netProfit").innerHTML =
            "UGX " + netProfit.toLocaleString();

        document.getElementById("footerNetProfit").innerHTML =
            "UGX " + netProfit.toLocaleString();

    });

};
// =====================================
// PART 23 - LOAD BALANCE SHEET
// =====================================

window.loadBalanceSheet = function () {

    if (!document.getElementById("balanceSheetTable")) return;

    const q = query(
        collection(db, "generalLedger"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        snapshot.forEach((doc) => {

            const ledger = doc.data();

            const account = ledger.account;

            const debit = Number(ledger.debit);
            const credit = Number(ledger.credit);

            // ASSETS
            if (
                account === "Cash" ||
                account === "Bank" ||
                account === "Accounts Receivable" ||
                account === "Inventory" ||
                account === "Equipment"
            ) {

                totalAssets += debit;

                rows += `
                <tr>
                    <td>${account}</td>
                    <td>Asset</td>
                    <td>UGX ${debit.toLocaleString()}</td>
                </tr>
                `;

            }

            // LIABILITIES
            if (
                account === "Accounts Payable" ||
                account === "Loans"
            ) {

                totalLiabilities += credit;

                rows += `
                <tr>
                    <td>${account}</td>
                    <td>Liability</td>
                    <td>UGX ${credit.toLocaleString()}</td>
                </tr>
                `;

            }

            // OWNER'S EQUITY
            if (
                account === "Capital"
            ) {

                totalEquity += credit;

                rows += `
                <tr>
                    <td>${account}</td>
                    <td>Equity</td>
                    <td>UGX ${credit.toLocaleString()}</td>
                </tr>
                `;

            }

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="3">
                    No Balance Sheet Available
                </td>
            </tr>
            `;

        }

        document.getElementById("balanceSheetTable").innerHTML = rows;

        document.getElementById("totalAssets").innerHTML =
            "UGX " + totalAssets.toLocaleString();

        document.getElementById("totalLiabilities").innerHTML =
            "UGX " + totalLiabilities.toLocaleString();

        document.getElementById("totalEquity").innerHTML =
            "UGX " + totalEquity.toLocaleString();

    });

};
// =====================================
// PART 24 - LOAD CASH FLOW STATEMENT
// =====================================

window.loadCashFlow = function () {

    if (!document.getElementById("cashFlowTable")) return;

    const q = query(
        collection(db, "generalLedger"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let cashReceived = 0;
        let cashPaid = 0;

        snapshot.forEach((doc) => {

            const ledger = doc.data();

            const account = ledger.account;
            const debit = Number(ledger.debit);
            const credit = Number(ledger.credit);

            // Cash coming in
            if (
                account === "Cash" &&
                debit > 0
            ) {

                cashReceived += debit;

                rows += `
                <tr>
                    <td>${ledger.date}</td>
                    <td>Cash Received</td>
                    <td>UGX ${debit.toLocaleString()}</td>
                    <td>-</td>
                </tr>
                `;

            }

            // Cash going out
            if (
                account === "Cash" &&
                credit > 0
            ) {

                cashPaid += credit;

                rows += `
                <tr>
                    <td>${ledger.date}</td>
                    <td>Cash Paid</td>
                    <td>-</td>
                    <td>UGX ${credit.toLocaleString()}</td>
                </tr>
                `;

            }

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="4">
                    No Cash Flow Available
                </td>
            </tr>
            `;

        }

        const netCashFlow = cashReceived - cashPaid;

        document.getElementById("cashFlowTable").innerHTML = rows;

        document.getElementById("cashReceived").innerHTML =
            "UGX " + cashReceived.toLocaleString();

        document.getElementById("cashPaid").innerHTML =
            "UGX " + cashPaid.toLocaleString();

        document.getElementById("netCashFlow").innerHTML =
            "UGX " + netCashFlow.toLocaleString();

    });

};
// =====================================
// PART 25 - LOAD ACCOUNTS RECEIVABLE
// =====================================

window.loadAccountsReceivable = function () {

    if (!document.getElementById("receivableTable")) return;

    const q = query(
        collection(db, "sales"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalReceivable = 0;

        snapshot.forEach((doc) => {

            const sale = doc.data();

            // Only unpaid sales
            if (sale.paymentStatus !== "Paid") {

                totalReceivable += Number(sale.total);

                rows += `
                <tr>

                    <td>${sale.customer}</td>

                    <td>${sale.product}</td>

                    <td>${sale.date}</td>

                    <td>UGX ${Number(sale.total).toLocaleString()}</td>

                    <td>${sale.payment}</td>

                </tr>
                `;

            }

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="5">
                    No Outstanding Receivables
                </td>
            </tr>
            `;

        }

        document.getElementById("receivableTable").innerHTML = rows;

        document.getElementById("totalReceivable").innerHTML =
            "UGX " + totalReceivable.toLocaleString();

    });

};
// =====================================
// PART 27 - LOAD ACCOUNTS PAYABLE
// =====================================

window.loadAccountsPayable = function () {

    if (!document.getElementById("payableTable")) return;

    const q = query(
        collection(db, "expenses"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";
        let totalPayable = 0;

        snapshot.forEach((doc) => {

            const expense = doc.data();

            // Show only unpaid or partially paid expenses
            if (
                expense.paymentStatus === "Unpaid" ||
                expense.paymentStatus === "Partial"
            ) {

                totalPayable += Number(expense.amount);

                rows += `
                <tr>

                    <td>${expense.expenseName}</td>

                    <td>${expense.category}</td>

                    <td>${expense.date}</td>

                    <td>UGX ${Number(expense.amount).toLocaleString()}</td>

                    <td>${expense.paymentStatus}</td>

                </tr>
                `;

            }

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="5">
                    No Outstanding Payables
                </td>
            </tr>
            `;

        }

        document.getElementById("payableTable").innerHTML = rows;

        document.getElementById("totalPayable").innerHTML =
            "UGX " + totalPayable.toLocaleString();

        if (document.getElementById("footerPayable")) {

            document.getElementById("footerPayable").innerHTML =
                "UGX " + totalPayable.toLocaleString();

        }

    });

};
// =====================================
// PART 28 - LOAD INVENTORY
// =====================================

window.loadInventory = function () {

    if (!document.getElementById("inventoryTable")) return;

    const q = query(
        collection(db, "products"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalProducts = 0;
        let totalStock = 0;
        let totalValue = 0;

        snapshot.forEach((doc) => {

            const product = doc.data();

            const stock = Number(product.stock);
            const price = Number(product.price);

            totalProducts++;
            totalStock += stock;
            totalValue += stock * price;

            let status = "In Stock";

            if (stock <= 5) {

                status = "Low Stock";

            }

            if (stock <= 0) {

                status = "Out of Stock";

            }

            rows += `
            <tr>

                <td>${product.productName}</td>

                <td>${product.category}</td>

                <td>${stock}</td>

                <td>UGX ${price.toLocaleString()}</td>

                <td>UGX ${(stock * price).toLocaleString()}</td>

                <td>${status}</td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>

                <td colspan="6">

                    No Products Available

                </td>

            </tr>
            `;

        }

        document.getElementById("inventoryTable").innerHTML = rows;

        document.getElementById("totalProducts").innerHTML = totalProducts;

        document.getElementById("totalStock").innerHTML =
            totalStock.toLocaleString();

        document.getElementById("inventoryValue").innerHTML =
            "UGX " + totalValue.toLocaleString();

    });

};
// =====================================
// PART 29 - LOAD FIXED ASSETS
// =====================================

window.loadFixedAssets = function () {

    if (!document.getElementById("assetTable")) return;

    const q = query(
        collection(db, "fixedAssets"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalCost = 0;
        let totalDepreciation = 0;
        let totalBookValue = 0;

        snapshot.forEach((doc) => {

            const asset = doc.data();

            const cost = Number(asset.cost);
            const depreciation = Number(asset.depreciation);
            const bookValue = cost - depreciation;

            totalCost += cost;
            totalDepreciation += depreciation;
            totalBookValue += bookValue;

            rows += `
            <tr>

                <td>${asset.assetName}</td>

                <td>${asset.category}</td>

                <td>${asset.purchaseDate}</td>

                <td>UGX ${cost.toLocaleString()}</td>

                <td>UGX ${depreciation.toLocaleString()}</td>

                <td>UGX ${bookValue.toLocaleString()}</td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="6">
                    No Fixed Assets Found
                </td>
            </tr>
            `;

        }

        document.getElementById("assetTable").innerHTML = rows;

        document.getElementById("totalAssetCost").innerHTML =
            "UGX " + totalCost.toLocaleString();

        document.getElementById("totalDepreciation").innerHTML =
            "UGX " + totalDepreciation.toLocaleString();

        document.getElementById("bookValue").innerHTML =
            "UGX " + totalBookValue.toLocaleString();

    });

};
// =====================================
// PART 29 - LOAD FIXED ASSETS
// =====================================

window.loadFixedAssets = function () {

    if (!document.getElementById("assetTable")) return;

    const q = query(
        collection(db, "fixedAssets"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalCost = 0;
        let totalDepreciation = 0;
        let totalBookValue = 0;

        snapshot.forEach((doc) => {

            const asset = doc.data();

            const cost = Number(asset.cost);
            const depreciation = Number(asset.depreciation);
            const bookValue = cost - depreciation;

            totalCost += cost;
            totalDepreciation += depreciation;
            totalBookValue += bookValue;

            rows += `
            <tr>

                <td>${asset.assetName}</td>

                <td>${asset.category}</td>

                <td>${asset.purchaseDate}</td>

                <td>UGX ${cost.toLocaleString()}</td>

                <td>UGX ${depreciation.toLocaleString()}</td>

                <td>UGX ${bookValue.toLocaleString()}</td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="6">
                    No Fixed Assets Found
                </td>
            </tr>
            `;

        }

        document.getElementById("assetTable").innerHTML = rows;

        document.getElementById("totalAssetCost").innerHTML =
            "UGX " + totalCost.toLocaleString();

        document.getElementById("totalDepreciation").innerHTML =
            "UGX " + totalDepreciation.toLocaleString();

        document.getElementById("bookValue").innerHTML =
            "UGX " + totalBookValue.toLocaleString();

    });

};
// =====================================
// PART 30 - LOAD BUDGETS
// =====================================

window.loadBudgets = function () {

    if (!document.getElementById("budgetTable")) return;

    const q = query(
        collection(db, "budgets"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalBudget = 0;
        let totalActual = 0;

        snapshot.forEach((doc) => {

            const budget = doc.data();

            const budgetAmount = Number(budget.budgetAmount);
            const actualAmount = Number(budget.actualAmount);

            totalBudget += budgetAmount;
            totalActual += actualAmount;

            const remaining = budgetAmount - actualAmount;

            rows += `
            <tr>

                <td>${budget.category}</td>

                <td>${budget.period}</td>

                <td>UGX ${budgetAmount.toLocaleString()}</td>

                <td>UGX ${actualAmount.toLocaleString()}</td>

                <td>UGX ${remaining.toLocaleString()}</td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>

                <td colspan="5">

                    No Budget Records Found

                </td>

            </tr>
            `;

        }

        document.getElementById("budgetTable").innerHTML = rows;

        document.getElementById("totalBudget").innerHTML =
            "UGX " + totalBudget.toLocaleString();

        document.getElementById("totalActual").innerHTML =
            "UGX " + totalActual.toLocaleString();

        document.getElementById("remainingBudget").innerHTML =
            "UGX " + (totalBudget - totalActual).toLocaleString();

    });

};
// =====================================
// PART 31 - LOAD USERS
// =====================================

window.loadUsers = function () {

    if (!document.getElementById("userTable")) return;

    const q = query(
        collection(db, "users"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalUsers = 0;

        snapshot.forEach((doc) => {

            const user = doc.data();

            totalUsers++;

            rows += `
            <tr>

                <td>${user.fullName}</td>

                <td>${user.username}</td>

                <td>${user.email}</td>

                <td>${user.role}</td>

                <td>${user.status}</td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>

                <td colspan="5">

                    No Users Found

                </td>

            </tr>
            `;

        }

        document.getElementById("userTable").innerHTML = rows;

        document.getElementById("totalUsers").innerHTML = totalUsers;

    });

};
// =====================================
// PART 32 - LOAD COMPANY SETTINGS
// =====================================

window.loadCompanySettings = function () {

    if (!document.getElementById("companyName")) return;

    const q = query(
        collection(db, "companySettings"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        snapshot.forEach((doc) => {

            const company = doc.data();

            document.getElementById("companyName").value =
                company.companyName || "";

            document.getElementById("companyEmail").value =
                company.companyEmail || "";

            document.getElementById("companyPhone").value =
                company.companyPhone || "";

            document.getElementById("companyAddress").value =
                company.companyAddress || "";

            document.getElementById("companyTIN").value =
                company.companyTIN || "";

            document.getElementById("companyCurrency").value =
                company.companyCurrency || "UGX";

        });

    });

};
// =====================================
// PART 32 - SAVE COMPANY SETTINGS
// =====================================

window.saveCompanySettings = async function () {

    try {

        await addDoc(collection(db, "companySettings"), getUserData({

            companyName:
                document.getElementById("companyName").value,

            companyEmail:
                document.getElementById("companyEmail").value,

            companyPhone:
                document.getElementById("companyPhone").value,

            companyAddress:
                document.getElementById("companyAddress").value,

            companyTIN:
                document.getElementById("companyTIN").value,

            companyCurrency:
                document.getElementById("companyCurrency").value,

            createdAt: new Date()

        }));

        alert("Company Settings Saved Successfully!");

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 33 - AUDIT TRAIL
// =====================================

window.logActivity = async function(action, details) {

    try {

        await addDoc(collection(db, "auditTrail"), getUserData({

            action: action,

            details: details,

            user: currentUser.username,

            date: new Date().toLocaleDateString(),

            time: new Date().toLocaleTimeString(),

            createdAt: new Date()

        }));

    } catch (error) {

        console.log(error);

    }

};
// =====================================
// PART 33 - LOAD AUDIT TRAIL
// =====================================

window.loadAuditTrail = function () {

    if (!document.getElementById("auditTable")) return;

    const q = query(
        collection(db, "auditTrail"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(q, (snapshot) => {

        let rows = "";

        let totalActivities = 0;

        snapshot.forEach((doc) => {

            const activity = doc.data();

            totalActivities++;

            rows += `
            <tr>

                <td>${activity.date}</td>

                <td>${activity.time}</td>

                <td>${activity.user}</td>

                <td>${activity.action}</td>

                <td>${activity.details}</td>

            </tr>
            `;

        });

        if (rows === "") {

            rows = `
            <tr>

                <td colspan="5">

                    No Activities Recorded

                </td>

            </tr>
            `;

        }

        document.getElementById("auditTable").innerHTML = rows;

        document.getElementById("totalActivities").innerHTML =
            totalActivities;

    });

};
// =====================================
// PART 34 - BACKUP DATABASE
// =====================================

window.backupDatabase = async function () {

    try {

        const collections = [
            "sales",
            "expenses",
            "products",
            "customers",
            "budgets",
            "fixedAssets",
            "auditTrail"
        ];

        let backup = {};

        for (const name of collections) {

            const snapshot = await getDocs(collection(db, name));

            backup[name] = [];

            snapshot.forEach((doc) => {

                backup[name].push(doc.data());

            });

        }

        const data =
            JSON.stringify(backup, null, 2);

        const blob =
            new Blob([data], {
                type: "application/json"
            });

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download =
            "FinVision_Backup.json";

        a.click();

        URL.revokeObjectURL(url);

        alert("Backup completed successfully!");

    } catch (error) {

        alert(error.message);

    }

};
// =====================================
// PART 34 - RESTORE DATABASE
// =====================================

window.restoreDatabase = function () {

    alert(
        "Restore feature will be enabled in the next update. Please keep your backup file safe."
    );

};
// =====================================
// PART 35 - LOAD NOTIFICATIONS
// =====================================

window.loadNotifications = function () {

    if (!document.getElementById("notificationTable")) return;

    let rows = "";
    let totalNotifications = 0;

    // Low Stock Alert
    const productQuery = query(
        collection(db, "products"),
        where("owner", "==", currentUser.username)
    );

    onSnapshot(productQuery, (snapshot) => {

        rows = "";
        totalNotifications = 0;

        snapshot.forEach((doc) => {

            const product = doc.data();

            if (Number(product.stock) <= 5) {

                totalNotifications++;

                rows += `
                <tr>
                    <td>Low Stock</td>
                    <td>${product.productName} has only ${product.stock} item(s) remaining.</td>
                    <td>Warning</td>
                </tr>
                `;

            }

        });

        if (rows === "") {

            rows = `
            <tr>
                <td colspan="3">
                    No Notifications Available
                </td>
            </tr>
            `;

        }

        document.getElementById("notificationTable").innerHTML = rows;

        document.getElementById("totalNotifications").innerHTML =
            totalNotifications;

    });

};


