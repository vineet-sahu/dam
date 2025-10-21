"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("assets", "url", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("assets", "storage_path", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("assets", "thumbnail_path", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("assets", "filename", {
      type: Sequelize.STRING(500),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("assets", "url", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn("assets", "storage_path", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn("assets", "thumbnail_path", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.changeColumn("assets", "filename", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
