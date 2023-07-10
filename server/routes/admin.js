const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const adminLayout = '../views/layouts/admin';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret=process.env.JWT_SECRET
/**
 * Check login - middleware
*/
const authMiddleWare=(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    try{
        const decoded = jwt.verify(token,jwtSecret);//verify if token has same jwt secret
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({message:'Unauthorized'});
    }
}

/**
 * GET
 * Admin - Login page
*/
router.get('/admin',async(req,res)=>{
    try{
        const locals={
            title:"Admin",
            desc:"Simple blog"
        }
        res.render('admin/index',{locals,layout:adminLayout});
    }catch(error){
        console.log(error)
    }  
});
/**
 * POST
 * Admin - check Login page
*/
router.post('/admin',async(req,res)=>{
    try{
        const {username,password} = req.body;
       const user = await User.findOne({username});
       if(!user){
        return res.status(401).json({message: 'Invalid credentials'});
       }
       const isPassWordValid = await bcrypt.compare(password,user.password);
       if(!isPassWordValid){
        return res.status(401).json({message: 'Invalid credentials'});
       }
       //save token to cookie
       const token=jwt.sign({userId:user._id},jwtSecret);
       res.cookie("token",token,{httpOnly:true});
       res.redirect('/dashboard');
         
    }catch(error){
        console.log(error)
    }  
});

/**
 * GET
 * Admin dashboard
*/
router.get('/dashboard',authMiddleWare,async(req,res)=>{
    try{
        const locals={
            title:"Dashboard",
            desc:"Simple Blog using NodeJS,Express,MongoDB"
        }
        const data = await Post.find();
        res.render('admin/dashboard',{
            locals,
            data
        });
    }catch(error){
        console.log(error)
    }
});
/**
 * GET
 * ADMIN-create new post
 */
router.get('/add-post',authMiddleWare,async(req,res)=>{
    try{
        const locals={
            title:"Add post",
            desc:"Simple Blog using NodeJS,Express,MongoDB"
        }
        const data=await Post.find();
        res.render('admin/add-post',{
            locals,
            data,
            layout:adminLayout
    });
    }catch(error){
        console.log(erorr);
    }
    
})

/**
 * POST
 * ADMIN-create new post
 */
router.post('/add-post',authMiddleWare,async(req,res)=>{
    try{

        try{
            const newPost=new Post({
                title:req.body.title,
                body:req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        }
        catch(error){
            console.log(erorr);
        }
       
    }catch(error){
        console.log(error);
    }
})
/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
/**
 * PUT-
 * admin create new post
 */

router.put('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
      
      res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });



// router.post('/admin',async(req,res)=>{
//     try{
//         const {username,password} = req.body;
//         if(req.body.username=='admin' && req.body.password=='password'){
//             res.send('you are logged in')
//         }else{
//             res.send('wrong username')
//         }
         
//     }catch(error){
//         console.log(error)
//     }  
// });

/**
 * POST
 * Admin - Register
*/
router.post('/register',async(req,res)=>{
    try{
        const {username,password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10);

        try{
            const user = await User.create({username,password:hashedPassword});
            res.status(201).json({message:'User created',user});
        }catch(error){
            if(error.code===11000){
               res.status(409).json({message:'User already in use'}); 
            }
            res.status(500).json({message:'Internal server error'})
        }
         
    }catch(error){
        console.log(error)
    }  
});

/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
  
/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });

module.exports=router;