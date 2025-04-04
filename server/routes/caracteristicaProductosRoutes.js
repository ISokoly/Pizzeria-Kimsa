const express = require('express');
const router = express.Router();
const caracteristicaProductosController = require('../controllers/caracteristicasProductosController');

router.get('/caracteristicas_productos/producto', caracteristicaProductosController.getAllCaracteristicasProductos);
router.get('/caracteristicas_productos/producto/:id', caracteristicaProductosController.getCaracteristicasProductosById);
router.post('/caracteristicas_productos/producto', caracteristicaProductosController.createCaracteristicasProductos);
router.put('/caracteristicas_productos/producto/:id', caracteristicaProductosController.updateCaracteristicasProductos);
router.delete('/caracteristicas_productos/producto/:id', caracteristicaProductosController.deleteCaracteristicasProductos);

// 👇 ESTA es la ruta que filtra por producto_id, ahora con prefijo claro
router.get('/caracteristicas_productos/:producto_id', caracteristicaProductosController.getCaracteristicasProductosByProducto);

module.exports = router;