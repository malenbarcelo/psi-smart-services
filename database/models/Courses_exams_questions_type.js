module.exports = (sequelize, DataTypes) => {
  const alias = "Courses_exams_questions_types"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
    }
  }

  const config = {
    tableName: 'courses_exams_questions_types',
    timestamps: false,
  }

  const Courses_exams_questions_types = sequelize.define(alias, cols, config)

  Courses_exams_questions_types.associate = (models) => {
    // no associations
  }

  return Courses_exams_questions_types
}
