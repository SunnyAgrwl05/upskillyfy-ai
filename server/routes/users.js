import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import AuthEvent from '../models/AuthEvent.js'

const router = express.Router()

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('savedInternships')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, branch, college, year, linkedin, github } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, branch, college, year, linkedin, github },
      { new: true, select: '-password' }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users/save-internship/:id
router.post('/save-internship/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const internshipId = req.params.id

    const idx = user.savedInternships.indexOf(internshipId)
    if (idx > -1) {
      user.savedInternships.splice(idx, 1)
    } else {
      user.savedInternships.push(internshipId)
    }

    await user.save()
    res.json({ saved: idx === -1, savedInternships: user.savedInternships })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/data-export', protect, async (req,res) => {
 const user=await User.findById(req.user.id).select('-password -googleId').lean()
 const events=await AuthEvent.find({user:req.user.id}).select('action provider status createdAt failureCode').sort({createdAt:-1}).lean()
 res.setHeader('Content-Disposition','attachment; filename="upskillyfy-account-data.json"')
 res.json({exportedAt:new Date().toISOString(),account:user,authenticationActivity:events})
})
router.delete('/account', protect, async (req,res) => {
 const {confirmation,password}=req.body||{}
 if(confirmation!=='DELETE MY ACCOUNT')return res.status(400).json({message:'Type DELETE MY ACCOUNT to confirm.'})
 const user=await User.findById(req.user.id)
 if(!user)return res.status(404).json({message:'Account not found.'})
 if(user.authProviders?.includes('password')&&!(await user.comparePassword(password||'')))return res.status(401).json({message:'Enter your current password to delete this account.'})
 await AuthEvent.updateMany({user:user._id},{$set:{user:null,email:'',ipAddress:'',userAgent:''}})
 await User.deleteOne({_id:user._id})
 res.clearCookie('upskillyfy_session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'})
 res.json({success:true,message:'Account deleted. Some activity records may be retained in anonymized form.'})
})
export default router