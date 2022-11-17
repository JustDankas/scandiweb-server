"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mariadb_1 = __importDefault(require("mariadb"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const pool = mariadb_1.default.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    // connectionLimit: 5,
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        conn = yield pool.getConnection();
        const products = yield conn.query("	SELECT * FROM sql7572701.Product;");
        // const productCopies = await conn.query(
        //   "	SELECT * FROM sql7572701.ProductCopy;"
        // );
        res.status(200).json({
            products,
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    finally {
        conn === null || conn === void 0 ? void 0 : conn.destroy();
    }
}));
//    "build": "rimraf ./build && tsc",
//    "start": "npm run build && node build/index.js",
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        const { SKU, name, price, type, size, weight, dimension } = req.body;
        // Create connection
        conn = yield pool.getConnection();
        //Check if SKU exists
        const count = yield conn.query(`SELECT * FROM sql7572701.Product AS P
    WHERE P.SKU = '${SKU}' `);
        // If SKU exists , dont create product-type with code of SKU
        if (count[0] === undefined) {
            yield conn.query(`INSERT INTO sql7572701.Product
        VALUES ('${SKU}','${name}',${price},'${type}',${size},${weight},'${dimension}')`);
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
        // Create product copy with SKU
        // await conn.query(`INSERT INTO sql7572701.ProductCopy (\`ProductCopySKU\`)
        // VALUES ('${SKU}')`);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    finally {
        conn === null || conn === void 0 ? void 0 : conn.destroy();
    }
}));
app.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    try {
        const { deleteIds } = req.body;
        conn = yield pool.getConnection();
        if (deleteIds.length === 0) {
            res.sendStatus(400);
            return;
        }
        let query = "DELETE FROM sql7572701.Product WHERE";
        deleteIds.forEach((id) => {
            query += " SKU='" + id + "' OR";
        });
        query = query.slice(0, query.length - 2);
        yield conn.query(query);
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    finally {
        conn === null || conn === void 0 ? void 0 : conn.destroy();
    }
}));
const port = process.env.PORT || 5000;
http_1.default.createServer(app).listen(port);
