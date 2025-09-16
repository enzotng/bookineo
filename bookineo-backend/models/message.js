module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    subject: DataTypes.STRING(200),
    content: DataTypes.TEXT,
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: "messages", timestamps: false });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: "sender_id", as: "sender" });
    Message.belongsTo(models.User, { foreignKey: "recipient_id", as: "recipient" });
  };

  return Message;
};
