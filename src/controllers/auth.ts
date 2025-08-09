import { Request, Response } from "express";
import { prismaCilent } from "..";
import {hashSync} from 'bcrypt'

export const signUp = async (request: Request, response: Response) => {
  const { name, email, password } = request.body;


  let user = await prismaCilent.user.findFirst({where: {email}})

  if(user){
    throw Error("User already exists!")
  }

  user = await prismaCilent.user.create({
    data:{
        name,
        email,
        password: hashSync(password,10)
    }
  })

  response.json(user);
};
