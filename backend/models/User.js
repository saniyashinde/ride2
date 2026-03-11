const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true
},

password:{
type:String
},

image:{
type:String
}

},{timestamps:true});


module.exports = mongoose.models.User || mongoose.model("User", userSchema);