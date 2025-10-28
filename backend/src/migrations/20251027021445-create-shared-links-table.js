"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shared_links", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      asset_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "assets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      collection_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "Reference to collection if sharing a collection",
      },
      token: {
        type: Sequelize.STRING(64),
        unique: true,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Expiration date for the shared link",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Optional password protection for the link",
      },
      max_downloads: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Maximum number of downloads allowed",
      },
      download_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Number of times the asset has been downloaded",
      },
      allow_download: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Whether downloads are allowed",
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Whether the link is publicly accessible",
      },
      access_logs: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false,
        comment: "Access logs with IP, timestamp, and user agent",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("shared_links", ["token"], {
      unique: true,
      name: "shared_links_token_unique",
    });

    await queryInterface.addIndex("shared_links", ["asset_id"], {
      name: "shared_links_asset_id_index",
    });

    await queryInterface.addIndex("shared_links", ["created_by"], {
      name: "shared_links_created_by_index",
    });

    await queryInterface.addIndex("shared_links", ["expires_at"], {
      name: "shared_links_expires_at_index",
    });
  },

  async down(queryInterface, _) {
    await queryInterface.removeIndex(
      "shared_links",
      "shared_links_expires_at_index",
    );
    await queryInterface.removeIndex(
      "shared_links",
      "shared_links_created_by_index",
    );
    await queryInterface.removeIndex(
      "shared_links",
      "shared_links_asset_id_index",
    );
    await queryInterface.removeIndex(
      "shared_links",
      "shared_links_token_unique",
    );

    await queryInterface.dropTable("shared_links");
  },
};
