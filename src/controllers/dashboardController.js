const redirect = [
    async (req, res) => {
        try {
            if (!req.user) return res.redirect('/account/login');
            const role = req.user.role;

            switch (role) {
                case "owner":
                    return res.render('dashboard/properties');
                case "staff":
                    return res.render('dashboard/staff');
                case "guest":
                    return res.render('dashboard/guest');
            }

            return res.status(403).send('Access denied');
        } catch (error) {
            console.error('Redirect Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

module.exports = { redirect };