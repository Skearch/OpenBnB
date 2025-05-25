const { prisma } = require("../config/database");

class EmailSubscriptionController {
    static async subscribe(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const existing = await prisma.subscription.findUnique({ where: { email } });
            if (existing) {
                return res.status(409).json({ success: false, message: "Email already subscribed" });
            }
            await prisma.subscription.create({ data: { email } });
            res.json({ success: true, message: "Subscribed successfully" });
        } catch (error) {
            console.error("Subscription error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async list(req, res) {
        try {
            const subscriptions = await prisma.subscription.findMany({
                orderBy: { createdAt: "desc" }
            });
            res.json({ success: true, subscriptions });
        } catch (error) {
            console.error("List subscriptions error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.subscription.delete({ where: { id: parseInt(id, 10) } });
            res.json({ success: true, message: "Subscription deleted" });
        } catch (error) {
            console.error("Delete subscription error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async edit(req, res) {
        try {
            const { id } = req.params;
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const existing = await prisma.subscription.findUnique({ where: { email } });
            if (existing && existing.id !== parseInt(id, 10)) {
                return res.status(409).json({ success: false, message: "Email already subscribed" });
            }
            const updated = await prisma.subscription.update({
                where: { id: parseInt(id, 10) },
                data: { email }
            });
            res.json({ success: true, message: "Subscription updated", subscription: updated });
        } catch (error) {
            console.error("Edit subscription error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = EmailSubscriptionController;