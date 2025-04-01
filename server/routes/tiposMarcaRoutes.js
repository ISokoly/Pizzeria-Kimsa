const express = require('express');
const router = express.Router();
const tiposMarcaController = require('../controllers/tiposMarcaController');

router.get('/tipos_marcas/nombre', tiposMarcaController.getAllTiposMarcas); // Obtiene todas las marcas
router.get('/tipos_marcas/nombre/:nombre', tiposMarcaController.getTiposMarcaByNombre); // Obtiene por nombre específico
router.post('/tipos_marcas/nombre', tiposMarcaController.createTiposMarca);
router.put('/tipos_marcas/nombre/:nombre', tiposMarcaController.updateTiposMarca);
router.delete('/tipos_marcas/nombre/:nombre', tiposMarcaController.deleteTiposMarca);

module.exports = router;