import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout, signInUser, signUpUser } from '../services/auth-service';

export const useSignIn = () => {
  return useMutation({
    mutationFn: signInUser,
    onSuccess: (res) => {
      return res.data;
    },
    onError: (error) => {
      console.error('Sign in failed:', error);
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: signUpUser,
    onSuccess: (_) => {},
    onError: (error) => {
      console.error('Sign up failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (_) => {
      queryClient.clear();
      console.log('User logged out and cache cleared');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
};
