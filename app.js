require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./server/config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

//create express app and set port
const app = express();
const PORT = 5000 || process.env.PORT;

//connect to DB
connectDB();

//middleware->
//accept search term and search for data
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'))
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:mongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),
}))

//use public folder to store css and images
app.use(express.static('public'));


//templating engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');


app.locals.isActiveRoute = isActiveRoute; 


//routes
app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));

//make app listen at port
app.listen(PORT,()=>{
    console.log(`listening from http://localhost:${PORT}`);
})