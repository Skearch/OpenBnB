const redirect = [
    async (req, res) => {
        try {
            if (!req.user) return res.redirect('/account/login');
            const role = req.user.role;

            switch (role) {
                case "owner":
                    return res.redirect('/dashboard/overview');
                case "staff":
                    return res.redirect('/dashboard/staff');
                case "guest":
                    return res.redirect('/dashboard/guest');
            }

            return res.status(403).send('Access denied');
        } catch (error) {
            console.error('Redirect Error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
];

const properties = [(req, res) => res.render('dashboard/properties')];
const accounts = [(req, res) => res.render('dashboard/accounts')];
const overview = [(req, res) => res.render('dashboard/overview')];

module.exports = { redirect, properties, accounts, overview };