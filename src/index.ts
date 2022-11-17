import express, { Request, response, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql";
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const pool2 = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  // connectionLimit: 1000,
  multipleStatements: true,
});

app.get("/", async (req: Request, res: Response) => {
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
            throw new Error(error?.message);
          }
        });
      } else throw new Error(err.message);
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
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
  try {
    const { SKU, name, price, type, size, weight, dimension } = req.body;
    //Check if SKU exists
    pool2.query(
      `SELECT * FROM Product AS P
    WHERE P.SKU = '${SKU}' `,
      (error, response) => {
        if (response.length < 1) {
          //SKU doesnt exist , create product
          pool2.query(
            `INSERT INTO Product
                VALUES ('${SKU}','${name}',${price},'${type}',${size},${weight},'${dimension}')`,
            (error, response) => {
              console.log(error);
              if (response) res.sendStatus(200);
              else res.sendStatus(400);
            }
          );
        } else res.sendStatus(400);
      }
    );
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put(
  "/",
  async (req: Request<{}, {}, { deleteIds: string[] }>, res: Response) => {
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
        if (response) res.sendStatus(200);
        else res.sendStatus(400);
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

const port = process.env.PORT || 5000;

http
  .createServer(app)
  .listen(port, () => console.log(`Listening on port ${port}`));
