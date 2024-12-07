const RequestedProduct = require('../models/requestedProduct');

const createProductRequest = async (req, res) => {
    try {
        const { productName, productCategory, description, userId } = req.body;

        if (!productName || !productCategory || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newRequest = new RequestedProduct({
            productName,
            productCategory,
            description,
            userId,
        });

        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit product request', error: err.message });
    }
};

const getUserProductRequests = async (req, res) => {
    try {
        const { userId } = req.query;
        const requests = await RequestedProduct.find({ userId });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch product requests', error: err.message });
    }
};

const getAllRequestedProducts = async (req, res) => {
    try {
        const requests = await RequestedProduct.find();
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch all product requests', error: err.message });
    }
};

const deleteRequestedProducts = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await RequestedProduct.findByIdAndDelete(productId); // Delete product by ID

        if (!product) {
            return res.status(404).json({ message: 'Product request not found' });
        }

        res.status(200).json({ message: 'Product request deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete product request', error: error.message });
    }
}

module.exports = { createProductRequest, getUserProductRequests, getAllRequestedProducts, deleteRequestedProducts };

