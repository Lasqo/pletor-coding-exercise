import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { API_BASE } from "../../constants/app";
import { FormInputText } from "../Form/components/FormInputText";
import { LoginFormInputs, RegisterFormInputs } from "./Auth.types";



type AuthProps = {
  onLogin: (token: string, user: any) => void;
  onError: (message: string) => void;
};

export const Auth = ({ onLogin, onError }: AuthProps) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormInputs>();

  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    watch,
  } = useForm<RegisterFormInputs>();

  const handleLogin = async (data: LoginFormInputs) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      const responseData = await response.json();
      onLogin(responseData.access_token, responseData.user);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleRegister = async (data: RegisterFormInputs) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.registerEmail,
          username: data.registerUsername,
          password: data.registerPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Registration failed");
      }

      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.registerEmail,
          password: data.registerPassword,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("Registration successful but login failed");
      }
      const responseData = await loginResponse.json();
      onLogin(responseData.access_token, responseData.user);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minWidth:350,
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          {isRegistering ? "Create an Account" : "Login to Your Account"}
        </Typography>

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit(handleLogin)} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormInputText
                control={loginControl}
                name="username"
                label="Email"
                required
                rules={{ required: "Username is required" }}
              />
              <FormInputText
                control={loginControl}
                name="password"
                label="Password"
                type="password"
                required
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mt: 1 }}
              >
                Login
              </Button>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit(handleRegister)} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="registerEmail"
                control={registerControl}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field, fieldState: { error, invalid } }) => (
                  <TextField
                    {...field}
                    required
                    label="Email"
                    fullWidth
                    error={invalid}
                    helperText={error?.message}
                    variant="standard"
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottomColor: "#D2E6FE",
                      },
                      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottomColor: "#2196f3",
                      },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#2196f3",
                      },
                    }}
                  />
                )}
              />
              <Controller
               control={registerControl}
                name="registerUsername"
                rules={{
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                }}
                render={({ field, fieldState: { error, invalid } }) => (
                  <TextField
                    {...field}
                    required
                    label="Username"
                    fullWidth
                    error={invalid}
                    helperText={error?.message}
                    variant="standard"
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottomColor: "#D2E6FE",
                      },
                      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottomColor: "#2196f3",
                      },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#2196f3",
                      },
                    }}
                  />
                )}
              />
              <FormInputText
                control={registerControl}
                name="registerPassword"
                label="Password"
                type="password"
                required
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
              />
              <FormInputText
                control={registerControl}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                required
                rules={{
                  required: "Please confirm your password",
                  validate: (val: string) => {
                    if (watch("registerPassword") != val) {
                      return "Passwords do not match";
                    }
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mt: 1 }}
              >
                Register
              </Button>
            </Box>
          </form>
        )}

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <Button
              onClick={() => setIsRegistering(!isRegistering)}
              sx={{ textTransform: "none" }}
            >
              {isRegistering ? "Login" : "Create one"}
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
