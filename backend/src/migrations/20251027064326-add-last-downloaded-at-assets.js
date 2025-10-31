"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("assets", "last_downloaded_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
      comment: "Last time the asset was downloaded",
    });
  },

  down: async (queryInterface, _) => {
    await queryInterface.removeColumn("assets", "last_downloaded_at");
  },
};
