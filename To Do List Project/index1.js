import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const db = new pg.Client({
    user: "postgres", 
    host: "localhost",
    database: "World",
    password: "Megha@5455",
    port: 5432
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database", err);
    } else {
        console.log("Connected to the database");
    }
});

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



let items = [];

async function elementindb() {
    try {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        items = result.rows;
    } catch (err) {
       console.error("Error fetching items from the database", err);
    }
}

app.get("/", async (req, res) => {
    try {
        await elementindb();
        res.render("index.ejs", {
            listTitle: "My To Do List",
            listItems: items
        });
    } catch (err) {
       console.error("Error in GET / route", err);
       res.status(500).send("Server Error");
    }
});

app.post("/add", async (req, res) => {
    const newItem = req.body.newItem;
    try {
        await db.query("INSERT INTO items (title) VALUES ($1)", [newItem]);
    } catch (err) {
       console.error("Error inserting new item into the database", err);
    }
    res.redirect("/");
});


app.post("/edit", async (req, res) => {
    const id = req.body.updatedItemId;
    const updatedTitle = req.body.updatedItemTitle;
    try {
        await db.query("UPDATE items SET title = $1 WHERE id = $2", [updatedTitle, id]);
    } catch (err) {
       console.error("Error updating item in the database", err);
    }
    res.redirect("/");
});


app.post("/delete", async (req, res) => {
    const id = req.body.deleteItemId;
    try {
        await db.query("DELETE FROM items WHERE id = $1", [id]);
    } catch (err) {
       console.error("Error deleting item from the database", err);
    }
    res.redirect("/");
});


app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
