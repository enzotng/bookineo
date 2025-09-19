import { Sequelize, DataTypes } from "sequelize";

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    const Rental = sequelize.define(
        "Rental",
        {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            book_id: { type: DataTypes.UUID, allowNull: false },
            renter_id: { type: DataTypes.UUID, allowNull: false },
            rental_date: { type: DataTypes.DATE, allowNull: false },
            expected_return_date: { type: DataTypes.DATE },
            actual_return_date: { type: DataTypes.DATE },
            duration_days: { type: DataTypes.INTEGER },
            status: { type: DataTypes.STRING(20), defaultValue: "active" },
            comment: { type: DataTypes.TEXT },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "rentals", timestamps: false }
    );

    Rental.associate = (models: any) => {
        Rental.belongsTo(models.Book, { foreignKey: "book_id", as: "book" });
        Rental.belongsTo(models.User, { foreignKey: "renter_id", as: "renter" });
    };

    return Rental;
};
