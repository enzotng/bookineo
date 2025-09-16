export default (sequelize, DataTypes) => {
    const Category = sequelize.define(
        "Category",
        {
            name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "categories", timestamps: false }
    );

    Category.associate = (models) => {
        Category.hasMany(models.Book, { foreignKey: "category_id" });
    };

    return Category;
};
