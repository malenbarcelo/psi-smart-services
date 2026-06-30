module.exports = (sequelize, DataTypes) => {
  const alias = "Students_exams"

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
    id_courses_exams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    exam_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_variant: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    exam_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    exam_grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  }

  const config = {
    tableName: 'students_exams',
    timestamps: false,
  }

  const Students_exams = sequelize.define(alias, cols, config)

  Students_exams.associate = (models) => {
    Students_exams.belongsTo(models.Students, { as: 'student_data', foreignKey: 'id_students' })
    Students_exams.belongsTo(models.Students_inscriptions, { as: 'inscription_data', foreignKey: 'id_students_inscriptions' })
    Students_exams.belongsTo(models.Courses, { as: 'course_data', foreignKey: 'id_courses' })
    Students_exams.belongsTo(models.Courses_exams, { as: 'course_exam_data', foreignKey: 'id_courses_exams' })
  }

  return Students_exams
}
