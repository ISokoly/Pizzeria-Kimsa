const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/productos', productoController.getAllProductos);
router.get('/productos/:id', productoController.getProductoById);
router.get('/productos/categoria/:nombreCategoria', productoController.getByCategoriaNombre);
router.post('/productos', productoController.createProducto);
router.put('/productos/:id', productoController.updateProducto);
router.delete('/productos/:id', productoController.deleteProducto);
router.get('/productos/:nombreCategoria', productoController.getAllProductos);

module.exports = router;