const mongoose = require("mongoose");

const connectDb = async () => {
    await mongoose.connect("mongodb://localhost:27017/lol");
};
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: [255, "Email length must be at most 255"],
    },
    ip: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", userSchema);


connectDb();
