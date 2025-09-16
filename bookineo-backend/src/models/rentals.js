export default (sequelize, DataTypes) => {
    const Rental = sequelize.define(
        "Rental",
        {
            book_id: { type: DataTypes.INTEGER, allowNull: false },
            renter_id: { type: DataTypes.INTEGER, allowNull: false },
            start_date: { type: DataTypes.DATE, allowNull: false },
            end_date: DataTypes.DATE,
            status: { type: DataTypes.STRING(20), defaultValue: "pending" },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "rentals", timestamps: false }
    );

    Rental.associate = (models) => {
        Rental.belongsTo(models.Book, { foreignKey: "book_id", as: "book" });
        Rental.belongsTo(models.User, { foreignKey: "renter_id", as: "renter" });
    };

    return Rental;
};
