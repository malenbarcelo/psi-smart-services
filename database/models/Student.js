module.exports = (sequelize, DataTypes) => {
  const alias = "Students"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_companies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    dni: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }

  const config = {
    tableName: 'students',
    timestamps: false,
  }

  const Students = sequelize.define(alias, cols, config)

  Students.associate = (models) => {
    Students.belongsTo(models.Users_companies, { as: 'company_data', foreignKey: 'id_companies' })
    Students.hasMany(models.Students_inscriptions, { as: 'inscriptions', foreignKey: 'id_students' })
    Students.hasMany(models.Students_exams, { as: 'exams', foreignKey: 'id_students' })
  }

  return Students
}
