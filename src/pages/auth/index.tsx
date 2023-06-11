import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Login from "@/components/Auth/Login";
import { Icons } from "@/components/UI/Icons";
import Register from "@/components/Auth/Register";

const Auth: React.FC = () => {
  const [login, setLogin] = useState(true);

  const toggleForm = () => {
    console.log("workgin");
    setLogin((p) => !p);
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back to Emojica
          </h1>
          <p className="text-sm text-muted-foreground">
            {login
              ? "Enter your email and password sign in to your account"
              : "Enter the details below to create your account"}
          </p>
        </div>
        <div className={cn("grid gap-6")}>
          {login ? <Login /> : <Register />}
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <button
            className="hover:text-brand underline underline-offset-4"
            onClick={toggleForm}
          >
            {login ? "Don't have an account? Sign Up" : "Already a member?"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
