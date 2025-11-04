export type LoginFormInputs = {
  username: string;
  password: string;
};

export type RegisterFormInputs = {
  confirmPassword: string;
  registerEmail: string;
  registerPassword: string;
  registerUsername: string;
};
export type User = {
  id: number;
  email: string;
  username: string;
  created_at: string;
};
