import mongoose from 'mongoose'
const schema = new mongoose.Schema({
 action:{type:String,enum:['signup','login'],required:true,index:true},
 provider:{type:String,enum:['password','google'],required:true},
 status:{type:String,enum:['success','failure'],required:true,index:true},
 user:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null,index:true},
 email:{type:String,default:'',lowercase:true,trim:true,index:true},
 ipAddress:{type:String,default:''}, userAgent:{type:String,default:''}, failureCode:{type:String,default:''}
},{timestamps:true})
schema.index({createdAt:-1})
export default mongoose.model('AuthEvent',schema)
