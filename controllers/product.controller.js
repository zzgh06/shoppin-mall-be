const Product = require("../models/Product");
const PAGE_SIZE = 5;
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
    // console.log(name)
    // isDeleted 에 따라 보여주는 결과가 다름
    const cond = name 
    ? { name: { $regex: name, $options: "i" }, isDeleted: false }
    : { isDeleted: false };
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

productController.getProductById = async (req,res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
    res.status(200).json({ status : 'success', data : product });
  } catch(error) {
    res.status(400).json({ status : 'fail', error : error.message });
  }
}

productController.updateProduct = async (req, res) => {
  try {
    // 수정할 상품의 id 값
    const productId = req.params.id;
    const {sku, name, image, category, description, price, stock, status} = req.body;
    // id 값과 일치하는 상품
    // 수정할 내용,
    // 업데이트한 후 새로운 값 리턴하는 옵션 => { new : true }
    const product = await Product.findByIdAndUpdate(
      { _id:productId }, 
      { sku, name, image, category, description, price, stock, status },
      { new : true }
    );
    res.status(200).json({ status : 'success', data : product });
  } catch(error){
    res.status(400).json({ status : 'fail', error : error.message });
  }
}

// 삭제(isDeleted : true) 변경, 실제로 삭제 X
// isDeleted bool 에 따라 보여주는 item 변경
productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id:productId },
      { isDeleted: true }
    );
    res.status(200).json({ status : 'success' });
  } catch(error){
    res.status(400).json({ status : 'fail', error : error.message });
  }
}

module.exports = productController