-- ============================================================
-- DROP&CREATE DATABASE to recreate it
-- ============================================================
DROP DATABASE IF EXISTS dwbi;
CREATE DATABASE dwbi;
USE dwbi;

-- ============================================================
-- DROP TABLES in correct dependency order
-- ============================================================
DROP TABLE IF EXISTS ProductSupplier;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS OrderLine;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Shipment;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Supplier;
DROP TABLE IF EXISTS Warehouse;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS Employee;

-- ============================================================
-- CREATE TABLES
-- ============================================================

-- -------------------------
-- Employee
-- -------------------------
CREATE TABLE Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255),
    role        VARCHAR(100)
);

-- -------------------------
-- Customer
-- -------------------------
CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    signup_date DATE,
    region      VARCHAR(100)
);

-- -------------------------
-- Category
-- -------------------------
CREATE TABLE Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)
);

-- -------------------------
-- Supplier
-- -------------------------
CREATE TABLE Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255),
    contact_info VARCHAR(255)
);

-- -------------------------
-- Warehouse
-- -------------------------
CREATE TABLE Warehouse (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    location     VARCHAR(255)
);

-- -------------------------
-- Product
-- -------------------------
CREATE TABLE Product (
    product_id   INT AUTO_INCREMENT PRIMARY KEY,
    sku          VARCHAR(100),
    name         VARCHAR(255),
    category_id  INT,
    supplier_id  INT, 
    price        DECIMAL(10,2),
    cost         DECIMAL(10,2),
    FOREIGN KEY (category_id) REFERENCES Category(category_id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);

-- -------------------------
-- Orders 
-- -------------------------
CREATE TABLE Orders (
    order_id     INT AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT,
    employee_id  INT,
    order_date   DATE,
    status       VARCHAR(50),
    total_amount DECIMAL(10,2),
    payment_id   INT,
    shipment_id  INT,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- -------------------------
-- Payment 
-- -------------------------
CREATE TABLE Payment (
    payment_id   INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT UNIQUE,
    payment_date DATE,
    amount       DECIMAL(10,2),
    method       VARCHAR(50),
    status       VARCHAR(50),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- -------------------------
-- Shipment
-- -------------------------
CREATE TABLE Shipment (
    shipment_id   INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT UNIQUE,
    shipped_date  DATE,
    delivery_date DATE,
    carrier       VARCHAR(100),
    tracking      VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- Now that Payment & Shipment exist, link from Orders
ALTER TABLE Orders
    ADD FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    ADD FOREIGN KEY (shipment_id) REFERENCES Shipment(shipment_id);

-- -------------------------
-- OrderLine 
-- -------------------------
CREATE TABLE OrderLine (
    orderline_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT,
    product_id   INT,
    quantity     INT,
    unit_price   DECIMAL(10,2),
    discount     DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

-- -------------------------
-- Inventory
-- -------------------------
CREATE TABLE Inventory (
    inventory_id     INT AUTO_INCREMENT PRIMARY KEY,
    product_id       INT,
    warehouse_id     INT,
    quantity_on_hand INT,
    last_update      DATE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id)
);

-- -------------------------
-- ProductSupplier (resolve many-2-many)
-- -------------------------
CREATE TABLE ProductSupplier (
    product_id  INT,
    supplier_id INT,
    PRIMARY KEY (product_id, supplier_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id),
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);
