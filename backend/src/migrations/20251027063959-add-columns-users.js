"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "active",
    });

    await queryInterface.addColumn("users", "avatar", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Avatar URL or path",
    });

    await queryInterface.addColumn("users", "storage_used", {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0,
      comment: "Storage used in bytes",
    });

    await queryInterface.addColumn("users", "storage_limit", {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 10737418240,
      comment: "Storage limit in bytes",
    });
  },

  async down(queryInterface, _) {
    await queryInterface.removeColumn("users", "status");
    await queryInterface.removeColumn("users", "avatar");
    await queryInterface.removeColumn("users", "storage_used");
    await queryInterface.removeColumn("users", "storage_limit");
  },
};
