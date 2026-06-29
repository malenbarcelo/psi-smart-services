module.exports = (sequelize, DataTypes) => {
  const alias = "Users_categories"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }

  const config = {
    tableName: 'users_categories',
    timestamps: false,
  }

  const Users_categories = sequelize.define(alias, cols, config)

  Users_categories.associate = (models) => {
    Users_categories.hasMany(models.Users, { as: 'users', foreignKey: 'id_users_categories' })
  }

  return Users_categories
}
