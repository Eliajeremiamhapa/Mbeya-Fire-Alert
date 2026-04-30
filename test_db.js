const mongoose = require('mongoose');

// Hii ndiyo string yako tuliyoikamilisha
const db_url = "mongodb+srv://eliamhapa34_db_user:eliamongodb@cluster0.xayuiam.mongodb.net/gems_db?retryWrites=true&w=majority&appName=Cluster0";

console.log("Jaribio la kuunganisha Database linaanza...");

mongoose.connect(db_url)
    .then(() => {
        console.log("========================================");
        console.log("🔥 HONGERA ELIA!");
        console.log("Database ya GEMS imeunganishwa kikamilifu!");
        console.log("========================================");
        process.exit(0); // Zima test baada ya kufanikiwa
    })
    .catch(err => {
        console.error("❌ KOSA LIMEGUNDULIKA:");
        console.error(err.message);
        console.log("\nUshauri: Hakikisha umeruhusu IP (0.0.0.0/0) kule MongoDB Network Access.");
        process.exit(1);
    });