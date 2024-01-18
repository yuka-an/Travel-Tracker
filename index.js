import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: '123456',
  port:5432
});

db.connect();

//let visited_countries = {};
// db.query('SELECT country_code FROM visited_countries;', (err,res)=>{
//   if(err){
//     console.error("Error executing query ",err.stack);
//   }else{
//     visited_countries = res.rows;
//   }
//   db.end();
// })

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkVisisted(){
  let countries = []
  const result = await(db.query("SELECT country_code FROM visited_countries;"));
  // for(var i = 0; i<visited_countries.length; i++)
  //   countries.push(visited_countries[i].country_code);
  result.rows.forEach(country=>{
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisisted();
  res.render("index.ejs", {countries : countries, total: countries.length});
}); 

app.post("/add", async(req,res)=>{
  const visited_country = req.body.country;
  const result = await(db.query(
    "SELECT country_code FROM world_countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'", 
    [visited_country.toLowerCase()]
  ));
  const countries = await checkVisisted();

  try{
    const countryCode = result.rows[0].country_code;

    try{
      await(db.query("INSERT INTO visited_countries(country_code) values($1);",[countryCode]));
      res.redirect('/');
    }catch(err){
      console.log(err);
      res.render("index.ejs",{
        countries: countries, 
        total: countries.length, 
        error1: "Country has already been added, try again."
      });
    }

  }catch(err){
    console.log(err);
    res.render("index.ejs",{
      countries:countries,
      total: countries.length,
      error1: "Country name does not exist, try again."
    });
  }


});
app.post("/remove", async(req,res)=>{
  const visited_country = req.body.country;
  const result = await(db.query(
    "SELECT country_code FROM world_countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'", 
    [visited_country.toLowerCase()]
  ));
  const countries = await checkVisisted();

  try{
    const countryCode = result.rows[0].country_code;

    try{
      await(db.query("DELETE FROM visited_countries WHERE country_code = $1;",[countryCode]));
      res.redirect('/');
    }catch(err){
      console.log(err);
      res.render("index.ejs",{
        countries: countries, 
        total: countries.length, 
        error2: "Country is not added, try again."
      });
    }

  }catch(err){
    console.log(err);
    res.render("index.ejs",{
      countries:countries,
      total: countries.length,
      error2: "Country name does not exist, try again."
    });
  }


});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
