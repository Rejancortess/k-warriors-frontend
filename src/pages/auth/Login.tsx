import { NavLink } from "react-router-dom";

const Login = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Login</h1>
        <NavLink
          to="/dashboard"
          className="text-white bg-blue-500  p-2 rounded-md"
        >
          Go to dashboard
        </NavLink>
      </div>
    </>
  );
};

export default Login;
