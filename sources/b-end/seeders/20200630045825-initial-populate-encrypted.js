'use strict';
const fs = require('fs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    let data = JSON.parse(fs.readFileSync('./data/encrypted.json', 'utf8'));

    data = data.map(elem => {
      elem.createdAt = new Date();
      elem.updatedAt = new Date();
      
      return elem;
    });

    return queryInterface.bulkInsert('EncryptedUsers', data, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('EncryptedUsers', null, {});
  }
};