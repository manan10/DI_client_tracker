const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const data = [
        { p: "Food & Daily Essentials", i: "Package", s: ["Zepto/Blinkit", "Grocery", "Veggies/Fruits", "Dry Fruits", "Milk & Dairy", "Bread & Bakery", "Spices", "Sweets", "Snacks", "Health Food"] },
        { p: "Dining & Entertainment", i: "Utensils", s: ["Eat-out", "Order-In", "Cinema", "Entertainment", "Concerts", "Hobbies"] },
        { p: "Household Staff", i: "UserRound", s: ["Housekeeping Salary", "Cook Salary", "Gardener", "Car Wash", "Laundry"] },
        { p: "Housing & Utilities", i: "Home", s: ["Society Maintenance", "Electricity Bill", "Water Bill", "Piped Gas", "Cleaning Supplies", "Kitchenware", "Furniture", "Hardware"] },
        { p: "Technology", i: "Smartphone", s: ["Mobile Bill", "Broadband", "DTH/Cable", "Subscriptions", "Gadget Repairs", "New Electronics"] },
        { p: "Transport", i: "Car", s: ["Petrol/Diesel", "CNG", "Toll/Fastag", "Auto/Rickshaw", "Uber/Ola", "Metro/Train", "Flights", "Hotel", "Sightseeing", "Service/AMC", "Insurance"] },
        { p: "Personal Care", i: "Shirt", s: ["Clothing", "Footwear", "Salon", "Cosmetics", "Jewelry", "Tailoring", "Gym", "Sports", "Supplements"] },
        { p: "Health & Medical", i: "HeartPulse", s: ["Pharmacy", "Doctor Fees", "Lab Tests", "Dental", "Optical", "Insurance Premium", "Senior Care"] },
        { p: "Education", i: "GraduationCap", s: ["School/College Fees", "Tuition", "Stationery", "Skill Courses", "Uniforms", "Exam Fees"] },
        { p: "Family & Traditions", i: "Landmark", s: ["Pooja Samagri", "Religious Donations", "Festival Decorations", "Gifts", "Charity", "Club Memberships"] },
        { p: "Business", i: "Briefcase", s: ["Office Supplies", "Business Travel"] },
        { p: "Miscellaneous", i: "MoreHorizontal", s: ["Fines/Challans", "Courier & Shipping"] }
    ];

    try {
        await Category.deleteMany();
        for (let item of data) {
            const parent = await Category.create({ label: item.p, icon: item.i });
            const subs = item.s.map(label => ({ label, parent: parent._id, icon: item.i }));
            subs.push({ label: "Others", parent: parent._id, icon: "MoreHorizontal" });
            await Category.insertMany(subs);
        }
        console.log("Seeding Complete!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();