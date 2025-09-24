import { Request, Response } from "express";

// Controller function to get all users
export const getUsers = (req: Request, res: Response) => {
	const users = [
		{ id: 1, name: "Alice" },
		{ id: 2, name: "Bob" },
	];
	res.json(users);
};

// Controller function to create a new user
export const createUser = (req: Request, res: Response) => {
	const newUser = req.body;
	// In a real application, you would save this to a database
	console.log("Received new user:", newUser);
	res.status(201).json({ message: "User created successfully", user: newUser });
};
