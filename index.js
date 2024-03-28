import express, { json } from 'express';
import bodyParser from 'body-parser';
import articles from './articles.json' assert {type: 'json'};
import fs from 'fs';
import pg from 'pg';
import 'dotenv/config';

const app = express();
const port = 3000;
const art = articles["articles"];

// console.log(process.env.DB_PASSWORD);

const db = new pg.Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DBNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// const connectionString = "postgres://localhost:16lYxmNGNi9q9O2gytZjrlnVsjW1c40E@dpg-co241si0si5c73cqakgg-a/authors_cvb5";

// const db = new pg.Client({
//     connectionString,
// });

db.connect()
    .then(() => console.log('Connected to PostgreSQL on Render'))
    .catch(err => console.error('Connection error', err.stack));


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    fs.readFile('./articles.json', "utf8", (err, data) => {
        if(err){
            console.log(`Error reading file from disk: ${err}`);
        }else{
            const jsonData = JSON.parse(data);
            res.render("index.ejs", {articleData: jsonData.articles});
        }
    });
});

app.get("/yourBlog/:id", (req, res) => {
    const id = req.params.id;
    fs.readFile('./articles.json', "utf8", (err, data) => {
        if(err){
            console.log(`Error reading file from disk: ${err}`);
        }else{
            const jsonData = JSON.parse(data);
            res.render("yourBlog.ejs", {articleData: jsonData.articles[id-1]});
        }
    });
});

app.get("/editBlog/:id", (req, res) => {
    const id = req.params.id;
    fs.readFile('./articles.json', "utf8", (err, data) => {
        if(err){
            console.log(`Error reading file from disk: ${err}`);
        }else{
            const jsonData = JSON.parse(data);
            res.render("editBlog.ejs", {articleData: jsonData.articles[id-1]});
        }
    });
});


app.get("/newblog", (req, res) => {
    res.render("newBlog.ejs");
});

app.post("/update/:id", (req, res) => {
    let blogTitle = req.body["title"];
    let blogSubTitle = req.body["subtitle"];
    let blogSummary = req.body["summary"];
    let blogContent = req.body["content-area"];
    const id = req.params.id;
    fs.readFile('./articles.json', 'utf8', (err, data) => {
        if(err){
            console.log(`Error reading file from disk: ${err}`);
        }else{
            const jsonData = JSON.parse(data);

            const something = jsonData.articles[id-1];
            something.title = blogTitle;
            something.subtitle = blogSubTitle;
            something["sub-content"] = blogSummary;
            something.content = blogContent;

            fs.writeFile('./articles.json', JSON.stringify(jsonData, null, 4), (err) => {
                if(err){
                    console.log(`Error writing file to disk: ${err}`);
                }else{
                    res.redirect("/");
                }
            });
        }
    });
});


app.post("/submit", (req, res) => {
    let blogTitle = req.body["title"];
    let blogSubTitle = req.body["subtitle"];
    let blogSummary = req.body["summary"];
    let blogContent = req.body["content-area"];

    fs.readFile('./articles.json', 'utf8', (err, data) => {
        if(err){
            console.log(`Error reading file from disk: ${err}`);
        }else{
            const jsonData = JSON.parse(data);

            jsonData.articles.push({
                id: jsonData.articles.length + 1,
                "title": blogTitle,
                "sub-title": blogSubTitle,
                "sub-content": blogSummary,
                "content": blogContent
            });

            fs.writeFile('./articles.json', JSON.stringify(jsonData, null, 4), (err) => {
                if(err){
                    console.log(`Error writing file to disk: ${err}`);
                }else{
                    res.redirect("/");
                }
            });
        }
    });
});

app.post("/del/:id", (req,res) => {
    const id = req.params.id;
    fs.readFile('./articles.json', 'utf8', (err, data) => {
        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } else {
            let jsonData = JSON.parse(data);

            const index = jsonData.articles.findIndex(article => article.id == id);

            if (index !== -1) {
                jsonData.articles.splice(index, 1);
                jsonData.articles = jsonData.articles.map((article, index) => {
                    return { ...article, id: index + 1 };
                });

                fs.writeFile('./articles.json', JSON.stringify(jsonData, null, 4), (err) => {
                    if (err) {
                        console.log(`Error writing file to disk: ${err}`);
                    } else {
                        res.redirect("/");
                    }
                });
            } else {
                res.status(404).send('Article not found');
            }
        }
    });
});

app.get('/profile', (req, res) => {
    res.render('profile.ejs');
});

app.post('/registerSelf', async (req, res) => {
    console.log(req.body);
    const fullName = req.body.fullName;
    const username = req.body.username;
    const password = req.body.password;

    await db.query("INSERT INTO usertable (full_name, user_name, password) VALUES ($1, $2, $3)", [fullName, username, password]);
    res.redirect('/');
    db.end();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});