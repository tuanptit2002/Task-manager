const mongoose = require('mongoose');
const validator  = require('validator')
const bcrypt = require('bcrypt')
const jwt  = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is valid');
            }
        }
    },
    password:{
        type: String,
        require: true,
        minlength:7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password');
            }
        }
    },
    age:{
        type: Number,
        default : 0,
        validate(value){
            if(value < 0){
                throw new Error('Age mus be postive number')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
},
{
    timestamps:true
}
)

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', 
    foreignField: 'owner'
})

userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject
}

// userSchema.methods.remove = async function (){
//     const user = this;
    
//     await user.deleteOne();
// }

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token  =  jwt.sign({ _id: user._id.toString()}, 'PTIT');
    user.tokens = user.tokens.concat({token})
    await user.save();
    return token;
}

userSchema.statics.findBycredentials  = async (email, password) => {
    const user  = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
            throw new Error('Unable to login')
    }
    return user;
}

userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User