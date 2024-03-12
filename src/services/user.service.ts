import { User, Role, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/ApiError";
import { encryptPassword } from "../utils/encryption";

const createUser = async (
  email: string,
  password: string,
  name?: string,
  lastname?: string,
  role: Role = Role.USER
): Promise<User> => {
  
    if (await getUserByEmail(email)){
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }

    return prisma.user.create({
    data: {
      email,
      name,
      lastname,
      password: await encryptPassword(password),
      role,
    },
  });
};

const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = [
    "id",
    "email",
    "name",
    "lastname",
    "password",
    "role",
    "isEmailVerified",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<User, Key>> => {
  return prisma.user.findUnique({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

const queryUser = async <Key extends keyof User>(
    filter: object,
    options: {
        limit?: number;
        page?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    },
    keys: Key[] = [
        'id',
        'email',
        'lastname',
        'name',
        'password',
        'role',
        'isEmailVerified',
        'createdAt',
        'updatedAt'
    ] as Key[]
): Promise<Pick<User, Key>[]> => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy;
    const sortType = options.sortType ?? 'desc';
    const users = await prisma.user.findMany({
        where: filter,
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        skip: page * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    });

    return users as Pick<User, Key>[];
}

const getUserById = async <Key extends keyof User>(
    id: number,
    keys: Key[] = [
        'id',
        'email',
        'name',
        'lastname',
        'password',
        'role',
        'isEmailVerified',
        'createdAt',
        'updatedAt'
    ] as Key[]
): Promise<Pick<User, Key> | null> => {
    return prisma.user.findUnique({
        where: { id },
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    }) as Promise<Pick<User, Key> | null>;
};


const updateUserById = async <Key extends keyof User>(
    userId: number,
    updateBody: Prisma.UserUpdateInput,
    keys: Key[] = [
        'id',
        'email',
        'name',
        'lastname',
        'role'
    ] as Key[]
): Promise<Pick<User, Key> | null> => {
    const user = await getUserById(userId, ['id', 'email', 'name', 'lastname']);
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    };
    
    if(updateBody.email && (await getUserByEmail(updateBody.email as string))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    };
    const updateUser = await prisma.user.update({
        where: { id: userId },
        data: updateBody,
        select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
    });
    return updateUser as Pick<User, Key> | null;
};

const deleteUserById = async (userId: number): Promise<User> => {
    const user = await getUserById(userId);
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    };
    await prisma.user.delete({
        where: {
            id: userId
        }
    })
    return user;
}

export default {
    createUser,
    getUserByEmail,
    getUserById,
    updateUserById,
    deleteUserById,
    queryUser
}