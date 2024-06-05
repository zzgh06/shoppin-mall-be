const Product = require("../models/Product");
const PAGE_SIZE = 1;
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
    const { page, name } = req.query
    const cond = name ? {name:{$regex:name, $options:"i"}} : {};
    // 선언
    let query = Product.find(cond);
    // 페이지 혹은 조건에 따라서 response로 전달할 데이터를 동적으로 변경
    let response = { status : "success" }
    if (page){
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      // 최종 몇개 페이지 : 전체페이지개수 = 전체 데이터 개수 / 페이지 사이즈
      const totalItemNumber = await Product.find(cond).count();
      const totalPageNumber = Math.ceil(totalItemNumber / PAGE_SIZE);
      // 총 페이지 데이터
      response.totalPageNumber = totalPageNumber;
    }
    // 실행
    const productList = await query.exec();
    // 상품데이터
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status : 'fail', error : error.message });
  }
};

module.exports = productController