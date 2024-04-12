/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: FAROUK ALHASSAN Student ID: 133081224 Date: 02/15/2024
*
********************************************************************************/

require('dotenv').config(); //allow access to our DB through dotenv file
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  define:{
    timestamps:false
  }
});

//test connection to DB 
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });


  //Theme model (table)
  const Theme = sequelize.define('Theme', {
    id:{
     type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  name: Sequelize.STRING
  });

  //Set model (table)
  const Set = sequelize.define('Set', {
    set_num: {
      type:Sequelize.STRING,
      primaryKey: true
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    img_url: Sequelize.STRING
  });


  //creating association between two models(tables)
  Set.belongsTo(Theme, {foreignKey: 'theme_id'});



  function initialize() {
    return new Promise((resolve, reject) => {
      sequelize.sync()
        .then(() => {
          console.log('Database synchronized successfully.');
          resolve();
        })
        .catch(err => {
          console.error('Unable to synchronize database:', err);
          reject(err);
        });
    });
  }
  

  function getAllSets() {
    return new Promise((resolve, reject) => {
      Set.findAll({ include: [Theme] })
        .then(sets => {
          resolve(sets);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  

  function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
      Set.findOne({
        include: [Theme],
        where: { set_num: setNum }
      })
      .then(foundSet => {
        if (foundSet) {
          resolve(foundSet);
        } else {
          reject(new Error("Unable to find requested set"));
        }
      })
      .catch(err => {
        reject(err);
      });
    });
  }
  

  function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
      Set.findAll({
        include: [Theme],
        where: {
          '$Theme.name$': {
            [Sequelize.Op.iLike]: `%${theme}%`
          }
        }
      })
      .then(foundSets => {
        if (foundSets.length > 0) {
          resolve(foundSets);
        } else {
          reject(new Error("Unable to find requested sets"));
        }
      })
      .catch(err => {
        reject(err);
      });
    });
  }


  //AddSet
  function addSet(setData) {
    return new Promise((resolve, reject) => {
      Set.create(setData)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err.errors[0].message);
        });
    });
  }


  //getAllThemes
  function getAllThemes() {
    return new Promise((resolve, reject) => {
      Theme.findAll()
        .then(themes => {
          resolve(themes);
        })
        .catch(err => {
          reject(err);
        });
    });
  }


  
function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num: set_num } })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err.errors[0].message);
      });
  });
}


function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.destroy({ where: { set_num: set_num } })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err.errors[0].message);
      });
  });
}


module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet, Set, Theme }
