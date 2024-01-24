const express=require('express');
const { UserRouter } = require('./routes/UserRouter');
const { AdminRoutes } = require('./routes/adminRoutes');
// const { F_Select } = require('./model/OrcModel');
const dateFormat = require('dateformat');
const { update_endcollection } = require('./controller/Scheduler');
const { BankRoutes } = require('./routes/BankRoutes');
const { ServerRoures } = require('./routes/ServerRoures');
const { Sadmin } = require('./routes/Sadmin.routes');
const app = express(),
path = require('path'),
flash = require('connect-flash'),
session = require('express-session'),
port = process.env.PORT || 3000;

//ejs
app.set("view engine","ejs")
//ejs uiew path
app.set("views",path.join(__dirname,'view'))

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'assets')))
app.use(express.static(path.join(__dirname,'uploads')))
app.use(express.json())//alltime return json
app.use(express.urlencoded({extended:true}))

// SESSION
app.use(
    session({
      secret: "DATABANK",//project name secretKey
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 36000000,//time 1000 h
      },
    })
  );
// END


app.use(flash());
var sessionFlash = function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning');
    res.locals.success = req.flash('success');
    next();
}
app.use(sessionFlash)


app.use((req, res, next) => {
    res.locals.user = req.session.user ? req.session.user : null
    next()
})

app.get('/', async (req, res) => {
  res.redirect('/admin/login')
  // var pax_id = 1,
  //     fields = "user_cd, cust_cd, last_login, user_name, active_status",
  //     table_name = "md_user",
  //     where = "user_type != 'A'",
  //     order = null,
  //     flag = 1;
  //   var resDt = await F_Select(pax_id, fields, table_name, where, order, flag);
  // res.send(resDt)
})

//admin branch
app.use('/admin',AdminRoutes);
//admin Bank
app.use('/bank',BankRoutes);
app.use('/super-admin',Sadmin);

//bank server api
app.use('/agent_account',ServerRoures);

//full online app Api
app.use('/v1/user',UserRouter);

app.get('*', function(req, res){
  res.render('auth/error_404')
  // res.redirect('/auth')
  // res.send('what???', 404);
});

// app.get('/about',(rex,res,nxt)=>{
//     res.send("hello");
// });


// Schedule the task to run at every day
setInterval(() => {
  const datetime = dateFormat(new Date(), "HH")
  // const datetime = dateFormat(new Date(), "HH:MM")
  // if (datetime == "01:00") {
    if (datetime == "23") {
    console.log("Schedule time "+datetime);
    update_endcollection()
  }
  console.log("update_endcollection");
}, 1000*60*60);



app.listen(port , (err) =>{
    if(err) throw new Error(err)
    else console.log(`App is running at port: ${port}`);
})