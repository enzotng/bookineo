import { Sequelize, DataTypes } from "sequelize";

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    const Book = sequelize.define(
        "Book",
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            isbn: { type: DataTypes.STRING(10) },
            title: { type: DataTypes.STRING(255), allowNull: false },
            author: { type: DataTypes.STRING(255) },
            publication_year: { type: DataTypes.INTEGER },
            category_id: { type: DataTypes.INTEGER },
            price: { type: DataTypes.DECIMAL(10, 2) },
            status: { type: DataTypes.STRING(20), defaultValue: "available" },
            owner_id: { type: DataTypes.UUID },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            image_url: { type: DataTypes.TEXT },
        },
        { tableName: "books", timestamps: false }
    );

    Book.associate = (models: any) => {
        Book.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });
        Book.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
    };

    return Book;
};
