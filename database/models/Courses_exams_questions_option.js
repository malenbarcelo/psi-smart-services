module.exports = (sequelize, DataTypes) => {
  const alias = "Courses_exams_questions_options"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_courses_exams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_courses_exams_questions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    option_reference: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    option_text: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    correct_option: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }

  const config = {
    tableName: 'courses_exams_questions_options',
    timestamps: false,
  }

  const Courses_exams_questions_options = sequelize.define(alias, cols, config)

  Courses_exams_questions_options.associate = (models) => {
    Courses_exams_questions_options.belongsTo(models.Courses_exams, { as: 'course_exam_data', foreignKey: 'id_courses_exams' })
    Courses_exams_questions_options.belongsTo(models.Courses_exams_questions, { as: 'question_data', foreignKey: 'id_courses_exams_questions' })
  }

  return Courses_exams_questions_options
}
