const Jokes = require('../model/Jokes');

exports.getallcontent = async (req, res) => {
    try {
        const data = await Jokes.find();
        res.json(data);
    } catch (error) {
        console.error('Error fetching all content:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
