module.exports = (sequelize, Sequelize) => {
  const PageConfig = sequelize.define("page_config", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pageKey: {
      // Example: "home_banner", "home_categories", "app_theme"
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    configData: {
      // Stores the JSON configuration for the page element
      type: Sequelize.JSON,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  });
  return PageConfig;
};
