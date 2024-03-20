import express from 'express';
import validate from 'middleware/validate';
import { userValidation } from 'validations';
import { userController } from 'controllers';


const router = express.Router();

router
.route('/')
.post(validate(userValidation.createUser), userController.createUser)
.get(validate(userValidation.getUsers), userController.getUsers);