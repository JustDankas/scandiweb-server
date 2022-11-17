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
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mysql_1 = __importDefault(require("mysql"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const pool2 = mysql_1.default.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    // connectionLimit: 1000,
    multipleStatements: true,
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // pool2.query("SELECT * FROM Product;", (error, response) => {
        //   if (response)
        //     res.status(200).json({
        //       products: response,
        //     });
        //   else if (error) {
        //     console.log(error);
        //     res.sendStatus(400);
        //   }
        // });
        pool2.getConnection((err, conn) => {
            if (conn) {
                conn.query("SELECT * FROM Product;", (error, response) => {
                    if (response)
                        res.status(200).json({
                            products: response,
                        });
                    else {
                        conn.destroy();
                        throw new Error(error === null || error === void 0 ? void 0 : error.message);
                    }
                });
            }
            else
                throw new Error(err.message);
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
//    "build": "rimraf ./build && tsc",
//    "start": "npm run build && node build/index.js",
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { SKU, name, price, type, size, weight, dimension } = req.body;
        //Check if SKU exists
        pool2.query(`SELECT * FROM Product AS P
    WHERE P.SKU = '${SKU}' `, (error, response) => {
            if (response.length < 1) {
                //SKU doesnt exist , create product
                pool2.query(`INSERT INTO Product
                VALUES ('${SKU}','${name}',${price},'${type}',${size},${weight},'${dimension}')`, (error, response) => {
                    console.log(error);
                    if (response)
                        res.sendStatus(200);
                    else
                        res.sendStatus(400);
                });
            }
            else
                res.sendStatus(400);
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
app.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deleteIds } = req.body;
        if (deleteIds.length === 0) {
            res.sendStatus(400);
            return;
        }
        let query = "DELETE FROM Product WHERE";
        deleteIds.forEach((id) => {
            query += " SKU='" + id + "' OR";
        });
        query = query.slice(0, query.length - 2);
        pool2.query(query, (error, response) => {
            if (response)
                res.sendStatus(200);
            else
                res.sendStatus(400);
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
const port = process.env.PORT || 5000;
http_1.default
    .createServer(app)
    .listen(port, () => console.log(`Listening on port ${port}`));
