import { Sequelize, DataTypes } from "sequelize";

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    const Message = sequelize.define(
        "Message",
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            sender_id: { type: DataTypes.UUID, allowNull: false },
            recipient_id: { type: DataTypes.UUID, allowNull: false },
            subject: { type: DataTypes.STRING(200) },
            content: { type: DataTypes.TEXT },
            is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
            sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "messages", timestamps: false }
    );

    Message.associate = (models: any) => {
        Message.belongsTo(models.User, { foreignKey: "sender_id", as: "sender" });
        Message.belongsTo(models.User, { foreignKey: "recipient_id", as: "recipient" });
    };

    return Message;
};
