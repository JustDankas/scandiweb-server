import express, { Request, Response } from "express";
import http from "http";
import mariadb from "mariadb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const pool = mariadb.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  // connectionLimit: 5,
});

app.get("/", async (req: Request, res: Response) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const products = await conn.query("	SELECT * FROM sql7572701.Product;");
    // const productCopies = await conn.query(
    //   "	SELECT * FROM sql7572701.ProductCopy;"
    // );
    res.status(200).json({
      products,
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  } finally {
    conn?.destroy();
  }
});

interface Product {
  SKU: string;
  name: string;
  price: number;
  type: string;
  size: number;
  weight: number;
  dimension: string;
}
//    "build": "rimraf ./build && tsc",
//    "start": "npm run build && node build/index.js",

app.post("/", async (req: Request<{}, {}, Product>, res: Response) => {
  let conn;
  try {
    const { SKU, name, price, type, size, weight, dimension } = req.body;
    // Create connection
    conn = await pool.getConnection();
    //Check if SKU exists
    const count = await conn.query(`SELECT * FROM sql7572701.Product AS P
    WHERE P.SKU = '${SKU}' `);
    // If SKU exists , dont create product-type with code of SKU
    if (count[0] === undefined) {
      await conn.query(
        `INSERT INTO sql7572701.Product
        VALUES ('${SKU}','${name}',${price},'${type}',${size},${weight},'${dimension}')`
      );
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
    // Create product copy with SKU
    // await conn.query(`INSERT INTO sql7572701.ProductCopy (\`ProductCopySKU\`)
    // VALUES ('${SKU}')`);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  } finally {
    conn?.destroy();
  }
});

app.put(
  "/",
  async (req: Request<{}, {}, { deleteIds: string[] }>, res: Response) => {
    let conn;
    try {
      const { deleteIds } = req.body;
      conn = await pool.getConnection();
      if (deleteIds.length === 0) {
        res.sendStatus(400);
        return;
      }
      let query = "DELETE FROM sql7572701.Product WHERE";
      deleteIds.forEach((id) => {
        query += " SKU='" + id + "' OR";
      });
      query = query.slice(0, query.length - 2);
      await conn.query(query);
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    } finally {
      conn?.destroy();
    }
  }
);
const port = process.env.PORT || 5000;

http.createServer(app).listen(port);
