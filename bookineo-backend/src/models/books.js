export default (sequelize, DataTypes) => {
    const Book = sequelize.define(
        "Book",
        {
            id: { type: DataTypes.STRING(10), primaryKey: true, autoIncrement: true },
            title: { type: DataTypes.STRING(255), allowNull: false },
            author: { type: DataTypes.STRING(255) },
            publication_year: { type: DataTypes.INTEGER },
            category_id: { type: DataTypes.INTEGER },
            price: { type: DataTypes.DECIMAL(10, 2) },
            status: { type: DataTypes.STRING(20), defaultValue: "available" },
            owner_id: { type: DataTypes.INTEGER },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            image_url: { type: DataTypes.TEXT },
        },
        { tableName: "books", timestamps: false }
    );

    Book.associate = (models) => {
        Book.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });
        Book.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
    };

    return Book;
};
