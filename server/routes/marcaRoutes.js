const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');

router.get('/marcas', marcaController.getAllMarcas);
router.get('/marcas/:id', marcaController.getMarcaById);
router.post('/marcas', marcaController.createMarca);
router.put('/marcas/:id', marcaController.updateMarca);
router.delete('/marcas/:id', marcaController.deleteMarca);

module.exports = router;