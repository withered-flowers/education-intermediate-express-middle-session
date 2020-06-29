'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let data = JSON.parse(fs.readFileSync('./data/user.json', 'utf8'));

    data = data.map(elem => {
      elem.createdAt = new Date();
      elem.updatedAt = new Date();
      
      return elem;
    });

    return queryInterface.bulkInsert('Users', data, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
