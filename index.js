import express, { json } from 'express';
import bodyParser from 'body-parser';
import articles from './articles.json' assert {type: 'json'};
import fs from 'fs';

const app = express();
const port = 3000;
const art = articles["articles"];

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

            // console.log(blogContent);

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

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});