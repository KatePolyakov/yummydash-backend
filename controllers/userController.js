const {User} = require('../models/user');

const addNewUserAddress = async (req, res) => {
  try {
    // First, find the user by email and update the addresses
    User.findOne({email: req.body.email}).then(async (user) => {
      if (!user) {
        return res.status(404).send({message: 'User not found'});
      }

      // Create the new address object
      const newAddress = {
        userAddress1: req.body.userAddress1,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        isPrimaryAddress: req.body.isPrimaryAddress,
      };

      // If the new address is set as primary,
      // update all other addresses to false
      if (newAddress.isPrimaryAddress) {
        user.address.forEach((address) => {
          address.isPrimaryAddress = false;
        });
      }

      // Push the new address to the user's addresses
      user.address.push(newAddress);
      // Save the user with the updated addresses
      user.save();
      res.status(201).send({
        address: user.address,
        status: 'success',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal Server Error'});
  }
};

const updatePrimaryAddress = async (req, res) => {
  try {
    const email = req.body.email;
    const id = req.body.id;
    if (!email || !id) {
      return res.status(400).send({message: 'Bad Request'});
    }

    const user = await User.findOne({email});

    if (!user) {
      return res.status(404).send({message: 'User not found'});
    }

    const addressToUpdate = user.address.id(id);

    if (!addressToUpdate) {
      return res.status(404).send({message: 'Address not found'});
    }

    // Update the address being set as primary
    addressToUpdate.isPrimaryAddress = true;

    // Set isPrimaryAddress to false for all other addresses
    user.address.forEach((addres) => {
      if (addres._id != id) {
        addres.isPrimaryAddress = false;
      }
    });

    // Save the user with the updated addresses
    await user.save();

    res.status(201).send({
      address: user.address,
      status: 'success',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal Server Error'});
  }
};


module.exports = {
  addNewUserAddress,
  updatePrimaryAddress,
};
