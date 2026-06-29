module.exports = (sequelize, DataTypes) => {
  const alias = "Users"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_users_categories: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_companies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }

  const config = {
    tableName: 'users',
    timestamps: false,
  }

  const Users = sequelize.define(alias, cols, config)

  Users.associate = (models) => {
    Users.belongsTo(models.Users_categories, { as: 'category_data', foreignKey: 'id_users_categories' })
    Users.belongsTo(models.Users_companies, { as: 'company_data', foreignKey: 'id_companies' })
  }

  return Users
}
