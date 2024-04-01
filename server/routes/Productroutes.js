const express = require('express');
const router = express.Router();
const ProductControl = require('../controllers/productControllers');

router.delete('/force/:id', ProductControl.DeleteProduct);
router.post('/restore/:id', ProductControl.RestoreProduct);
router.delete('/:id', ProductControl.destroy);
router.put('/edit/:id', ProductControl.EditProduct);
router.put('/like/:id', ProductControl.LikeProduct);
router.post('/:id/comments', ProductControl.AddCMproduct);
router.post('/them', ProductControl.PostProduct);
router.get('/search', ProductControl.Searchproduct);
router.get('/getlike', ProductControl.getLike);
router.get('/getdelete', ProductControl.GetProductdelete);
router.get('/:productId/comments', ProductControl.getCMproduct);
router.get('/:id', ProductControl.GetProductid);
router.get('/', ProductControl.GetProduct);

module.exports = router;
