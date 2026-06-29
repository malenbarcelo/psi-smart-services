module.exports = (sequelize, DataTypes) => {
  const alias = "Users_companies"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }

  const config = {
    tableName: 'users_companies',
    timestamps: false,
  }

  const Users_companies = sequelize.define(alias, cols, config)

  Users_companies.associate = (models) => {
    Users_companies.hasMany(models.Users, { as: 'users', foreignKey: 'id_companies' })
    Users_companies.hasMany(models.Students, { as: 'students', foreignKey: 'id_companies' })
  }

  return Users_companies
}
