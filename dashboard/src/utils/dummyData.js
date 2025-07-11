import image1 from '../images/1.webp';
import image2 from '../images/2.webp';
import image3 from '../images/3.webp';

const generateDummyProducts = () => {
  const categories = ['Flowers', 'Edibles', 'Drinks', 'Accessories'];
  const images = [image1, image2, image3];

  const names = ['Aloe Vera', 'Basil', 'Cannabis', 'Dandelion', 'Eucalyptus', 'Fennel', 'Ginger', 'Hibiscus', 'Iris', 'Jasmine', 'Kale', 'Lavender', 'Mint', 'Nutmeg', 'Oregano', 'Parsley', 'Quinoa', 'Rosemary', 'Sage', 'Thyme', 'Uva Ursi', 'Valerian', 'Wheatgrass', 'Xanthan Gum', 'Yarrow', 'Zucchini']; // Example names
  const dummyProducts = [];

  for (let i = 1; i <= 50; i++) {
    const name = names[Math.floor(Math.random() * names.length)] + ` ${i}`; // Ensure unique names by appending the index
    const category = categories[Math.floor(Math.random() * categories.length)];
    const image = images[Math.floor(Math.random() * images.length)];
    const price = parseFloat((Math.random() * (100 - 5) + 5).toFixed(2)); // Price between 5 and 100
    const quantity = Math.floor(Math.random() * 100) + 1; // Quantity between 1 and 100

    dummyProducts.push({
      id: i,
      name,
      category,
      image,
      price,
      quantity
    });
  }

  return dummyProducts;
};

export default generateDummyProducts;
