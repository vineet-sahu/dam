import api from "./api";

const DAM_API_BASE_URL =
  import.meta.env.VITE_DAM_API_BASE_URL || "http://localhost:5000/api";

const DAM_Api = () => {
  const ApiURL = (node: string) => `${DAM_API_BASE_URL}/auth/${node}`;
  return {
    signinURL: ApiURL("signin"),
    signupURL: ApiURL("signup"),
  };
};

export const signInUser = async (credentials: any) => {
  return await api.post(DAM_Api().signinURL, {
    ...credentials,
  });
};

export const signUpUser = async (credentials: any) => {
  return await api.post(DAM_Api().signupURL, {
    ...credentials,
  });
};
