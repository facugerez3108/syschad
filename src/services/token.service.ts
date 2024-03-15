import jwt from "jsonwebtoken";
import moment, { Moment } from 'moment';
import httpStatus from "http-status";
import config from "config/config";
import userService from "./user.service";
import ApiError from "utils/ApiError";
import { Token, TokenType } from "@prisma/client";
import prisma from "client";
import { AuthTokensResponse } from "types/response";


const generateToken = (
    userId: number,
    expries: Moment,
    type: TokenType,
    secret = config.jwt.secret
): string => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expries.unix(),
        type
    };

    return jwt.sign(payload, secret);
}

const saveToken = async (
    token: string,
    userId: number,
    expires: Moment,
    type: TokenType,
    blacklisted = false
): Promise<Token> => {
    const createdToken = prisma.token.create({
        data: {
            token,
            userId: userId,
            expires: expires.toDate(),
            type,
            blacklisted
        }
    })

    return createdToken;
}


const verifyToken = async (
    token: string,
    type: TokenType,
): Promise<Token> => {
    const payload = jwt.verify(token, config.jwt.secret);
    const userId = Number(payload.sub);
    const tokenData = await prisma.token.findFirst({
        where: { token, type, userId, blacklisted: false}
    })

    if(!tokenData){
        throw new Error('Token not found');
    }
    return tokenData;
}


const generateAuthTokens = async (
    user: { id: number }
): Promise<AuthTokensResponse> => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user.id, accessTokenExpires, TokenType.ACCESS);
  
    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExpires, TokenType.REFRESH);
    await saveToken(refreshToken, user.id, refreshTokenExpires, TokenType.REFRESH);
  
    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate()
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate()
      }
    };   
}


const generateResetPasswordToken = async (
    email: string
): Promise<string> => {
    const user = await userService.getUserByEmail(email);
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user.id as number, expires, TokenType.RESET_PASSWORD);
    await saveToken(resetPasswordToken, user.id as number, expires, TokenType.RESET_PASSWORD);
    return resetPasswordToken;
}

const generateVerifyEmailToken = async (user: { id: number }): Promise<string> => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
    await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
    return verifyEmailToken;
  };
  
  export default {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateResetPasswordToken,
    generateVerifyEmailToken
  };