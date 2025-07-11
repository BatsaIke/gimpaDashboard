

export const filterProductsByCategory = (allProducts, selectedCategory) => {
    return selectedCategory
        ? allProducts.filter(product => product.category === selectedCategory)
        : allProducts;
};