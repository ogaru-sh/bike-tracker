export type User = {
  id: string;
  email: string | null;
  name: string | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};
