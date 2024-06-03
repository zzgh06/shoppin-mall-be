const Product = require("../models/Product");
const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const { sku, name, image, category, description, price, stock, status } = req.body;
    const product = new Product({
      sku, 
      name, 
      image, 
      category, 
      description, 
      price, 
      stock, 
      status
    });
    await product.save();
    res.status(200).json({ status : 'success', product });
  } catch (error) {
    res.status(400).json({ status : 'fail', error : error.message });
  };
}

productController.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ status : 'success', products });
  } catch (error) {
    res.status(400).json({ status : 'fail', error : error.message });
  }
};

module.exports = productController