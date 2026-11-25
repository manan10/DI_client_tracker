// backend/scripts/syncProdRecipesToTest.js
require("dotenv").config();
const mongoose = require("mongoose");

const PROD_URI = process.env.MONGO_URI_PROD;
const TEST_URI = process.env.MONGO_URI;

if (!PROD_URI || !TEST_URI) {
  console.error("❌ Missing MONGO_URI_PROD or MONGO_URI in .env");
  process.exit(1);
}

// Safety guard: prevent accidentally wiping Prod if both URIs are identical
if (PROD_URI.trim() === TEST_URI.trim()) {
  console.error(
    "❌ ABORTING: MONGO_URI_PROD and MONGO_URI are identical! Refusing to wipe."
  );
  process.exit(1);
}

async function syncProdRecipesToTest() {
  let prodConn;
  let testConn;

  try {
    console.log("🔌 Connecting to Production DB (read-only)...");
    prodConn = await mongoose.createConnection(PROD_URI).asPromise();
    console.log(`✅ Connected to Prod DB: ${prodConn.name}`);

    console.log("🔌 Connecting to Test DB...");
    testConn = await mongoose.createConnection(TEST_URI).asPromise();
    console.log(`✅ Connected to Test DB: ${testConn.name}`);

    const prodRecipesCol = prodConn.collection("recipes");
    const prodUsersCol = prodConn.collection("users");
    const testRecipesCol = testConn.collection("recipes");
    const testUsersCol = testConn.collection("users");

    // 1. Fetch all recipes from Production
    const prodRecipes = await prodRecipesCol.find({}).toArray();
    console.log(`📦 Found ${prodRecipes.length} recipes in Production.`);

    if (prodRecipes.length === 0) {
      console.log("⚠️ No recipes found in Production. Nothing to copy.");
      return;
    }

    // 2. Resolve valid User ObjectId(s) on Test DB so .populate('createdBy') works cleanly
    const testUsers = await testUsersCol.find({}).toArray();
    const prodUsers = await prodUsersCol.find({}).toArray();

    const prodUserEmailById = new Map(
      prodUsers.map((u) => [String(u._id), (u.email || "").toLowerCase()])
    );
    const testUserIdByEmail = new Map(
      testUsers.map((u) => [(u.email || "").toLowerCase(), u._id])
    );
    const fallbackTestUserId = testUsers[0]?._id || null;

    if (!fallbackTestUserId) {
      console.warn(
        "⚠️ Warning: No users found in Test DB 'users' collection. Keeping original createdBy ObjectIds."
      );
    } else {
      console.log(
        `👤 Resolved fallback Test User: ${testUsers[0].email || testUsers[0]._id}`
      );
    }

    // 3. Wipe existing recipes in Test DB
    const deleteResult = await testRecipesCol.deleteMany({});
    console.log(
      `🧹 Wiped ${deleteResult.deletedCount} existing recipes from Test DB.`
    );

    // 4. Prepare documents with mapped createdBy
    const docsToInsert = prodRecipes.map((doc) => {
      let resolvedCreatorId = doc.createdBy;

      if (fallbackTestUserId) {
        const creatorEmail = prodUserEmailById.get(String(doc.createdBy));
        resolvedCreatorId =
          (creatorEmail && testUserIdByEmail.get(creatorEmail)) ||
          fallbackTestUserId;
      }

      return {
        ...doc,
        createdBy: resolvedCreatorId,
      };
    });

    // 5. Insert into Test DB
    const insertResult = await testRecipesCol.insertMany(docsToInsert);
    console.log(
      `🚀 Successfully copied ${insertResult.insertedCount} recipes to Test DB (${testConn.name})!`
    );
  } catch (err) {
    console.error("❌ Sync failed:", err);
    process.exitCode = 1;
  } finally {
    if (prodConn) await prodConn.close();
    if (testConn) await testConn.close();
    console.log("🔒 Database connections closed.");
  }
}

syncProdRecipesToTest();