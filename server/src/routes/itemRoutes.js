const express = require('express');
const router = express.Router();
const {addCategory, getCategories, verifyItemName, addItem, editItem, deleteItem, getItems, addConversions, getConversions, updateItems, addPrimaryUnit, addSecondaryUnit, getAllPrimaryUnits, getAllSecondaryUnits} = require('../controllers/itemController');

router.post('/addCategory', addCategory)
router.get('/getCategory', getCategories)
router.post('/addPrimaryUnit', addPrimaryUnit)
router.get('/getAllPrimaryUnits', getAllPrimaryUnits)
router.post('/addSecondaryUnit', addSecondaryUnit)
router.get('/getAllSecondaryUnits', getAllSecondaryUnits)
router.post('/addItem', addItem)
router.post('/verifyItemName', verifyItemName)
router.put('/editItem', editItem)
router.delete('/deleteItem', deleteItem)
router.put('/updateItems', updateItems)
router.get('/getItems', getItems)
router.post('/addConversions', addConversions)
router.get('/getConversions', getConversions)

module.exports = router;    