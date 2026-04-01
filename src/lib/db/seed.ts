import { db } from "./index";
import { categories } from "./schema";
import { ulid } from "ulid";

const DEFAULT_CATEGORIES = [
  { name: "Photoshoot", slug: "photoshoot", color: "#FEF991", sortOrder: 0 },
  { name: "Video", slug: "video", color: "#4B7EB9", sortOrder: 1 },
  { name: "Post-Production", slug: "post-production", color: "#8B5CF6", sortOrder: 2 },
  { name: "Review", slug: "review", color: "#FFCF54", sortOrder: 3 },
  { name: "Delivery", slug: "delivery", color: "#4BB956", sortOrder: 4 },
  { name: "Social Post", slug: "social-post", color: "#FF453A", sortOrder: 5 },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of DEFAULT_CATEGORIES) {
    db.insert(categories)
      .values({
        id: ulid(),
        ...cat,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .run();
  }
  console.log("Done seeding.");
}

seed();
