module.exports = (sequelize, DataTypes) => {
  const alias = "Templates_credentials"

  const cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_courses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_templates_credentials: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    credential_logo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    signature_1: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    signature_2: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    credential_forehead: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    credential_back: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    credential_normatives: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    }
  }

  const config = {
    tableName: 'templates_credentials',
    timestamps: false,
  }

  const Templates_credentials = sequelize.define(alias, cols, config)

  Templates_credentials.associate = (models) => {
    Templates_credentials.belongsTo(models.Courses, { as: 'course_data', foreignKey: 'id_courses' })
  }

  return Templates_credentials
}
