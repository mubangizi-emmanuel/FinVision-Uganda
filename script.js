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
    const description = document.getElementById("description").value.trim();

    if (!expenseName || !amount || !expenseDate) {
        alert("Please fill in all required fields.");
        return;
    }

    try {

        await addDoc(collection(db, "expenses"), getUserData({

            expenseName: expenseName,
            category: category,
            amount: amount,
            date: expenseDate,
            payment: paymentMethod,
            description: description,
            createdAt: new Date()

        }));

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