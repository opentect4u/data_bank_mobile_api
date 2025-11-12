const AuthCheckedMW=(req, res,next)=>{
    try {
        if (!req.session.user){
            res.redirect('/admin/login')
        }else{
            next()
        }
    } catch (error) {
        res.redirect('/admin/login')
    }
}


const logout = async (req, res,next) => {
    // console.log(req.session);
    // req.session.user = '';
    
    req.session.destroy()
        res.redirect('/admin/login')
    

}


module.exports = { AuthCheckedMW,logout }