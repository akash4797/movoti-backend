import db from "../../db/db.js";
import bcrypt from "bcrypt";
import { UserInputError, AuthenticationError } from "apollo-server-express";
import isEmail from "validator/lib/isEmail.js";
import jwt from "jsonwebtoken";

export default {
  Query: {
    //SECTION user login
    login: async (_, args) => {
      let { username, password } = args.userinput;
      let errors = {};
      try {
        //NOTE Validate for empty field
        if (username.trim() == "")
          errors.username = "User Name must not be empty";
        if (password.trim() == "")
          errors.username = "Password must not be empty";

        // throw errors for validation
        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        //NOTE find user by username. if not then throw error
        const user = await db.user.findUnique({
          where: {
            username,
          },
        });

        //throw error for user not found
        if (!user) {
          errors.username = "Username doesn't exist";
          throw new AuthenticationError("Username doesn't exist", { errors });
        }

        //NOTE check password and if not then throw error
        const correctPassword = await bcrypt.compare(password, user.password);

        //throw error for wrong password
        if (!correctPassword) {
          errors.password = "Password is incorrect";
          throw new AuthenticationError("Password is incorrect", { errors });
        }

        //NOTE generate token for the user
        const payload = {
          username: user.username,
          email: user.email,
          name: user.name,
          contact: user.contact,
          role: user.role,
        };
        // @ts-ignore
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: 60 * 60,
        });

        //return if all OK
        return {
          ...user,
          token,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    //SECTION register users
    register: async (_, args) => {
      let { username, email, contact, name, password, confirmPassword } =
        args.userinput;
      let errors = {};
      try {
        //NOTE validate input data and throw errors
        if (email.trim() == "") errors.email = "Email must not be empty";
        if (username.trim() == "")
          errors.username = "User Name must not be empty";
        if (password.trim() == "")
          errors.password = "Password must not be empty";
        if (confirmPassword.trim() == "")
          errors.confirmpassword = "Confirm Password must not be empty";
        if (password.trim() != confirmPassword.trim())
          errors.passMatch = "Password doesn't match";
        if (!isEmail(email.trim())) errors.email = "Not a valid email";

        //NOTE check if user by email & username then if exists then throw error
        const userByUserID = await db.user.findUnique({
          where: {
            username,
          },
        });
        const userByEmail = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (userByUserID) errors.username = "Username already taken";
        if (userByEmail) errors.email = "Email already taken";

        // throw errors
        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        //NOTE hashpassword and create user
        password = await bcrypt.hash(password, 6);
        const user = await db.user.create({
          data: {
            username: username.trim(),
            email: email.trim(),
            password,
            contact,
            name,
            role: "Normal",
          },
        });
        // return user
        return user;
      } catch (error) {
        // return errors
        // console.log(error);
        throw new UserInputError("bad input", { errors: errors });
      }
    },
    editUser: async (_, args, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const userUpdate = await db.user.update({
          where: {
            username: user.username,
          },
          data: {
            email: args.userinput?.email ? args.userinput?.email : user.email,
            contact: args.userinput?.contact
              ? args.userinput?.contact
              : user.contact,
            name: args.userinput?.name ? args.userinput?.name : user.name,
          },
        });

        //NOTE generate token for the user
        const payload = {
          username: userUpdate.username,
          email: userUpdate.email,
          name: userUpdate.name,
          contact: userUpdate.contact,
          role: userUpdate.role,
        };
        // @ts-ignore
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: 60 * 60,
        });

        return {
          ...userUpdate,
          token,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
