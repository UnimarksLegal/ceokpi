export interface User {
  username: string;
  password: string;
  role: string;
}

export const mockUsers: User[] = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "manager", password: "manager123", role: "manager" },
  { username: "user", password: "user123", role: "user" },
];
