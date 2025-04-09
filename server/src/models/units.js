const mongoose = require('mongoose');

const PrimaryUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        //required: true
    }
});

const SecondaryUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        //required: true
    }
});

const UnitSchema = new mongoose.Schema({
    email: {type: String},
    primaryUnit: {
        type: [PrimaryUnitSchema],
        //required: true,
        default: [
            'BAGS',
            'BOTTLES',
            'BOX',
            'BUNDLES',
            'CANS',
            'CARTONS',
            'DOZENS',
            'GRAMMES',
            'KILLOGRAMS',
            'LITRE',
            'MILLILITRE',
            'NUMBERS',
            'PACKS',
            'PAIRS',
            'PIECES',
            'QUINTAL',
            'ROLLS',
            'SQUARE FEET'
        ]
    },
    secondaryUnit: {
        type: [SecondaryUnitSchema],
        //required: true,
        default: [
            'BAGS',
            'BOTTLES',
            'BOX',
            'BUNDLES',
            'CANS',
            'CARTONS',
            'DOZENS',
            'GRAMMES',
            'KILLOGRAMS',
            'LITRE',
            'MILLILITRE',
            'NUMBERS',
            'PACKS',
            'PAIRS',
            'PIECES',
            'QUINTAL',
            'ROLLS',
            'SQUARE FEET'
        ]
    }
});

module.exports = mongoose.model('Unit', UnitSchema);
