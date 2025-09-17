export default (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
            password: { type: DataTypes.STRING(255), allowNull: false },
            first_name: DataTypes.STRING(50),
            last_name: DataTypes.STRING(50),
            birth_date: DataTypes.DATE,
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "users", timestamps: false }
    );

    User.associate = (models) => {
        User.hasMany(models.Book, { foreignKey: "owner_id" });
        User.hasMany(models.Rental, { foreignKey: "renter_id" });
        User.hasMany(models.Message, { foreignKey: "sender_id", as: "sentMessages" });
        User.hasMany(models.Message, { foreignKey: "recipient_id", as: "receivedMessages" });
    };

    return User;
};
