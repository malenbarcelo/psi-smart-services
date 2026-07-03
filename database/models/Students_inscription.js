module.exports = (sequelize, DataTypes) => {
  const alias = "Students_inscriptions"

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
    id_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_courses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inscription_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    verification_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }

  const config = {
    tableName: 'students_inscriptions',
    timestamps: false,
  }

  const Students_inscriptions = sequelize.define(alias, cols, config)

  Students_inscriptions.associate = (models) => {
    Students_inscriptions.belongsTo(models.Users_companies, { as: 'company_data', foreignKey: 'id_companies' })
    Students_inscriptions.belongsTo(models.Students, { as: 'student_data', foreignKey: 'id_students' })
    Students_inscriptions.belongsTo(models.Courses, { as: 'course_data', foreignKey: 'id_courses' })
    Students_inscriptions.hasMany(models.Students_exams, { as: 'exams', foreignKey: 'id_students_inscriptions' })
    Students_inscriptions.hasMany(models.Students_inscriptions_observations, { as: 'observations', foreignKey: 'id_students_inscriptions' })
  }

  return Students_inscriptions
}
