module.exports = (sequelize, DataTypes) => {
  const alias = "Templates_certificates"

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
    id_templates_cetificates: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    header_logo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    footer_logo: {
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
    course_name_in_certificate: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    certificate_normatives: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    },
    text_1: {
      type: DataTypes.STRING(5000),
      allowNull: true,
    },
    text_2: {
      type: DataTypes.STRING(5000),
      allowNull: true,
    },
    student_photo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }

  const config = {
    tableName: 'templates_certificates',
    timestamps: false,
  }

  const Templates_certificates = sequelize.define(alias, cols, config)

  Templates_certificates.associate = (models) => {
    Templates_certificates.belongsTo(models.Courses, { as: 'course_data', foreignKey: 'id_courses' })
  }

  return Templates_certificates
}
