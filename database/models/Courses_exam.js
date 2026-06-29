module.exports = (sequelize, DataTypes) => {
  const alias = "Courses_exams"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    exam_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    exm_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    id_courses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exam_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pass_grade: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }

  const config = {
    tableName: 'courses_exams',
    timestamps: false,
  }

  const Courses_exams = sequelize.define(alias, cols, config)

  Courses_exams.associate = (models) => {
    Courses_exams.belongsTo(models.Courses, { as: 'course_data', foreignKey: 'id_courses' })
  }

  return Courses_exams
}
