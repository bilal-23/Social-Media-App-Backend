import React, { useEffect, useState } from "react";

const Auth: React.FC = () => {
  const [login, setLogin] = useState(true);

  const toggleForm = () => {
    console.log("workgin");
    setLogin((p) => !p);
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-8xl text-center">Social Media Backend App</h1>
    </div>
  );
};

export default Auth;
