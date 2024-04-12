import httpStatus from "http-status";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { userService } from "../services";
import { Request, Response, NextFunction } from "express";

const createUser = catchAsync(async (req, res) => {
  const { email, password, name, lastname, role } = req.body;
  const user = await userService.createUser(
    email,
    password,
    name,
    lastname,
    role
  );
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const result = await userService.queryUsers();
  res.send(result);
});


const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

//test
const getUserRoleCtlr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header is missing');
      }
      
      const token = req.headers.authorization.split(' ')[1];
    
      // Obtener el rol del usuario usando el servicio getUserRole
      const role = await userService.getUserRole(token);
      console.log('Token recibido en el backend:', token);
      res.send({ role });
    } catch (error: any) {
      console.error("Error obteniendo el rol del usuario:", error);
      res.status(error.statusCode || 500).send({ message: error.message });
    }
  };
  

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserRoleCtlr,
};
