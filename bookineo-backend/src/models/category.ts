import { Sequelize, DataTypes } from "sequelize";

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    const Category = sequelize.define(
        "Category",
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "categories", timestamps: false }
    );

    Category.associate = (models: any) => {
        Category.hasMany(models.Book, { foreignKey: "category_id" });
    };

    return Category;
};
