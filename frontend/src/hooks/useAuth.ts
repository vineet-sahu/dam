import { useMutation } from "@tanstack/react-query";
import { signInUser, signUpUser } from "../services/Auth";

export const useSignIn = () => {
  return useMutation({
    mutationFn: signInUser,
    onSuccess: (data) => {
      console.log("Sign in successful:", data);
    },
    onError: (error) => {
      console.error("Sign in failed:", error);
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      console.log("Sign up successful:", data);
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
    },
  });
};
