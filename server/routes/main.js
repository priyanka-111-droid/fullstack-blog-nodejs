const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

//routes
/**
 * GET
 * HOME/
 */
router.get('',async(req,res)=>{
    try{
        const locals={
            title:"NodeJS Blog",
            desc:"Simple blog"
        }
        let perPage=6;
        let page=req.query.page || 1;

        const data= await Post.aggregate([{$sort:{createdAt:-1}}])
        .skip(perPage*page-perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count();
        const nextPage = parseInt(page)+1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage);

        res.render('index',{locals,data,current:page,nextPage:hasNextPage?nextPage:null,currentRoute:'/'});
    }catch(error){
        console.log(error)
    }
   
});

/**
 * GET
 * Post:id
 */
router.get('/post/:id',async(req,res)=>{
        let slug = req.params.id;
        const locals={
            title:"NodeJS blog",
            desc:"Simple blog created with NodeJS,Express and MongoDB"
        }
        try{
            const data=await Post.findById({_id:slug});
            res.render('post',{
                locals,
                data,
                currentRoute: `/post/${slug}`
            });
        }catch(error){
            console.log(error)
        }   
});

/**
 * POST/
 * Post-searchTerm
 */
router.post('/search',async(req,res)=>{
        
        try{
            const locals={
                title:"Search",
                desc:"Simple blog"
            }
            let searchTerm = req.body.searchTerm;
            const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

            const data=await Post.find({
                $or:[
                    {title:{$regex:new RegExp(searchNoSpecialChar,'i')}},
                    {body:{$regex:new RegExp(searchNoSpecialChar,'i')}},
                ]
            });
            res.render('search',{locals,data, currentRoute: '/'});
        }
        catch(error){
            console.log(error)
        }  
    });

router.get('/about',(req,res)=>{
    res.render('about',{
        currentRoute: '/about'
    });
});

// router.get('',async(req,res)=>{
//     const locals={
//         title:"NodeJS Blog",
//         desc:"Simple blog"
//     }
//     try{
//         const data=await Post.find();
//         res.render('index',{locals,data});
//     }catch(error){
//         console.log(error)
//     }
   
// });

// function insertPostData(){
//     Post.insertMany(
//         [
//             {
//             title:"how to make blog",
//             body:"This is intro of how to"
//             },
//             {
//                 title:"how to cook",
//                 body:"This is intro of how to cook"
//             },
//             {
//                 title:"NodeJS limiting network traffic",
//                 body:"learn how to limit network traffic"
//             },
//             {
//                 title: "build real-time, event-driven applications in Node.js",
//                 body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//             },
//             {
//                 title: "Discover how to use Express.js",
//                 body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//             },
//             {
//                 title: "Asynchronous Programming with Node.js",
//                 body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//             },
//             {
//                 title: "Learn the basics of Node.js and its architecture",
//                 body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//             },
//             {
//                 title: "NodeJs Limiting Network Traffic",
//                 body: "Learn how to limit netowrk traffic."
//             },
//             {
//                 title: "Learn Morgan - HTTP Request logger for NodeJs",
//                 body: "Learn Morgan."
//             },
//             {
//                       title: "Building APIs with Node.js",
//                       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//             },
//         ]
//     )
// }

// insertPostData();





module.exports = router;