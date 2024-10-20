import { v4 as uuid } from "uuid";

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export let users: User[] = []; // initial data is empty

export function addUser({ username, age, hobbies }: Omit<User, "id">): User {
  const newUser = { id: uuid(), username, age, hobbies };
  users.push(newUser);
  return newUser;
}

export const getUserById = (id: string): User | undefined =>
  users.find((user) => user.id === id);

export function updateUser(
  id: string,
  updateData: Partial<Omit<User, "id">>
): User | undefined {
  const user = getUserById(id);
  if (user) Object.assign(user, updateData);
  return user;
}

export function deleteUser(id: string): boolean {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
}
