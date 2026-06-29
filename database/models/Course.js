module.exports = (sequelize, DataTypes) => {
  const alias = "Courses"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    course_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    validity_months: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    has_credential: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    has_certificate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    has_theorical: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    has_practical: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }

  const config = {
    tableName: 'courses',
    timestamps: false,
  }

  const Courses = sequelize.define(alias, cols, config)

  Courses.associate = (models) => {
    Courses.hasMany(models.Courses_exams, { as: 'exams', foreignKey: 'id_courses' })
  }

  return Courses
}
