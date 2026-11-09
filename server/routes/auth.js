import express from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import AuthEvent from '../models/AuthEvent.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const getJwtSecret = () => { if (!process.env.JWT_SECRET) throw Object.assign(new Error('Authentication is unavailable.'), { status: 503 }); return process.env.JWT_SECRET }
const signToken = id => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' })
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60 * 1000 }
const setSession = (res, id) => res.cookie('upskillyfy_session', signToken(id), cookieOptions)
const clearSession = res => res.clearCookie('upskillyfy_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })
const payload = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, branch: user.branch, college: user.college, year: user.year, enrolledCourses: user.enrolledCourses || [], savedInternships: user.savedInternships || [] })
async function logEvent(req, { action, provider = 'password', status, user = null, email = '', failureCode = '' }) {
  try { await AuthEvent.create({ action, provider, status, user: user?._id || null, email: String(email || user?.email || '').toLowerCase().trim(), ipAddress: String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().slice(0,64), userAgent: String(req.headers['user-agent'] || '').slice(0,300), failureCode: String(failureCode).slice(0,80) }) }
  catch (e) { console.error('Auth audit log error:', e.message) }
}
router.post('/register', async (req,res) => {
 const {name,email,password,role,branch,college,year,termsAccepted,marketingConsent}=req.body
 try {
  getJwtSecret()
  if(typeof name!=='string'||typeof email!=='string'||typeof password!=='string'||!name.trim()||!email.trim()||!password) return res.status(400).json({message:'Name, email, and password are required.'})
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())||email.length>254) return res.status(400).json({message:'Enter a valid email address.'})
  if(name.trim().length>100) return res.status(400).json({message:'Name must be 100 characters or fewer.'})
  if(password.length<8||password.length>128) return res.status(400).json({message:'Password must be between 8 and 128 characters.'})
  if(termsAccepted!==true) return res.status(400).json({message:'Please accept the Terms and Privacy Policy.'})
  const normalized=email.toLowerCase().trim()
  if(await User.findOne({email:normalized})){await logEvent(req,{action:'signup',status:'failure',email:normalized,failureCode:'EMAIL_ALREADY_EXISTS'});return res.status(409).json({message:'An account with this email already exists.'})}
  const user=await User.create({name:name.trim(),email:normalized,password,role:['student','faculty'].includes(role)?role:'student',branch:branch||'',college:college||'',year:year||'',authProviders:['password'],privacyConsents:{termsAcceptedAt:new Date(),privacyAcceptedAt:new Date(),policyVersion:'2026-11-09',marketingEmails:marketingConsent===true}})
  await logEvent(req,{action:'signup',status:'success',user});setSession(res,user._id);return res.status(201).json({user:payload(user)})
 } catch(e){console.error('Registration error:',e);await logEvent(req,{action:'signup',status:'failure',email,failureCode:e.code||'REGISTRATION_ERROR'});return res.status(e.status||500).json({message:e.status?e.message:'Failed to register account.'})}
})
router.post('/login',async(req,res)=>{
 const{email,password}=req.body
 try{
  getJwtSecret()
  if(typeof email!=='string'||typeof password!=='string'||!email.trim()||!password)return res.status(400).json({message:'Email and password are required.'})
  const normalized=email.toLowerCase().trim(),user=await User.findOne({email:normalized})
  if(!user||!(await user.comparePassword(password))){await logEvent(req,{action:'login',status:'failure',email:normalized,failureCode:'INVALID_CREDENTIALS'});return res.status(401).json({message:'Invalid email or password.'})}
  await logEvent(req,{action:'login',status:'success',user});setSession(res,user._id);return res.json({user:payload(user)})
 }catch(e){console.error('Login error:',e);await logEvent(req,{action:'login',status:'failure',email,failureCode:e.code||'LOGIN_ERROR'});return res.status(e.status||500).json({message:e.status?e.message:'Failed to login.'})}
})
router.post('/google',async(req,res)=>{
 const{credential,intent='login',role='student',branch='',college='',year='',termsAccepted=false}=req.body;let email=''
 try{
  getJwtSecret();if(!process.env.GOOGLE_CLIENT_ID)return res.status(503).json({message:'Google sign-in is not configured yet.'})
  if(!credential)return res.status(400).json({message:'Google credential is required.'})
  const ticket=await googleClient.verifyIdToken({idToken:credential,audience:process.env.GOOGLE_CLIENT_ID}),profile=ticket.getPayload()
  if(!profile?.sub||!profile.email||!profile.email_verified)return res.status(401).json({message:'Google account email could not be verified.'})
  email=profile.email.toLowerCase().trim()
  let user=await User.findOne({googleId:profile.sub}),action='login'
  if(!user){
   const emailOwner=await User.findOne({email})
   if(emailOwner)return res.status(409).json({message:'An account with this email already exists. Sign in with your password first; linking must be completed from authenticated account settings.'})
   if(termsAccepted!==true)return res.status(400).json({message:'Accept the Terms and Privacy Policy before creating a Google account.'})
   action='signup';user=await User.create({name:profile.name||email.split('@')[0],email,googleId:profile.sub,avatar:profile.picture||'',role:['student','faculty'].includes(role)?role:'student',branch,college,year,authProviders:['google'],privacyConsents:{termsAcceptedAt:new Date(),privacyAcceptedAt:new Date(),policyVersion:'2026-11-09',marketingEmails:false}})
  }
  await logEvent(req,{action,provider:'google',status:'success',user});setSession(res,user._id);return res.json({user:payload(user),isNewUser:action==='signup'})
 }catch(e){console.error('Google auth error:',e.message);await logEvent(req,{action:intent==='signup'?'signup':'login',provider:'google',status:'failure',email,failureCode:e.code||'GOOGLE_AUTH_ERROR'});return res.status(e.status||401).json({message:e.status?e.message:'Google authentication failed.'})}
})
router.post('/logout',(req,res)=>{clearSession(res);res.json({success:true})})
router.get('/me',protect,async(req,res)=>res.json(payload(req.user)))
export default router
