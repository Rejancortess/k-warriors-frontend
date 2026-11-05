import { NavLink } from "react-router-dom";

const Login = () => {
  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Login</h1>
        <NavLink
          to="/dashboard"
          className="rounded-md bg-blue-500 p-2 text-white"
        >
          Go to dashboard
        </NavLink>
      </div>
    </>
  );
};

export default Login;
