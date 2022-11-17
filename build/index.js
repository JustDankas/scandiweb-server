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
// const pool = mariadb.createPool({
//   host: process.env.SQL_HOST,
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD,
//   // connectionLimit: 5,
// });
const pool2 = mysql_1.default.createPool({
    host: "db4free.net",
    port: 3306,
    user: "justdankas",
    password: "5KBTZfAcaW",
    database: "productsdb2022",
    connectionLimit: 100,
    multipleStatements: true,
});
// app.get("/", async (req: Request, res: Response) => {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const products = await conn.query("	SELECT * FROM sql7572701.Product;");
//     // const productCopies = await conn.query(
//     //   "	SELECT * FROM sql7572701.ProductCopy;"
//     // );
//     res.status(200).json({
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   } finally {
//     conn?.destroy();
//   }
// });
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        pool2.query("SELECT * FROM Product;", (error, response) => {
            if (res)
                res.status(200).json({
                    products: response,
                });
            if (error)
                res.sendStatus(400);
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
//    "build": "rimraf ./build && tsc",
//    "start": "npm run build && node build/index.js",
// app.post("/", async (req: Request<{}, {}, Product>, res: Response) => {
//   let conn;
//   try {
//     const { SKU, name, price, type, size, weight, dimension } = req.body;
//     // Create connection
//     conn = await pool.getConnection();
//     //Check if SKU exists
//     const count = await conn.query(`SELECT * FROM sql7572701.Product AS P
//     WHERE P.SKU = '${SKU}' `);
//     // If SKU exists , dont create product-type with code of SKU
//     if (count[0] === undefined) {
//       await conn.query(
//         `INSERT INTO sql7572701.Product
//         VALUES ('${SKU}','${name}',${price},'${type}',${size},${weight},'${dimension}')`
//       );
//       res.sendStatus(200);
//     } else {
//       res.sendStatus(400);
//     }
//     // Create product copy with SKU
//     // await conn.query(`INSERT INTO sql7572701.ProductCopy (\`ProductCopySKU\`)
//     // VALUES ('${SKU}')`);
//   } catch (error) {
//     console.log(error);
//     res.sendStatus(500);
//   } finally {
//     conn?.destroy();
//   }
// });
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
// app.put(
//   "/",
//   async (req: Request<{}, {}, { deleteIds: string[] }>, res: Response) => {
//     let conn;
//     try {
//       const { deleteIds } = req.body;
//       conn = await pool.getConnection();
//       if (deleteIds.length === 0) {
//         res.sendStatus(400);
//         return;
//       }
//       let query = "DELETE FROM sql7572701.Product WHERE";
//       deleteIds.forEach((id) => {
//         query += " SKU='" + id + "' OR";
//       });
//       query = query.slice(0, query.length - 2);
//       await conn.query(query);
//       res.sendStatus(200);
//     } catch (error) {
//       console.log(error);
//       res.sendStatus(500);
//     } finally {
//       conn?.destroy();
//     }
//   }
// );
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
http_1.default.createServer(app).listen(port);
