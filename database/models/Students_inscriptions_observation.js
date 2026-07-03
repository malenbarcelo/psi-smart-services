module.exports = (sequelize, DataTypes) => {
  const alias = "Students_inscriptions_observations"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_students_inscriptions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_students_exams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observations: {
      type: DataTypes.STRING(2500),
      allowNull: true,
    }
  }

  const config = {
    tableName: 'students_inscriptions_observations',
    timestamps: false,
  }

  const Students_inscriptions_observations = sequelize.define(alias, cols, config)

  Students_inscriptions_observations.associate = (models) => {
    Students_inscriptions_observations.belongsTo(models.Students, { as: 'student_data', foreignKey: 'id_students' })
    Students_inscriptions_observations.belongsTo(models.Students_inscriptions, { as: 'inscription_data', foreignKey: 'id_students_inscriptions' })
    Students_inscriptions_observations.belongsTo(models.Students_exams, { as: 'student_exam_data', foreignKey: 'id_students_exams' })
  }

  return Students_inscriptions_observations
}
