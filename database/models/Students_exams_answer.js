module.exports = (sequelize, DataTypes) => {
  const alias = "Students_exams_answers"

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
    id_courses_exams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_courses_exams_questions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ids_selected_options: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    ids_correct_options: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    correct_answer: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  }

  const config = {
    tableName: 'students_exams_answers',
    timestamps: false,
  }

  const Students_exams_answers = sequelize.define(alias, cols, config)

  Students_exams_answers.associate = (models) => {
    Students_exams_answers.belongsTo(models.Students, { as: 'student_data', foreignKey: 'id_students' })
    Students_exams_answers.belongsTo(models.Students_inscriptions, { as: 'inscription_data', foreignKey: 'id_students_inscriptions' })
    Students_exams_answers.belongsTo(models.Students_exams, { as: 'student_exam_data', foreignKey: 'id_students_exams' })
    Students_exams_answers.belongsTo(models.Courses_exams, { as: 'course_exam_data', foreignKey: 'id_courses_exams' })
    Students_exams_answers.belongsTo(models.Courses_exams_questions, { as: 'question_data', foreignKey: 'id_courses_exams_questions' })
  }

  return Students_exams_answers
}
