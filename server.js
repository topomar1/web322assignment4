/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: FAROUK ALHASSAN Student ID: 133081224 Date: 04/12/2024
*
*Published URL: 
*

********************************************************************************/

const express = require('express');
const legoData = require("./modules/legoSets");
const app = express();
const path = require('path');

//port number
const HTTP_PORT = process.env.HTTP_PORT || 8080;


app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

//set view for ejs
app.set('view engine', 'ejs');



app.get('/',(req, res)=>{
    res.render('home');

});


app.get('/about',(req, res)=>{
    res.render('about');


});


app.get("/lego/sets", async (req,res)=>{

    try{
      if(req.query.theme){
        let sets = await legoData.getSetsByTheme(req.query.theme);
        res.render("sets",{legoSet:sets}); 
    
      }else{
        let sets = await legoData.getAllSets();
        res.render("sets",{legoSet:sets});
      }
    }catch(err){
      res.status(404).render("404", {message: "Unable to find requested sets."});
    }
  
  });



app.get("/lego/sets/:num", async (req,res)=>{
    try{
      let set = await legoData.getSetByNum(req.params.num);
      res.render("set",{legoSet:set})
    }catch(err){
      res.status(404).render("404", {message: "Unable to find requested sets."});
    }
  }); 



app.get("/lego/addSet", async(req, res)=>{
  try{
    let themeData = await legoData.getAllThemes();
    res.render("addSet", { themes: themeData });

  }catch(err){
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  
  }

});


// POST route to handle form submission
app.post("/lego/addSet", async (req, res) => {
  try {
      await legoData.addSet(req.body);
      res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/editSet/:num", async (req, res) => {
  try {
      const set = await legoData.getSetByNum(req.params.num);
      const themes = await legoData.getAllThemes();
      res.render("editSet", { themes: themes, legoSet:set });
  } catch (err) {
      res.status(404).render("404", { message: err });
  }
});

// POST route to handle form submission for editing a set
app.post("/lego/editSet", async (req, res) => {
  try {
      const setNum = req.body.set_num;
      const setData = {
          name: req.body.name,
          year: req.body.year,
          theme_id: req.body.theme_id,
          num_parts: req.body.num_parts,
          img_url: req.body.img_url
      };
      await legoData.editSet(setNum, setData);
      res.redirect("/lego/sets");
  } catch (err) {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});


app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});


app.use((req, res, next) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for."});
  });
  
  
  legoData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { console.log(`server running on port ${HTTP_PORT}`) });
  });
