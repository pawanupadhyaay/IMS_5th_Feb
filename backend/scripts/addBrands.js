const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { Product } = require("../models/Product");

const brandsToAdd = ["Timex", "Cerruti", "Giordano"];

const addBrands = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB!\n");

    for (const brand of brandsToAdd) {
      // Check if a product with this brand already exists
      const existingProduct = await Product.findOne({ brand: brand });
      
      if (existingProduct) {
        console.log(`✅ Brand "${brand}" already exists in database`);
      } else {
        // Create a minimal product with this brand
        const newProduct = await Product.create({
          brand: brand,
          sku: `SEED-${brand.toUpperCase()}-${Date.now()}`,
          category: "Analog",
          inventory: 0,
          price: 0,
          oldPrice: 0,
          description: `Seed product for ${brand} brand`,
          title: "",
        });
        
        console.log(`✅ Created seed product for brand "${brand}" (ID: ${newProduct._id})`);
      }
    }

    // Verify brands are now in the database
    console.log("\n📋 Verifying brands in database...");
    const allBrands = await Product.distinct("brand", { brand: { $ne: "" } });
    const addedBrands = brandsToAdd.filter(b => allBrands.includes(b));
    
    console.log(`\n✅ Successfully added brands: ${addedBrands.join(", ")}`);
    
    if (addedBrands.length < brandsToAdd.length) {
      const missing = brandsToAdd.filter(b => !allBrands.includes(b));
      console.log(`⚠️  Warning: Could not verify these brands: ${missing.join(", ")}`);
    }

    await mongoose.connection.close();
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

addBrands();

