const branch_user = (req, res, next)=>{
    try {
        const user_data = req.session.user.user_data.msg[0];
        if (user_data.user_type == 'R') {
            next()
        } else {
            const previousUrl = req.get('referer') || '/';
            res.redirect(previousUrl);
        }

    } catch (error) {
        res.redirect('/admin/dashboard')
    }
}

module.exports = { branch_user }