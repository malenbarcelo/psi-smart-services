module.exports = (sequelize, DataTypes) => {
  const alias = "Students_exams_theoricals"

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
    id_courses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_exams_theoricals: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    theoricals_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    theoricals_grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    theoricals_update_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  }

  const config = {
    tableName: 'students_exams_theoricals',
    timestamps: false,
  }

  const Students_exams_theoricals = sequelize.define(alias, cols, config)

  Students_exams_theoricals.associate = (models) => {
    Students_exams_theoricals.belongsTo(models.Students_inscriptions, { as: 'inscription_data', foreignKey: 'id_students_inscriptions' })
    Students_exams_theoricals.belongsTo(models.Students, { as: 'student_data', foreignKey: 'id_students' })
    Students_exams_theoricals.belongsTo(models.Courses, { as: 'course_data', foreignKey: 'id_courses' })
  }

  return Students_exams_theoricals
}
