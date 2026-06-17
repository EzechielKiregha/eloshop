import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

const categories = [
  { name: "Robes", slug: "robes" },
  { name: "Vestes", slug: "vestes" },
  { name: "Chaussures", slug: "chaussures" },
  { name: "Accessoires", slug: "accessoires" }
];

const products = [
  {
    name: "Robe satin noire",
    slug: "robe-satin-noire",
    description: "Robe noire en satin avec une coupe élégante pour soirées et événements.",
    price: 240,
    costPrice: 140,
    images: ['https://i.pinimg.com/1200x/4f/33/58/4f3358e72f11350743b97c999093515d.jpg', 'https://i.pinimg.com/1200x/45/82/5c/45825c2909f00adefd5be5ee48a59fae.jpg', 'https://i.pinimg.com/1200x/b4/78/70/b478702d5970541b7fca11970a161a28.jpg'],
    stock: 18,
    sku: "ROB-001",
    categorySlug: "robes"
  },
  {
    name: "Blazer ivoire",
    slug: "blazer-ivoire",
    description: "Blazer ivoire structuré avec finition premium et silhouette moderne.",
    price: 310,
    costPrice: 185,
    images: ['https://i.pinimg.com/1200x/10/e2/d6/10e2d6494510281ef391078e20fef8c8.jpg','https://i.pinimg.com/1200x/0c/f7/33/0cf733b92618681e958f3736e5f63aa2.jpg', 'https://i.pinimg.com/736x/24/66/2d/24662dc5394a55e50ef12530fdb00b18.jpg'],
    stock: 9,
    sku: "VES-014",
    categorySlug: "vestes"
  },
  {
    name: "Escarpins cuir",
    slug: "escarpins-cuir",
    description: "Escarpins en cuir avec talon stable et allure raffinée.",
    price: 285,
    costPrice: 170,
    images: ['https://i.pinimg.com/1200x/2c/29/a0/2c29a09ed596efc481e3cedb07488038.jpg','https://i.pinimg.com/1200x/f2/52/0e/f2520ec7f6ac2ada9b164ab62b373260.jpg', 'https://i.pinimg.com/736x/5a/99/ab/5a99ab35a4e70b43c35e25e70c26d82f.jpg'],
    stock: 6,
    sku: "CHA-022",
    categorySlug: "chaussures"
  },
  {
    name: "Sac structure",
    slug: "sac-structure",
    description: "Sac structuré pour accompagner les tenues professionnelles et habillées.",
    price: 195,
    costPrice: 98,
    images: ['https://i.pinimg.com/1200x/e6/8e/ea/e68eea48087ef90893ebd51fbb79e7ed.jpg', 'https://i.pinimg.com/1200x/01/$/74/01fc74ecb865ac132baa9adb374f6659.jpg'],
    stock: 23,
    sku: "ACC-031",
    categorySlug: "accessoires"
  }
];

async function main() {

  const adminPassword = await hash("admin123", 12);

  await prisma.user.upsert({
    where: { phone: "+200000000000" },
    update: { password: adminPassword },
    create: {
      name: "Administrateur KAMEGA Shop",
      phone: "+200000000000",
      email: "admin@kamegashop.com",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice,
        images: product.images,
        stock: product.stock,
        sku: product.sku,
        categoryId: category.id
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        sku: product.sku,
        images: product.images,
        categoryId: category.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
