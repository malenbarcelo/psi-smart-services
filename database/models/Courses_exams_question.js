module.exports = (sequelize, DataTypes) => {
  const alias = "Courses_exams_questions"

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
    exam_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_variant: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    id_courses_exams_questions_types: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }

  const config = {
    tableName: 'courses_exams_questions',
    timestamps: false,
  }

  const Courses_exams_questions = sequelize.define(alias, cols, config)

  Courses_exams_questions.associate = (models) => {
    Courses_exams_questions.belongsTo(models.Courses_exams, { as: 'course_exam_data', foreignKey: 'id_courses_exams' })
    Courses_exams_questions.belongsTo(models.Courses_exams_questions_types, { as: 'question_type_data', foreignKey: 'id_courses_exams_questions_types' })
    Courses_exams_questions.hasMany(models.Courses_exams_questions_options, { as: 'options', foreignKey: 'id_courses_exams_questions' })
  }

  return Courses_exams_questions
}
