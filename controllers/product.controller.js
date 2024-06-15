const Product = require("../models/Product");
const User = require("../models/User");
const PAGE_SIZE = 5;
const productController = {};
productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      images,
      category,
      description,
      price,
      stock,
      status,
      gender,
    } = req.body;
    const product = new Product({
      sku,
      name,
      images,
      gender,
      category,
      description,
      price,
      stock,
      status,
      likes: 0,
      purchases: 0,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name
      ? { name: { $regex: name, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNumber = await Product.find(cond).count();
      const totalPageNumber = Math.ceil(totalItemNumber / PAGE_SIZE);
      response.totalPageNumber = totalPageNumber;
    }
    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { sku, name, images, category, description, price, stock, status } =
      req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, images, category, description, price, stock, status },
      { new: true }
    );
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true }
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 재고 확인
productController.checkItemListStock = async (itemList) => {
  try {
    const products = await Product.find({
      _id: { $in: itemList.map((item) => item.productId) },
    });
    const productMap = products.reduce((map, product) => {
      map[product._id] = product;
      return map;
    }, {});
    const insufficientStockItems = itemList
      .filter((item) => {
        const product = productMap[item.productId];
        return product.stock[item.size] < item.qty;
      })
      .map((item) => {
        return {
          item,
          message: `${productMap[item.productId].name}의 ${
            item.size
          } 재고가 부족합니다.`,
        };
      });

    return insufficientStockItems;
  } catch (error) {
    throw new Error("재고 확인 중 오류가 발생했습니다.");
  }
};

// 좋아요 기능 추가 및 취소
productController.toggleLikeProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.userId;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    const alreadyLiked = req.alreadyLiked;

    if (alreadyLiked) {
      product.likes -= 1;
      await product.save();

      user.likedProducts.pull(productId);
      await user.save();
    } else {
      product.likes += 1;
      await product.save();

      user.likedProducts.push(productId);
      await user.save();
    }
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
